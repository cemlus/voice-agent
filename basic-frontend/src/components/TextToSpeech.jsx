import React, { useState, useRef, useEffect } from 'react';

// Streaming TTS with LMNT WebSocket
export default function StreamingTTS() {
  const [text, setText] = useState('Hello, this is a streaming test.');
  const [streaming, setStreaming] = useState(false);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const queueRef = useRef([]);
  const bufferRef = useRef(null);

  const REACT_APP_LMNT_API_KEY = 'ak_HUSHEgfmxBMtuFY2kPCRtV'

  // Initialize Web Audio API
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Function to connect and start streaming
  const startStreaming = () => {
    if (streaming) return;
    setStreaming(true);
    socketRef.current = new WebSocket('ws://localhost:8080/tts');

    socketRef.current.binaryType = 'arraybuffer';

    socketRef.current.onopen = () => {
      // Send auth and config
      socketRef.current.send(JSON.stringify({ init: true }));

    //   socketRef.current.send(JSON.stringify({
    //     'X-API-Key': REACT_APP_LMNT_API_KEY,
    //     voice: 'leah',
    //     format: 'mp3',
    //     sample_rate: 24000,
    //     conversational: true
    //   }));

      // Send text and flush
      socketRef.current.send(JSON.stringify({ text, flush: true }));
    };

    socketRef.current.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        // JSON metadata
        console.log('Meta:', event.data);
      } else {
        // Binary audio chunk
        queueRef.current.push(event.data);
        playQueue();
      }
    };

    socketRef.current.onclose = () => {
      setStreaming(false);
      console.log('Streaming closed');
    };

    socketRef.current.onerror = (err) => {
      console.error('WebSocket error', err);
      socketRef.current.close();
    };
  };

  // Play queued audio chunks
  const playQueue = async () => {
    if (!audioContextRef.current || bufferRef.current) return;

    const chunk = queueRef.current.shift();
    if (!chunk) return;

    bufferRef.current = await audioContextRef.current.decodeAudioData(chunk);
    const src = audioContextRef.current.createBufferSource();
    src.buffer = bufferRef.current;
    src.connect(audioContextRef.current.destination);
    src.onended = () => {
      bufferRef.current = null;
      playQueue();
    };
    src.start();
    sourceRef.current = src;
  };

  const stopStreaming = () => {
    if (socketRef.current) socketRef.current.close();
    setStreaming(false);
    queueRef.current = [];
    if (sourceRef.current) sourceRef.current.stop();
  };

  return (
    <div className="p-4 text-black">
      <h2 className="text-lg font-semibold mb-2">LMNT Streaming TTS Demo</h2>
      <textarea
        rows={3}
        className="w-full p-2 border rounded mb-2"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div className="space-x-2">
        <button
          onClick={startStreaming}
          disabled={streaming}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {streaming ? 'Streaming...' : 'Start Streaming'}
        </button>
        {streaming && (
          <button
            onClick={stopStreaming}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
