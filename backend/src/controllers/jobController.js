// Controller for all job-related API endpoints

import jobService from '../services/jobService.js';
import jobMatcher from '../utils/jobMatcher.js';
import IndeedScraper from '../services/scrapers/indeedScraper.js';

class JobController {
    // Get all jobs with optional filters
    async getAllJobs(req, res) {
        try {
            const filters = {
                keywords: req.query.keywords,
                location: req.query.location,
                skills: req.query.skills ? req.query.skills.split(',') : undefined,
                remote: req.query.remote,
                minSalary: req.query.minSalary,
                maxSalary: req.query.maxSalary
            };

            const options = {
                page: req.query.page || 1,
                limit: req.query.limit || 20,
                sortBy: req.query.sortBy || '-postedDate'
            };

            const result = await jobService.getJobs(filters, options);

            res.status(200).json({
                success: true,
                data: result.jobs,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error in getAllJobs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch jobs',
                error: error.message
            });
        }
    }

    // Get a specific job by ID
    async getJobById(req, res) {
        try {
            const { id } = req.params;
            const job = await jobService.getJobById(id);

            // If user is authenticated, record that they viewed this job
            if (req.user) {
                await jobService.recordJobAction(req.user._id, id, 'viewed');
            }

            res.status(200).json({
                success: true,
                data: job
            });
        } catch (error) {
            console.error('Error in getJobById:', error);
            res.status(error.message === 'Job not found' ? 404 : 500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get personalized job recommendations for authenticated user
    async getRecommendedJobs(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const options = {
                page: req.query.page || 1,
                limit: req.query.limit || 20
            };

            const result = await jobService.getRecommendedJobs(req.user, options);

            // Calculate match scores for each job
            const jobsWithScores = result.jobs.map(job => {
                const matchScore = jobMatcher.calculateMatchScore(req.user, job);
                return {
                    ...job,
                    matchScore
                };
            });

            res.status(200).json({
                success: true,
                data: jobsWithScores,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error in getRecommendedJobs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recommended jobs',
                error: error.message
            });
        }
    }

    // Get detailed match breakdown for a specific job
    async getJobMatchScore(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { id } = req.params;
            const job = await jobService.getJobById(id);
            const matchBreakdown = jobMatcher.getMatchBreakdown(req.user, job);

            res.status(200).json({
                success: true,
                data: matchBreakdown
            });
        } catch (error) {
            console.error('Error in getJobMatchScore:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to calculate match score',
                error: error.message
            });
        }
    }

    // Save a job to user's saved list
    async saveJob(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { id } = req.params;
            const result = await jobService.recordJobAction(req.user._id, id, 'saved');

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Error in saveJob:', error);
            res.status(error.message === 'Job not found' ? 404 : 500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Mark job as applied
    async applyToJob(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { id } = req.params;
            const result = await jobService.recordJobAction(req.user._id, id, 'applied');

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Error in applyToJob:', error);
            res.status(error.message === 'Job not found' ? 404 : 500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Hide a job from recommendations
    async hideJob(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { id } = req.params;
            const result = await jobService.recordJobAction(req.user._id, id, 'hidden');

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Error in hideJob:', error);
            res.status(error.message === 'Job not found' ? 404 : 500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get user's saved jobs
    async getSavedJobs(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const jobs = await jobService.getUserJobs(req.user._id, 'saved');

            res.status(200).json({
                success: true,
                data: jobs
            });
        } catch (error) {
            console.error('Error in getSavedJobs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch saved jobs',
                error: error.message
            });
        }
    }

    // Get user's applied jobs
    async getAppliedJobs(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const jobs = await jobService.getUserJobs(req.user._id, 'applied');

            res.status(200).json({
                success: true,
                data: jobs
            });
        } catch (error) {
            console.error('Error in getAppliedJobs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch applied jobs',
                error: error.message
            });
        }
    }

    // Trigger job scraping (admin/manual trigger)
    async triggerScraping(req, res) {
        try {
            const { keywords, location } = req.body;

            if (!keywords) {
                return res.status(400).json({
                    success: false,
                    message: 'Keywords are required for scraping'
                });
            }

            // Initialize scraper
            const scraper = new IndeedScraper();

            // Scrape jobs
            console.log('Starting job scraping...');
            const scrapedJobs = await scraper.scrape({
                keywords,
                location: location || 'India'
            });

            // Save scraped jobs to database
            const saveResult = await jobService.saveScrapedJobs(scrapedJobs);

            res.status(200).json({
                success: true,
                message: 'Scraping completed',
                data: {
                    scraped: scrapedJobs.length,
                    saved: saveResult.saved,
                    duplicates: saveResult.duplicates,
                    errors: saveResult.errors
                }
            });
        } catch (error) {
            console.error('Error in triggerScraping:', error);
            res.status(500).json({
                success: false,
                message: 'Scraping failed',
                error: error.message
            });
        }
    }
}

export default new JobController();
