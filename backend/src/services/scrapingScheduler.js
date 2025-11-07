// This service runs scheduled job scraping based on user skills in the database

import IndeedScraper from './scrapers/indeedScraper.js';
import jobService from './jobService.js';
import User from '../models/UserModel.js';

class ScrapingScheduler {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
    }

    // Start the scheduled scraping (runs every 6 hours by default)
    start(intervalHours = 6) {
        if (this.isRunning) {
            console.log('[ScrapingScheduler] Already running');
            return;
        }

        console.log(`[ScrapingScheduler] Starting scheduler (runs every ${intervalHours} hours)`);
        this.isRunning = true;

        // Run immediately on start
        this.runScraping();

        // Schedule periodic runs
        const intervalMs = intervalHours * 60 * 60 * 1000;
        this.intervalId = setInterval(() => {
            this.runScraping();
        }, intervalMs);
    }

    // Stop the scheduled scraping
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('[ScrapingScheduler] Stopped');
    }

    // Main scraping logic
    async runScraping() {
        try {
            console.log('[ScrapingScheduler] Starting scheduled scraping run...');

            // Get all unique skills from users
            const skills = await this.getUserSkills();

            if (skills.length === 0) {
                console.log('[ScrapingScheduler] No user skills found, skipping scraping');
                return;
            }

            console.log(`[ScrapingScheduler] Found ${skills.length} unique skills to scrape for`);

            // Scrape jobs for top skills (limit to avoid overload)
            const topSkills = skills.slice(0, 10); // Top 10 most common skills
            let totalScraped = 0;
            let totalSaved = 0;

            for (const skill of topSkills) {
                try {
                    console.log(`[ScrapingScheduler] Scraping jobs for skill: ${skill}`);

                    const scraper = new IndeedScraper();
                    const jobs = await scraper.scrape({
                        keywords: skill,
                        location: 'India'
                    });

                    // Save jobs to database
                    const result = await jobService.saveScrapedJobs(jobs);

                    totalScraped += jobs.length;
                    totalSaved += result.saved;

                    console.log(`[ScrapingScheduler] ${skill}: Found ${jobs.length} jobs, saved ${result.saved} new`);

                    // Small delay between skill searches to be respectful
                    await this.delay(5000); // 5 seconds
                } catch (error) {
                    console.error(`[ScrapingScheduler] Error scraping for ${skill}:`, error.message);
                }
            }

            console.log(`[ScrapingScheduler] Scraping run completed. Total: ${totalScraped} scraped, ${totalSaved} saved`);

            // Clean up old jobs
            await jobService.cleanupOldJobs();
        } catch (error) {
            console.error('[ScrapingScheduler] Error in scheduled scraping:', error);
        }
    }

    // Get unique skills from all users, sorted by frequency
    async getUserSkills() {
        try {
            // Aggregate to get all skills and their counts
            const skillAggregation = await User.aggregate([
                { $unwind: '$skills' },
                {
                    $group: {
                        _id: '$skills.skillName',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 20 } // Get top 20 skills
            ]);

            return skillAggregation.map(item => item._id);
        } catch (error) {
            console.error('[ScrapingScheduler] Error getting user skills:', error);
            return [];
        }
    }

    // Helper function to create delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Manual trigger for testing
    async triggerManualScraping(keywords, location = 'India') {
        try {
            console.log(`[ScrapingScheduler] Manual scraping triggered for: ${keywords}`);

            const scraper = new IndeedScraper();
            const jobs = await scraper.scrape({ keywords, location });

            const result = await jobService.saveScrapedJobs(jobs);

            return {
                scraped: jobs.length,
                saved: result.saved,
                duplicates: result.duplicates,
                errors: result.errors
            };
        } catch (error) {
            console.error('[ScrapingScheduler] Manual scraping failed:', error);
            throw error;
        }
    }
}

export default new ScrapingScheduler();
