# JOBIFY - Quick Start Guide

This guide will help you get the MVP up and running in minutes.

## Prerequisites

Make sure you have installed:
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm (comes with Node.js)

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages including testing dependencies.

### 2. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/job_recommendation_db
JWT_SECRET=change_this_to_a_secure_random_string_in_production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 4. Run the Application

```bash
npm run dev
```

You should see:
```
Server is running on port 3000
MongoDB connected successfully
```

## Testing the MVP

### Run All Tests

```bash
npm test
```

This runs the complete test suite including:
- Unit tests for skill extraction
- Unit tests for job matching algorithm
- Integration tests for all API endpoints
- Scraper tests

**Note:** The test scripts now use `cross-env` to work on Windows, macOS, and Linux.

### Watch Mode (For Development)

```bash
npm run test:watch
```

Tests will automatically rerun when you save changes to files.

### Check Test Coverage

```bash
npm run test:coverage
```

View the HTML coverage report at `backend/coverage/lcov-report/index.html`

## Quick API Test

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the token from the response.

### 2. Upload Resume (Optional)

```bash
curl -X POST http://localhost:3000/api/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@/path/to/your/resume.pdf"
```

This will automatically extract skills from your resume.

### 3. Scrape Jobs

```bash
curl -X POST http://localhost:3000/api/jobs/scrape/trigger \
  -H "Content-Type: application/json" \
  -d '{"keywords":"software engineer","location":"Mumbai"}'
```

Wait for scraping to complete (may take 10-30 seconds depending on results).

### 4. Get Recommendations

```bash
curl -X GET http://localhost:3000/api/jobs/recommended/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

You'll receive personalized job recommendations with match scores!

## What the MVP Includes

### Core Features
- User registration and authentication with JWT
- Resume upload with automatic skill extraction (PDF and DOCX)
- Profile management with skills and preferences
- Automated job scraping from Indeed
- Intelligent job matching based on skills, location, salary, and experience
- Personalized job recommendations
- Job actions: save, apply, hide, view
- Comprehensive test suite with 80+ tests

### Completed Modules

1. **Authentication System**
   - User registration
   - Login with JWT tokens
   - Protected routes

2. **Resume Processing**
   - PDF and DOCX parsing
   - Skill extraction with 90+ predefined skills
   - Automatic profile updates

3. **Job Scraping**
   - Complete Indeed scraper
   - Extracts: title, company, location, salary, description, skills
   - Deduplication logic
   - Scheduled scraping (can be enabled)

4. **Job Matching Algorithm**
   - Skill similarity scoring (50% weight)
   - Location matching (20% weight)
   - Salary range matching (15% weight)
   - Experience level matching (15% weight)

5. **API Endpoints**
   - Auth: register, login, profile
   - Profile: update, skills management
   - Jobs: list, detail, recommendations, actions
   - Resume: upload and parse

6. **Testing**
   - Unit tests for utilities
   - Integration tests for API
   - Scraper tests
   - 80+ test cases total

## File Structure Overview

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── models/          # Database schemas (User, Job, Resume)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic (jobService, scrapers)
│   ├── utils/           # Helper functions (skillExtractor, jobMatcher)
│   └── config/          # Database configuration
├── tests/               # Comprehensive test suite
│   ├── integration/     # API tests
│   ├── scrapers/        # Scraper tests
│   └── utils/           # Utility tests
├── uploads/             # Resume file storage
├── .env                 # Environment variables (create this)
├── package.json         # Dependencies and scripts
└── server.js           # Application entry point
```

## Common Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check the MONGODB_URI in your `.env` file

### Port 3000 Already in Use
- Change PORT in `.env` to a different number
- Or kill the process: `lsof -ti:3000 | xargs kill` (macOS/Linux)

### Tests Failing
- Make sure you ran `npm install` first
- Check that all dev dependencies installed correctly
- Try deleting `node_modules` and running `npm install` again

### No Jobs Found When Scraping
- Indeed frequently changes their HTML structure
- Try different keywords or locations
- Check console logs for detailed error messages
- The scraper includes multiple selectors to handle changes

## Next Steps

1. **Enable Scheduled Scraping**
   - Uncomment the scheduler in `server.js` to enable automatic job scraping every 6 hours

2. **Customize Skill Database**
   - Add more skills to `src/utils/skillExtractor.js` for better matching

3. **Add More Job Sources**
   - Implement LinkedIn scraper in `src/services/scrapers/linkedinScraper.js`
   - Use the `baseScraper.js` as a template

4. **Build Frontend**
   - Create React app for user-friendly interface
   - Connect to these API endpoints

5. **Deploy**
   - Use MongoDB Atlas for cloud database
   - Deploy to Heroku, AWS, or your preferred platform

## Need Help?

- Check the main README.md for detailed documentation
- Review test files in `tests/` for usage examples
- Check API endpoint examples in README.md
- All functions include plain English comments explaining what they do

## MVP Success Checklist

- [ ] MongoDB is running
- [ ] Application starts without errors
- [ ] All tests pass (npm test)
- [ ] Can register and login users
- [ ] Can upload resume and extract skills
- [ ] Can trigger job scraping
- [ ] Can get personalized recommendations
- [ ] Can save/apply/hide jobs

Once all checkboxes are complete, your MVP is fully functional!
