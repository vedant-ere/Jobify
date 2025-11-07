// Tests for Indeed scraper

import IndeedScraper from '../../src/services/scrapers/indeedScraper.js';

describe('Indeed Scraper', () => {
    let scraper;

    beforeEach(() => {
        scraper = new IndeedScraper();
    });

    describe('Constructor', () => {
        test('should initialize with correct default values', () => {
            expect(scraper.sourceName).toBe('Indeed');
            expect(scraper.baseURL).toBe('https://in.indeed.com');
            expect(scraper.options.rateLimit).toBe(3000);
            expect(scraper.options.maxRetries).toBe(2);
        });

        test('should allow custom options', () => {
            const customScraper = new IndeedScraper({
                rateLimit: 5000,
                maxRetries: 3
            });

            expect(customScraper.options.rateLimit).toBe(5000);
            expect(customScraper.options.maxRetries).toBe(3);
        });
    });

    describe('buildSearchURL', () => {
        test('should build search URL with default parameters', () => {
            const url = scraper.buildSearchURL({});

            expect(url).toContain('https://in.indeed.com/jobs?');
            expect(url).toContain('q=developer');
            expect(url).toContain('l=Mumbai');
            expect(url).toContain('start=0');
        });

        test('should build search URL with custom keywords', () => {
            const url = scraper.buildSearchURL({ keywords: 'React Developer' });

            expect(url).toContain('q=React+Developer');
        });

        test('should build search URL with custom location', () => {
            const url = scraper.buildSearchURL({ location: 'Bangalore' });

            expect(url).toContain('l=Bangalore');
        });

        test('should encode special characters in URL', () => {
            const url = scraper.buildSearchURL({
                keywords: 'React & Node.js',
                location: 'Mumbai, India'
            });

            expect(url).not.toContain(' ');
            expect(url).not.toContain('&'); // Should be encoded
        });
    });

    describe('parseLocation', () => {
        test('should parse simple city location', () => {
            const location = scraper.parseLocation('Mumbai');

            expect(location).toEqual({
                city: 'Mumbai',
                state: undefined,
                country: 'India',
                remote: false
            });
        });

        test('should parse city and state', () => {
            const location = scraper.parseLocation('Mumbai, Maharashtra');

            expect(location).toEqual({
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India',
                remote: false
            });
        });

        test('should detect remote jobs', () => {
            const location1 = scraper.parseLocation('Remote in Mumbai');
            expect(location1.remote).toBe(true);
            expect(location1.city).toBe('Mumbai');

            const location2 = scraper.parseLocation('Work from home - Bangalore');
            expect(location2.remote).toBe(true);

            const location3 = scraper.parseLocation('WFH - Delhi');
            expect(location3.remote).toBe(true);
        });

        test('should handle empty location string', () => {
            const location = scraper.parseLocation('');

            expect(location.city).toBe('Not specified');
            expect(location.remote).toBe(false);
        });
    });

    describe('parseSalary', () => {
        test('should parse salary range', () => {
            const salary = scraper.parseSalary('₹3,00,000 - ₹5,00,000 a year');

            expect(salary).toEqual({
                min: 300000,
                max: 500000,
                currency: 'INR'
            });
        });

        test('should parse single salary value', () => {
            const salary = scraper.parseSalary('₹5,00,000');

            expect(salary).toEqual({
                min: 500000,
                max: 500000,
                currency: 'INR'
            });
        });

        test('should handle different number formats', () => {
            const salary1 = scraper.parseSalary('₹30,000 - ₹50,000 a month');
            expect(salary1.min).toBe(30000);
            expect(salary1.max).toBe(50000);

            const salary2 = scraper.parseSalary('Rs 800000 per annum');
            expect(salary2.min).toBe(800000);
        });

        test('should return null for invalid salary text', () => {
            const salary = scraper.parseSalary('Competitive salary');
            expect(salary).toBeNull();
        });
    });

    describe('extractSkillsFromDescription', () => {
        test('should extract common tech skills from description', () => {
            const description = 'We need a developer with JavaScript, React, and Node.js experience.';
            const skills = scraper.extractSkillsFromDescription(description);

            expect(skills).toContain('javascript');
            expect(skills).toContain('react');
            expect(skills).toContain('node');
        });

        test('should extract database and cloud skills', () => {
            const description = 'Required: MongoDB, AWS, Docker, and Kubernetes knowledge.';
            const skills = scraper.extractSkillsFromDescription(description);

            expect(skills).toContain('mongodb');
            expect(skills).toContain('aws');
            expect(skills).toContain('docker');
            expect(skills).toContain('kubernetes');
        });

        test('should not duplicate skills', () => {
            const description = 'React React React developer needed. React experience required.';
            const skills = scraper.extractSkillsFromDescription(description);

            const reactCount = skills.filter(s => s === 'react').length;
            expect(reactCount).toBe(1);
        });

        test('should handle case-insensitive matching', () => {
            const description = 'JAVASCRIPT, JavaScript, javascript';
            const skills = scraper.extractSkillsFromDescription(description);

            const jsCount = skills.filter(s => s === 'javascript').length;
            expect(jsCount).toBe(1);
        });

        test('should return empty array for null or empty description', () => {
            expect(scraper.extractSkillsFromDescription(null)).toEqual([]);
            expect(scraper.extractSkillsFromDescription('')).toEqual([]);
            expect(scraper.extractSkillsFromDescription(undefined)).toEqual([]);
        });

        test('should use word boundaries to avoid partial matches', () => {
            const description = 'We need a tester for our testing framework.';
            const skills = scraper.extractSkillsFromDescription(description);

            // Should match 'testing' but not 'tester'
            expect(skills).toContain('testing');
        });

        test('should extract multiple different skill types', () => {
            const description = `
                Looking for a Full Stack Developer with:
                - Frontend: React, HTML, CSS
                - Backend: Node.js, Express
                - Database: MongoDB, MySQL
                - DevOps: Docker, AWS, Git
                - Testing: Jest, TDD
            `;
            const skills = scraper.extractSkillsFromDescription(description);

            expect(skills.length).toBeGreaterThan(8);
            expect(skills).toContain('react');
            expect(skills).toContain('html');
            expect(skills).toContain('node');
            expect(skills).toContain('mongodb');
            expect(skills).toContain('docker');
        });
    });

    describe('parseJobData', () => {
        test('should parse HTML with no jobs and return empty array', () => {
            const emptyHtml = '<html><body><div>No jobs found</div></body></html>';
            const jobs = scraper.parseJobData(emptyHtml);

            expect(jobs).toEqual([]);
        });

        test('should skip jobs without title or company', () => {
            // Mock HTML with incomplete job data
            const incompleteHtml = `
                <html><body>
                    <div data-testid="job-tile">
                        <h2><a data-testid="job-title">Test Job</a></h2>
                        <!-- No company name -->
                    </div>
                </body></html>
            `;

            const jobs = scraper.parseJobData(incompleteHtml);

            // Should not include jobs without company
            expect(jobs).toEqual([]);
        });

        test('should handle multiple selectors for finding jobs', () => {
            // The scraper tries multiple selectors - test that it works with different HTML structures
            const html1 = '<div data-testid="job-tile"></div>';
            const html2 = '<div class="jobsearch-SerpJobCard"></div>';
            const html3 = '<div class="job_seen_beacon"></div>';

            // Should not throw errors for different HTML structures
            expect(() => scraper.parseJobData(html1)).not.toThrow();
            expect(() => scraper.parseJobData(html2)).not.toThrow();
            expect(() => scraper.parseJobData(html3)).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        test('should handle malformed HTML gracefully', () => {
            const malformedHtml = '<html><body><div>Unclosed div';

            expect(() => scraper.parseJobData(malformedHtml)).not.toThrow();
        });

        test('should handle empty HTML', () => {
            expect(() => scraper.parseJobData('')).not.toThrow();
            expect(scraper.parseJobData('')).toEqual([]);
        });

        test('should handle null HTML', () => {
            expect(() => scraper.parseJobData(null)).not.toThrow();
        });
    });

    describe('Integration', () => {
        test('should have stats tracking', () => {
            expect(scraper.stats).toBeDefined();
            expect(scraper.stats).toHaveProperty('totalRequests');
            expect(scraper.stats).toHaveProperty('successfulRequests');
            expect(scraper.stats).toHaveProperty('failedRequests');
        });

        test('should respect rate limiting configuration', () => {
            const slowScraper = new IndeedScraper({ rateLimit: 5000 });
            expect(slowScraper.options.rateLimit).toBe(5000);

            const fastScraper = new IndeedScraper({ rateLimit: 1000 });
            expect(fastScraper.options.rateLimit).toBe(1000);
        });

        test('should have retry configuration', () => {
            expect(scraper.options.maxRetries).toBeDefined();
            expect(scraper.options.maxRetries).toBeGreaterThan(0);
        });
    });
});
