// Tests for job matching algorithm

import jobMatcher from '../../src/utils/jobMatcher.js';

describe('Job Matcher Utility', () => {
    // Sample user profile for testing
    const sampleUser = {
        profile: {
            firstName: 'John',
            lastName: 'Doe',
            experience: 3,
            location: {
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India',
                remote: false
            }
        },
        skills: [
            { skillName: 'javascript', proficiency: 4, category: 'technical' },
            { skillName: 'react', proficiency: 4, category: 'technical' },
            { skillName: 'node', proficiency: 3, category: 'technical' },
            { skillName: 'mongodb', proficiency: 3, category: 'technical' }
        ],
        preferences: {
            salaryRange: { min: 500000, max: 1000000 },
            jobTypes: ['full-time'],
            remote: false
        }
    };

    describe('calculateSkillMatch', () => {
        test('should return perfect score for exact skill match', () => {
            const jobSkills = ['javascript', 'react', 'node', 'mongodb'];
            const score = jobMatcher.calculateSkillMatch(sampleUser.skills, jobSkills);

            expect(score).toBeGreaterThan(0.8);
            expect(score).toBeLessThanOrEqual(1.0);
        });

        test('should return partial score for partial skill match', () => {
            const jobSkills = ['javascript', 'react', 'python', 'django'];
            const score = jobMatcher.calculateSkillMatch(sampleUser.skills, jobSkills);

            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThan(0.6);
        });

        test('should return 0 for no skill match', () => {
            const jobSkills = ['python', 'django', 'ruby', 'rails'];
            const score = jobMatcher.calculateSkillMatch(sampleUser.skills, jobSkills);

            expect(score).toBe(0);
        });

        test('should return 0 when user has no skills', () => {
            const userWithNoSkills = { skills: [] };
            const jobSkills = ['javascript', 'react'];
            const score = jobMatcher.calculateSkillMatch(userWithNoSkills.skills, jobSkills);

            expect(score).toBe(0);
        });

        test('should return neutral score when job has no skill requirements', () => {
            const jobSkills = [];
            const score = jobMatcher.calculateSkillMatch(sampleUser.skills, jobSkills);

            expect(score).toBe(0.5);
        });

        test('should handle case-insensitive skill matching', () => {
            const jobSkills = ['JAVASCRIPT', 'React', 'NODE'];
            const score = jobMatcher.calculateSkillMatch(sampleUser.skills, jobSkills);

            expect(score).toBeGreaterThan(0.8);
        });
    });

    describe('calculateLocationMatch', () => {
        test('should return perfect score for same city', () => {
            const jobLocation = {
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India',
                remote: false
            };
            const score = jobMatcher.calculateLocationMatch(sampleUser.profile, jobLocation);

            expect(score).toBe(1.0);
        });

        test('should return partial score for same state but different city', () => {
            const jobLocation = {
                city: 'Pune',
                state: 'Maharashtra',
                country: 'India',
                remote: false
            };
            const score = jobMatcher.calculateLocationMatch(sampleUser.profile, jobLocation);

            expect(score).toBe(0.6);
        });

        test('should return low score for different location', () => {
            const jobLocation = {
                city: 'Bangalore',
                state: 'Karnataka',
                country: 'India',
                remote: false
            };
            const score = jobMatcher.calculateLocationMatch(sampleUser.profile, jobLocation);

            expect(score).toBe(0.2);
        });

        test('should return high score for remote jobs', () => {
            const jobLocation = {
                city: 'Bangalore',
                state: 'Karnataka',
                country: 'India',
                remote: true
            };
            const score = jobMatcher.calculateLocationMatch(sampleUser.profile, jobLocation);

            expect(score).toBe(0.7);
        });

        test('should return perfect score when both user and job prefer remote', () => {
            const remoteUser = {
                ...sampleUser.profile,
                location: { ...sampleUser.profile.location, remote: true }
            };
            const jobLocation = { remote: true };
            const score = jobMatcher.calculateLocationMatch(remoteUser, jobLocation);

            expect(score).toBe(1.0);
        });

        test('should return neutral score when location info is missing', () => {
            const userWithNoLocation = { profile: {} };
            const jobLocation = { city: 'Mumbai' };
            const score = jobMatcher.calculateLocationMatch(userWithNoLocation.profile, jobLocation);

            expect(score).toBe(0.5);
        });
    });

    describe('calculateSalaryMatch', () => {
        test('should return perfect score when job salary is within user range', () => {
            const jobSalary = { min: 600000, max: 800000, currency: 'INR' };
            const score = jobMatcher.calculateSalaryMatch(sampleUser.preferences, jobSalary);

            expect(score).toBe(1.0);
        });

        test('should return high score when job salary overlaps with user range', () => {
            const jobSalary = { min: 400000, max: 700000, currency: 'INR' };
            const score = jobMatcher.calculateSalaryMatch(sampleUser.preferences, jobSalary);

            expect(score).toBe(0.7);
        });

        test('should return good score when job pays above user max', () => {
            const jobSalary = { min: 1200000, max: 1500000, currency: 'INR' };
            const score = jobMatcher.calculateSalaryMatch(sampleUser.preferences, jobSalary);

            expect(score).toBe(0.8);
        });

        test('should return low score when job pays below user min', () => {
            const jobSalary = { min: 300000, max: 400000, currency: 'INR' };
            const score = jobMatcher.calculateSalaryMatch(sampleUser.preferences, jobSalary);

            expect(score).toBe(0.3);
        });

        test('should return neutral score when salary info is missing', () => {
            const score = jobMatcher.calculateSalaryMatch(sampleUser.preferences, null);
            expect(score).toBe(0.5);

            const userWithNoPrefs = { preferences: {} };
            const jobSalary = { min: 500000 };
            const score2 = jobMatcher.calculateSalaryMatch(userWithNoPrefs.preferences, jobSalary);
            expect(score2).toBe(0.5);
        });
    });

    describe('calculateExperienceMatch', () => {
        test('should return perfect score for exact experience match', () => {
            const jobTitle = 'Mid-level Software Engineer';
            const score = jobMatcher.calculateExperienceMatch(sampleUser.profile, jobTitle);

            expect(score).toBe(1.0);
        });

        test('should return high score for close experience match', () => {
            const jobTitle = 'Junior Software Developer';
            const score = jobMatcher.calculateExperienceMatch(sampleUser.profile, jobTitle);

            expect(score).toBeGreaterThanOrEqual(0.7);
        });

        test('should return lower score for senior position when user is mid-level', () => {
            const jobTitle = 'Senior Software Architect';
            const score = jobMatcher.calculateExperienceMatch(sampleUser.profile, jobTitle);

            expect(score).toBeLessThan(0.7);
        });

        test('should match intern positions for 0 years experience', () => {
            const entryUser = { ...sampleUser.profile, experience: 0 };
            const jobTitle = 'Software Engineering Intern';
            const score = jobMatcher.calculateExperienceMatch(entryUser, jobTitle);

            expect(score).toBe(1.0);
        });

        test('should match senior positions for 5+ years experience', () => {
            const seniorUser = { ...sampleUser.profile, experience: 6 };
            const jobTitle = 'Senior Software Engineer';
            const score = jobMatcher.calculateExperienceMatch(seniorUser, jobTitle);

            expect(score).toBeGreaterThanOrEqual(0.9);
        });
    });

    describe('calculateMatchScore', () => {
        const sampleJob = {
            title: 'Mid-level React Developer',
            company: 'Tech Corp',
            location: {
                city: 'Mumbai',
                state: 'Maharashtra',
                remote: false
            },
            description: 'Looking for a React developer with Node.js experience',
            skills: ['javascript', 'react', 'node', 'mongodb'],
            salary: { min: 600000, max: 900000, currency: 'INR' }
        };

        test('should calculate overall match score', () => {
            const score = jobMatcher.calculateMatchScore(sampleUser, sampleJob);

            expect(score).toBeGreaterThan(70);
            expect(score).toBeLessThanOrEqual(100);
            expect(typeof score).toBe('number');
        });

        test('should return lower score for poor match', () => {
            const poorMatchJob = {
                title: 'Senior Python Developer',
                location: { city: 'Bangalore', remote: false },
                skills: ['python', 'django', 'postgresql'],
                salary: { min: 1500000, max: 2000000, currency: 'INR' }
            };

            const score = jobMatcher.calculateMatchScore(sampleUser, poorMatchJob);

            expect(score).toBeLessThan(50);
        });

        test('should return score between 0 and 100', () => {
            const score = jobMatcher.calculateMatchScore(sampleUser, sampleJob);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });
    });

    describe('getMatchBreakdown', () => {
        const sampleJob = {
            title: 'React Developer',
            location: { city: 'Mumbai', remote: false },
            skills: ['javascript', 'react', 'node'],
            salary: { min: 700000, max: 900000, currency: 'INR' }
        };

        test('should return detailed match breakdown', () => {
            const breakdown = jobMatcher.getMatchBreakdown(sampleUser, sampleJob);

            expect(breakdown).toHaveProperty('overall');
            expect(breakdown).toHaveProperty('breakdown');
            expect(breakdown.breakdown).toHaveProperty('skills');
            expect(breakdown.breakdown).toHaveProperty('location');
            expect(breakdown.breakdown).toHaveProperty('salary');
            expect(breakdown.breakdown).toHaveProperty('experience');
        });

        test('should return scores as percentages (0-100)', () => {
            const breakdown = jobMatcher.getMatchBreakdown(sampleUser, sampleJob);

            expect(breakdown.overall).toBeGreaterThanOrEqual(0);
            expect(breakdown.overall).toBeLessThanOrEqual(100);

            Object.values(breakdown.breakdown).forEach(score => {
                expect(score).toBeGreaterThanOrEqual(0);
                expect(score).toBeLessThanOrEqual(100);
            });
        });

        test('should return integer scores', () => {
            const breakdown = jobMatcher.getMatchBreakdown(sampleUser, sampleJob);

            expect(Number.isInteger(breakdown.overall)).toBe(true);
            Object.values(breakdown.breakdown).forEach(score => {
                expect(Number.isInteger(score)).toBe(true);
            });
        });
    });
});
