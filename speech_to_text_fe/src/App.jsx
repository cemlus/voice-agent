// // import React, { useState, useRef, useEffect } from "react";

// // export default function App() {
// //   const [connected, setConnected] = useState(false);
// //   const [isRecording, setIsRecording] = useState(false);
// //   const wsRef = useRef(null);
// //   const mediaRecorderRef = useRef(null);
// //   const mediaStreamRef = useRef(null);
// //   const initializedRef = useRef(false);
// //   const [interim, setInterim] = useState("");
// //   const [finalTranscript, setFinalTranscript] = useState("");

// //   // Initialize WebSocket connection once
// //   useEffect(() => {
// //     if (initializedRef.current) return;
// //     initializedRef.current = true;

// //     console.log("🔄 Initializing WebSocket connection...");
// //     const socket = new WebSocket("ws://localhost:1001/ws");
// //     wsRef.current = socket;

// //     socket.onopen = () => {
// //       console.log("🟢 WebSocket connected");
// //       setConnected(true);
// //     };

// //     socket.onerror = (err) => {
// //       console.error("❌ WebSocket error:", err);
// //       setConnected(false);
// //     };

// //     socket.onclose = (event) => {
// //       console.log("🔴 WebSocket closed:", event.code, event.reason);
// //       setConnected(false);
// //     };

// //     socket.onmessage = (event) => {
// //       console.log("📨 Raw message received:", event.data);
// //       try {
// //         const data = JSON.parse(event.data);
// //         console.log("📝 Parsed message:", data);
        
// //         const alt = data.channel?.alternatives?.[0];
// //         if (alt && alt.transcript) {
// //           console.log("🎯 Transcript found:", alt.transcript, "Is final:", data.is_final);
          
// //           if (data.is_final) {
// //             setFinalTranscript((prev) => prev + " " + alt.transcript);
// //             setInterim("");
// //           } else {
// //             setInterim(alt.transcript);
// //           }
// //         } else {
// //           console.log("⚠️ No transcript in message");
// //         }
// //       } catch (e) {
// //         console.error("❌ Failed to parse message:", e);
// //         console.log("Raw data:", event.data);
// //       }
// //     };

// //     // Cleanup on unmount
// //     return () => {
// //       if (socket.readyState === WebSocket.OPEN) {
// //         socket.close();
// //       }
// //     };
// //   }, []);

// //   // Start recording and stream audio
// //   const startRecording = async () => {
// //     if (!connected || isRecording) {
// //       console.log("⚠️ Cannot start recording - connected:", connected, "isRecording:", isRecording);
// //       return;
// //     }

// //     try {
// //       console.log("🎤 Requesting microphone access...");
// //       const stream = await navigator.mediaDevices.getUserMedia({ 
// //         audio: {
// //           sampleRate: 48000,
// //           channelCount: 1
// //         }
// //       });
      
// //       mediaStreamRef.current = stream;
// //       console.log("🎤 Got media stream:", stream);

// //       // Check supported MIME types
// //       const mimeTypes = [
// //         'audio/webm',
// //         'audio/webm;codecs=opus',
// //         'audio/wav',
// //         'audio/ogg;codecs=opus'
// //       ];
      
// //       let selectedMimeType = null;
// //       for (const mimeType of mimeTypes) {
// //         if (MediaRecorder.isTypeSupported(mimeType)) {
// //           selectedMimeType = mimeType;
// //           console.log("✅ Using MIME type:", mimeType);
// //           break;
// //         }
// //       }

// //       if (!selectedMimeType) {
// //         console.error("❌ No supported MIME type found");
// //         return;
// //       }

// //       const recorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
// //       mediaRecorderRef.current = recorder;

// //       recorder.onstart = () => {
// //         console.log("🎤 Recording started");
// //         setIsRecording(true);
// //       };

// //       recorder.onstop = () => {
// //         console.log("🛑 Recording stopped");
// //         setIsRecording(false);
// //         mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
// //         mediaStreamRef.current = null;
// //         mediaRecorderRef.current = null;
// //       };

// //       recorder.onerror = (e) => {
// //         console.error("❌ Recorder error:", e.error);
// //       };
      
// //       recorder.ondataavailable = (e) => {
// //         console.log("📊 Audio data available - size:", e.data.size, "type:", e.data.type);
        
// //         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && e.data.size > 0) {
// //           wsRef.current.send(e.data);
// //           console.log("📤 Sent audio chunk to server");
// //         } else {
// //           console.warn("⚠️ Cannot send audio - WebSocket state:", wsRef.current?.readyState);
// //         }
// //       };

// //       recorder.start(250); // Send chunks every 250ms
// //       console.log("🎤 MediaRecorder started with 250ms chunks");
      
// //     } catch (err) {
// //       console.error("❌ Microphone access error:", err);
// //     }
// //   };

// //   // Stop recording
// //   const stopRecording = () => {
// //     if (mediaRecorderRef.current && isRecording) {
// //       console.log("🛑 Stopping recording...");
// //       mediaRecorderRef.current.stop();
// //     }
// //   };

// //   return (
// //     <div className="p-4">
// //       <h1 className="text-xl font-bold mb-2">Live Transcription Test</h1>
// //       <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>
// //       <div className="mt-4">
// //         <button
// //           className="px-4 py-2 bg-green-600 text-white rounded mr-2 disabled:opacity-50"
// //           onClick={startRecording}
// //           disabled={!connected || isRecording}
// //         >
// //           {isRecording ? "🎤 Recording..." : "Start Recording"}
// //         </button>
// //         <button
// //           className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
// //           onClick={stopRecording}
// //           disabled={!isRecording}
// //         >
// //           Stop Recording
// //         </button>
// //       </div>
// //       <div className="mt-6 p-4 bg-gray-100 rounded">
// //         <h2 className="font-semibold mb-1">Transcript:</h2>
// //         <p className="min-h-[50px]">
// //           <span className="text-black">{finalTranscript}</span>
// //           <span className="text-gray-400 italic">{interim}</span>
// //         </p>
// //       </div>
// //       <div className="mt-4 p-4 bg-blue-50 rounded">
// //         <h3 className="font-semibold mb-1">Debug Info:</h3>
// //         <p>WebSocket Connected: {connected ? "✅" : "❌"}</p>
// //         <p>Recording: {isRecording ? "✅" : "❌"}</p>
// //         <p>Check console for detailed logs</p>
// //       </div>
// //     </div>
// //   );
// // }

// import React, { useState, useRef, useEffect } from "react";

// export default function App() {
//   const [connected, setConnected] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const mediaStreamRef = useRef(null);
//   const initializedRef = useRef(false);
//   const [interim, setInterim] = useState("");
//   const [finalTranscript, setFinalTranscript] = useState("");

//   // Initialize WebSocket connection once
//   useEffect(() => {
//     if (initializedRef.current) return;
//     initializedRef.current = true;

//     console.log("🔄 Initializing WebSocket connection...");
//     const socket = new WebSocket("ws://localhost:1001/ws");
//     wsRef.current = socket;

//     socket.onopen = () => {
//       console.log("🟢 WebSocket connected");
//       setConnected(true);
//     };

//     socket.onerror = (err) => {
//       console.error("❌ WebSocket error:", err);
//       setConnected(false);
//     };

//     socket.onclose = (event) => {
//       console.log("🔴 WebSocket closed:", event.code, event.reason);
//       setConnected(false);
//     };

//     socket.onmessage = (event) => {
//       console.log("📨 Raw message received:", event.data);
//       try {
//         const data = JSON.parse(event.data);
//         console.log("📝 Parsed message:", data);
        
//         // Handle both old and new Deepgram response formats
//         const alt = data.channel?.alternatives?.[0];
//         if (alt && alt.transcript) {
//           console.log("🎯 Transcript found:", alt.transcript, "Is final:", data.is_final);
          
//           if (data.is_final) {
//             setFinalTranscript((prev) => prev + " " + alt.transcript);
//             setInterim("");
//           } else {
//             setInterim(alt.transcript);
//           }
//         } else {
//           console.log("⚠️ No transcript in message");
//         }
//       } catch (e) {
//         console.error("❌ Failed to parse message:", e);
//         console.log("Raw data:", event.data);
//       }
//     };

//     // Cleanup on unmount
//     return () => {
//       if (socket.readyState === WebSocket.OPEN) {
//         socket.close();
//       }
//     };
//   }, []);

//   // Start recording and stream audio
//   const startRecording = async () => {
//     if (!connected || isRecording) {
//       console.log("⚠️ Cannot start recording - connected:", connected, "isRecording:", isRecording);
//       return;
//     }

//     try {
//       console.log("🎤 Requesting microphone access...");
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           sampleRate: 48000,
//           channelCount: 1
//         }
//       });
      
//       mediaStreamRef.current = stream;
//       console.log("🎤 Got media stream:", stream);

//       // Check supported MIME types
//       const mimeTypes = [
//         'audio/webm',
//         'audio/webm;codecs=opus',
//         'audio/wav',
//         'audio/ogg;codecs=opus'
//       ];
      
//       let selectedMimeType = null;
//       for (const mimeType of mimeTypes) {
//         if (MediaRecorder.isTypeSupported(mimeType)) {
//           selectedMimeType = mimeType;
//           console.log("✅ Using MIME type:", mimeType);
//           break;
//         }
//       }

//       if (!selectedMimeType) {
//         console.error("❌ No supported MIME type found");
//         return;
//       }

//       const recorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
//       mediaRecorderRef.current = recorder;

//       recorder.onstart = () => {
//         console.log("🎤 Recording started");
//         setIsRecording(true);
//       };

//       recorder.onstop = () => {
//         console.log("🛑 Recording stopped");
//         setIsRecording(false);
//         mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
//         mediaStreamRef.current = null;
//         mediaRecorderRef.current = null;
//       };

//       recorder.onerror = (e) => {
//         console.error("❌ Recorder error:", e.error);
//       };
      
//       recorder.ondataavailable = (e) => {
//         console.log("📊 Audio data available - size:", e.data.size, "type:", e.data.type);
        
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && e.data.size > 0) {
//           wsRef.current.send(e.data);
//           console.log("📤 Sent audio chunk to server");
//         } else {
//           console.warn("⚠️ Cannot send audio - WebSocket state:", wsRef.current?.readyState);
//         }
//       };

//       recorder.start(250); // Send chunks every 250ms
//       console.log("🎤 MediaRecorder started with 250ms chunks");
      
//     } catch (err) {
//       console.error("❌ Microphone access error:", err);
//     }
//   };

//   // Stop recording
//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       console.log("🛑 Stopping recording...");
//       mediaRecorderRef.current.stop();
//     }
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-2">Live Transcription Test</h1>
//       <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>
//       <div className="mt-4">
//         <button
//           className="px-4 py-2 bg-green-600 text-white rounded mr-2 disabled:opacity-50"
//           onClick={startRecording}
//           disabled={!connected || isRecording}
//         >
//           {isRecording ? "🎤 Recording..." : "Start Recording"}
//         </button>
//         <button
//           className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
//           onClick={stopRecording}
//           disabled={!isRecording}
//         >
//           Stop Recording
//         </button>
//       </div>
//       <div className="mt-6 p-4 bg-gray-100 rounded">
//         <h2 className="font-semibold mb-1">Transcript:</h2>
//         <p className="min-h-[50px]">
//           <span className="text-black">{finalTranscript}</span>
//           <span className="text-gray-400 italic">{interim}</span>
//         </p>
//       </div>
//       <div className="mt-4 p-4 bg-blue-50 rounded">
//         <h3 className="font-semibold mb-1">Debug Info:</h3>
//         <p>WebSocket Connected: {connected ? "✅" : "❌"}</p>
//         <p>Recording: {isRecording ? "✅" : "❌"}</p>
//         <p>Check console for detailed logs</p>
//       </div>
//     </div>
//   );
// }

// App.jsx
// "use strict"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import './App.css'

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [caption, setCaption] = useState("Realtime speech transcription API");
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [debugInfo, setDebugInfo] = useState([]);
  
  const socketRef = useRef(null);
  const microphoneRef = useRef(null);
  const streamRef = useRef(null);

  // Debug logging function
  const addDebugLog = useCallback((message) => {
    console.log(message);
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        addDebugLog("Attempting to connect to WebSocket...");
        socketRef.current = new WebSocket("ws://localhost:3000");
        
        socketRef.current.onopen = () => {
          addDebugLog("client: connected to server");
          setIsConnected(true);
          setConnectionStatus('Connected');
          setError(null);
        };

        socketRef.current.onmessage = (event) => {
          addDebugLog(`Received message: ${event.data.substring(0, 100)}...`);
          if (event.data === "") {
            return;
          }
          
          let data;
          try {
            data = JSON.parse(event.data);
          } catch (e) {
            addDebugLog(`Failed to parse JSON: ${e.message}`);
            return;
          }
        
          if (data && data.channel && data.channel.alternatives && data.channel.alternatives[0] && data.channel.alternatives[0].transcript !== "") {
            addDebugLog(`Updating caption: ${data.channel.alternatives[0].transcript}`);
            setCaption(data.channel.alternatives[0].transcript);
          }
        };

        socketRef.current.onclose = (event) => {
          addDebugLog(`client: disconnected from server (code: ${event.code}, reason: ${event.reason})`);
          setIsConnected(false);
          setConnectionStatus('Disconnected');
          setIsRecording(false);
        };

        socketRef.current.onerror = (error) => {
          addDebugLog(`WebSocket error: ${error.message || 'Unknown error'}`);
          setError("WebSocket connection failed");
          setConnectionStatus('Connection Error');
        };

      } catch (error) {
        addDebugLog(`Failed to create WebSocket connection: ${error.message}`);
        setError("Failed to connect to server");
        setConnectionStatus('Connection Failed');
      }
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [addDebugLog]);

  // Get microphone access
  const getMicrophone = useCallback(async () => {
    try {
      addDebugLog("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      addDebugLog("Microphone access granted");
      
      // Check if MediaRecorder supports webm
      const mimeTypes = ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/wav'];
      let supportedMimeType = null;
      
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          supportedMimeType = mimeType;
          break;
        }
      }
      
      if (!supportedMimeType) {
        throw new Error("No supported audio format found");
      }
      
      addDebugLog(`Using MIME type: ${supportedMimeType}`);
      return new MediaRecorder(stream, { mimeType: supportedMimeType });
    } catch (error) {
      addDebugLog(`Error accessing microphone: ${error.message}`);
      setError("Could not access microphone. Please check permissions.");
      throw error;
    }
  }, [addDebugLog]);

  // Setup microphone recording
  const openMicrophone = useCallback((microphone, socket) => {
    return new Promise((resolve) => {
      microphone.onstart = () => {
        addDebugLog("client: microphone opened");
        setIsRecording(true);
        resolve();
      };

      microphone.onstop = () => {
        addDebugLog("client: microphone closed");
        setIsRecording(false);
      };

      microphone.ondataavailable = (event) => {
        addDebugLog(`client: microphone data received - size: ${event.data.size} bytes`);
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          addDebugLog("Sending audio data to server...");
          socket.send(event.data);
        } else {
          addDebugLog(`Cannot send data - size: ${event.data.size}, socket state: ${socket.readyState}`);
        }
      };

      microphone.onerror = (event) => {
        addDebugLog(`MediaRecorder error: ${event.error}`);
        setError(`Recording error: ${event.error}`);
      };

      addDebugLog("Starting microphone recording...");
      microphone.start(1000);
    });
  }, [addDebugLog]);

  // Close microphone
  const closeMicrophone = useCallback((microphone) => {
    addDebugLog("Closing microphone...");
    if (microphone && microphone.state !== 'inactive') {
      microphone.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        addDebugLog(`Stopped track: ${track.kind}`);
      });
      streamRef.current = null;
    }
  }, [addDebugLog]);

  // Handle recording toggle
  const handleRecordClick = useCallback(async () => {
    addDebugLog(`Record button clicked - isRecording: ${isRecording}, isConnected: ${isConnected}`);
    
    if (!isConnected) {
      setError("Not connected to server");
      addDebugLog("Cannot record - not connected to server");
      return;
    }

    if (!isRecording) {
      try {
        setError(null);
        addDebugLog("Starting recording process...");
        const microphone = await getMicrophone();
        microphoneRef.current = microphone;
        await openMicrophone(microphone, socketRef.current);
        addDebugLog("Recording started successfully");
      } catch (error) {
        addDebugLog(`Error starting recording: ${error.message}`);
        setError("Failed to start recording");
      }
    } else {
      if (microphoneRef.current) {
        closeMicrophone(microphoneRef.current);
        microphoneRef.current = null;
        addDebugLog("Recording stopped");
      }
    }
  }, [isRecording, isConnected, getMicrophone, openMicrophone, closeMicrophone, addDebugLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      addDebugLog("Component unmounting - cleaning up...");
      if (microphoneRef.current) {
        closeMicrophone(microphoneRef.current);
      }
    };
  }, [closeMicrophone, addDebugLog]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Captions by Deepgram
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {connectionStatus}
            </span>
          </div>
        </div>

        {/* Record Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleRecordClick}
            disabled={!isConnected}
            className={`
              relative w-24 h-24 rounded-full transition-all duration-300 transform
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-lg shadow-red-500/50' 
                : 'bg-blue-500 hover:bg-blue-600 hover:scale-105 shadow-lg shadow-blue-500/50'
              }
              ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              flex items-center justify-center
            `}
          >
            {isRecording ? (
              <>
                <MicOff className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-full border-4 border-white animate-ping"></div>
              </>
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Button Status */}
        <div className="text-center mb-6">
          <span className={`text-sm font-medium ${isRecording ? 'text-red-600' : 'text-blue-600'}`}>
            {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
          </span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Debug Information */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Log:</h3>
          <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
            {debugInfo.map((log, index) => (
              <div key={index} className="font-mono">{log}</div>
            ))}
          </div>
        </div>

        {/* Captions Display */}
        <div className="bg-gray-50 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
          <div className="text-center">
            <Volume2 className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-lg text-gray-700 leading-relaxed">
              {caption}
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-4 mt-8">
          <a
            href="https://console.deepgram.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Sign Up
          </a>
          <a
            href="https://developers.deepgram.com/docs/introduction"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Read the Docs
          </a>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-sm font-medium">Recording</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;