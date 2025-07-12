import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /wav|mp3|mp4|m4a|webm/;
  const isValidType = allowedTypes.test(file.mimetype);
  if (isValidType) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only wav, mp3, mp4, m4a, and webm are allowed.'), false);
  }
};

const limits = {
  fileSize: 250 * 1024 * 1024, // 250 MB
};

const voiceUpload = multer({
  storage,
  fileFilter,
  limits,
}).array('audioFiles', 20); // Accept up to 20 files

export default voiceUpload;
