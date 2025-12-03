import { GoogleGenAI, Type } from "@google/genai";
import { LinkItem } from '../types';

const apiKey = process.env.API_KEY || '';

// We cannot use 'new GoogleGenAI' at the module level if the key might be missing during initial render.
// We will instantiate it inside the function.

export const enrichLinkData = async (title: string, url: string): Promise<{ tags: string[], description: string }> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return { tags: [], description: '' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      I have a saved weblink. 
      Title: "${title}"
      URL: "${url}"
      
      Please generate:
      1. A short, concise summary (max 20 words) describing what this kind of link probably contains based on the title and URL structure.
      2. A list of 3-5 relevant generic tags (e.g., "Technology", "Recipe", "News", "Dev", "Design").
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["description", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) return { tags: [], description: '' };

    const data = JSON.parse(text);
    return {
      tags: data.tags || [],
      description: data.description || ''
    };

  } catch (error) {
    console.error("Gemini enrichment failed:", error);
    return { tags: [], description: '' };
  }
};