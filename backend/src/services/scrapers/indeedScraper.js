// backend/src/services/scrapers/indeedScraper.js
import BaseScraper from "./baseScraper.js";
import * as cheerio from 'cheerio';

class IndeedScraper extends BaseScraper {
    constructor(options = {}) {
        super('Indeed', {
            baseURL: 'https://in.indeed.com', // Using India Indeed for testing
            rateLimit: 3000, // 3 seconds between requests - be respectful
            maxRetries: 2,
            ...options
        });
    }

    // Build search URL
    buildSearchURL(query) {
        const { keywords = 'developer', location = 'Mumbai' } = query;
        
        const params = new URLSearchParams({
            q: keywords,
            l: location,
            start: 0 // First page
        });

        return `${this.baseURL}/jobs?${params.toString()}`;
    }

    async fetchJobData(query) {
        const searchUrl = this.buildSearchURL(query);
        console.log(`[${this.sourceName}] Fetching: ${searchUrl}`);

        const html = await this.makeRequest(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'
            }
        });

        return html;
    }

    parseJobData(html) {
        const $ = cheerio.load(html);
        const jobs = [];

        console.log(`[${this.sourceName}] Parsing HTML...`);

        // Multiple selectors - Indeed changes these frequently
        const jobSelectors = [
            '[data-testid="job-tile"]',
            '.jobsearch-SerpJobCard',
            '.slider_container .slider_item',
            '.job_seen_beacon'
        ];

        let foundJobs = false;

        for (const selector of jobSelectors) {
            const jobCards = $(selector);

            if (jobCards.length > 0) {
                console.log(`[${this.sourceName}] Found ${jobCards.length} jobs using selector: ${selector}`);
                foundJobs = true;

                jobCards.each((index, element) => {
                    const jobCard = $(element);

                    // Extract all job fields
                    const title = this.extractJobTitle(jobCard);
                    const company = this.extractCompany(jobCard);
                    const location = this.extractLocation(jobCard);
                    const salary = this.extractSalary(jobCard);
                    const description = this.extractDescription(jobCard);
                    const url = this.extractJobUrl(jobCard);

                    // Only add job if we have at least title and company
                    if (title && company) {
                        jobs.push({
                            title: title,
                            company: company,
                            location: location,
                            description: description || 'No description available',
                            salary: salary,
                            skills: this.extractSkillsFromDescription(description),
                            source: {
                                name: this.sourceName,
                                url: url || this.baseURL,
                                scrapedAt: new Date()
                            }
                        });
                    }
                });

                break; // Stop after finding jobs with first working selector
            }
        }

        if (!foundJobs) {
            console.log(`[${this.sourceName}] No jobs found with any selector`);
            // Log first 500 chars of HTML for debugging
            console.log('HTML Preview:', html.substring(0, 500));
        }

        return jobs;
    }

    extractJobTitle(jobCard) {
        const $ = cheerio.load(jobCard);

        // Multiple ways Indeed might structure job titles
        const titleSelectors = [
            'h2 a[data-testid="job-title"]',
            'h2 a span[title]',
            '.jobTitle a span',
            'h2.jobTitle a',
            '.jobTitle-color-purple',
            'h2 span[title]'
        ];

        for (const selector of titleSelectors) {
            const titleElement = $(selector);

            if (titleElement.length > 0) {
                const title = titleElement.attr('title') || titleElement.text();
                if (title && title.trim()) {
                    return title.trim();
                }
            }
        }

        return null;
    }

    extractCompany(jobCard) {
        const $ = cheerio.load(jobCard);

        // Try multiple selectors for company name
        const companySelectors = [
            '[data-testid="company-name"]',
            'span.companyName',
            '[data-testid="company-name"] a',
            '.company',
            '[data-company-name]'
        ];

        for (const selector of companySelectors) {
            const element = $(selector);
            if (element.length > 0) {
                const company = element.text().trim();
                if (company) {
                    return company;
                }
            }
        }

        return 'Unknown Company';
    }

    extractLocation(jobCard) {
        const $ = cheerio.load(jobCard);

        // Try multiple selectors for location
        const locationSelectors = [
            '[data-testid="text-location"]',
            '.companyLocation',
            '[data-testid="job-location"]',
            '.location'
        ];

        for (const selector of locationSelectors) {
            const element = $(selector);
            if (element.length > 0) {
                const locationText = element.text().trim();
                if (locationText) {
                    return this.parseLocation(locationText);
                }
            }
        }

        return { city: 'Not specified', remote: false };
    }

    parseLocation(locationText) {
        // Check if remote job
        const isRemote = /remote|work from home|wfh/i.test(locationText);

        // Try to extract city and state
        // Examples: "Mumbai, Maharashtra", "Bangalore", "Remote in Delhi"
        const cleanLocation = locationText.replace(/remote in /i, '').trim();
        const parts = cleanLocation.split(',').map(p => p.trim());

        return {
            city: parts[0] || 'Not specified',
            state: parts[1] || undefined,
            country: 'India', // Since we're using India Indeed
            remote: isRemote
        };
    }

    extractSalary(jobCard) {
        const $ = cheerio.load(jobCard);

        // Try multiple selectors for salary
        const salarySelectors = [
            '[data-testid="attribute_snippet_testid"]',
            '.salary-snippet',
            '.salaryText',
            '[data-testid="salary-snippet"]'
        ];

        for (const selector of salarySelectors) {
            const element = $(selector);
            if (element.length > 0) {
                const salaryText = element.text().trim();
                if (salaryText && /₹|rs|lakh|thousand/i.test(salaryText)) {
                    return this.parseSalary(salaryText);
                }
            }
        }

        return null;
    }

    parseSalary(salaryText) {
        // Extract salary range from text like "₹3,00,000 - ₹5,00,000 a year" or "₹30,000 - ₹50,000 a month"
        const numbers = salaryText.match(/[\d,]+/g);

        if (numbers && numbers.length >= 1) {
            const cleanNumbers = numbers.map(n => parseInt(n.replace(/,/g, '')));

            return {
                min: cleanNumbers[0] || null,
                max: cleanNumbers[1] || cleanNumbers[0] || null,
                currency: 'INR'
            };
        }

        return null;
    }

    extractDescription(jobCard) {
        const $ = cheerio.load(jobCard);

        // Try multiple selectors for job description/snippet
        const descSelectors = [
            '.job-snippet',
            '[data-testid="job-snippet"]',
            '.summary',
            '.job-snippet-text'
        ];

        for (const selector of descSelectors) {
            const element = $(selector);
            if (element.length > 0) {
                const description = element.text().trim();
                if (description) {
                    return description;
                }
            }
        }

        return null;
    }

    extractJobUrl(jobCard) {
        const $ = cheerio.load(jobCard);

        // Try to find job URL
        const linkSelectors = [
            'h2 a[href*="/rc/clk"]',
            'h2 a[href*="/viewjob"]',
            'a[data-jk]',
            'h2 a[href]'
        ];

        for (const selector of linkSelectors) {
            const link = $(selector);
            if (link.length > 0) {
                const href = link.attr('href');
                if (href) {
                    // Make absolute URL if relative
                    return href.startsWith('http') ? href : `${this.baseURL}${href}`;
                }
            }
        }

        return null;
    }

    extractSkillsFromDescription(description) {
        if (!description) return [];

        // Common tech skills to look for - basic keyword matching
        const skillKeywords = [
            'javascript', 'js', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
            'node', 'nodejs', 'express', 'django', 'flask', 'spring', 'mongodb', 'sql',
            'mysql', 'postgresql', 'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
            'git', 'ci/cd', 'agile', 'scrum', 'rest', 'api', 'html', 'css', 'sass',
            'webpack', 'babel', 'jest', 'testing', 'tdd', 'microservices'
        ];

        const foundSkills = [];
        const lowerDesc = description.toLowerCase();

        for (const skill of skillKeywords) {
            // Use word boundary to avoid partial matches
            const regex = new RegExp(`\\b${skill}\\b`, 'i');
            if (regex.test(lowerDesc)) {
                foundSkills.push(skill.toLowerCase());
            }
        }

        return [...new Set(foundSkills)]; // Remove duplicates
    }

    // Override scrape method to add logging
    async scrape(query) {
        try {
            console.log(`[${this.sourceName}] Starting scrape...`);
            const result = await super.scrape(query);
            console.log(`[${this.sourceName}] Scrape completed. Found ${result.length} jobs`);
            return result;
        } catch (error) {
            console.error(`[${this.sourceName}] Scrape failed:`, error.message);
            throw error;
        }
    }
}

export default IndeedScraper;