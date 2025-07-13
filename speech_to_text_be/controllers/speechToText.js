import dotenv from 'dotenv'
dotenv.config()
import { createClient } from '@deepgram/sdk';

const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
console.log(deepgramApiKey);

import fs from 'fs';

const transcribeFile = async () => {
    // STEP 1: Create a Deepgram client using the API key
    const deepgramClient = createClient(deepgramApiKey)
  // STEP 2: Call the transcribeFile method with the audio payload and options
  const { result, error } = await deepgramClient.listen.prerecorded.transcribeFile(
    // path to the audio file
    fs.readFileSync("../../siddhant_voice.wav"),
    // STEP 3: Configure Deepgram options for audio analysis
    {
      model: "nova-3",
      smart_format: true,
    }
  );
  if (error) throw error;
  // STEP 4: Print the results
  if (!error) console.dir(result, { depth: null });
};

const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");
const fetch = require("cross-fetch");

const live = async () => {
  // The API key you created in step 1
  const deepgramApiKey = "69e111524c4244a6ae0716eafda63420c4ee2f32";

  // URL for the real-time streaming audio you would like to transcribe
  const url = "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service";

  // Initialize the Deepgram SDK
  const deepgram = createClient(deepgramApiKey);

  // Create a websocket connection to Deepgram
  const connection = deepgram.listen.live({
    smart_format: true,
    model: 'nova-2',
    language: 'en-GB',
  });

  // Listen for the connection to open.
  connection.on(LiveTranscriptionEvents.Open, () => {
    // Listen for any transcripts received from Deepgram and write them to the console.
    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      console.dir(data, { depth: null });
    });

    // Listen for any metadata received from Deepgram and write it to the console.
    connection.on(LiveTranscriptionEvents.Metadata, (data) => {
      console.dir(data, { depth: null });
    });

    // Listen for the connection to close.
    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log("Connection closed.");
    });

    // Send streaming audio from the URL to Deepgram.
    fetch(url)
      .then((r) => r.body)
      .then((res) => {
        res.on("readable", () => {
          connection.send(res.read());
        });
      });
  });
};

live();


// const transcription = response['results'].channels[0].alternatives[0].transcript;
// console.log(transcription);


