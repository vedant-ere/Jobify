// Tests for skill extraction utility

import { extractSkillsFromText } from '../../src/utils/skillExtractor.js';

describe('Skill Extraction Utility', () => {
    describe('extractSkillsFromText', () => {
        test('should extract basic programming language skills', () => {
            const text = 'I have experience with JavaScript, Python, and Java development.';
            const result = extractSkillsFromText(text);

            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'javascript' })
            );
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'python' })
            );
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'java' })
            );
        });

        test('should extract framework and library skills', () => {
            const text = 'Expert in React, Angular, and Node.js with Redux state management.';
            const result = extractSkillsFromText(text);

            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'react' })
            );
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'angular' })
            );
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'node' })
            );
        });

        test('should extract cloud platform skills', () => {
            const text = 'Certified in AWS, Azure, and Google Cloud Platform with Docker and Kubernetes.';
            const result = extractSkillsFromText(text);

            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'aws', category: 'cloud' })
            );
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'azure', category: 'cloud' })
            );
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'docker' })
            );
        });

        test('should extract database skills', () => {
            const text = 'Proficient in MongoDB, MySQL, PostgreSQL, and Redis.';
            const result = extractSkillsFromText(text);

            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'mongodb' })
            );
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'mysql' })
            );
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'postgresql' })
            );
        });

        test('should handle skill aliases correctly', () => {
            const text = 'I know JS and TS very well.';
            const result = extractSkillsFromText(text);

            // JS should be recognized as JavaScript
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'javascript' })
            );
            // TS should be recognized as TypeScript
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'typescript' })
            );
        });

        test('should assign correct categories to skills', () => {
            const text = 'Technical skills: Python, AWS. Tools: Git, Jira. Soft skills: Leadership, Communication.';
            const result = extractSkillsFromText(text);

            const pythonSkill = result.skills.find(s => s.skillName === 'python');
            expect(pythonSkill.category).toBe('technical');

            const awsSkill = result.skills.find(s => s.skillName === 'aws');
            expect(awsSkill.category).toBe('cloud');

            const gitSkill = result.skills.find(s => s.skillName === 'git');
            expect(gitSkill.category).toBe('tool');

            const leadershipSkill = result.skills.find(s => s.skillName === 'leadership');
            expect(leadershipSkill.category).toBe('non-technical');
        });

        test('should return empty array for text with no skills', () => {
            const text = 'This is just some random text with no technical content.';
            const result = extractSkillsFromText(text);

            expect(result.skills).toEqual([]);
        });

        test('should not duplicate skills when mentioned multiple times', () => {
            const text = 'JavaScript expert. I love JavaScript. JavaScript is my favorite. JavaScript developer.';
            const result = extractSkillsFromText(text);

            const jsSkills = result.skills.filter(s => s.skillName === 'javascript');
            expect(jsSkills.length).toBe(1);
        });

        test('should handle case-insensitive matching', () => {
            const text = 'PYTHON, Python, python, PyThOn';
            const result = extractSkillsFromText(text);

            const pythonSkills = result.skills.filter(s => s.skillName === 'python');
            expect(pythonSkills.length).toBe(1);
        });

        test('should extract skills from resume-like text', () => {
            const resumeText = `
                TECHNICAL SKILLS
                - Programming Languages: JavaScript, TypeScript, Python
                - Frontend: React, Vue.js, HTML5, CSS3
                - Backend: Node.js, Express, Django
                - Databases: MongoDB, PostgreSQL
                - Cloud: AWS, Docker, Kubernetes
                - Version Control: Git, GitHub
            `;

            const result = extractSkillsFromText(resumeText);

            expect(result.skills.length).toBeGreaterThan(10);
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'javascript' })
            );
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'react' })
            );
            expect(result.skills).toContainEqual(
                expect.objectContaining({ skillName: 'mongodb' })
            );
        });

        test('should extract non-technical skills', () => {
            const text = 'Strong leadership, excellent communication, and project management skills.';
            const result = extractSkillsFromText(text);

            expect(result.skills).toContainEqual(
                expect.objectContaining({
                    skillName: 'leadership',
                    category: 'non-technical'
                })
            );
            expect(result.skills).toContainEqual(
                expect.objectContaining({
                    skillName: 'communication',
                    category: 'non-technical'
                })
            );
        });

        test('should handle empty or null input gracefully', () => {
            expect(extractSkillsFromText('')).toEqual({ skills: [] });
            expect(extractSkillsFromText(null)).toEqual({ skills: [] });
            expect(extractSkillsFromText(undefined)).toEqual({ skills: [] });
        });
    });
});
