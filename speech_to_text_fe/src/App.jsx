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
import React, { useEffect, useRef, useState } from 'react';

export default function App() {
  const [connected, setConnected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const socketRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  // 1) Establish WebSocket connection on mount
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000');
    socket.binaryType = 'arraybuffer';

    socket.onopen = () => {
      console.log('WS: connected');
      setConnected(true);
    };

    socket.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.channel) {
          const txt = data.channel.alternatives[0].transcript;
          if (txt) setTranscript(txt);
        }
      } catch (e) {
        // could be metadata or parse error
      }
    };

    socket.onerror = (err) => {
      console.error('WS error:', err);
    };

    socket.onclose = () => {
      console.log('WS: disconnected');
      setConnected(false);
      stopRecording(); // ensure mic is off
    };

    socketRef.current = socket;
    return () => {
      socket.close();
    };
  }, []);

  // 2) Start MediaRecorder streaming 1s blobs
  const startRecording = async () => {
    if (!connected || recording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorderRef.current = recorder;

      recorder.onstart = () => {
        console.log('Mic: started');
        setRecording(true);
      };

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(e.data);
          console.log('Sent blob size:', e.data.size);
        }
      };

      recorder.onstop = () => {
        console.log('Mic: stopped');
        setRecording(false);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start(1000); // emit 1s chunks
    } catch (err) {
      console.error('Mic error:', err);
    }
  };

  // 3) Stop recording
  const stopRecording = () => {
    if (recorderRef.current && recording) {
      recorderRef.current.stop();
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>🎤 Live Transcription</h1>
      <p>
        WS Status:{' '}
        <strong style={{ color: connected ? 'green' : 'red' }}>
          {connected ? 'Connected' : 'Disconnected'}
        </strong>
      </p>
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={!connected}
        style={{
          padding: '0.5em 1em',
          background: recording ? '#c00' : '#0a0',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: connected ? 'pointer' : 'not-allowed',
        }}
      >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>

      <div
        style={{
          marginTop: 20,
          padding: 10,
          background: '#f0f0f0',
          minHeight: 60,
          borderRadius: 4,
          color: 'black'
        }}
      >
        <strong>Transcript:</strong>
        <p style={{ marginTop: 8 }}>{transcript || <em>No speech detected</em>}</p>
      </div>
    </div>
  );
}
