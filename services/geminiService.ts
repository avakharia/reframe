
import { GoogleGenAI, Type } from "@google/genai";
import { WisdomNugget, SearchResult, FollowUpResult } from "../types";

// Ensure API Key check prevents crashes in environments without it
const apiKey = process.env.API_KEY || '';

export const generateWisdom = async (situation: string): Promise<WisdomNugget> => {
  if (!apiKey) {
    return {
      id: Date.now().toString(),
      quote: "The only way out is through.",
      author: "Robert Frost",
      context: "When facing difficulties, avoidance only prolongs the struggle. (Fallback: API Key Missing)",
      tags: ["Resilience", "Courage"],
      actionableStep: "Write down the one thing you are avoiding and do it for just 5 minutes."
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
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
    return {
      id: Date.now().toString(),
      quote: "Adversity introduces a man to himself.",
      author: "Albert Einstein",
      context: "Challenges are not just obstacles, but opportunities to discover your own strength.",
      tags: ["Growth", "Perspective"],
      actionableStep: "Take deep breaths and list 3 things you are grateful for right now."
    };
  }
};

export const suggestProjectTasks = async (projectTitle: string, description: string): Promise<string[]> => {
  if (!apiKey) return ["Define clear goals", "Research first steps", "Draft a plan"];

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a list of 3 actionable, small steps (tasks) for a project titled "${projectTitle}" with description: "${description}". return only strings.`,
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

export const analyzeSituation = async (query: string): Promise<SearchResult> => {
  if (!apiKey) {
    // Fallback data structure updated for 3 variations
    return {
      id: Date.now().toString(),
      query,
      variations: [
        {
          type: 'ROOTS',
          title: 'The Philosophical View',
          quote: "A journey of a thousand miles begins with a single step.",
          author: "Lao Tzu",
          context: "Focus on the fundamental truth of patience.",
          suggestedTasks: ["Meditate for 5 mins", "Journal your fears", "Read about Stoicism"]
        },
        {
          type: 'BRANCHES',
          title: 'Practical Application',
          quote: "Action is the foundational key to all success.",
          author: "Picasso",
          context: "Apply this to your career or relationships immediately.",
          suggestedTasks: ["Update Resume", "Call a friend", "Organize workspace"]
        },
        {
          type: 'TOOLBOX',
          title: 'Immediate Tool',
          quote: "Between stimulus and response there is a space.",
          author: "Viktor Frankl",
          context: "Use the 'Pause Button' technique.",
          suggestedTasks: ["Practice the Pause", "Use 'I' statements", "Box Breathing"]
        }
      ]
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this user query/situation: "${query}". 
      Provide 3 distinct reframing variations based on these categories:
      1. ROOTS: A deep, philosophical, or spiritual perspective (e.g. Stoicism, Buddhism, nature of reality).
      2. BRANCHES: A practical, real-world application (e.g. Career, Relationships, Finance, Social).
      3. TOOLBOX: An immediate, actionable mental model or technique (e.g. Breathing, Journaling, Reframing technique).
      
      For each variation, provide:
      - A specific title (e.g. "The Stoic Shift" or "The Relationship Pivot")
      - A relevant quote
      - A context/explanation
      - EXACTLY 3 small, actionable tasks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['ROOTS', 'BRANCHES', 'TOOLBOX'] },
                  title: { type: Type.STRING },
                  quote: { type: Type.STRING },
                  author: { type: Type.STRING },
                  context: { type: Type.STRING },
                  suggestedTasks: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Exactly 3 tasks" 
                  }
                },
                required: ["type", "title", "quote", "author", "context", "suggestedTasks"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    const data = JSON.parse(text);

    return {
      id: Date.now().toString(),
      query,
      variations: data.variations
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getFollowUpAdvice = async (history: string, newQuestion: string): Promise<FollowUpResult> => {
  if (!apiKey) {
    return {
      answer: "This is a demo response for your follow-up.",
      suggestedTasks: ["Follow up task 1", "Follow up task 2", "Follow up task 3"]
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Context: The user previously asked about "${history}". Now they are asking: "${newQuestion}".
      Provide a helpful, direct answer to the new question.
      Also provide exactly 3 actionable tasks/outcomes they can add to their todo list based on this answer.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            suggestedTasks: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["answer", "suggestedTasks"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (e) {
    console.error(e);
    return {
       answer: "I'm having trouble connecting right now, but essentially: keep moving forward.",
       suggestedTasks: ["Reflect on progress", "Try again later"]
    };
  }
}

export const getProjectCoaching = async (title: string, description: string, category: string): Promise<WisdomNugget> => {
  if (!apiKey) {
    return {
      id: Date.now().toString(),
      quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      context: "Keep pushing forward with your project. Consistency is key.",
      tags: ["Persistence", "Focus"],
      actionableStep: "Review your project goals today."
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `The user is working on a project titled "${title}" in the category of "${category}". 
      Description: "${description}".
      
      Act as a wise mentor or coach. Provide a piece of wisdom/perspective specifically tailored to this project's theme to help them stay motivated or see the bigger picture.
      Include a relevant quote, context, and one small actionable step to move the project forward.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            author: { type: Type.STRING },
            context: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableStep: { type: Type.STRING }
          },
          required: ["quote", "author", "context", "tags", "actionableStep"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (e) {
    console.error(e);
    return {
      id: Date.now().toString(),
      quote: "The secret of getting ahead is getting started.",
      author: "Mark Twain",
      context: "Don't overthink it. Just take the next small step.",
      tags: ["Action", "Momentum"],
      actionableStep: "Complete one small task for this project right now."
    };
  }
}
