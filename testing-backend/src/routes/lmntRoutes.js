/*
https://api.lmnt.com/v1/ai/voice this is the endpoint for the Lmnt API to create a voice


https://api.lmnt.com/v1/ai/voice/list this is the endpoint for the Lmnt API to list voices

https://api.lmnt.com/v1/ai/speech/bytes this is the endpoint for the Lmnt API to stream audio

*/

import { Router } from "express";
import { createVoice, deleteVoiceById, getVoiceById, getVoices, updateVoiceById } from "../controllers/lmntcontrollers.js"; // Adjust the path as necessary
import { getAudioFromText } from "../controllers/lmntSpeechControllers.js";
const LMNT_API_KEY = process.env.LMNT_API_KEY;

const lmntRouter = Router();

lmntRouter.get("/voices", getVoices);
lmntRouter.get("/voices/:id", getVoiceById);
lmntRouter.post("/voices", createVoice)
lmntRouter.put("/voices/:id", updateVoiceById);
lmntRouter.delete("/voices/:id", deleteVoiceById)

lmntRouter.post('/speech', getAudioFromText)


export default lmntRouter;

