import { useState } from "react";
import { useLocation } from "wouter";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function AIAssistantFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  // Don't show on these pages
  const excludedPages = ["/", "/signup", "/login", "/ai-assistant"];
  if (excludedPages.includes(location)) {
    return null;
  }

  // Create a function to navigate to the AI assistant page
  const navigateToAssistant = () => {
    window.location.href = "/ai-assistant";
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={navigateToAssistant}
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}

export default AIAssistantFloating;