"use client"
import React from "react"
import { Home, Mic, Volume2, Settings, BarChart3, Users, X, Presentation } from "lucide-react"

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "voice-manager", label: "Voice Manager", icon: Mic },
    { id: "text-to-speech", label: "Text to Speech", icon: Volume2 },
    { id: "TTS", label: "TTS", icon: Presentation },
  ]

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <div
        className={`
        fixed top-0 left-0 bg-slate-900 text-white z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
        w-[17vw] flex flex-col h-[100vh] 
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold">VoiceHub</h1>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 hover:bg-slate-800 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id)
                      setIsOpen(false) // Close mobile menu
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                      ${
                        activeTab === item.id
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">User</p>
              <p className="text-xs text-slate-400 truncate">user@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
