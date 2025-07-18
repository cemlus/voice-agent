import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../App.css'
// Define your backend URL for Deepgram ASR
// Corrected port from 9091 to 9090 to match the backend server's listening port.
const DEEPGRAM_WS_URL = 'wss://voice-agent-qqe1.onrender.com/stt'; // For Deepgram ASR

// Main application component
export default function STT() {
  // --- State for Deepgram ASR (Speech-to-Text) ---
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("Start speaking...");
  const deepgramWsRef = useRef(null);
  const mediaRecorderRef = useRef(null); // For microphone access
  const [deepgramStatus, setDeepgramStatus] = useState("Disconnected"); // More detailed status

  // --- Setup Deepgram ASR WebSocket Connection ---
  useEffect(() => {
    const connectWebSocket = () => {
      setDeepgramStatus("Connecting...");
      const ws = new WebSocket(DEEPGRAM_WS_URL);
      ws.binaryType = 'arraybuffer'; // Expect binary data for audio

      ws.onopen = () => {
        console.log('✅ Deepgram WS Connected');
        setDeepgramStatus("Connected");
        // No specific init frame needed for Deepgram client, just ready to send audio
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Deepgram sends transcript data in a specific structure
          if (data.channel && data.channel.alternatives && data.channel.alternatives[0] && data.channel.alternatives[0].transcript !== "") {
            setTranscript(data.channel.alternatives[0].transcript);
          } else if (data.metadata) {
            console.log('Deepgram Metadata:', data.metadata);
          }
        } catch (e) {
          console.error('Error parsing Deepgram WS message:', e, event.data);
        }
      };

      ws.onerror = (errorEvent) => {
        console.error('⚠️ Deepgram WS Error Event:', errorEvent.type, errorEvent);
        setDeepgramStatus("Error: Check backend (port 9090)");
        setTranscript("Deepgram connection error. Please ensure the backend server on port 9090 is running.");
      };

      ws.onclose = (closeEvent) => {
        console.log('⭕ Deepgram WS Closed. Code:', closeEvent.code, 'Reason:', closeEvent.reason);
        setDeepgramStatus("Disconnected");
        setIsRecording(false); // Ensure recording state is reset
        setTranscript("Deepgram connection closed.");

        // Attempt to reconnect after a delay if it was an unexpected close
        // This simple auto-reconnect can be expanded with exponential backoff
        if (!closeEvent.wasClean) { // If the connection was not closed cleanly
          console.log('Attempting to reconnect to Deepgram WS in 10 seconds...');
        //   setTimeout(connectWebSocket, 10000);
        }
      };

      deepgramWsRef.current = ws;
    };

    connectWebSocket(); // Initial connection attempt

    // Cleanup function for Deepgram WebSocket
    return () => {
      if (deepgramWsRef.current) {
        // Ensure the WebSocket is closed cleanly on component unmount
        deepgramWsRef.current.close(1000, "Component unmounted");
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // --- Microphone and MediaRecorder Logic ---
  const getMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Using 'audio/webm' as per your client-side script
      return new MediaRecorder(stream, { mimeType: 'audio/webm' });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure it is connected and permissions are granted.');
      throw error;
    }
  }, []);

  const openMicrophone = useCallback(async () => {
    if (!deepgramWsRef.current || deepgramWsRef.current.readyState !== WebSocket.OPEN) {
      alert("Deepgram WebSocket is not open. Please wait for connection or refresh.");
      return;
    }

    try {
      const microphone = await getMicrophone();
      mediaRecorderRef.current = microphone;

      microphone.onstart = () => {
        console.log('Client: Microphone opened, recording started.');
        setIsRecording(true);
      };

      microphone.onstop = () => {
        console.log('Client: Microphone closed, recording stopped.');
        setIsRecording(false);
        // Deepgram SDK handles end-of-stream internally on the server side when client WS closes.
      };

      microphone.ondataavailable = (event) => {
        if (event.data.size > 0 && deepgramWsRef.current.readyState === WebSocket.OPEN) {
          deepgramWsRef.current.send(event.data); // Send audio Blob directly
        }
      };

      microphone.start(1000); // Send data every 1 second
      setTranscript("Listening...");

    } catch (error) {
      console.error('Error opening microphone:', error);
      setIsRecording(false);
    }
  }, [getMicrophone]);

  const closeMicrophone = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      closeMicrophone();
    } else {
      openMicrophone();
    }
  }, [isRecording, openMicrophone, closeMicrophone]);

  // --- UI Rendering ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter text-gray-800">
      <h1 className="text-4xl font-bold text-blue-700 mb-8 rounded-lg p-2 shadow-md">
        Deepgram Live Transcription
      </h1>

      {/* Deepgram ASR Section */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">Live Transcription</h2>
        <div className="flex justify-center mb-4">
          <button
            onClick={handleToggleRecording}
            disabled={deepgramWsRef.current?.readyState !== WebSocket.OPEN}
            className={`px-6 py-3 rounded-full text-white font-bold transition-all duration-300 ease-in-out shadow-md
              ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              ${deepgramWsRef.current?.readyState !== WebSocket.OPEN ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px] flex items-center justify-center">
          <p className="text-lg text-gray-700 text-center">
            {deepgramWsRef.current?.readyState !== WebSocket.OPEN ? "Connecting to ASR..." : transcript}
          </p>
        </div>
      </div>

      {/* Global Status Indicators */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>Deepgram ASR Status: {deepgramStatus}</p>
      </div>
    </div>
  );
}
