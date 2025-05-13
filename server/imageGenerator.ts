import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate an image using OpenAI's DALL-E model
 * @param prompt Text description of the image to generate
 * @param outputPath Optional path to save the image
 * @returns Image URL and local saved path if requested
 */
export async function generateImage(prompt: string, outputPath?: string): Promise<{ url: string, localPath?: string }> {
  try {
    console.log("Generating image with prompt:", prompt);
    
    const response = await openai.images.generate({
      model: "dall-e-3", // the newest model available
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No image data returned from OpenAI");
    }
    
    const imageUrl = response.data[0].url;
    
    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    // Download and save the image if outputPath is provided
    if (outputPath) {
      // Ensure directory exists
      const directory = path.dirname(outputPath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      // Download the image
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Save the image
      fs.writeFileSync(outputPath, buffer);
      console.log(`Image saved to ${outputPath}`);
      
      return { url: imageUrl, localPath: outputPath };
    }

    return { url: imageUrl };
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Generate an image and save it to the /assets directory
 * @param prompt Text description of the image to generate
 * @returns Path to the generated image file
 */
export async function generateAndSaveImage(prompt: string): Promise<string> {
  const filename = `generated-${uuidv4()}.png`;
  const outputPath = path.join('client/public/assets', filename);
  
  const result = await generateImage(prompt, outputPath);
  
  return `/assets/${filename}`; // Return the public URL path
}