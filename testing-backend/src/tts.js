import { Lmnt } from "lmnt-node";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const LMNT_API_KEY = "ak_HUSHEgfmxBMtuFY2kPCRtV";

const client = new Lmnt({ apiKey: LMNT_API_KEY });
async function tts() {
  const response = await client.speech.generate({
    text: "Hello, world! This is a test of the LMNT speech synthesis API.",
    voice: "morgan",
    format: "mp3",
    model: "blizzard",
  });

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync("../uploads/output.mp3", audioBuffer);
}

// tts()

const speechSession = client.speech.sessions.create({
  voice: "morgan",
});

const outputStream = fs.createWriteStream("../uploads/session_output.mp3");

// Send text incrementally
const writeTask = async () => {
  for (let i = 0; i < 5; i++) {
    speechSession.appendText("Hello, world!");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  speechSession.finish();
};

// Receive audio as it's generated
const readTask = async () => {
  for await (const message of speechSession) {
    if (message.audio) {
      outputStream.write(message.audio);
    }
  }
  speechSession.close();
  outputStream.end();
};

Promise.all([writeTask(), readTask()])
  .then(() => {
    console.log("TTS session complete, audio saved.");
  })
  .catch((err) => {
    console.error("Error during TTS session:", err);
  });