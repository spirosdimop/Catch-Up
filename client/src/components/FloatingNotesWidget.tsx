import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, X, Minimize2, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FloatingNotesWidgetProps {
  className?: string;
}

export function FloatingNotesWidget({ className = "" }: FloatingNotesWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [notes, setNotes] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("floating-notes");
    const savedPosition = localStorage.getItem("floating-notes-position");
    const savedIsOpen = localStorage.getItem("floating-notes-open");
    const savedIsMinimized = localStorage.getItem("floating-notes-minimized");
    
    if (savedNotes) {
      setNotes(savedNotes);
    }
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
    if (savedIsOpen === "true") {
      setIsOpen(true);
    }
    if (savedIsMinimized === "true") {
      setIsMinimized(true);
    }
  }, []);

  // Auto-save notes with debouncing
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem("floating-notes", notes);
      setLastSaved(new Date());
    }, 1000); // Save after 1 second of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes]);

  // Save position and state
  useEffect(() => {
    localStorage.setItem("floating-notes-position", JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem("floating-notes-open", isOpen.toString());
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem("floating-notes-minimized", isMinimized.toString());
  }, [isMinimized]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (dragRef.current && dragRef.current.contains(e.target as Node)) {
      setIsDragging(true);
      const rect = widgetRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep widget within viewport bounds
      const maxX = window.innerWidth - 300;
      const maxY = window.innerHeight - 400;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const closeWidget = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={toggleOpen}
          className={`fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg ${className}`}
          size="lg"
        >
          <StickyNote className="h-6 w-6" />
        </Button>
      )}

      {/* Floating Notes Widget */}
      {isOpen && (
        <div
          ref={widgetRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl"
          style={{
            left: position.x,
            top: position.y,
            width: isMinimized ? "250px" : "300px",
            height: isMinimized ? "50px" : "400px",
            transition: isDragging ? "none" : "all 0.2s ease",
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Header */}
          <div
            ref={dragRef}
            className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg cursor-move select-none"
          >
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Notes</span>
              {lastSaved && !isMinimized && (
                <span className="text-xs text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-200"
                onClick={toggleMinimize}
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minimize2 className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-200"
                onClick={closeWidget}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="p-3 h-full">
              <Textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Write your notes here... They will be saved automatically."
                className="w-full h-full resize-none border-0 focus:ring-0 p-0 text-sm"
                style={{ height: "calc(100% - 60px)" }}
              />
              <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <span>{notes.length} characters</span>
                <span>Auto-saves every second</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default FloatingNotesWidget;