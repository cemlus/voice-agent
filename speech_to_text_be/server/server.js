// server.js (ES Module)
// A Node.js WebSocket proxy for Deepgram live streaming speech-to-text
import "dotenv/config"; // Load .env variables
import { createServer } from "http"; // HTTP server
import WebSocket, { WebSocketServer } from "ws"; // WS library
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

// Instantiate Deepgram client (SDK v3+)
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Create HTTP server for potential REST endpoints
const server = createServer();

// Create WebSocket server on HTTP server
const wss = new WebSocketServer({ server, path: "/ws" });

// Start server
server.listen(3001, () =>
  console.log("✅ Server listening on http://localhost:3001/ws")
);

// On each new browser client connection:
wss.on("connection", (clientSocket) => {
  console.log("🔌 New client connected");

  // Open Deepgram live transcription socket
  const dgSocket = deepgram.listen.live({
    model: 'nova-3', // High-accuracy ASR model
    language: "en-US",
    punctuate: true,
    // encoding: "linear16",
    // interim_results: true,
    endpointing: 5000,          // Finalize on 300ms silence
    // sample_rate: 16000
  });

  // Deepgram connection opened
  setTimeout(() => {
    console.log(
      "--------------------------------------------------------------------------------------------------------------------"
    );
    // console.log(dgSocket.keepAlive())
    // console.log(dgSocket);
  }, 3000);

  // dgSocket.keepAlive();

  

  dgSocket.on(LiveTranscriptionEvents.Open, () => {
    console.log("🟢 Connected to Deepgram");
  });

  // Handle incoming transcript events
  dgSocket.on(LiveTranscriptionEvents.Transcript, (data) => {
    try {
      clientSocket.send(JSON.stringify(data)); // Send raw JSON
    } catch (err) {
      console.error("⚠️ Error sending transcript:", err);
    }
  });

  // Log Deepgram errors
  dgSocket.on(LiveTranscriptionEvents.Error, (err) => {
    console.error("❌ Deepgram error:", err);
  });

  // Deepgram stream closed
  dgSocket.on(LiveTranscriptionEvents.Close, () => {
    console.log("🔴 Deepgram connection closed");
  });

  // Relay audio chunks from client to Deepgram
  clientSocket.on("message", (audioChunk) => {
    if (dgSocket.getReadyState() === WebSocket.OPEN) {
      dgSocket.send(audioChunk);
      console.log(audioChunk);
    }
  });

  // Cleanup on client disconnect
  clientSocket.on("close", async () => {
    console.log("❎ Client disconnected");
    console.log("byyyyyyyyyyeeeeeeeeeee");
    try {
      await dgSocket.requestClose(); // 👈 graceful shutdown
    } catch (err) {
      console.warn(
        "⚠️ dgSocket.requestClose() error (likely already closed):",
        err.message
      );
    }
    // No explicit stop call needed; Deepgram socket auto-closes on inactivity
  });

  // Handle client socket errors
  clientSocket.on("error", async (err) => {
    console.error("💥 Client socket error:", err);
    try {
      await dgSocket.requestClose();
    } catch (err) {
      console.warn('⚠️ dgSocket.requestClose() error:', err.message);
    }

    // Let Deepgram socket close naturally
  });
});

// Note: sendToLLM() stub can be added here for integration with an LLM pipeline

// End of server.js
