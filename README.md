# JOBIFY 🚀

A personalized job discovery platform that intelligently matches users with opportunities by analyzing their skills against real-time job market data.

## 🎯 Overview

JOBIFY transforms the traditional job search experience from passive browsing to proactive discovery. Instead of users manually searching through countless job boards, our platform continuously learns user preferences and market trends to surface relevant opportunities they might otherwise miss.

### Why JOBIFY?

- **Intelligent Matching**: Advanced algorithms analyze your skills and match you with the most relevant opportunities
- **Real-time Data**: Stay updated with the latest job market trends and opportunities
- **Personalized Experience**: The platform learns your preferences and improves recommendations over time
- **Comprehensive Coverage**: Aggregates opportunities from multiple sources for maximum exposure

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

## 🛠️ Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer middleware
- **Security**: bcrypt for password hashing

## 📁 Project Structure

```
JOBIFY/
├── backend/
│   └── src/
│       ├── config/          # Database and environment configuration
│       ├── controllers/     # Request handlers
│       │   ├── authController.js
│       │   ├── profileController.js
│       │   └── resumeController.js
│       ├── middlewares/     # Custom middleware functions
│       │   ├── authMiddleware.js
│       │   └── uploadMiddleware.js
│       ├── models/          # MongoDB schemas
│       │   ├── ResumeModel.js
│       │   └── UserModel.js
│       ├── routes/          # API route definitions
│       │   ├── auth.js
│       │   ├── index.js
│       │   ├── profile.js
│       │   └── resume.js
│       ├── services/        # Business logic layer
│       ├── utils/           # Utility functions
│       │   ├── convertSkillsForUser.js
│       │   ├── saveSkillsToUser.js
│       │   └── skillExtractor.js
│       └── tests/           # Test files
├── frontend/                # Frontend application (coming soon)
├── uploads/                 # File upload directory
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── package-lock.json
└── server.js               # Application entry point
```

## 🚀 Getting Started

### Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jobify.git
   cd jobify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory and add the following:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/jobify
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
  
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
   - Example: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobify`

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:3000`

## 🔧 API Endpoints (Till now)

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/skills` - Add skills to profile

### Resume Management
- `POST /api/resume/upload` - Upload resume file
- `GET /api/resume` - Get user's resume data
- `DELETE /api/resume/:id` - Delete resume

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  skills: [String],
  preferences: {
    location: String,
    salaryRange: {
      min: Number,
      max: Number
    },
    jobType: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Resume Model
```javascript
{
  userId: ObjectId (ref: User),
  filename: String,
  originalName: String,
  extractedSkills: [String],
  extractedText: String,
  uploadDate: Date
}
```



## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive input validation and sanitization
- **File Upload Security**: Secure file handling with type and size restrictions

## 📈 Upcoming Features

- [ ] Job recommendation engine
- [ ] Real-time job alerts
- [ ] Advanced skill matching algorithms
- [ ] Integration with major job boards
- [ ] Mobile application
- [ ] Interview preparation tools
- [ ] UI / UX



