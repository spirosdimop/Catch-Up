import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImageIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
  initialPrompt?: string;
  autoGenerate?: boolean;
  showPrompt?: boolean;
}

export function ImageGenerator({
  onImageGenerated,
  initialPrompt = "",
  autoGenerate = false,
  showPrompt = true
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Generate image using the OpenAI API
  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description for the image you want to generate.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest<{ url: string }>('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (response && response.url) {
        setImageUrl(response.url);
        if (onImageGenerated) {
          onImageGenerated(response.url);
        }
        toast({
          title: "Image generated",
          description: "Your image has been successfully generated!",
        });
      } else {
        throw new Error("No image URL in response");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on mount if autoGenerate is true
  useEffect(() => {
    if (autoGenerate && initialPrompt) {
      generateImage();
    }
  }, [autoGenerate, initialPrompt]);

  return (
    <div className="w-full space-y-4">
      {showPrompt && (
        <div className="space-y-2">
          <Textarea
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
            disabled={isGenerating}
          />
          <Button 
            onClick={generateImage} 
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>
        </div>
      )}

      {imageUrl && (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img 
            src={imageUrl} 
            alt="Generated content" 
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {isGenerating && !imageUrl && (
        <div className="flex items-center justify-center p-12 border border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-gray-500">Generating your image...</p>
            <p className="text-xs text-gray-400">This may take up to 30 seconds</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGenerator;