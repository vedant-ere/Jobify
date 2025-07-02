// fileName and path : backend\src\controllers\resumeController.js
import mammoth from "mammoth";
import fs from "fs";
import Resume from "../models/ResumeModel.js";
import { extractSkills } from "../utils/skillExtractor.js";
import { convertSkillsForUser } from "../utils/convertSkillsForUser.js";
import { saveSkillsToUser } from "../utils/saveSkillsToUser.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    let extractedText = "";

    if (req.file.mimetype == "application/pdf") {
   
      let dataBuffer = fs.readFileSync(req.file.path);
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

    const userSkills = await convertSkillsForUser(skillsResult);
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