import { Router, Request, Response } from "express";
import { generateImage, generateAndSaveImage } from "../imageGenerator";

const router = Router();

/**
 * Generate an image using OpenAI's DALL-E model
 * POST /api/images/generate
 * @body {prompt: string} - Text description of the image to generate
 * @body {save: boolean} - Optional flag to save the image (default: false)
 * @returns {url: string, localPath?: string} - URL of the generated image and local path if saved
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, save = false } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    
    if (save) {
      const imagePath = await generateAndSaveImage(prompt);
      return res.json({ path: imagePath });
    } else {
      const result = await generateImage(prompt);
      return res.json(result);
    }
  } catch (error: any) {
    console.error("Error generating image:", error);
    res.status(500).json({ 
      error: "Failed to generate image", 
      details: error.message || "Unknown error" 
    });
  }
});

export default router;