// server.js
import dotenv from "dotenv";
import axios from "axios";
import { Readable } from "stream";

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


// res.setHeader("Content-Type", "audio/mpeg");
