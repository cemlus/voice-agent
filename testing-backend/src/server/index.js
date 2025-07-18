// server.js (Looks good!)
import express from 'express';
import cors from 'cors';
import userRouter from '../routes/userRoutes.js'; // Added .js extension
import dotenv from 'dotenv';
import lmntRouter from '../routes/lmntRoutes.js';
import http from 'http'
import url from 'url'
import { sttWss } from '../stt.js';
import { ttsWss } from '../websocket_testing.js'

dotenv.config();
const PORT = process.env.PORT || 8080;
const LMNT_API_KEY = process.env.LMNT_API_KEY ;
const LMNT_VOICE_ID = process.env.LMNT_VOICE_ID;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname'; // Default URI if not set

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.use('/api/users', userRouter);
app.use('/api/lmnt', lmntRouter);

const server = http.createServer(app); // This is the single HTTP server instance

server.on('upgrade', (req, socket, head) => {
  const { pathname } = url.parse(req.url)

  if(pathname == '/tts'){
    ttsWss.handleUpgrade(req, socket, head, (ws) => {
      ttsWss.emit("connection", ws, req);
    })
  } else if (pathname == '/stt'){
    sttWss.handleUpgrade(req, socket, head, (ws) => {
      sttWss.emit("connection", ws, req);
    })
  }
  else {
    socket.destroy(); 
  }

})


server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  console.log(`WebSocket Server is running on port ws://localhost:${PORT}/tts for Text-To-Speech`);
  console.log(`WebSocket Server is running on port ws://localhost:${PORT}/stt for Speech-To-Text`);
});

