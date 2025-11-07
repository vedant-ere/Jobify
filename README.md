# JOBIFY - MVP Ready! 🚀

A personalized job discovery platform that intelligently matches users with opportunities by analyzing their skills against real-time job market data.

## Overview

JOBIFY transforms the traditional job search experience from passive browsing to proactive discovery. Instead of users manually searching through countless job boards, our platform continuously learns user preferences and market trends to surface relevant opportunities they might otherwise miss.

### Why JOBIFY?

- **Intelligent Matching**: Advanced algorithms analyze your skills and match you with the most relevant opportunities
- **Real-time Data**: Stay updated with the latest job market trends and opportunities through automated web scraping
- **Personalized Experience**: The platform learns your preferences and improves recommendations over time
- **Comprehensive Coverage**: Aggregates opportunities from multiple sources for maximum exposure
- **Resume Skill Extraction**: Automatically extracts technical and non-technical skills from your resume

## MVP Features (Now Available!)

Our Minimum Viable Product includes all core functionality you need to get started:

- User registration and authentication with JWT tokens
- Resume upload with automatic skill extraction from PDF and DOCX files
- Profile management with skill proficiency ratings
- Automated job scraping from Indeed with full field extraction
- Intelligent job matching based on user skills, location, and preferences
- Personalized job recommendations with match scores
- Job actions: save, apply, hide, and view jobs
- Comprehensive test suite with 80+ tests
- API endpoints for all job operations

## 🏗️ Architecture

### Data Flow Pipeline

```
1. Data Acquisition
   ├── Web Scraping (Indeed, Glassdoor, etc.)
   ├── API Integration (LinkedIn, GitHub Jobs)
   └── User Input (Resume, Manual Skills)
   
2. Data Processing
   ├── Job Parsing & Standardization
   ├── Skill Extraction (NLP)
   └── Data Validation & Cleaning
   
3. Matching Engine
   ├── Skill Similarity Scoring
   ├── Location/Salary Filtering
   └── Preference Weighting
   
4. User Interface
   ├── Job Feed Generation
   ├── Filter Controls
   └── Feedback Collection
```

## Tech Stack

### Backend
- **Runtime**: Node.js with Express.js 5.1
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **File Upload**: Multer middleware
- **Resume Parsing**: pdf-parse and mammoth for PDF and DOCX files
- **Web Scraping**: Cheerio and Axios for job data collection
- **Security**: Helmet middleware for HTTP security headers

### Testing
- **Framework**: Jest 29
- **Integration Tests**: Supertest for API testing
- **Database**: MongoDB Memory Server for isolated test environment
- **Coverage**: Comprehensive unit and integration tests

### Development Tools
- **Nodemon**: Auto-restart server during development
- **Concurrently**: Run multiple commands in parallel
- **ES Modules**: Modern JavaScript module system

## 📁 Project Structure

```
JOBIFY/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and environment configuration
│   │   │   └── database.js
│   │   ├── controllers/     # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── jobController.js      # NEW: Job operations
│   │   │   ├── profileController.js
│   │   │   └── resumeController.js
│   │   ├── middlewares/     # Custom middleware functions
│   │   │   ├── authMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── models/          # MongoDB schemas
│   │   │   ├── Job.js               # NEW: Job model with indexes
│   │   │   ├── ResumeModel.js
│   │   │   ├── ScrapingLog.js
│   │   │   └── UserModel.js
│   │   ├── routes/          # API route definitions
│   │   │   ├── auth.js
│   │   │   ├── index.js
│   │   │   ├── jobs.js              # NEW: Job routes
│   │   │   ├── jobSearchRoutes.js
│   │   │   ├── profile.js
│   │   │   └── resume.js
│   │   ├── services/        # Business logic layer
│   │   │   ├── jobService.js        # NEW: Job CRUD operations
│   │   │   ├── scrapingScheduler.js # NEW: Scheduled scraping
│   │   │   └── scrapers/
│   │   │       ├── baseScraper.js   # Base scraper class
│   │   │       └── indeedScraper.js # Complete Indeed scraper
│   │   └── utils/           # Utility functions
│   │       ├── convertSkillsForUser.js
│   │       ├── jobMatcher.js        # NEW: Matching algorithm
│   │       ├── saveSkillsToUser.js
│   │       └── skillExtractor.js
│   ├── tests/               # Comprehensive test suite
│   │   ├── integration/     # API integration tests
│   │   │   ├── auth.test.js
│   │   │   └── jobs.test.js
│   │   ├── scrapers/        # Scraper unit tests
│   │   │   └── indeedScraper.test.js
│   │   └── utils/           # Utility unit tests
│   │       ├── jobMatcher.test.js
│   │       └── skillExtractor.test.js
│   └── uploads/             # File upload directory
├── frontend/                # Frontend application (coming soon)
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── package-lock.json
└── server.js               # Application entry point
```

## Getting Started

### Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jobify.git
   cd jobify/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the backend directory with the following:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/job_recommendation_db

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Optional: TheirStack API for additional job sources
   THEIRSTACK_API_KEY=your_api_key_here
   ```

4. **Set up MongoDB**

   **Option A: Local MongoDB Installation**
   - Install MongoDB from [official website](https://www.mongodb.com/try/download/community)
   - Start MongoDB service:
     ```bash
     # On macOS with Homebrew
     brew services start mongodb/brew/mongodb-community

     # On Ubuntu/Debian
     sudo systemctl start mongod

     # On Windows
     net start MongoDB
     ```

   **Option B: MongoDB Atlas (Cloud)**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string and update `MONGODB_URI` in `.env`
   - Example: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/job_recommendation_db`

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`
   You should see: "Server is running on port 3000" and "MongoDB connected successfully"

## Running Tests

Our comprehensive test suite includes unit tests, integration tests, and scraper tests.

### Running All Tests

```bash
npm test
```

This runs all tests in the project using Jest.

### Running Tests in Watch Mode

For active development, you can run tests in watch mode. Tests will automatically rerun when you save changes:

```bash
npm run test:watch
```

### Running Tests with Coverage

To see code coverage reports showing which parts of your code are tested:

```bash
npm run test:coverage
```

This generates a coverage report in the terminal and creates an HTML report in the `coverage/` directory.

### Running Specific Test Files

To run tests for a specific module:

```bash
# Test skill extraction utility
npm test skillExtractor

# Test job matching algorithm
npm test jobMatcher

# Test API endpoints
npm test integration

# Test scrapers
npm test scrapers
```

### Test Structure

Our tests are organized into categories:

- **Unit Tests** (`tests/utils/`): Test individual functions and utilities
  - Skill extraction from resumes
  - Job matching algorithm
  - Helper functions

- **Integration Tests** (`tests/integration/`): Test API endpoints end-to-end
  - Authentication flow
  - Job CRUD operations
  - User interactions

- **Scraper Tests** (`tests/scrapers/`): Test web scraping functionality
  - HTML parsing
  - Data extraction
  - Error handling

### Test Coverage Goals

We aim for:
- Overall coverage > 80%
- Critical paths (auth, job matching) > 90%
- All API endpoints covered by integration tests

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  - Body: `{ email, password }`
  - Returns: JWT token and user data

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: JWT token and user data

- `GET /api/auth/profile` - Get authenticated user profile (protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: User profile with skills

### Profile Management
- `PUT /api/profile` - Update user profile (protected)
  - Body: `{ firstName, lastName, title, experience, location }`

- `PUT /api/profile/skills` - Update user skills (protected)
  - Body: `{ skills: [{ skillName, proficiency, category }] }`

- `DELETE /api/profile/skills/:skillId` - Delete a skill (protected)

### Resume Management
- `POST /api/resume/upload` - Upload and parse resume (protected)
  - Accepts: PDF or DOCX files
  - Automatically extracts skills and updates profile

### Job Operations

#### Public Endpoints
- `GET /api/jobs` - Get all jobs with filters
  - Query params: `?keywords=react&location=mumbai&skills=javascript,react&remote=true&minSalary=500000&page=1&limit=20`
  - Returns: Paginated job listings

- `GET /api/jobs/:id` - Get specific job details
  - Records view action if user is authenticated

#### Protected Endpoints (require authentication)
- `GET /api/jobs/recommended/list` - Get personalized job recommendations
  - Returns: Jobs ranked by match score based on user skills and preferences

- `GET /api/jobs/:id/match-score` - Get detailed match breakdown for a job
  - Returns: Overall score and breakdown by skills, location, salary, experience

- `POST /api/jobs/:id/save` - Save a job to user's saved list

- `POST /api/jobs/:id/apply` - Mark job as applied

- `POST /api/jobs/:id/hide` - Hide job from recommendations

- `GET /api/jobs/user/saved` - Get user's saved jobs

- `GET /api/jobs/user/applied` - Get user's applied jobs

#### Admin Endpoints
- `POST /api/jobs/scrape/trigger` - Manually trigger job scraping
  - Body: `{ keywords, location }`
  - Returns: Scraping statistics

## Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed with bcrypt),
  profile: {
    firstName: String,
    lastName: String,
    title: String,
    experience: Number,
    location: {
      city: String,
      state: String,
      country: String,
      remote: Boolean
    }
  },
  skills: [{
    skillName: String (required, lowercase),
    proficiency: Number (1-5),
    category: Enum ['technical', 'non-technical', 'tool', 'industry', 'cloud'],
    verified: Boolean
  }],
  preferences: {
    jobTypes: [String],
    salaryRange: { min: Number, max: Number },
    industries: [String],
    companySize: [String]
  },
  jobHistory: [{
    jobId: ObjectId (ref: Job),
    action: Enum ['viewed', 'saved', 'applied', 'rejected', 'hidden'],
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Job Model
```javascript
{
  title: String (required),
  company: String (required),
  location: {
    city: String,
    state: String,
    country: String,
    remote: Boolean
  },
  description: String (required),
  skills: [String] (lowercase),
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  source: {
    name: String (required),
    url: String (required, unique),
    scrapedAt: Date
  },
  isActive: Boolean,
  postedDate: Date,
  expiresAt: Date (TTL index - auto-delete after 30 days),
  createdAt: Date,
  updatedAt: Date
}

// Indexes for performance
- Text search: title, description, skills
- Location: city, state, remote
- Skills array index
- Active jobs with recent posts
- Unique source URL for deduplication
```

### Resume Model
```javascript
{
  userId: ObjectId (ref: User),
  originalFileName: String,
  extractedText: String,
  parsedSkills: Array,
  uploadDate: Date
}
```



## Security Features

- **JWT Authentication**: Secure token-based authentication with configurable expiration
- **Password Hashing**: bcrypt for secure password storage with salt rounds
- **Protected Routes**: Middleware-based route protection for sensitive endpoints
- **Input Validation**: Comprehensive input validation and sanitization
- **File Upload Security**: Secure file handling with type and size restrictions
- **Database Security**: Mongoose schema validation and sanitization
- **HTTP Security**: Helmet middleware for security headers
- **CORS Configuration**: Cross-origin resource sharing controls

## Job Matching Algorithm

Our intelligent matching algorithm considers multiple factors to find the best jobs for each user:

### Scoring Components (Weighted)

1. **Skill Match (50% weight)**
   - Counts matching skills between user and job
   - Considers both required and preferred skills
   - Rewards having more skills than required

2. **Location Match (20% weight)**
   - Perfect match for same city
   - Partial match for same state
   - Remote jobs get high scores
   - User location preferences considered

3. **Salary Match (15% weight)**
   - Perfect match for jobs within user range
   - Good score for jobs above user max
   - Partial match for overlapping ranges
   - Lower score for below minimum

4. **Experience Match (15% weight)**
   - Matches job seniority level to user experience
   - Junior (1-2 years), Mid (3-5 years), Senior (5+ years)
   - Considers job title indicators

### Match Score Output
- Overall score: 0-100
- Detailed breakdown by category
- Used for job ranking and recommendations

## Usage Examples

### Complete User Flow

1. **Register and Login**
```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

2. **Upload Resume and Extract Skills**
```bash
# Upload resume (automatically extracts skills)
curl -X POST http://localhost:3000/api/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@/path/to/resume.pdf"
```

3. **Update Profile**
```bash
# Update user profile
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "experience": 3,
    "location": {"city": "Mumbai", "state": "Maharashtra"}
  }'
```

4. **Trigger Job Scraping**
```bash
# Scrape jobs for your skills
curl -X POST http://localhost:3000/api/jobs/scrape/trigger \
  -H "Content-Type: application/json" \
  -d '{"keywords":"React Developer","location":"Mumbai"}'
```

5. **Get Personalized Recommendations**
```bash
# Get recommended jobs
curl -X GET http://localhost:3000/api/jobs/recommended/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

6. **Interact with Jobs**
```bash
# Save a job
curl -X POST http://localhost:3000/api/jobs/JOB_ID/save \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark as applied
curl -X POST http://localhost:3000/api/jobs/JOB_ID/apply \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get match score breakdown
curl -X GET http://localhost:3000/api/jobs/JOB_ID/match-score \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running: `sudo systemctl status mongod`
   - Check connection string in `.env` file
   - For MongoDB Atlas, verify IP whitelist settings

2. **Tests Failing**
   - Run `npm install` to ensure all dev dependencies are installed
   - Make sure you're in the backend directory
   - Check that Jest and testing dependencies are properly installed

3. **Port Already in Use**
   - Change the PORT in `.env` file
   - Kill the process using the port: `lsof -ti:3000 | xargs kill`

4. **Resume Upload Fails**
   - Check file size limit (default: 5MB)
   - Ensure file is PDF or DOCX format
   - Verify uploads directory exists and has write permissions

5. **Scraping Returns No Jobs**
   - Indeed frequently changes their HTML structure
   - The scraper includes multiple selectors to handle this
   - Check console logs for detailed error messages
   - Try different keywords or locations

## Upcoming Features

- [ ] LinkedIn scraper implementation
- [ ] Email job alerts and notifications
- [ ] Advanced NLP for resume parsing
- [ ] Interview preparation tools
- [ ] Company reviews integration
- [ ] Salary insights and analytics
- [ ] Mobile application (React Native)
- [ ] Full frontend web application (React)
- [ ] Admin dashboard for monitoring
- [ ] Redis caching for performance
- [ ] Background job queue (Bull/BullMQ)
- [ ] Deployment guides (Docker, AWS, Heroku)



