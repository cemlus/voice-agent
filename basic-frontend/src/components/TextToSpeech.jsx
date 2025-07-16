import React, { useState, useRef, useEffect } from "react";
import { BACKEND_URL } from "./TTS";
import axios from 'axios';

export default function LiveTTSPlayer() {
  const [wsReady, setWsReady] = useState(false);
  const [input, setInput] = useState("");
  const audioCtxRef = useRef(null);
  const wsRef = useRef(null);
  const playQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

  // 1) Initialize AudioContext once
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // 2) Open WebSocket once
  useEffect(() => {
    const ws = new WebSocket("wss://voice-agent-qqe1.onrender.com/tts");                        // add backend URL here
    ws.binaryType = "arraybuffer";
    ws.onopen = () => {
      console.log("✅ WS open");
      setWsReady(true);
      // send init frame
      ws.send(JSON.stringify({ init: true }));
    };
    ws.onmessage = (evt) => {
      if (evt.data instanceof ArrayBuffer) {
        // enqueue audio chunk
        playQueueRef.current.push(evt.data);
        playNext();
      } else {
        // optional: receive metadata as JSON
        console.log("ℹ️ Meta from server:", evt.data);
      }
    };
    ws.onerror = (err) => console.error("⚠️ WS error:", err);
    ws.onclose = () => console.log("⭕ WS closed");

    wsRef.current = ws;
    return () => {
      ws.close();
    };
  }, []);

  // 3) Play queued audio chunk if not already playing
  const playNext = async () => {
    if (isPlayingRef.current) return;
    const chunk = playQueueRef.current.shift();
    if (!chunk) return;

    isPlayingRef.current = true;
    try {
      const audioBuffer = await audioCtxRef.current.decodeAudioData(chunk);
      const src = audioCtxRef.current.createBufferSource();
      src.buffer = audioBuffer;
      src.connect(audioCtxRef.current.destination);
      src.onended = () => {
        isPlayingRef.current = false;
        playNext();
      };
      src.start();
    } catch (err) {
      console.error("🔴 Audio decode error:", err);
      isPlayingRef.current = false;
    }
  };

  // 4) Send text, flush, or eof to backend
  const sendText = async (query) => {
    if (!wsReady) return;
    const res = await axios.post(BACKEND_URL + '/api/lmnt/llmoutput', {
      query: query
    })
    wsRef.current.send(JSON.stringify({ res }));
    console.log("→ Sent res:", res);
  };

  const flush = () => {
    if (!wsReady) return;
    wsRef.current.send(JSON.stringify({ flush: true }));
    console.log("→ Sent flush");
  };

  const finish = () => {
    if (!wsReady) return;
    wsRef.current.send(JSON.stringify({ eof: true }));
    console.log("→ Sent eof");
  };

  // 5) UI handlers
  const handleSend = async () => {
    if (!input.trim()) return;
    
    await sendText(input);
    flush();
    setInput("");
  };

  const handleFinish = () => {
    finish();
  };

  return (
    <div className="min-w-[50vw] min-h-[50vh] mx-auto mt-8 p-4 bg-white rounded-lg shadow text-black">
      <h3 className="text-xl font-bold mb-4">Live TTS Streaming</h3>
      <textarea
        rows={3}
        className="w-full p-2 border rounded mb-2"
        placeholder="Type something..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex space-x-2">
        <button
          onClick={handleSend}
          disabled={!wsReady}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Send & Flush
        </button>
        <button
          onClick={handleFinish}
          disabled={!wsReady}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Finish
        </button>
      </div>
      {!wsReady && <p className="mt-2 text-sm text-gray-500">Connecting…</p>}
    </div>
  );
}
