
// // // // End of server.js
// // // server.js (ES Module)
// // // A Node.js WebSocket proxy for Deepgram live streaming speech-to-text
// // import "dotenv/config"; // Load .env variables
// // import { createServer } from "http"; // HTTP server
// // import WebSocket, { WebSocketServer } from "ws"; // WS library
// // import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

// // // Instantiate Deepgram client (SDK v3+)
// // const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// // // Create HTTP server for potential REST endpoints
// // const server = createServer();

// // // Create WebSocket server on HTTP server
// // const wss = new WebSocketServer({ server, path: "/ws" });

// // // Start server
// // server.listen(1001, () =>
// //   console.log("✅ Server listening on http://localhost:1001/ws")
// // );

// // // On each new browser client connection:
// // wss.on("connection", (clientSocket) => {
// //   console.log("🔌 New client connected");
  
// //   let dgSocket;
// //   let isDeepgramConnected = false;

// //   // Open Deepgram live transcription socket
// //   try {
// //     dgSocket = deepgram.listen.live({
// //       model: "nova-3",
// //       smart_format: true
// //     });

// //     // Deepgram connection opened
// //     dgSocket.on(LiveTranscriptionEvents.Open, () => {
// //       console.log("🟢 Connected to Deepgram");
// //       isDeepgramConnected = true;
// //     });

// //     // Handle incoming transcript events
// //     dgSocket.on(LiveTranscriptionEvents.Transcript, (data) => {
// //       console.log("📝 Received transcript from Deepgram:", data);
// //       try {
// //         if (clientSocket.readyState === WebSocket.OPEN) {
// //           clientSocket.send(JSON.stringify(data));
// //           console.log("📤 Sent transcript to client");
// //         }
// //       } catch (err) {
// //         console.error("⚠️ Error sending transcript:", err);
// //       }
// //     });

// //     // Log Deepgram errors
// //     dgSocket.on(LiveTranscriptionEvents.Error, (err) => {
// //       console.error("❌ Deepgram error:", err);
// //     });

// //     // Deepgram stream closed
// //     dgSocket.on(LiveTranscriptionEvents.Close, () => {
// //       console.log("🔴 Deepgram connection closed");
// //       isDeepgramConnected = false;
// //     });

// //     // Handle Deepgram metadata
// //     dgSocket.on(LiveTranscriptionEvents.Metadata, (data) => {
// //       console.log("📊 Deepgram metadata:", data);
// //     });

// //   } catch (error) {
// //     console.error("❌ Failed to create Deepgram connection:", error);
// //   }

// //   // Relay audio chunks from client to Deepgram
// //   clientSocket.on("message", (audioChunk) => {
// //     console.log("🎤 Received audio chunk from client, size:", audioChunk.length);
// //     console.log("🎤 Audio chunk type:", typeof audioChunk);
// //     console.log("🎤 Audio chunk constructor:", audioChunk.constructor.name);
    
// //     if (dgSocket && isDeepgramConnected) {
// //       try {
// //         dgSocket.send(audioChunk);
// //         console.log("📤 Sent audio chunk to Deepgram");
// //       } catch (error) {
// //         console.error("❌ Error sending audio to Deepgram:", error);
// //       }
// //     } else {
// //       console.warn("⚠️ Deepgram not connected, dropping audio chunk");
// //     }
// //   });

// //   // Cleanup on client disconnect
// //   clientSocket.on("close", async () => {
// //     console.log("❎ Client disconnected");
// //     if (dgSocket) {
// //       try {
// //         await dgSocket.requestClose();
// //         console.log("✅ Deepgram connection closed gracefully");
// //       } catch (err) {
// //         console.warn("⚠️ Error closing Deepgram connection:", err.message);
// //       }
// //     }
// //   });

// //   // Handle client socket errors
// //   clientSocket.on("error", async (err) => {
// //     console.error("💥 Client socket error:", err);
// //     if (dgSocket) {
// //       try {
// //         await dgSocket.requestClose();
// //       } catch (err) {
// //         console.warn("⚠️ Error closing Deepgram connection:", err.message);
// //       }
// //     }
// //   });
// // });

// // // Graceful shutdown
// // process.on('SIGINT', () => {
// //   console.log('\n🛑 Shutting down server...');
// //   server.close(() => {
// //     console.log('✅ Server closed');
// //     process.exit(0);
// //   });
// // });

// // console.log("🚀 Server started, waiting for connections...");

// // server.js (ES Module version of the working HTML example)
// import "dotenv/config";
// import { createServer } from "http";
// import WebSocket, { WebSocketServer } from "ws";
// import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

// // Create HTTP server
// const server = createServer();

// // Create WebSocket server
// const wss = new WebSocketServer({ server, path: "/ws" });

// // Create Deepgram client
// const deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);

// console.log("🔑 API Key present:", !!process.env.DEEPGRAM_API_KEY);

// let keepAlive;

// const setupDeepgram = (ws) => {
//   console.log("🔄 Setting up Deepgram connection...");
  
//   const deepgram = deepgramClient.listen.live({
//     smart_format: true,
//     model: "nova-2", // Try nova-2 first, then nova-3
//     // language: "en-US",
//     // interim_results: true,
//     // punctuate: true,
//   });

//   // Clear any existing keepalive
//   if (keepAlive) clearInterval(keepAlive);
  
//   // Set up keepalive
//   keepAlive = setInterval(() => {
//     console.log("🔄 deepgram: keepalive");
//     try {
//       deepgram.keepAlive();
//     } catch (error) {
//       console.error("❌ keepalive error:", error);
//     }
//   }, 10 * 1000);

//   deepgram.addListener(LiveTranscriptionEvents.Open, async () => {
//     console.log("🟢 deepgram: connected");

//     deepgram.addListener(LiveTranscriptionEvents.Transcript, (data) => {
//       console.log("📝 deepgram: transcript received");
//       console.log("📤 ws: transcript sent to client");
      
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(JSON.stringify(data));
//       }
//     });

//     deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
//       console.log("🔴 deepgram: disconnected");
//       clearInterval(keepAlive);
//       deepgram.requestClose();
//     });

//     deepgram.addListener(LiveTranscriptionEvents.Error, async (error) => {
//       console.log("❌ deepgram: error received");
//       console.error(error);
//     });

//     deepgram.addListener(LiveTranscriptionEvents.Warning, async (warning) => {
//       console.log("⚠️ deepgram: warning received");
//       console.warn(warning);
//     });

//     deepgram.addListener(LiveTranscriptionEvents.Metadata, (data) => {
//       console.log("📊 deepgram: metadata received");
//       console.log("📤 ws: metadata sent to client");
      
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(JSON.stringify({ metadata: data }));
//       }
//     });
//   });

//   return deepgram;
// };

// wss.on("connection", (ws) => {
//   console.log("🔌 ws: client connected");
//   let deepgram = setupDeepgram(ws);

//   ws.on("message", (message) => {
//     console.log("🎤 ws: client data received, size:", message.length);

//     if (deepgram.getReadyState() === 1 /* OPEN */) {
//       console.log("📤 ws: data sent to deepgram");
//       deepgram.send(message);
//     } else if (deepgram.getReadyState() >= 2 /* 2 = CLOSING, 3 = CLOSED */) {
//       console.log("⚠️ ws: data couldn't be sent to deepgram");
//       console.log("🔄 ws: retrying connection to deepgram");
      
//       // Attempt to reopen the Deepgram connection
//       deepgram.requestClose();
//       deepgram.removeAllListeners();
//       deepgram = setupDeepgram(ws);
//     } else {
//       console.log("⚠️ ws: data couldn't be sent to deepgram - not ready");
//     }
//   });

//   ws.on("close", () => {
//     console.log("❎ ws: client disconnected");
//     if (deepgram) {
//       deepgram.requestClose();
//       deepgram.removeAllListeners();
//       deepgram = null;
//     }
//     if (keepAlive) {
//       clearInterval(keepAlive);
//     }
//   });

//   ws.on("error", (error) => {
//     console.error("💥 ws: client error:", error);
//     if (deepgram) {
//       deepgram.requestClose();
//       deepgram.removeAllListeners();
//       deepgram = null;
//     }
//     if (keepAlive) {
//       clearInterval(keepAlive);
//     }
//   });
// });

// // Start server
// server.listen(1001, () => {
//   console.log("✅ Server is listening on http://localhost:1001/ws");
// });

// // Graceful shutdown
// process.on('SIGINT', () => {
//   console.log('\n🛑 Shutting down server...');
//   if (keepAlive) clearInterval(keepAlive);
//   server.close(() => {
//     console.log('✅ Server closed');
//     process.exit(0);
//   });
// });

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);
let keepAlive;

const setupDeepgram = (ws) => {
  const deepgram = deepgramClient.listen.live({
    smart_format: true,
    model: "nova-3",
  });

  if (keepAlive) clearInterval(keepAlive);
  keepAlive = setInterval(() => {
    console.log("deepgram: keepalive");
    deepgram.keepAlive();
  }, 10 * 1000);

  deepgram.addListener(LiveTranscriptionEvents.Open, async () => {
    console.log("deepgram: connected");

    deepgram.addListener(LiveTranscriptionEvents.Transcript, (data) => {
      console.log("deepgram: transcript received");
      console.log("ws: transcript sent to client");
      ws.send(JSON.stringify(data));
    });

    deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
      console.log("deepgram: disconnected");
      clearInterval(keepAlive);
      deepgram.finish();
    });

    deepgram.addListener(LiveTranscriptionEvents.Error, async (error) => {
      console.log("deepgram: error received");
      console.error(error);
    });

    deepgram.addListener(LiveTranscriptionEvents.Warning, async (warning) => {
      console.log("deepgram: warning received");
      console.warn(warning);
    });

    deepgram.addListener(LiveTranscriptionEvents.Metadata, (data) => {
      console.log("deepgram: metadata received");
      console.log("ws: metadata sent to client");
      ws.send(JSON.stringify({ metadata: data }));
    });
  });

  return deepgram;
};

wss.on("connection", (ws) => {
  console.log("ws: client connected");
  let deepgram = setupDeepgram(ws);

  ws.on("message", (message) => {
    console.log("ws: client data received");

    if (deepgram.getReadyState() === 1 /* OPEN */) {
      console.log("ws: data sent to deepgram");
      deepgram.send(message);
    } else if (deepgram.getReadyState() >= 2 /* 2 = CLOSING, 3 = CLOSED */) {
      console.log("ws: data couldn't be sent to deepgram");
      console.log("ws: retrying connection to deepgram");
      /* Attempt to reopen the Deepgram connection */
      deepgram.finish();
      deepgram.removeAllListeners();
      deepgram = setupDeepgram(ws);
    } else {
      console.log("ws: data couldn't be sent to deepgram");
    }
  });

  ws.on("close", () => {
    console.log("ws: client disconnected");
    deepgram.finish();
    deepgram.removeAllListeners();
    deepgram = null;
  });
});

app.use(express.static("public/"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

server.listen(2000, () => {
  console.log("Server is listening on port 3000");
});
