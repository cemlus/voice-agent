// test-pre.mjs
import fs from 'fs';
import { createClient } from '@deepgram/sdk';
import dotenv from 'dotenv';

dotenv.config();
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// async function testPreRecorded() {
//   try {
//     // Read a 4 s WAV (16-bit PCM) into a Buffer
//     const audio = fs.readFileSync('./sample4s.wav');
//     const response = await dg.transcription.preRecorded(
//       { buffer: audio, mimetype: 'audio/wav' },
//       { punctuate: true, language: 'en-US' }
//     );
//     console.log('✅ Transcript:', response.results.channels[0].alternatives[0].transcript);
//   } catch (e) {
//     console.error('❌ Pre-Recorded error:', e);
//   }
// }

// testPreRecorded();

const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
  fs.createReadStream("../../Audio_07_13_2025_19_01_13.wav"),
  {
    model: "nova-3",
  }
);

if(result){
    console.log(result.results.channels[0].alternatives[0].transcript);
} else {
    console.log(error);
}
