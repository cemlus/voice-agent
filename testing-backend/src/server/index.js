import express from 'express';
import cors from 'cors';
import userRouter from '../routes/userRoutes.js'; // Added .js extension
import dotenv from 'dotenv';
import lmntRouter from '../routes/lmntRoutes.js';
import { attachTtsStream } from '../websocket_testing.js';
import http from 'http'

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

app.use('/api/users', userRouter); // Adjust the path as necessary)

app.use('/api/lmnt', lmntRouter)

const server = http.createServer(app)

attachTtsStream({
  server,
  apiKey: LMNT_API_KEY,
  voiceId: LMNT_VOICE_ID
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  console.log(`WebSocket Server is running on port ws://localhost:${PORT}/tts`);
});
