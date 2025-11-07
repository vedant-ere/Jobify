// Integration tests for authentication endpoints

import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import routes from '../../src/routes/index.js';
import User from '../../src/models/UserModel.js';

const app = express();
app.use(express.json());
app.use('/api', routes);

let mongoServer;

// Setup test database before all tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

// Clean up after each test
afterEach(async () => {
    await User.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
        test('should register a new user successfully', async () => {
            const newUser = {
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(newUser)
                .expect(201);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email', newUser.email);
            expect(response.body.user).not.toHaveProperty('password');
        });

        test('should fail to register with duplicate email', async () => {
            const user = {
                email: 'duplicate@example.com',
                password: 'password123'
            };

            // Register first time - should succeed
            await request(app)
                .post('/api/auth/register')
                .send(user)
                .expect(201);

            // Register again with same email - should fail
            const response = await request(app)
                .post('/api/auth/register')
                .send(user)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        test('should fail to register without email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ password: 'password123' })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        test('should fail to register without password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com' })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        test('should hash password before saving', async () => {
            const newUser = {
                email: 'hash@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/register')
                .send(newUser)
                .expect(201);

            const savedUser = await User.findOne({ email: newUser.email });
            expect(savedUser.password).not.toBe(newUser.password);
            expect(savedUser.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user before each login test
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });
        });

        test('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email', 'login@example.com');
        });

        test('should fail to login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).not.toHaveProperty('token');
        });

        test('should fail to login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });

        test('should fail to login without email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ password: 'password123' })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        test('should fail to login without password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'login@example.com' })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/auth/profile', () => {
        let authToken;

        beforeEach(async () => {
            // Register and login to get auth token
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'profile@example.com',
                    password: 'password123'
                });

            authToken = response.body.token;
        });

        test('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.user).toHaveProperty('email', 'profile@example.com');
            expect(response.body.user).not.toHaveProperty('password');
        });

        test('should fail to get profile without token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });

        test('should fail to get profile with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalidtoken123')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });
});
