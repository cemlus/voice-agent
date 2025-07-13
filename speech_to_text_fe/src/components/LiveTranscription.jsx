// LiveTranscription.jsx
import React, { useEffect, useRef, useState } from "react";

export default function LiveTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);

  const convertFloat32ToInt16 = (buffer) => {
    const l = buffer.length;
    const int16Buffer = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16Buffer[i] = Math.min(1, buffer[i]) * 0x7FFF; // clamp and convert
    }
    return int16Buffer;
  };

  const startRecording = async () => {
    try {
      // Create socket
      socketRef.current = new WebSocket("ws://localhost:3001/ws");
      socketRef.current.binaryType = "arraybuffer";

      socketRef.current.onopen = async () => {
        console.log("🟢 WebSocket connected");

        // Setup audio context
        audioContextRef.current = new AudioContext({ sampleRate: 16000 }); // Deepgram prefers 16kHz
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);

        // Use ScriptProcessorNode (AudioWorklet is better but more setup)
        processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        processorRef.current.onaudioprocess = (e) => {
          const float32Data = e.inputBuffer.getChannelData(0); // Mono channel
          const int16Data = convertFloat32ToInt16(float32Data);
          if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(int16Data.buffer);
          }
        };

        // Connect audio graph
        sourceRef.current.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);

        setIsRecording(true);
      };

      socketRef.current.onerror = (err) => {
        console.error("🔴 WebSocket error:", err);
      };

      socketRef.current.onclose = () => {
        console.log("🔌 WebSocket closed");
      };

    } catch (err) {
      console.error("🎙️ Mic access error:", err);
    }
  };

  const stopRecording = () => {
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();

    streamRef.current?.getTracks().forEach(track => track.stop());
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    setIsRecording(false);
  };

  return (
    <div>
      <h2>🎤 Live Transcription</h2>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}
