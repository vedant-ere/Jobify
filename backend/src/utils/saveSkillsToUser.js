import User from "../models/UserModel.js";

const saveSkillsToUser = async (userId, userSkills) => {
  try {
    //  Adding only new skills
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Checking for existing skills
    const existingSkillNames = user.skills.map((s) =>
      s.skillName.toLowerCase()
    );
    const newSkills = userSkills.filter(
      (skill) => !existingSkillNames.includes(skill.skillName.toLowerCase())
    );

    // Adding new skills to user
    user.skills.push(...newSkills);
    await user.save();

    return {
      added: newSkills.length,
      total: user.skills.length,
      newSkills: newSkills,
    };
  } catch (error) {
   console.error('Error saving skills to user:', error);
    throw error;
  }
};

export {saveSkillsToUser}
