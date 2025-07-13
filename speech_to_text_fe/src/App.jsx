import React, { useState, useRef, useEffect } from 'react';
import LiveTranscription from './components/LiveTranscription';

export default function App() {
  const [connected, setConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const initializedRef = useRef(false); // prevent double init in StrictMode

  // Initialize WebSocket connection once (Guard against StrictMode double mount)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const socket = new WebSocket('ws://localhost:3001/ws');
    wsRef.current = socket;

    socket.binaryType = 'arraybuffer'; // ensure we receive binary correctly

    socket.onopen = () => {
      console.log('🟢 WebSocket connected');
      setConnected(true);
    };

    socket.onerror = (err) => {
      console.error('WebSocket error', err);
      setConnected(false);
    };

    socket.onclose = () => {
      console.log('🔴 WebSocket closed');
      setConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data));
        const alt = data.channel?.alternatives?.[0];
        if (alt) {
          console.log('📝 Transcript:', alt.transcript, 'Final:', data.isFinal);
          setTranscript(prev => data.isFinal ? alt.transcript : `${prev} ${alt.transcript}`);
        }
      } catch (e) {
        console.error('Failed to parse message', e);
      }
    };

    // Do not close on unmount - keep connection live
  }, []);

  // Start recording and stream audio
  const startRecording = async () => {
    if (!connected || isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.onstart = () => {
        console.log('🎤 Recording started');
        setIsRecording(true);
      };
      recorder.onstop = () => {
        console.log('🛑 Recording stopped');
        setIsRecording(false);
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
      };
      recorder.onerror = e => console.error('Recorder error', e.error);

      recorder.ondataavailable = e => {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(e.data);
          console.log('📤 Sent audio chunk, size:', e.data.size);
          console.log('type of data chunks:', typeof(e.data));
        }
      };

      recorder.start(250);
    } catch (err) {
      console.error('Microphone access error', err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Live Transcription Test</h1>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <div className="mt-4">
        {/* <button
          className="px-4 py-2 bg-green-600 text-white rounded mr-2"
          onClick={startRecording}
          disabled={!connected || isRecording}
        >
          Start Recording
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={stopRecording}
          disabled={!isRecording}
        >
          Stop Recording
        </button> */}
        <LiveTranscription/>
      </div>
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-1">Transcript:</h2>
        <p>{transcript}</p>
      </div>
    </div>
  );
}
