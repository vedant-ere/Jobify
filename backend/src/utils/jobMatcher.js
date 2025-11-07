// This utility calculates how well a job matches a user's profile based on skills, location, and preferences

class JobMatcher {
    // Calculate overall match score between user and job (0-100)
    calculateMatchScore(user, job) {
        let totalScore = 0;
        let totalWeight = 0;

        // Skill matching (weight: 50%)
        const skillWeight = 50;
        const skillScore = this.calculateSkillMatch(user.skills, job.skills);
        totalScore += skillScore * skillWeight;
        totalWeight += skillWeight;

        // Location matching (weight: 20%)
        const locationWeight = 20;
        const locationScore = this.calculateLocationMatch(user.profile, job.location);
        totalScore += locationScore * locationWeight;
        totalWeight += locationWeight;

        // Salary matching (weight: 15%)
        const salaryWeight = 15;
        const salaryScore = this.calculateSalaryMatch(user.preferences, job.salary);
        totalScore += salaryScore * salaryWeight;
        totalWeight += salaryWeight;

        // Experience matching (weight: 15%)
        const experienceWeight = 15;
        const experienceScore = this.calculateExperienceMatch(user.profile, job.title);
        totalScore += experienceScore * experienceWeight;
        totalWeight += experienceWeight;

        // Return normalized score (0-100)
        return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    }

    // Calculate skill match score (0-1)
    calculateSkillMatch(userSkills, jobSkills) {
        if (!userSkills || userSkills.length === 0) {
            return 0;
        }

        if (!jobSkills || jobSkills.length === 0) {
            return 0.5; // Neutral score if job has no specified skills
        }

        // Extract skill names from user skills
        const userSkillNames = userSkills.map(s => s.skillName.toLowerCase());
        const jobSkillNames = jobSkills.map(s => s.toLowerCase());

        // Find matching skills
        const matchingSkills = userSkillNames.filter(skill =>
            jobSkillNames.includes(skill)
        );

        if (matchingSkills.length === 0) {
            return 0;
        }

        // Calculate match percentage based on job requirements
        const matchPercentage = matchingSkills.length / jobSkillNames.length;

        // Bonus for having more than required skills
        const coverageBonus = matchingSkills.length / userSkillNames.length;

        // Weighted average (70% match percentage, 30% coverage)
        return (matchPercentage * 0.7) + (coverageBonus * 0.3);
    }

    // Calculate location match score (0-1)
    calculateLocationMatch(userProfile, jobLocation) {
        if (!userProfile || !userProfile.location) {
            return 0.5; // Neutral if user has no location preference
        }

        if (!jobLocation) {
            return 0.5; // Neutral if job has no location
        }

        const userLoc = userProfile.location;
        const jobLoc = jobLocation;

        // Perfect match for remote jobs if user prefers remote
        if (jobLoc.remote && userLoc.remote) {
            return 1.0;
        }

        // High score if cities match
        if (userLoc.city && jobLoc.city) {
            const cityMatch = userLoc.city.toLowerCase() === jobLoc.city.toLowerCase();
            if (cityMatch) {
                return 1.0;
            }

            // Partial match if states match but cities differ
            if (userLoc.state && jobLoc.state) {
                const stateMatch = userLoc.state.toLowerCase() === jobLoc.state.toLowerCase();
                if (stateMatch) {
                    return 0.6;
                }
            }
        }

        // Remote jobs get medium score even if location doesn't match
        if (jobLoc.remote) {
            return 0.7;
        }

        // No match
        return 0.2;
    }

    // Calculate salary match score (0-1)
    calculateSalaryMatch(userPreferences, jobSalary) {
        if (!userPreferences || !userPreferences.salaryRange) {
            return 0.5; // Neutral if user has no salary preference
        }

        if (!jobSalary || (!jobSalary.min && !jobSalary.max)) {
            return 0.5; // Neutral if job has no salary info
        }

        const userMin = userPreferences.salaryRange.min || 0;
        const userMax = userPreferences.salaryRange.max || Infinity;
        const jobMin = jobSalary.min || 0;
        const jobMax = jobSalary.max || jobSalary.min || Infinity;

        // Job salary is within user's desired range
        if (jobMin >= userMin && jobMax <= userMax) {
            return 1.0;
        }

        // Job salary overlaps with user's range
        if (jobMax >= userMin && jobMin <= userMax) {
            return 0.7;
        }

        // Job salary is above user's range (still good)
        if (jobMin > userMax) {
            return 0.8;
        }

        // Job salary is below user's range
        if (jobMax < userMin) {
            return 0.3;
        }

        return 0.5;
    }

    // Calculate experience match score (0-1)
    calculateExperienceMatch(userProfile, jobTitle) {
        if (!userProfile || !userProfile.experience) {
            return 0.5; // Neutral if user has no experience info
        }

        if (!jobTitle) {
            return 0.5;
        }

        const userExp = userProfile.experience; // Years of experience
        const titleLower = jobTitle.toLowerCase();

        // Identify seniority level from job title
        let requiredExp = 0;

        if (titleLower.includes('intern') || titleLower.includes('trainee')) {
            requiredExp = 0;
        } else if (titleLower.includes('junior') || titleLower.includes('entry')) {
            requiredExp = 1;
        } else if (titleLower.includes('mid') || titleLower.includes('intermediate')) {
            requiredExp = 3;
        } else if (titleLower.includes('senior') || titleLower.includes('sr.')) {
            requiredExp = 5;
        } else if (titleLower.includes('lead') || titleLower.includes('principal') || titleLower.includes('architect')) {
            requiredExp = 7;
        } else if (titleLower.includes('staff') || titleLower.includes('distinguished')) {
            requiredExp = 10;
        } else {
            // No clear seniority indicator - assume mid-level
            requiredExp = 3;
        }

        // Calculate match based on experience difference
        const expDiff = Math.abs(userExp - requiredExp);

        if (expDiff === 0) {
            return 1.0; // Perfect match
        } else if (expDiff <= 1) {
            return 0.9; // Very close
        } else if (expDiff <= 2) {
            return 0.7; // Close enough
        } else if (expDiff <= 3) {
            return 0.5; // Moderate match
        } else {
            return 0.3; // Poor match
        }
    }

    // Get match breakdown for display to user
    getMatchBreakdown(user, job) {
        const skillScore = this.calculateSkillMatch(user.skills, job.skills);
        const locationScore = this.calculateLocationMatch(user.profile, job.location);
        const salaryScore = this.calculateSalaryMatch(user.preferences, job.salary);
        const experienceScore = this.calculateExperienceMatch(user.profile, job.title);
        const overallScore = this.calculateMatchScore(user, job);

        return {
            overall: overallScore,
            breakdown: {
                skills: Math.round(skillScore * 100),
                location: Math.round(locationScore * 100),
                salary: Math.round(salaryScore * 100),
                experience: Math.round(experienceScore * 100)
            }
        };
    }
}

export default new JobMatcher();
