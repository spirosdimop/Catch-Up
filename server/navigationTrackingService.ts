import { storage } from './storage';
import { eq, desc, sql } from 'drizzle-orm';
import * as schema from "@shared/schema";

export interface NavigationData {
  userId: string;
  path: string;
  fromPath: string | null;
  timestamp: Date;
  sessionId: string;
  timeOnPage?: number;
  clickedElements?: string[];
}

interface NavigationPattern {
  fromPath: string;
  toPath: string;
  frequency: number;
  avgTimeOnPage: number;
}

interface UserPathRecommendation {
  currentPath: string;
  recommendedPaths: Array<{
    path: string;
    displayName: string;
    confidence: number;
  }>;
  frequentElements: Array<{
    element: string;
    displayName: string;
    frequency: number;
  }>;
}

/**
 * Record a navigation event when user navigates in the app
 */
export async function recordNavigation(navigationData: NavigationData): Promise<void> {
  try {
    // Insert into navigation_events table
    await storage.createNavigationEvent({
      userId: navigationData.userId,
      path: navigationData.path,
      fromPath: navigationData.fromPath,
      timestamp: navigationData.timestamp,
      sessionId: navigationData.sessionId,
      timeOnPage: navigationData.timeOnPage || 0,
      clickedElements: navigationData.clickedElements ? JSON.stringify(navigationData.clickedElements) : null
    });
  } catch (error) {
    console.error('Error recording navigation event:', error);
  }
}

/**
 * Get navigation patterns for a specific user
 */
export async function getUserNavigationPatterns(userId: string): Promise<NavigationPattern[]> {
  try {
    // Get the user's navigation events
    const navigationEvents = await storage.getNavigationEventsByUser(userId);
    
    // Build a map of paths and transitions
    const transitions: Record<string, Record<string, number>> = {};
    const timeOnPage: Record<string, number[]> = {};
    
    // Process navigation events to build transition map
    navigationEvents.forEach(event => {
      if (event.fromPath) {
        // Initialize path in transitions map if needed
        if (!transitions[event.fromPath]) {
          transitions[event.fromPath] = {};
        }
        
        // Increment transition count
        if (!transitions[event.fromPath][event.path]) {
          transitions[event.fromPath][event.path] = 0;
        }
        transitions[event.fromPath][event.path]++;
        
        // Track time on page for averages
        if (event.timeOnPage && event.timeOnPage > 0) {
          if (!timeOnPage[event.path]) {
            timeOnPage[event.path] = [];
          }
          timeOnPage[event.path].push(event.timeOnPage);
        }
      }
    });
    
    // Convert to NavigationPattern array
    const patterns: NavigationPattern[] = [];
    
    Object.keys(transitions).forEach(fromPath => {
      Object.keys(transitions[fromPath]).forEach(toPath => {
        const frequency = transitions[fromPath][toPath];
        
        // Calculate average time on page
        let avgTimeOnPage = 0;
        if (timeOnPage[toPath] && timeOnPage[toPath].length > 0) {
          avgTimeOnPage = timeOnPage[toPath].reduce((sum, time) => sum + time, 0) / timeOnPage[toPath].length;
        }
        
        patterns.push({
          fromPath,
          toPath,
          frequency,
          avgTimeOnPage
        });
      });
    });
    
    // Sort by frequency
    patterns.sort((a, b) => b.frequency - a.frequency);
    
    return patterns;
    
  } catch (error) {
    console.error('Error getting user navigation patterns:', error);
    return [];
  }
}

/**
 * Get path recommendations based on current path and user history
 */
export async function getPathRecommendations(userId: string, currentPath: string): Promise<UserPathRecommendation> {
  try {
    // Get navigation patterns
    const patterns = await getUserNavigationPatterns(userId);
    
    // Filter patterns for the current path
    const relevantPatterns = patterns.filter(pattern => pattern.fromPath === currentPath);
    
    // Get common elements clicked on this path
    const events = await storage.getNavigationEventsByPathAndUser(userId, currentPath);
    const elementCounts: Record<string, number> = {};
    
    // Count elements clicked
    events.forEach(event => {
      if (event.clickedElements) {
        try {
          const elements = JSON.parse(event.clickedElements);
          if (Array.isArray(elements)) {
            elements.forEach(element => {
              if (!elementCounts[element]) {
                elementCounts[element] = 0;
              }
              elementCounts[element]++;
            });
          }
        } catch (e) {
          // Invalid JSON, ignore
        }
      }
    });
    
    // Convert to array and sort
    const frequentElements = Object.keys(elementCounts).map(element => ({
      element,
      displayName: getDisplayNameForElement(element),
      frequency: elementCounts[element]
    })).sort((a, b) => b.frequency - a.frequency).slice(0, 5); // Top 5 elements
    
    // Map paths to human-readable names
    const recommendedPaths = relevantPatterns.map(pattern => ({
      path: pattern.toPath,
      displayName: getDisplayNameForPath(pattern.toPath),
      confidence: pattern.frequency / Math.max(...relevantPatterns.map(p => p.frequency))
    })).slice(0, 3); // Top 3 recommendations
    
    return {
      currentPath,
      recommendedPaths,
      frequentElements
    };
    
  } catch (error) {
    console.error('Error getting path recommendations:', error);
    return {
      currentPath,
      recommendedPaths: [],
      frequentElements: []
    };
  }
}

/**
 * Convert path to human-readable name
 */
function getDisplayNameForPath(path: string): string {
  const pathSegments = path.split('/').filter(Boolean);
  if (pathSegments.length === 0) {
    return 'Dashboard';
  }
  
  // Capitalize first letter and replace hyphens with spaces
  const lastSegment = pathSegments[pathSegments.length - 1];
  return lastSegment
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Convert element ID to human-readable name
 */
function getDisplayNameForElement(elementId: string): string {
  // Logic to convert element IDs to readable names
  if (elementId.includes('button-')) {
    return `${elementId.replace('button-', '')} button`;
  }
  if (elementId.includes('tab-')) {
    return `${elementId.replace('tab-', '')} tab`;
  }
  if (elementId.includes('menu-')) {
    return `${elementId.replace('menu-', '')} menu item`;
  }
  
  // Default: just clean up the ID
  return elementId
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}