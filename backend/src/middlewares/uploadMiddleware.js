import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer
const uploadFolder = path.join(__dirname, "../../uploads");
console.log("Upload folder path:", uploadFolder); // Debug log

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // FIX: sanitize filename (removes slashes, etc.)
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");

    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Checks if file is PDF or DOCX
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only PDF and DOCX files are allowed"), false); // Reject file
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

export { upload };

