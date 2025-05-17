import { Request, Response } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { users, serviceProviders } from "@shared/schema";
import { eq } from "drizzle-orm";

interface PublicProfileResponse {
  username: string;
  name: string;
  businessName: string;
  profession: string;
  email: string;
  phone: string;
  bio: string;
  profileImage: string;
  services: any[];
}

export const registerPublicProfileRoutes = (app: any) => {
  // Get public profile by username
  app.get("/api/public-profile/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      // First try to find the user
      const user = await db.select().from(users).where(eq(users.username, username));
      
      if (user && user.length > 0) {
        // If using the users table
        const userData = user[0];
        
        // Get services for this user (using sample services for now)
        const services = [
          {
            id: "1",
            name: "Consultation",
            description: "Initial client consultation",
            duration: 60,
            price: 150
          },
          {
            id: "2",
            name: "Strategy Session",
            description: "Business strategy planning",
            duration: 90,
            price: 250
          },
          {
            id: "3", 
            name: "Follow-up Meeting",
            description: "Project follow-up and review",
            duration: 30,
            price: 100
          }
        ];
        
        // Construct the response
        const profileResponse: PublicProfileResponse = {
          username: userData.username,
          name: userData.name,
          businessName: userData.name + "'s Business", // Default business name
          profession: "Professional", // Default profession
          email: userData.email,
          phone: "Not provided", // Default phone
          bio: "No bio available", // Default bio
          profileImage: userData.avatarUrl || "", // Profile image
          services: services
        };
        
        return res.json(profileResponse);
      }
      
      // If not found in users table, try service providers
      try {
        const providers = await db.select().from(serviceProviders)
          .where(eq(serviceProviders.email, username));
        
        if (providers && providers.length > 0) {
          const provider = providers[0];
          
          // Get services for this provider
          const services = await storage.getServicesByProvider(provider.id);
          
          // Construct the response from service provider
          const profileResponse: PublicProfileResponse = {
            username: username,
            name: `${provider.firstName} ${provider.lastName}`,
            businessName: provider.businessName,
            profession: provider.profession,
            email: provider.email,
            phone: provider.phone,
            bio: provider.voicemailMessage || "No bio available", // Using voicemail message as bio for now
            profileImage: provider.profileImage || "",
            services: services.map(s => ({
              id: s.id.toString(),
              name: s.name,
              description: s.description || "",
              duration: s.duration,
              price: s.price
            }))
          };
          
          return res.json(profileResponse);
        }
      } catch (providerError) {
        console.error("Error fetching provider:", providerError);
        // Continue to fallback
      }
      
      // If we got here, no user or provider was found
      // For demo/dev purposes, return mock data
      return res.status(404).json({ 
        error: "Profile not found",
        message: "No user or service provider found with the given username"
      });
    } catch (error) {
      console.error("Error fetching public profile:", error);
      res.status(500).json({ error: "Failed to fetch profile data" });
    }
  });
  
  // When a new user signs up, generate their public profile URL
  app.post("/api/generate-profile-link", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      // Get the user
      const user = await storage.getUser(parseInt(userId));
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Generate the profile link using the username
      const profileLink = `${req.protocol}://${req.get('host')}/p/${user.username}`;
      
      res.json({
        profileLink,
        username: user.username
      });
    } catch (error) {
      console.error("Error generating profile link:", error);
      res.status(500).json({ error: "Failed to generate profile link" });
    }
  });
};