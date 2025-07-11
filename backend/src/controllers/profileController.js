import User from "../models/UserModel.js";
import mongoose from "mongoose";

const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body; // Array of objects
    const userId = req.user._id;
    const user = await User.findById(userId);

    const exisitngSkills = user.skills || [];

    const skillsMap = new Map();
    exisitngSkills.map((skill) => skillsMap.set(skill.skillName, skill));
    console.log(exisitngSkills);

    if (!Array.isArray(skills))
      return res.status(400).json({ error: "Skills must be an Array" });

    for (const s of skills) {
      if (typeof s.skillName !== "string" || !s.skillName.trim())
        return res
          .status(400)
          .json({ error: "Each skill must have a skillName" });
      if (
        !Number.isInteger(s.proficiency) ||
        s.proficiency < 1 ||
        s.proficiency > 5
      )
        return res
          .status(400)
          .json({ error: "proficiency must be between 1-5" });
      if (
        typeof s.category !== "string" ||
        !s.category.trim() ||
        s.category == ""
      ) {
        s.category = "technical";
      }
    }

    const uniqueSkills = [];
    const skillNames = new Set();

    for (const skill of skills) {
      const name = skill.skillName.toLowerCase().trim();
      if (!skillNames.has(name)) {
        skillNames.add(name);
        uniqueSkills.push({
          skillName: name,
          proficiency: skill.proficiency,
          category: skill.category.toLowerCase(),
          verified: false,
        });
      }
    }

    for (const newSkill of uniqueSkills) {
      const skillName = newSkill.skillName;

      if (skillsMap.has(skillName)) {
        skillsMap.set(newSkill.skillName, newSkill);
      } else {
        skillsMap.set(newSkill.skillName, newSkill);
      }
    }
    const finalSkills = Array.from(skillsMap.values());

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { skills: finalSkills } },
      { new: true, runValidators: true }
    );

    return res.json({
      message: "Skills updated Successfully",
      skills: updatedUser.skills,
    });
  } catch (error) {
    console.error("Error updating skills:", error);
    return res.status(500).json({ error: "Server error updating skills" });
  }
};

const deleteSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    const skillId = req.params.skillId;

    const user = await User.findById(userId);
    // let exisitngSkills = []

    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({ error: "Invalid skill ID" });
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    const originalCount = user.skills.length;

    user.skills = user.skills.filter(
      (skill) => skill._id.toString() !== skillId
    );
    if (user.skills.length === originalCount) {
      return res.status(404).json({ error: "Skill not found" });
    }
    await user.save();
  } catch (error) {
    console.error("", error);
  }
};

const updateProfile = async (req, res) => {
  try {
    // Challenge: Allow users to update name, email, location, etc.
    // What fields should be updatable?
    // What validation do you need?
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export { updateSkills, deleteSkills };
