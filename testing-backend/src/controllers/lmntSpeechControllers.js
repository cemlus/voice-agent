import { Groq } from "groq-sdk";
import dotenv from "dotenv";
import axios from "axios";
import { Readable } from "stream";
import express from "express";
import cors from 'cors';
const app = express()
app.use(cors())
dotenv.config();

const { LMNT_API_KEY, LMNT_VOICE_ID } = process.env;
if (!LMNT_API_KEY || !LMNT_VOICE_ID) {
  console.error("Missing LMNT_API_KEY or LMNT_VOICE_ID in .env");
  process.exit(1);
}

export async function getAudioFromText(req, res) {
  const text = req.body.text;
  const voiceId = req.body.voice

  console.log("TTS request text:", text, "the voice Id is ", voiceId);

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "no text received" });
  }

  try {

    const response = await axios.post(
      "https://api.lmnt.com/v1/ai/speech/bytes",
      { text, voice: voiceId, model: "blizzard", language: "auto", format: "mp3", sample_rate: 24000 },
      {
        headers: {
          "X-API-KEY": LMNT_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "stream",
      }
    );

    // **Set the correct header** so the client knows what it is:
    res.setHeader("Content-Type", "audio/mpeg");

    // Pipe the raw audio stream to the response
    response.data.pipe(res);
  } catch (err) {
    console.error("TTS generation failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate audio" });
  }
}
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

export async function sendLlmResponse(req, res) {
  const { query } = req.body;
  const answerText = await getGroqChatCompletion(query);
  res.send(answerText);
}

// res.setHeader("Content-Type", "audio/mpeg");
