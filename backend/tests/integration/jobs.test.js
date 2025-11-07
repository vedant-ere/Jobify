// Integration tests for job endpoints

import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import routes from '../../src/routes/index.js';
import User from '../../src/models/UserModel.js';
import Job from '../../src/models/Job.js';

const app = express();
app.use(express.json());
app.use('/api', routes);

let mongoServer;
let authToken;
let testUser;

// Sample job data for testing
const sampleJob = {
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        remote: false
    },
    description: 'Looking for a software engineer with JavaScript and React experience',
    skills: ['javascript', 'react', 'node'],
    salary: {
        min: 600000,
        max: 1000000,
        currency: 'INR'
    },
    source: {
        name: 'Indeed',
        url: 'https://in.indeed.com/job/12345',
        scrapedAt: new Date()
    },
    isActive: true,
    postedDate: new Date()
};

// Setup test database before all tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

// Setup test user and token before each test
beforeEach(async () => {
    // Create test user
    const response = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'test@example.com',
            password: 'password123'
        });

    authToken = response.body.token;
    testUser = response.body.user;

    // Add skills to test user
    await User.findByIdAndUpdate(testUser._id, {
        skills: [
            { skillName: 'javascript', proficiency: 4, category: 'technical' },
            { skillName: 'react', proficiency: 4, category: 'technical' },
            { skillName: 'node', proficiency: 3, category: 'technical' }
        ],
        profile: {
            experience: 3,
            location: {
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India'
            }
        }
    });
});

// Clean up after each test
afterEach(async () => {
    await User.deleteMany({});
    await Job.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Job API', () => {
    describe('GET /api/jobs', () => {
        beforeEach(async () => {
            // Create some test jobs
            await Job.create([
                sampleJob,
                {
                    ...sampleJob,
                    title: 'Senior React Developer',
                    skills: ['react', 'typescript', 'graphql'],
                    source: { ...sampleJob.source, url: 'https://in.indeed.com/job/12346' }
                },
                {
                    ...sampleJob,
                    title: 'Python Developer',
                    skills: ['python', 'django', 'postgresql'],
                    location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
                    source: { ...sampleJob.source, url: 'https://in.indeed.com/job/12347' }
                }
            ]);
        });

        test('should get all jobs without authentication', async () => {
            const response = await request(app)
                .get('/api/jobs')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(3);
            expect(response.body).toHaveProperty('pagination');
        });

        test('should filter jobs by skills', async () => {
            const response = await request(app)
                .get('/api/jobs?skills=python')
                .expect(200);

            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].title).toBe('Python Developer');
        });

        test('should filter jobs by location', async () => {
            const response = await request(app)
                .get('/api/jobs?location=Mumbai')
                .expect(200);

            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(2);
        });

        test('should support pagination', async () => {
            const response = await request(app)
                .get('/api/jobs?page=1&limit=2')
                .expect(200);

            expect(response.body.data.length).toBe(2);
            expect(response.body.pagination).toHaveProperty('page', 1);
            expect(response.body.pagination).toHaveProperty('limit', 2);
            expect(response.body.pagination).toHaveProperty('total', 3);
            expect(response.body.pagination).toHaveProperty('pages', 2);
        });

        test('should search jobs by keywords', async () => {
            const response = await request(app)
                .get('/api/jobs?keywords=React')
                .expect(200);

            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/jobs/:id', () => {
        let jobId;

        beforeEach(async () => {
            const job = await Job.create(sampleJob);
            jobId = job._id.toString();
        });

        test('should get a specific job by ID', async () => {
            const response = await request(app)
                .get(`/api/jobs/${jobId}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('title', 'Software Engineer');
            expect(response.body.data).toHaveProperty('company', 'Tech Corp');
        });

        test('should record view action when authenticated user views job', async () => {
            await request(app)
                .get(`/api/jobs/${jobId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Check that view action was recorded
            const user = await User.findById(testUser._id);
            const viewedJob = user.jobHistory.find(
                h => h.jobId.toString() === jobId && h.action === 'viewed'
            );
            expect(viewedJob).toBeDefined();
        });

        test('should return 404 for non-existent job', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/jobs/${fakeId}`)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/jobs/recommended/list', () => {
        beforeEach(async () => {
            // Create jobs with different skill matches
            await Job.create([
                sampleJob, // Matches user skills: javascript, react, node
                {
                    ...sampleJob,
                    title: 'React Expert',
                    skills: ['react', 'javascript'],
                    source: { ...sampleJob.source, url: 'https://in.indeed.com/job/rec1' }
                },
                {
                    ...sampleJob,
                    title: 'Python Developer',
                    skills: ['python', 'django'],
                    source: { ...sampleJob.source, url: 'https://in.indeed.com/job/rec2' }
                }
            ]);
        });

        test('should get recommended jobs for authenticated user', async () => {
            const response = await request(app)
                .get('/api/jobs/recommended/list')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThan(0);

            // Check that jobs have match scores
            expect(response.body.data[0]).toHaveProperty('matchScore');
        });

        test('should require authentication', async () => {
            const response = await request(app)
                .get('/api/jobs/recommended/list')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });

        test('should prioritize jobs matching user skills', async () => {
            const response = await request(app)
                .get('/api/jobs/recommended/list')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // First job should have higher or equal match score than others
            const scores = response.body.data.map(job => job.matchScore);
            for (let i = 1; i < scores.length; i++) {
                expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
            }
        });
    });

    describe('GET /api/jobs/:id/match-score', () => {
        let jobId;

        beforeEach(async () => {
            const job = await Job.create(sampleJob);
            jobId = job._id.toString();
        });

        test('should get match score breakdown for a job', async () => {
            const response = await request(app)
                .get(`/api/jobs/${jobId}/match-score`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('overall');
            expect(response.body.data).toHaveProperty('breakdown');
            expect(response.body.data.breakdown).toHaveProperty('skills');
            expect(response.body.data.breakdown).toHaveProperty('location');
            expect(response.body.data.breakdown).toHaveProperty('salary');
            expect(response.body.data.breakdown).toHaveProperty('experience');
        });

        test('should require authentication', async () => {
            const response = await request(app)
                .get(`/api/jobs/${jobId}/match-score`)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('POST /api/jobs/:id/save', () => {
        let jobId;

        beforeEach(async () => {
            const job = await Job.create(sampleJob);
            jobId = job._id.toString();
        });

        test('should save a job to user saved list', async () => {
            const response = await request(app)
                .post(`/api/jobs/${jobId}/save`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);

            // Verify job was saved
            const user = await User.findById(testUser._id);
            const savedJob = user.jobHistory.find(
                h => h.jobId.toString() === jobId && h.action === 'saved'
            );
            expect(savedJob).toBeDefined();
        });

        test('should require authentication', async () => {
            const response = await request(app)
                .post(`/api/jobs/${jobId}/save`)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('POST /api/jobs/:id/apply', () => {
        let jobId;

        beforeEach(async () => {
            const job = await Job.create(sampleJob);
            jobId = job._id.toString();
        });

        test('should mark job as applied', async () => {
            const response = await request(app)
                .post(`/api/jobs/${jobId}/apply`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);

            // Verify job was marked as applied
            const user = await User.findById(testUser._id);
            const appliedJob = user.jobHistory.find(
                h => h.jobId.toString() === jobId && h.action === 'applied'
            );
            expect(appliedJob).toBeDefined();
        });

        test('should require authentication', async () => {
            const response = await request(app)
                .post(`/api/jobs/${jobId}/apply`)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('POST /api/jobs/:id/hide', () => {
        let jobId;

        beforeEach(async () => {
            const job = await Job.create(sampleJob);
            jobId = job._id.toString();
        });

        test('should hide a job from recommendations', async () => {
            const response = await request(app)
                .post(`/api/jobs/${jobId}/hide`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);

            // Verify job was hidden
            const user = await User.findById(testUser._id);
            const hiddenJob = user.jobHistory.find(
                h => h.jobId.toString() === jobId && h.action === 'hidden'
            );
            expect(hiddenJob).toBeDefined();
        });

        test('should require authentication', async () => {
            const response = await request(app)
                .post(`/api/jobs/${jobId}/hide`)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/jobs/user/saved', () => {
        let jobId;

        beforeEach(async () => {
            const job = await Job.create(sampleJob);
            jobId = job._id.toString();

            // Save the job
            await request(app)
                .post(`/api/jobs/${jobId}/save`)
                .set('Authorization', `Bearer ${authToken}`);
        });

        test('should get user saved jobs', async () => {
            const response = await request(app)
                .get('/api/jobs/user/saved')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0]).toHaveProperty('title', 'Software Engineer');
        });

        test('should require authentication', async () => {
            const response = await request(app)
                .get('/api/jobs/user/saved')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/jobs/user/applied', () => {
        let jobId;

        beforeEach(async () => {
            const job = await Job.create(sampleJob);
            jobId = job._id.toString();

            // Apply to the job
            await request(app)
                .post(`/api/jobs/${jobId}/apply`)
                .set('Authorization', `Bearer ${authToken}`);
        });

        test('should get user applied jobs', async () => {
            const response = await request(app)
                .get('/api/jobs/user/applied')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0]).toHaveProperty('title', 'Software Engineer');
        });

        test('should require authentication', async () => {
            const response = await request(app)
                .get('/api/jobs/user/applied')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });
});
