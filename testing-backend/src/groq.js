import { Groq } from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();
// import {} from "@ai-sdk/groq";
// import {} from "ai";
import express from "express";
import cors from 'cors';

const app = express();
app.use(express.json())
app.use(cors())


const systemPrompt =
 `
    You are a friendly voice assistant. Respond following these rules:
    
    1. SPEECH-FIRST DESIGN:
       - Use natural spoken language with contractions (e.g., "you're", "it's")
       - Keep responses to 1-3 short sentences (15s speech max)
       - Include brief pauses with ellipses (...) for natural flow
       - Avoid markdown, lists, or structured formatting
    
    2. PERSONALITY & TONE:
       - Be warm, helpful and slightly enthusiastic
       - Use minimal vocal fillers (max 1 per response)
       - Default to gender-neutral language
    
    3. FUNCTIONAL BEHAVIOR:
       - Prioritize concise answers first but do make sure to answer the questions asked adequately ensuring customer satisfaction.
       - Handle interruptions gracefully ("Sure!", "No problem!")
       - For ambiguous requests, ask 1 clarifying question
    
    4. SAFETY:
       - Politely decline inappropriate requests
       - Never pretend to be human ("As an AI, I...")
       - Redirect non-voice tasks gently
    `;

export async function getGroqChatCompletion(query) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: query,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    stream: false,
  });

  return response.choices[0]?.message?.content;
}
