import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import multer from "multer";
// import voiceUpload from "../middleware/multer.js";

dotenv.config();

const LMNT_API_KEY = process.env.LMNT_API_KEY;

export async function getVoices(req, res) {    // console.log(LMNT_API_KEY);

    try {
        const response = await axios.get("https://api.lmnt.com/v1/ai/voice/list", {
            headers: {
                "X-API-KEY": LMNT_API_KEY,
            },
        });
        const voices = response.data;
        return res.status(200).json(voices);
    } catch (error) {
        console.error("Error fetching voices:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getVoiceById(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Voice ID is required" });
    }
    try {
        const response = await axios.get("https://api.lmnt.com/v1/ai/voice/" + id, {
            headers: {
                "X-API-KEY": LMNT_API_KEY,
            },
        });
        const voiceDetails = response.data;
        return res.status(200).json(voiceDetails);
    } catch (error) {
        console.error("Error fetching voice by ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteVoiceById(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Voice ID is required" });
    }
    try {
        const response = await axios.delete(
            "https://api.lmnt.com/v1/ai/voice/" + id,
            {
                headers: {
                    "X-API-KEY": LMNT_API_KEY,
                },
            }
        );
        return res.status(200).json({ message: "Voice deleted successfully" });
    } catch (error) {
        console.error("Error deleting voice by ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// type is default to instant and enhance is default to false

// ----- Multer setup -----
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowed = /wav|mp3|mp4|m4a|webm/;
    allowed.test(file.mimetype)
        ? cb(null, true)
        : cb(new Error('Invalid file type. Only wav, mp3, mp4, m4a, webm.'));
};
const limits = { fileSize: 250 * 1024 * 1024 };

const voiceUpload = multer({ storage, fileFilter, limits }).array('audioFiles', 20);

// ----- Helper to clean up files -----
function cleanupFiles(files) {
    files.forEach((f) => {
        try { fs.unlinkSync(f.path); }
        catch (_) { /* ignore if already gone */ }
    });
}

export async function createVoice(req, res) {
    // 1) run multer
    voiceUpload(req, res, async (uploadErr) => {
        if (uploadErr) {
            return res.status(400).json({ error: uploadErr.message });
        }
        // 2) validate
        const metadataJson = req.body.metadata;
        if (!metadataJson) {
            return res.status(400).json({ error: "Missing metadata field" });
        }

        let metadata;
        try {
            metadata = JSON.parse(metadataJson);
        } catch (e) {
            return res.status(400).json({ error: "Invalid JSON in metadata" });
        }

        const { name, enhance, type = 'instant', gender, description } = metadata;


        if (!name || enhance == null) {
            cleanupFiles(req.files);
            return res.status(400).json({ message: 'name and enhance are required' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded.' });
        }

        // 3) build the form-data
        const form = new FormData();
        form.append('metadata', JSON.stringify({
            name,
            enhance: enhance === 'true' || enhance === true,
            type,
            gender,
            description,
        }));
        req.files.forEach((file) => {
            form.append('files', fs.createReadStream(file.path));
        });

        // 4) call LMNT
        try {
            const response = await axios.post(
                'https://api.lmnt.com/v1/ai/voice',
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                        'X-API-Key': LMNT_API_KEY,
                    },
                    maxBodyLength: Infinity,
                }
            );
            // 5) cleanup & respond
            cleanupFiles(req.files);
            console.log(response.data);
            
            return res.status(200).json({
                message: 'Voice created successfully',
                voiceData: response.data,
            });
        } catch (err) {
            console.error('LMNT error:', err.response?.data || err.message);
            cleanupFiles(req.files);
            return res.status(500).json({ error: 'Failed to create LMNT voice' });
        }
    });
}

export async function updateVoiceById(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Voice ID is required" });
    }
    const { name, description, starred = false, unfreeze = false } = req.body;
    // by default the unfreeze and starred is false
    
    try {
        const response = await axios.put(`https://api.lmnt.com/v1/ai/voice/${id}`, {
            headers: {
                'X-API-Key': LMNT_API_KEY,
            },
            name: name,
            description: description,
            starred: starred,
            unfreeze: unfreeze            
        });

        const voiceDetails = response.data
        return res.status(200).json({
            voiceDetails
        })

    } catch (error) {
        console.error("Error updating voice by ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


async function synthesizeText(text, voiceId) {
  const response = await axios.get('https://api.lmnt.com/v1/ai/speech', {
    responseType: 'arraybuffer',
    params: {
      text,
      voice: voiceId,
      format: 'mp3',
      language: 'en',
    },
    headers: {
      'X-API-Key': process.env.LMNT_API_KEY,
    },
  });

  // write out the audio file
  fs.writeFileSync('tts-output.mp3', response.data);
  console.log('Saved tts-output.mp3');
}

// usage:
synthesizeText('Hello from LMNT! Hope you are having a great day!', 'morgan')
  .catch(console.error);
