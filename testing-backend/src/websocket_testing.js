import { WebSocketServer } from "ws";
import dotenv from "dotenv"; // Keep dotenv here for self-sufficiency, or remove if only in main server.js
import Lmnt from "lmnt-node"; // Assuming 'lmnt-node' exports the constructor directly
dotenv.config()

export const ttsWss = new WebSocketServer({ noServer: true, path: "/tts" });

ttsWss.on("connection", async (clientWs, req) => {
  const clientAddr = req.socket.remoteAddress;
  console.log(`🟢 Client connected from ${clientAddr} for TTS`);

  // Create a new LMNT streaming session for this client
  let speechSession;
  try {
    console.log("⏳ Creating LMNT SpeechSession...");
    // Instantiate Lmnt client with the provided apiKey
    speechSession = await new Lmnt({apiKey: process.env.LMNT_API_KEY }) // Use the apiKey passed as argument
      .speech
      .sessions
      .create({
        voice: process.env.LMNT_VOICE_ID,
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

  // Transport‑level keep‑alive pings (prevent TCP/WebSocket timeouts)
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

    // Handle message formats:
    // 1. If the client forwarded the LLM response as { res: { data: "<string>" } } (from your old frontend)
    if (msg.res && typeof msg.res.data === "string") {
      const replyText = msg.res.data;
      console.log(`✍️ appendText("${replyText}")`);
      try {
        await speechSession.appendText(replyText);
      } catch (err) {
        console.error("🔴 Error appending text to SpeechSession:", err);
        clientWs.send(JSON.stringify({ error: "Failed to append text to TTS" }));
      }
      return;
    }
    // 2. If the client sends just { text: "<string>" } (from my suggested frontend)
    else if (msg.text && typeof msg.text === "string") {
      const replyText = msg.text;
      console.log(`✍️ appendText("${replyText}")`);
      try {
        await speechSession.appendText(replyText);
      } catch (err) {
        console.error("🔴 Error appending text to SpeechSession:", err);
        clientWs.send(JSON.stringify({ error: "Failed to append text to TTS" }));
      }
      return;
    }


    // Control messages:
    if (msg.flush) {
      console.log("🚿 flush()");
      try {
        await speechSession.flush();
      } catch (err) {
        console.error("🔴 Error flushing SpeechSession:", err);
        clientWs.send(JSON.stringify({ error: "Failed to flush TTS" }));
      }
      return;
    }
    if (msg.eof) {
      console.log("🔚 finish()");
      try {
        await speechSession.finish();
      } catch (err) {
        console.error("🔴 Error finishing SpeechSession:", err);
        clientWs.send(JSON.stringify({ error: "Failed to finish TTS" }));
      }
      return;
    }
  });

  // Stream audio chunks back to client
  (async () => {
    try {
      for await (const { audio, durations, warning } of speechSession) {
        console.log(`🔊 Streaming ${audio.byteLength} bytes to client`);
        // You can send metadata if you like:
        clientWs.send(JSON.stringify({ durations, warning })); // Send metadata as JSON
        if (clientWs.readyState === clientWs.OPEN) {
          clientWs.send(audio); // Send audio as binary
        }
      }
      console.log("ℹ️ SpeechSession iterator complete (EOF reached)");
    } catch (err) {
      console.error("🔴 Error during streaming from LMNT:", err);
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify({ error: "LMNT streaming error." }));
      }
    } finally {
      // Ensure WebSocket is closed after streaming is done or on error
      if (clientWs.readyState === clientWs.OPEN || clientWs.readyState === clientWs.CONNECTING) {
        clientWs.close();
      }
    }
  })();

  // Cleanup when client disconnects
  clientWs.on("close", (code, reason) => {
    console.log(`⚪ Client disconnected (${code}: ${reason})`);
    clearInterval(pingTimer); // Stop the ping timer
    try {
      speechSession.close(); // Close the LMNT session
      console.log("✅ SpeechSession closed");
    } catch (err) {
      console.warn("⚠️ Error closing SpeechSession on client disconnect:", err);
    }
  });

  clientWs.on("error", (err) => {
    console.error("⚠️ WebSocket error with client:", err);
    clearInterval(pingTimer); // Stop the ping timer on error
    try {
      speechSession.close(); // Close the LMNT session
      console.log("✅ SpeechSession closed due to WS error");
    } catch (closeErr) {
      console.warn("⚠️ Error closing SpeechSession on WS error:", closeErr);
    }
  });
});

