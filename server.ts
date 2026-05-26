/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const port = 3000;

// Initialize GoogleGenAI lazy-init style
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please verify it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route - Chat with AI Coach
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getAi();
      
      // We will use gemini-3.5-flash as recommended for basic/general text tasks.
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: `You are STRIVE AI, a professional, top-tier personal trainer, sports nutritionist, and fitness coach.
Your tone is sophisticated, motivating, scientific, yet encouraging and accessible.
Always output response in elegant, clear, well-structured English Markdown.
Keep your responses practical, concise, and focused on hyper-targeted sports science tips.

If the user wants advice on exercises, meals, or muscle building, give highly structured answers.
You can recommend modifications to sets, reps, and form.`,
        },
      });

      // Load history if present
      if (history && Array.isArray(history)) {
        // Prepare chat history
        // GoogleGenAI chat has simple hist or send message flow.
        // For simplicity and resilience, we can use chat sendMessage,
        // or we can just send the complete text with history prefix to generateContent.
      }

      // We'll pass the conversation formatted with history to generateContent for maximum resilience
      let formattedPrompt = "";
      if (history && Array.isArray(history)) {
        history.slice(-8).forEach((msg: any) => {
          formattedPrompt += `${msg.sender === "user" ? "Client" : "Coach"}: ${msg.text}\n`;
        });
      }
      formattedPrompt += `Client: ${message}\nCoach:`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedPrompt,
      });

      res.json({ text: result.text || "I was unable to formulate a response. Let's try again." });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route - Generate Custom Fitness Routine
  app.post("/api/generate-routine", async (req, res) => {
    try {
      const { goals, experience, daysPerWeek, equipment, focusMuscles } = req.body;
      const ai = getAi();

      const prompt = `Generate a customized 7-day weekly schedule for a fitness client.
Client Profile:
- Goals: ${goals || "Muscle Building & Strength"}
- Experience Level: ${experience || "All-round"}
- Target Training Days: ${daysPerWeek || 5} days/week training, rest on other days
- Equipment Available: ${equipment || "Full Gym / Freeweights"}
- Focus Groups: ${focusMuscles || "All muscle groups"}

Provide your answer strictly in structured JSON matching this schema:
{
  "exercises": [
    {
      "id": "exercise-id",
      "name": "Exercise Name",
      "target": "Target Muscles",
      "description": "Short explanation of purpose",
      "instructions": ["Step 1...", "Step 2..."],
      "sets": 3,
      "reps": "8-12",
      "category": "strength"
    }
  ],
  "routine": [
    {
      "day": "Monday",
      "title": "e.g. Chest & Triceps (Push)",
      "exercises": ["exercise-id-1", "exercise-id-2"],
      "nutritionalFocus": "Hydration / post-workout amino acids"
    }
  ],
  "nutrition": [
    {
      "name": "Food Item Name",
      "benefit": "Why it builds muscle",
      "category": "protein"
    }
  ]
}

Ensure all 7 days of the week (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday) are represented in the "routine" array. For rest days, leave "exercises" as an empty array [] and set the title to e.g., "Active Recovery" or "Rest Day".
Provide realistic, scientifically sound exercises and guidance. Ensure all exercise IDs in day routine match the ids in the "exercises" array.`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    target: { type: Type.STRING },
                    description: { type: Type.STRING },
                    instructions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    sets: { type: Type.INTEGER },
                    reps: { type: Type.STRING },
                    category: { type: Type.STRING }
                  },
                  required: ["id", "name", "target", "description", "instructions", "sets", "reps", "category"]
                }
              },
              routine: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    title: { type: Type.STRING },
                    exercises: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    nutritionalFocus: { type: Type.STRING }
                  },
                  required: ["day", "title", "exercises", "nutritionalFocus"]
                }
              },
              nutrition: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    benefit: { type: Type.STRING },
                    category: { type: Type.STRING }
                  },
                  required: ["name", "benefit", "category"]
                }
              }
            },
            required: ["exercises", "routine", "nutrition"]
          }
        }
      });

      const responseText = result.text;
      if (!responseText) {
        throw new Error("AI returned an empty response.");
      }

      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("Error generating routine:", error);
      res.status(500).json({ error: error.message || "Failed to generate dynamic routine." });
    }
  });

  // Serve static UI assets in production, otherwise Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
