import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = 'https://voice-agent-qqe1.onrender.com'


function TTS() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  // 1️⃣ Fetch your voices on mount
  useEffect(() => {
    (async () => {
      try {

        const res = await axios.get(
          BACKEND_URL + "/api/lmnt/voices"
        );
        setVoices(res.data);
        console.log(res.data);
        console.log(res.data[0].id);
        
        if (res.data.length) setVoiceId(res.data[0].id);
      } catch (err) {
        console.error("Failed to load voices:", err);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setAudioUrl(null);

    try {
      const res = await axios.post(
        BACKEND_URL + "/api/lmnt/speech",
        { text, voice: voiceId },         // include selected voice
        { responseType: "blob" }
      );
      const blob = res.data;
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("TTS error:", err.message);
      alert("Error generating audio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Text‑to‑Speech Demo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Voice selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Choose Voice Agent
          </label>
          <select
            value={voiceId}
            onChange={(e) => {
                setVoiceId(e.target.value)
                console.log(e.target.value);
                
            }}
            className="w-full border-gray-300 rounded p-2 text-black border-2"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.state})
              </option>
            ))}
          </select>
        </div>

        {/* Text area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full border-gray-300 rounded p-2 resize-none border-2 text-black"
            placeholder="Type something to synthesize…"
          />
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center px-4 py-2 rounded
              ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} 
              text-white font-semibold`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 border-2 border-t-2 rounded-full"
                viewBox="0 0 24 24"
              />
            ) : (
              "Synthesize Speech"
            )}
          </button>
        </div>
      </form>

      {/* Audio player */}
      {audioUrl && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Playback
          </h4>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </div>
  );
}

export default TTS;
