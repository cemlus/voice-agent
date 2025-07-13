import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@deepgram/sdk';

const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
const deepgram = new deepgramClient(deepgramApiKey)


// server.js
const deepgramClient = createClient(deepgramApiKey)
const WebSocket = require('ws');
const dgSocket = deepgramClient.transcription.live({ punctuate: true, interim_results: true });

const wss = new WebSocket.Server({ port: 3001 });
wss.on('connection', ws => {
  ws.on('message', msg => dgSocket.send(msg));
  dgSocket.addListener('transcriptReceived', data => ws.send(JSON.stringify(data)));
  ws.on('close', () => dgSocket.finish());
});


const app = express()
app.use(express.json())
app.use(cors())

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`)
})