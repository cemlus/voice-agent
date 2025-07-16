// server.js
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import Lmnt from "lmnt-node";
const app = express();
const server = http.createServer(app);
dotenv.config();

export function attachTtsStream({ server, apiKey, voiceId }){
  const wss = new WebSocketServer({ server, path: "/tts" });
  wss.on("connection", async (clientWs, req) => {
    const clientAddr = req.socket.remoteAddress;
    console.log(`🟢 Client connected from ${clientAddr}`);
  
    // Create a new LMNT streaming session for this client
    let speechSession;
    try {
      console.log("⏳ Creating LMNT SpeechSession...");
      speechSession = await new Lmnt({ apiKey: apiKey })
        .speech
        .sessions
        .create({
          voice: voiceId,
          format: "mp3",
          return_extras: false,
          sample_rate: 24000,
          conversational: true
        });
      console.log("✅ SpeechSession ready");
    } catch (err) {
      console.error("🔴 Failed to create SpeechSession:", err);
      clientWs.close(1011, "TTS init failed");
      return;
    }
  
    // Transport‐level keep‑alive pings (prevent TCP/WebSocket timeouts)
    const pingTimer = setInterval(() => {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.ping();
        console.log("💓 Sent WebSocket ping to keep connection alive");
      }
    }, 20_000);
  
    // Handle incoming messages
    clientWs.on("message", async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString("utf-8"));
        console.log("📨 From client:", msg);
      } catch {
        console.warn("⚠️ Ignoring non‑JSON message");
        return;
      }
  
      // If the client forwarded the LLM response as { res: { data: "<string>" } }
      if (msg.res && typeof msg.res.data === "string") {
        const replyText = msg.res.data;
        console.log(`✍️ appendText("${replyText}")`);
        speechSession.appendText(replyText);
        return;
      }
  
      // Control messages:
      if (msg.flush) {
        console.log("🚿 flush()");
        await speechSession.flush();
        return;
      }
      if (msg.eof) {
        console.log("🔚 finish()");
        await speechSession.finish();
        return;
      }
    });
  
    // Stream audio chunks back to client
    (async () => {
      try {
        for await (const { audio, durations, warning } of speechSession) {
          console.log(`🔊 Streaming ${audio.byteLength} bytes to client`);
          // You can send metadata if you like:
          clientWs.send(JSON.stringify({ durations, warning }));
          if (clientWs.readyState === clientWs.OPEN) {
            clientWs.send(audio);
          }
        }
        console.log("ℹ️ SpeechSession iterator complete (EOF reached)");
      } catch (err) {
        console.error("🔴 Error during streaming:", err);
      } finally {
        clientWs.close();
      }
    })();
  
    // Cleanup when client disconnects
    clientWs.on("close", (code, reason) => {
      console.log(`⚪ Client disconnected (${code}: ${reason})`);
      clearInterval(pingTimer);
      try {
        speechSession.close();
        console.log("✅ SpeechSession closed");
      } catch {}
    });
  
    clientWs.on("error", (err) => {
      console.error("⚠️ WebSocket error with client:", err);
    });
  });
  console.log("ℹ️ TTS WebSocket attached at /tts");

}
