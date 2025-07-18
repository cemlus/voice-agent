// stt.js
import { WebSocketServer } from "ws";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import dotenv from "dotenv";
dotenv.config(); // Ensure dotenv is configured in each module if needed, or in the main entry point

const deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);

// setupDeepgram now returns the Deepgram instance and its specific keepAliveInterval ID
const setupDeepgramConnection = (wsClient) => {
    console.log("Deepgram: Setting up new connection...");
    const deepgramLive = deepgramClient.listen.live({
        smart_format: true,
        model: "nova-3",
    });

    // Each deepgramLive instance needs its own keepAlive interval
    let keepAliveIntervalId;

    // --- Deepgram Event Listeners ---
    // Attach all listeners directly after creating deepgramLive instance
    deepgramLive.addListener(LiveTranscriptionEvents.Open, async () => {
        console.log("Deepgram: connected");
        if (keepAliveIntervalId) clearInterval(keepAliveIntervalId); // Clear any previous one if exists
        // Set up a new keep-alive interval specific to this deepgramLive instance
        keepAliveIntervalId = setInterval(() => {
            // console.log("deepgram: keepalive"); // Uncomment for verbose logging
            deepgramLive.keepAlive();
        }, 10 * 1000);
    });

    deepgramLive.addListener(LiveTranscriptionEvents.Transcript, (data) => {
        // console.log("deepgram: transcript received");
        if (wsClient.readyState === wsClient.OPEN) {
            // console.log("ws: transcript sent to client");
            wsClient.send(JSON.stringify(data));
        }
    });

    deepgramLive.addListener(LiveTranscriptionEvents.Close, async (closeEvent) => {
        console.log("Deepgram: disconnected. Code:", closeEvent.code, "Reason:", closeEvent.reason);
        if (keepAliveIntervalId) clearInterval(keepAliveIntervalId);
        deepgramLive.finish(); // Ensure Deepgram connection is gracefully closed
    });

    deepgramLive.addListener(LiveTranscriptionEvents.Error, async (error) => {
        console.error("Deepgram: error received:", error);
        if (keepAliveIntervalId) clearInterval(keepAliveIntervalId);
        deepgramLive.finish();
        // Optionally send an error message back to the client
        if (wsClient.readyState === wsClient.OPEN) {
            wsClient.send(JSON.stringify({ error: "Deepgram transcription error." }));
        }
    });

    deepgramLive.addListener(LiveTranscriptionEvents.Warning, async (warning) => {
        console.warn("Deepgram: warning received:", warning);
        if (wsClient.readyState === wsClient.OPEN) {
            wsClient.send(JSON.stringify({ warning: warning.message }));
        }
    });

    deepgramLive.addListener(LiveTranscriptionEvents.Metadata, (data) => {
        // console.log("deepgram: metadata received");
        if (wsClient.readyState === wsClient.OPEN) {
            // console.log("ws: metadata sent to client");
            wsClient.send(JSON.stringify({ metadata: data }));
        }
    });

    return deepgramLive; // Return the Deepgram live connection instance
};


export const sttWss = new WebSocketServer({ noServer: true, path: '/stt' });

sttWss.on("connection", (ws) => {
    console.log("WS: client connected for Deepgram ASR");
    // Each client WebSocket connection gets its own Deepgram connection
    let currentDeepgramConnection = setupDeepgramConnection(ws);

    ws.on("message", (message) => {
        // console.log("WS: client data received");

        if (currentDeepgramConnection.getReadyState() === 1 /* OPEN */) {
            // console.log("WS: data sent to deepgram");
            currentDeepgramConnection.send(message); // Forward client audio to Deepgram
        } else if (currentDeepgramConnection.getReadyState() >= 2 /* 2 = CLOSING, 3 = CLOSED */) {
            console.warn("WS: Deepgram connection not open, attempting to reopen.");
            // Attempt to reopen the Deepgram connection if it's closed or closing
            currentDeepgramConnection.finish(); // Ensure old connection is cleaned up
            currentDeepgramConnection.removeAllListeners(); // Remove listeners from old instance
            currentDeepgramConnection = setupDeepgramConnection(ws); // Create a new Deepgram connection
            // Try sending the message again if the new connection is immediately ready (unlikely for first message)
            if (currentDeepgramConnection.getReadyState() === 1) {
                currentDeepgramConnection.send(message);
            }
        } else {
            console.warn("WS: Data couldn't be sent to Deepgram (state not open or closing).");
        }
    });

    ws.on("close", (closeEvent) => {
        console.log("WS: client disconnected from Deepgram ASR. Code:", closeEvent.code, "Reason:", closeEvent.reason);
        // Clean up Deepgram connection when the client WebSocket closes
        if (currentDeepgramConnection) {
            currentDeepgramConnection.finish();
            currentDeepgramConnection.removeAllListeners();
            currentDeepgramConnection = null;
        }
        // The keepAliveIntervalId is handled within deepgramLive.on('close') for that specific instance
    });

    ws.on("error", (error) => {
        console.error("WS: client WebSocket error:", error);
        // Clean up Deepgram connection on WebSocket error
        if (currentDeepgramConnection) {
            currentDeepgramConnection.finish();
            currentDeepgramConnection.removeAllListeners();
            currentDeepgramConnection = null;
        }
        // The keepAliveIntervalId is handled within deepgramLive.on('error') for that specific instance
    });
});
