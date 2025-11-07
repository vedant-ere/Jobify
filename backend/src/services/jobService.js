// This service handles all job-related operations including saving, deduplication, and retrieval

import Job from '../models/Job.js';

class JobService {
    // Save multiple jobs from scraping, with deduplication
    async saveScrapedJobs(scrapedJobs) {
        if (!scrapedJobs || scrapedJobs.length === 0) {
            return { saved: 0, duplicates: 0, errors: 0 };
        }

        let saved = 0;
        let duplicates = 0;
        let errors = 0;

        for (const jobData of scrapedJobs) {
            try {
                // Check if job already exists using source URL
                if (jobData.source && jobData.source.url) {
                    const existingJob = await Job.findOne({ 'source.url': jobData.source.url });

                    if (existingJob) {
                        // Job already exists, just update the scrapedAt timestamp
                        existingJob.source.scrapedAt = new Date();
                        await existingJob.save();
                        duplicates++;
                        continue;
                    }
                }

                // Create new job with default values
                const job = new Job({
                    title: jobData.title,
                    company: jobData.company,
                    location: jobData.location,
                    description: jobData.description,
                    skills: jobData.skills || [],
                    salary: jobData.salary,
                    source: jobData.source,
                    isActive: true,
                    postedDate: new Date() // Assume posted date is today since we just scraped it
                });

                await job.save();
                saved++;
            } catch (error) {
                console.error(`Error saving job "${jobData.title}":`, error.message);
                errors++;
            }
        }

        return { saved, duplicates, errors };
    }

    // Get all active jobs with pagination and filters
    async getJobs(filters = {}, options = {}) {
        const {
            page = 1,
            limit = 20,
            sortBy = '-postedDate', // Sort by newest first
            keywords,
            location,
            skills,
            remote,
            minSalary,
            maxSalary
        } = { ...filters, ...options };

        // Build query
        const query = { isActive: true };

        // Text search on title, description, and skills if keywords provided
        if (keywords) {
            query.$text = { $search: keywords };
        }

        // Location filter
        if (location) {
            query.$or = [
                { 'location.city': new RegExp(location, 'i') },
                { 'location.state': new RegExp(location, 'i') }
            ];
        }

        // Skills filter - match any of the provided skills
        if (skills && skills.length > 0) {
            query.skills = { $in: skills.map(s => s.toLowerCase()) };
        }

        // Remote filter
        if (remote === true || remote === 'true') {
            query['location.remote'] = true;
        }

        // Salary filter
        if (minSalary || maxSalary) {
            query.salary = {};
            if (minSalary) {
                query.salary.min = { $gte: parseInt(minSalary) };
            }
            if (maxSalary) {
                query.salary.max = { $lte: parseInt(maxSalary) };
            }
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Execute query with pagination
        const jobs = await Job.find(query)
            .sort(sortBy)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination metadata
        const total = await Job.countDocuments(query);

        return {
            jobs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Get a single job by ID
    async getJobById(jobId) {
        const job = await Job.findById(jobId);

        if (!job) {
            throw new Error('Job not found');
        }

        return job;
    }

    // Get recommended jobs for a user based on their skills
    async getRecommendedJobs(user, options = {}) {
        const { page = 1, limit = 20 } = options;

        // Extract user skills
        const userSkills = user.skills.map(s => s.skillName.toLowerCase());

        if (userSkills.length === 0) {
            // If user has no skills, return recent jobs
            return this.getJobs({}, { page, limit });
        }

        // Find jobs that match user skills
        const query = {
            isActive: true,
            skills: { $in: userSkills }
        };

        // Apply user preferences if available
        if (user.preferences) {
            // Job type preference
            if (user.preferences.jobTypes && user.preferences.jobTypes.length > 0) {
                // Note: We need to add jobType field to Job model for this
                // For now, we'll skip this filter
            }

            // Location preference
            if (user.profile && user.profile.location) {
                const userCity = user.profile.location.city;
                if (userCity) {
                    // Prioritize jobs in user's city or remote jobs
                    query.$or = [
                        { 'location.city': new RegExp(userCity, 'i') },
                        { 'location.remote': true }
                    ];
                }
            }

            // Salary preference
            if (user.preferences.salaryRange) {
                const { min, max } = user.preferences.salaryRange;
                if (min || max) {
                    query.salary = {};
                    if (min) {
                        query['salary.min'] = { $gte: min };
                    }
                    if (max) {
                        query['salary.max'] = { $lte: max };
                    }
                }
            }
        }

        // Skip jobs the user has already interacted with
        const userJobHistory = user.jobHistory || [];
        const viewedJobIds = userJobHistory.map(h => h.jobId);
        if (viewedJobIds.length > 0) {
            query._id = { $nin: viewedJobIds };
        }

        // Calculate skip value
        const skip = (page - 1) * limit;

        // Find matching jobs and sort by skill match score
        const jobs = await Job.aggregate([
            { $match: query },
            {
                // Calculate match score based on number of matching skills
                $addFields: {
                    matchedSkills: {
                        $size: {
                            $setIntersection: ['$skills', userSkills]
                        }
                    }
                }
            },
            { $sort: { matchedSkills: -1, postedDate: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);

        // Get total count
        const total = await Job.countDocuments(query);

        return {
            jobs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Record user interaction with a job
    async recordJobAction(userId, jobId, action) {
        const User = (await import('../models/UserModel.js')).default;

        // Valid actions: viewed, saved, applied, rejected, hidden
        const validActions = ['viewed', 'saved', 'applied', 'rejected', 'hidden'];

        if (!validActions.includes(action)) {
            throw new Error(`Invalid action: ${action}`);
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }

        // Check if this job action already exists
        const existingAction = user.jobHistory.find(
            h => h.jobId.toString() === jobId && h.action === action
        );

        if (existingAction) {
            // Update timestamp
            existingAction.timestamp = new Date();
        } else {
            // Add new action
            user.jobHistory.push({
                jobId,
                action,
                timestamp: new Date()
            });
        }

        await user.save();

        return { success: true, message: `Job ${action} successfully` };
    }

    // Get user's saved/applied/hidden jobs
    async getUserJobs(userId, action) {
        const User = (await import('../models/UserModel.js')).default;

        const user = await User.findById(userId).populate('jobHistory.jobId');

        if (!user) {
            throw new Error('User not found');
        }

        // Filter job history by action
        const filteredHistory = user.jobHistory.filter(h => h.action === action && h.jobId);

        // Extract jobs
        const jobs = filteredHistory.map(h => h.jobId);

        return jobs;
    }

    // Clean up old inactive jobs (called by cron job)
    async cleanupOldJobs() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await Job.deleteMany({
            isActive: true,
            postedDate: { $lt: thirtyDaysAgo }
        });

        console.log(`Cleaned up ${result.deletedCount} old jobs`);
        return result.deletedCount;
    }
}

export default new JobService();
