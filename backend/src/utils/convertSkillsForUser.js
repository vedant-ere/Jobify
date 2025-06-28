//  Helper function to convert extracted skills to User model format

const determineProficiency = (skill, skillResult) => {
  const { confidence } = skillResult;
  if (confidence > 0.8) return 4;
  if (confidence > 0.6) return 3;
  if (confidence > 0.4) return 3;
  return 2;
};

const convertSkillsForUser = async (skillsResult) => {
  const { skills, categorizedSkills } = skillsResult;

  const userSkills = [];

  skills.forEach((skill) => {
    let skillCategory = "technical";

    for (const [category, skillsInCategory] of Object.entries(
      categorizedSkills
    )) {
      if (skillsInCategory.includes(skill)) {
        skillCategory = category;
        break;
      }
    }
    userSkills.push({
      skillName: skill.toLowerCase(),
      proficiency: determineProficiency(skill, skillsResult),
      category: skillCategory,
      verified: false,
    });
  });

  return userSkills;
};


export {determineProficiency, convertSkillsForUser}