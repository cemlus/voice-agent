import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import LiveTTSPlayer from './components/TextToSpeech'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <App/>
    // <LiveTTSPlayer/>
)
