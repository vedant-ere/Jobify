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
                    const jobTitle = this.extractJobTitle(jobCard);
                    
                    if (jobTitle) {
                        jobs.push({
                            title: jobTitle,
                            source: this.sourceName,
                            scrapedAt: new Date()
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