import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import pdf from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer
const uploadFolder = path.join(__dirname, "uploads");
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

import pdf from "pdf-parse";
import mammoth from "mammoth";
import Resume from "../models/ResumeModel.js";
import { extractSkills } from "../utils/skillExtractor.js";
import { convertSkillsForUser } from "../utils/convertSkillsForUser.js";
import { saveSkillsToUser } from "../utils/saveSkillsToUser.js";

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    let extractedText = "";

    if (req.file.mimetype == "application/pdf") {
      let dataBuffer = fs.readFileSync(filePath);
      let data = await pdf(dataBuffer);
      extractedText = data.text;
    } else if (
      req.file.mimetype ==
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      let result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    }
    console.log("Extracted text length:", extractedText.length);
    console.log("First 200 chars:", extractedText.substring(0, 200));

    const skillsResult = extractSkills(extractedText);
    console.log("Skills extracted:", skillsResult);

    const userSkills = convertSkillsForUser(skillsResult);
    console.log("Formatted skills", userSkills);
   
    const saved = await saveSkillsToUser(req.user._id, userSkills);
    console.log("Skills saved to DB:", saved);

    res.json({
      message: "Resume uploaded successfully",
      fileName: fileName,
      textLength: extractedText.length,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({ error: "Failed to process resume" });
  }
};

export { uploadResume };
