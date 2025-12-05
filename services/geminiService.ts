import { GoogleGenAI, Type } from "@google/genai";
import { WisdomNugget } from "../types";

// Helper to get the AI client instance safely
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set in process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateWisdom = async (situation: string): Promise<WisdomNugget> => {
  try {
    const ai = getAiClient();
    
    // Fallback if AI client cannot be initialized (e.g. missing key)
    if (!ai) throw new Error("AI Client not initialized");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `The user is facing this situation: "${situation}". 
      Provide a piece of wisdom, a quote (real or synthesized based on ancient wisdom), and a concrete actionable step to help them reframe their mindset.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            author: { type: Type.STRING },
            context: { type: Type.STRING, description: "A brief explanation of how this applies to the situation" },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            actionableStep: { type: Type.STRING, description: "One small concrete thing the user can do today" }
          },
          required: ["quote", "author", "context", "tags", "actionableStep"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    
    return {
      id: Date.now().toString(),
      ...data
    };

  } catch (error) {
    console.error("Error generating wisdom:", error);
    // Fallback for demo purposes if API fails or key is missing
    return {
      id: Date.now().toString(),
      quote: "The only way out is through.",
      author: "Robert Frost",
      context: "When facing difficulties, avoidance only prolongs the struggle. (Fallback: AI unavailable)",
      tags: ["Resilience", "Courage"],
      actionableStep: "Write down the one thing you are avoiding and do it for just 5 minutes."
    };
  }
};

export const suggestProjectTasks = async (projectTitle: string, description: string): Promise<string[]> => {
  try {
    const ai = getAiClient();
    if (!ai) throw new Error("AI Client not initialized");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a list of 5 actionable, small steps (tasks) for a project titled "${projectTitle}" with description: "${description}". return only strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating tasks:", error);
    return ["Define clear goals", "Research first steps", "Draft a plan"];
  }
};