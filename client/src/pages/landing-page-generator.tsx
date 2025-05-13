import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageGenerator } from "@/components/image-generator";
import { Download, Copy, Save } from "lucide-react";

const SAMPLE_PROMPTS = [
  {
    title: "Modern Landing Page",
    prompt: "A modern, high-conversion landing page UI for a productivity assistant app, designed in minimalist flat style with a deep navy blue background and crisp white and cobalt blue highlights. The hero section features a bold headline (\"Your Work. Fully Backed.\") and multiple call-to-action buttons across the layout, styled identically with different labels. Below the CTA buttons, display a carousel of diverse user avatars with names or roles. Add subtle animated effects for engagement. The layout uses sharp typography, soft shadows, and clean spacing."
  },
  {
    title: "Freelancer Portfolio",
    prompt: "A professional portfolio landing page for a freelancer with a minimalist design. Dark navy blue background with white text and subtle cobalt blue accents. Features a hero section with a circular profile photo and 'Available for Hire' tag. Includes sections for portfolio, testimonials, and a clean contact form. Modern, clean typography with soft drop shadows."
  },
  {
    title: "Booking Service",
    prompt: "A clean, modern booking service landing page with a navy blue and white color scheme. Features a prominent calendar widget in the hero section, service cards with pricing, and client testimonials with avatar photos. Includes multiple sign-up buttons styled consistently with subtle hover effects. Responsive design with clear call-to-action elements."
  }
];

export default function LandingPageGenerator() {
  const [activeTab, setActiveTab] = useState("generate");
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(SAMPLE_PROMPTS[0].prompt);
  const { toast } = useToast();

  const handleSaveImage = (imageUrl: string) => {
    setSavedImages((prev) => [...prev, imageUrl]);
    toast({
      title: "Image saved",
      description: "The generated image has been saved to your collection.",
    });
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt copied",
      description: "The prompt has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Landing Page Design Generator</h1>
      
      <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="saved">Saved ({savedImages.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Landing Page Design</CardTitle>
              <CardDescription>
                Use AI to generate a custom landing page design based on your description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Your design description</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="Describe your ideal landing page design in detail..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="pt-4">
                <ImageGenerator initialPrompt={customPrompt} showPrompt={false} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCustomPrompt("")}>Clear</Button>
              <Button onClick={() => handleSaveImage("")}>Save Design</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SAMPLE_PROMPTS.map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{template.title}</CardTitle>
                  <CardDescription>Pre-defined template</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3">{template.prompt}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mb-4"
                    onClick={() => {
                      setCustomPrompt(template.prompt);
                      setActiveTab("generate");
                    }}
                  >
                    Use This Template
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleCopyPrompt(template.prompt)}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copy Prompt
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-6">
          {savedImages.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-gray-500">No saved designs yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Generate and save designs to see them here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedImages.map((imageUrl, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <img 
                      src={imageUrl} 
                      alt={`Saved design ${index + 1}`} 
                      className="w-full h-auto rounded-md"
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        setSavedImages(savedImages.filter((_, i) => i !== index));
                        toast({
                          title: "Design removed",
                          description: "The design has been removed from your saved collection.",
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}