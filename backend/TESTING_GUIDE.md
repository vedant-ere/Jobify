# Testing Guide - JOBIFY MVP

This guide explains how to run and understand the comprehensive test suite for JOBIFY.

## Quick Start

```bash
# Make sure you're in the backend directory
cd backend

# Install dependencies (includes testing packages)
npm install

# Run all tests
npm test

# Watch mode - tests rerun on file changes
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Organization

Our test suite is organized into three main categories:

### 1. Unit Tests (tests/utils/)

These test individual functions and utilities in isolation.

**Skill Extractor Tests** (`tests/utils/skillExtractor.test.js`)
- Tests the resume parsing and skill extraction logic
- Validates detection of 90+ technical and non-technical skills
- Ensures proper categorization (technical, tool, cloud, etc.)
- Tests alias handling (e.g., "JS" → "JavaScript")
- Validates deduplication of repeated skills

Example test:
```javascript
test('should extract basic programming language skills', () => {
  const text = 'I have experience with JavaScript, Python, and Java.';
  const result = extractSkillsFromText(text);

  expect(result.skills).toContainEqual(
    expect.objectContaining({ skillName: 'javascript' })
  );
});
```

**Job Matcher Tests** (`tests/utils/jobMatcher.test.js`)
- Tests the matching algorithm that ranks jobs
- Validates skill similarity calculations
- Tests location matching logic
- Validates salary range comparisons
- Tests experience level matching

Example test:
```javascript
test('should return perfect score for exact skill match', () => {
  const jobSkills = ['javascript', 'react', 'node', 'mongodb'];
  const score = jobMatcher.calculateSkillMatch(userSkills, jobSkills);

  expect(score).toBeGreaterThan(0.8);
  expect(score).toBeLessThanOrEqual(1.0);
});
```

### 2. Integration Tests (tests/integration/)

These test complete API endpoints with a real (in-memory) database.

**Authentication Tests** (`tests/integration/auth.test.js`)
- Tests complete user registration flow
- Validates login with JWT token generation
- Tests password hashing and verification
- Validates protected route access
- Tests error handling for invalid inputs

Example test:
```javascript
test('should register a new user successfully', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', password: 'password123' })
    .expect(201);

  expect(response.body).toHaveProperty('token');
  expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned
});
```

**Job API Tests** (`tests/integration/jobs.test.js`)
- Tests all job-related endpoints
- Validates job listing with filters
- Tests personalized recommendations
- Validates job actions (save, apply, hide)
- Tests match score calculations
- Validates pagination

Example test:
```javascript
test('should get recommended jobs for authenticated user', async () => {
  const response = await request(app)
    .get('/api/jobs/recommended/list')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);

  expect(response.body.data).toBeInstanceOf(Array);
  expect(response.body.data[0]).toHaveProperty('matchScore');
});
```

### 3. Scraper Tests (tests/scrapers/)

These test the web scraping functionality with mock HTML data.

**Indeed Scraper Tests** (`tests/scrapers/indeedScraper.test.js`)
- Tests HTML parsing with multiple selectors
- Validates location parsing (city, state, remote)
- Tests salary extraction and formatting
- Validates skill extraction from descriptions
- Tests error handling for malformed data

Example test:
```javascript
test('should parse salary range', () => {
  const salary = scraper.parseSalary('₹3,00,000 - ₹5,00,000 a year');

  expect(salary).toEqual({
    min: 300000,
    max: 500000,
    currency: 'INR'
  });
});
```

## Understanding Test Output

### Successful Test Run

```
PASS  tests/utils/skillExtractor.test.js
  ✓ should extract basic programming language skills (5ms)
  ✓ should extract framework and library skills (3ms)
  ✓ should handle skill aliases correctly (2ms)

Test Suites: 5 passed, 5 total
Tests:       90 passed, 90 total
Snapshots:   0 total
Time:        5.234s
```

### Failed Test Example

```
FAIL  tests/utils/jobMatcher.test.js
  ✕ should calculate match score (12ms)

  Expected: value > 70
  Received: 45

  at Object.<anonymous> (tests/utils/jobMatcher.test.js:156:25)
```

This tells you:
- Which test file failed
- Which specific test failed
- What was expected vs what was received
- The line number where the assertion failed

## Coverage Report

After running `npm run test:coverage`, you'll see:

```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
--------------------|---------|----------|---------|---------|-------------------
All files           |   85.23 |    78.45 |   88.12 |   85.67 |
 controllers        |   92.45 |    85.23 |   95.12 |   93.21 |
  jobController.js  |   95.67 |    89.45 |   98.23 |   96.45 | 45-48
 services           |   78.34 |    72.11 |   82.45 |   79.23 |
  jobService.js     |   82.11 |    75.34 |   85.67 |   83.45 | 123-145, 201
--------------------|---------|----------|---------|---------|-------------------
```

**Understanding Coverage Metrics:**
- **% Stmts**: Percentage of statements executed
- **% Branch**: Percentage of conditional branches tested
- **% Funcs**: Percentage of functions called
- **% Lines**: Percentage of code lines executed
- **Uncovered Lines**: Specific lines not covered by tests

## Running Specific Tests

### Run Single Test File

```bash
# Test only skill extraction
npm test skillExtractor

# Test only job matching
npm test jobMatcher

# Test only auth API
npm test auth.test
```

### Run Tests Matching a Pattern

```bash
# Run all integration tests
npm test integration

# Run all scraper tests
npm test scrapers

# Run all utility tests
npm test utils
```

### Run Single Test Case

You can use `.only` to run a single test during development:

```javascript
test.only('should extract basic programming language skills', () => {
  // This is the only test that will run
});
```

**Remember to remove `.only` before committing!**

## Writing New Tests

### Template for Unit Tests

```javascript
import { yourFunction } from '../../src/utils/yourFile.js';

describe('Your Module Name', () => {
  describe('yourFunction', () => {
    test('should do something specific', () => {
      // Arrange: Set up test data
      const input = 'test data';

      // Act: Call the function
      const result = yourFunction(input);

      // Assert: Check the result
      expect(result).toBe('expected output');
    });

    test('should handle edge cases', () => {
      expect(yourFunction(null)).toBe(null);
      expect(yourFunction('')).toEqual([]);
    });
  });
});
```

### Template for Integration Tests

```javascript
import request from 'supertest';
import app from '../../src/app.js';

describe('Your API Endpoint', () => {
  test('should return expected data', async () => {
    const response = await request(app)
      .get('/api/your-endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toBeDefined();
  });

  test('should require authentication', async () => {
    const response = await request(app)
      .get('/api/protected-endpoint')
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });
});
```

## Common Jest Matchers

```javascript
// Equality
expect(value).toBe(42);                    // Strict equality (===)
expect(value).toEqual({ foo: 'bar' });     // Deep equality

// Truthiness
expect(value).toBeTruthy();                // Truthy value
expect(value).toBeFalsy();                 // Falsy value
expect(value).toBeNull();                  // Exactly null
expect(value).toBeUndefined();             // Exactly undefined
expect(value).toBeDefined();               // Not undefined

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeLessThanOrEqual(5);

// Strings
expect(string).toMatch(/pattern/);         // Regex match
expect(string).toContain('substring');     // Contains substring

// Arrays
expect(array).toContain(item);             // Contains item
expect(array).toHaveLength(3);             // Specific length
expect(array).toContainEqual(obj);         // Contains object

// Objects
expect(obj).toHaveProperty('key');         // Has property
expect(obj).toHaveProperty('key', value);  // Has property with value

// Exceptions
expect(() => fn()).toThrow();              // Throws error
expect(() => fn()).toThrow('error message');
```

## Best Practices

### 1. Test One Thing at a Time
```javascript
// Good: Tests one specific behavior
test('should extract JavaScript skill', () => {
  const result = extractSkillsFromText('JavaScript developer');
  expect(result.skills).toContainEqual(
    expect.objectContaining({ skillName: 'javascript' })
  );
});

// Bad: Tests multiple unrelated things
test('should work correctly', () => {
  expect(a()).toBe(1);
  expect(b()).toBe(2);
  expect(c()).toBe(3);
});
```

### 2. Use Descriptive Test Names
```javascript
// Good: Clear what the test does
test('should return empty array when no skills found', () => {});

// Bad: Unclear what's being tested
test('test1', () => {});
```

### 3. Arrange-Act-Assert Pattern
```javascript
test('should calculate match score correctly', () => {
  // Arrange: Set up test data
  const user = { skills: ['javascript', 'react'] };
  const job = { skills: ['javascript', 'react', 'node'] };

  // Act: Perform the action
  const score = calculateMatchScore(user, job);

  // Assert: Verify the result
  expect(score).toBeGreaterThan(50);
  expect(score).toBeLessThanOrEqual(100);
});
```

### 4. Clean Up After Tests
```javascript
// Use afterEach to clean up
afterEach(async () => {
  await User.deleteMany({});
  await Job.deleteMany({});
});
```

### 5. Use beforeEach for Common Setup
```javascript
let authToken;

beforeEach(async () => {
  // Create test user and get token
  const response = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', password: 'password123' });

  authToken = response.body.token;
});
```

## Debugging Tests

### 1. Use console.log
```javascript
test('debugging example', () => {
  const result = someFunction();
  console.log('Result:', result);  // Will show in test output
  expect(result).toBeDefined();
});
```

### 2. Run Single Test with --verbose
```bash
npm test -- --verbose skillExtractor
```

### 3. Use .only to Focus
```javascript
test.only('focus on this test', () => {
  // Only this test will run
});
```

### 4. Check Test Database State
```javascript
test('debugging database', async () => {
  const users = await User.find({});
  console.log('Users in DB:', users);
});
```

## Continuous Integration

When setting up CI/CD, use:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    cd backend
    npm install
    npm test

- name: Check coverage
  run: |
    cd backend
    npm run test:coverage
```

## Troubleshooting

### Tests Timing Out
If tests are slow or timing out:
```javascript
// Increase timeout for specific test
test('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### MongoDB Memory Server Issues
If you see MongoDB Memory Server errors:
```bash
# Clear the cache
rm -rf ~/.mongodb-memory-server

# Reinstall
npm install mongodb-memory-server --save-dev
```

### Port Already in Use
Tests use an in-memory database, but if you see port errors:
```bash
# Kill processes on port 3000
lsof -ti:3000 | xargs kill
```

## Summary

Your test suite now includes:
- **90+ comprehensive tests** covering all critical functionality
- **Unit tests** for pure functions and utilities
- **Integration tests** for API endpoints
- **Scraper tests** for web scraping logic
- **High coverage** (target: >80%)
- **Clear documentation** and examples

Run tests frequently during development to catch issues early. Use watch mode (`npm run test:watch`) for the best development experience.
