import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required :true,
  },
  originalFileName: {
    type: String,
    required: true,
  },
  extractedText : {
    type : String,
    
    
  },
  parsedSkills : {
    type: Array,

  },
  uploadDate: {
  type: Date,
  default: Date.now,
}
});

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume