"use client"
import React from "react"
import { useState } from "react"
import { Menu } from "lucide-react"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import STT from "./components/STT"
// import TextToSpeech from "./components/TextToSpeech"
import LongShot from "./Longshot"
import "./App.css"
import TTS from "./components/TTS"
import LiveTTSPlayer from "./components/TextToSpeech"

function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "voice-manager":
        return <LongShot />
      case "text-to-speech":
        return <LiveTTSPlayer />
      case "speech-to-text":
        return <STT />
      case "TTS":
        return <TTS/>
      default:
        return <LongShot />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex w-[100vw]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">VoiceHub</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}

export default App
