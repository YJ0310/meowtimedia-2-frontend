# Meowtimap Backend API Requirements

> **Document Purpose**: This document outlines all the backend APIs needed to support the Meowtimap frontend application. It serves as a reference for backend developers to understand what endpoints need to be implemented.

**Last Updated**: 22 December 2025 by Yang Amat Berbahagia Tun Datuk Prof. Dr. Sek Yin Jia, SMN, DKM, DMN, DB, SP, JMN, JSM, JSD

---

## Table of Contents

1. [Current State](#current-state)
2. [MongoDB Schema (Already Implemented)](#mongodb-schema-already-implemented)
3. [Authentication APIs (Implemented ✅)](#authentication-apis-implemented-)
4. [User APIs (To Be Implemented 🔴)](#user-apis-to-be-implemented-)
5. [Country Page APIs (To Be Implemented 🔴)](#country-page-apis-to-be-implemented-)
6. [Country Quiz APIs (To Be Implemented 🔴)](#country-quiz-apis-to-be-implemented-)
7. [Stamp/Passport APIs (To Be Implemented 🔴)](#stamppassport-apis-to-be-implemented-)
8. [Priority Order](#priority-order)

---

## Current State

### What's Already Implemented
- ✅ Google OAuth authentication flow
- ✅ User session management
- ✅ Basic user model in MongoDB
- ✅ Quiz model in MongoDB
- ✅ FunFact model in MongoDB

### What the Frontend Currently Uses
The frontend is using **mock data** from `lib/mock-data.ts` for:
- Countries list (dashboard map)
- Country content (festivals, food, funfacts) for `/country/[slug]` page
- Quiz questions for each country
- Stamps/achievements (one stamp per country)
- User progress

### Core Flow
1. User visits **Dashboard** → See all countries on map
2. User clicks a country → Goes to `/country/[slug]`
3. Country page shows: **Festivals**, **Food**, **Fun Facts** tabs + **Quiz** tab
4. User takes the **10-question quiz** (questions & choices shuffled)
5. If score ≥ 80% (8/10): **Country completed** → Earn **1 stamp** for that country
6. If score < 80%: Progress saved, user can **retry** the quiz

### API Base URL
```
Production: https://api.meowtimap.smoltako.space
Development: nope
```

---

## MongoDB Schema (Already Implemented)

### User Model (`models/User.js`)
```javascript
{
  googleId: String,          // Required, unique
  email: String,             // Required, unique
  displayName: String,       // Required
  firstName: String,
  lastName: String,
  avatar: String,            // Google profile picture URL
  username: String,          // Unique, sparse (optional custom username)
  bio: String,               // Max 500 chars
  countriesVisited: [String], // Array of country slugs
  stampsCollected: [ObjectId], // References to Stamp collection
  quizzesCompleted: [{
    quizId: ObjectId,        // Reference to Quiz
    score: Number,
    completedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

### Quiz Model (`models/Quiz.js`)
```javascript
{
  country: String,           // e.g., "Malaysia", indexed
  quiz_title: String,
  difficulty: String,        // Enum: "Easy", "Medium", "Hard"
  description: String,
  questions: [{
    id: Number,
    text: String,
    options: {
      A: String,
      B: String,
      C: String,
      D: String
    },
    correctAnswer: String    // Enum: "A", "B", "C", "D"
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### FunFact Model (`models/FunFact.js`)
```javascript
{
  country: String,           // Unique, indexed
  funFact: [String],         // Array of fun facts
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication APIs (Implemented ✅)

These endpoints are already working in `routes/auth.js`:

### `GET /auth/google`
Initiates Google OAuth login flow.

### `GET /auth/google/callback`
Handles Google OAuth callback, creates/updates user, redirects to frontend.

### `GET /auth/user`
Returns current authenticated user.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "mongodb_object_id",
    "email": "user@gmail.com",
    "displayName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://lh3.googleusercontent.com/..."
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

### `GET /auth/logout`
Logs out user and destroys session.

---

## User APIs (To Be Implemented 🔴)

### `GET /api/users/me/profile`
Get complete user profile with progress data.

**Headers:** Requires authentication (session)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@gmail.com",
    "displayName": "John Doe",
    "username": "johndoe123",
    "bio": "Love exploring Asian cultures!",
    "avatar": "https://lh3.googleusercontent.com/...",
    "stats": {
      "totalStamps": 12,
      "countriesVisited": 5,
      "quizzesCompleted": 8,
      "totalScore": 85
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### `PATCH /api/users/me/profile`
Update user profile (username and bio only).

**Request Body:**
```json
{
  "username": "newUsername123",
  "bio": "Updated bio text"
}
```

**Validation:**
- `username`: 3-30 chars, alphanumeric + underscore, unique
- `bio`: Max 500 chars

**Response (200):**
```json
{
  "success": true,
  "data": {
    "username": "newUsername123",
    "bio": "Updated bio text"
  }
}
```

### `GET /api/users/me/progress`
Get user's learning progress across all countries.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "countriesVisited": ["japan", "south-korea", "thailand"],
    "countryProgress": [
      {
        "countrySlug": "japan",
        "progress": 78,
        "unlockedTopics": 5,
        "totalTopics": 8
      },
      {
        "countrySlug": "south-korea",
        "progress": 65,
        "unlockedTopics": 4,
        "totalTopics": 8
      }
    ],
    "quizzesCompleted": [
      {
        "quizId": "quiz_id",
        "countrySlug": "japan",
        "score": 8,
        "totalQuestions": 10,
        "completedAt": "2024-11-15T14:30:00Z"
      }
    ]
  }
}
```

---

## Country Page APIs (To Be Implemented 🔴)

> **Frontend Route**: `/country/[slug]`
>
> This is the main country exploration page with tabs for Festivals, Food, Fun Facts, and Quiz.

### `GET /api/countries`
Get all countries for dashboard map display.

**Headers:** Optional authentication (if authenticated, includes user progress)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "country_id",
      "name": "Japan",
      "slug": "japan",
      "flag": "/japan.gif",
      "coordinates": [138.2529, 36.2048],
      "description": "Land of the Rising Sun...",
      "funFact": "Japan has more than 6,800 islands!",
      "isCompleted": true,
      "hasStamp": true,
      "quizHighScore": 9,
      "quizAttempts": 2
    },
    {
      "id": "country_id",
      "name": "China",
      "slug": "china",
      "flag": "🇨🇳",
      "coordinates": [104.1954, 35.8617],
      "description": "Ancient civilization...",
      "funFact": "The Great Wall is over 13,000 miles!",
      "isCompleted": false,
      "hasStamp": false,
      "quizHighScore": 0,
      "quizAttempts": 0
    }
  ]
}
```

### `GET /api/countries/:slug`
Get single country page data including all content (festivals, food, funfacts) and quiz metadata.

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "country_id",
    "name": "Japan",
    "slug": "japan",
    "flag": "/japan.gif",
    "coordinates": [138.2529, 36.2048],
    "description": "Land of the Rising Sun...",
    "isCompleted": false,
    "hasStamp": false,
    "quizHighScore": 6,
    "quizAttempts": 1,
    "content": {
      "festivals": [
        {
          "id": "content_id",
          "title": "Hanami (Cherry Blossom Festival)",
          "content": "Hanami is the beloved Japanese tradition of enjoying cherry blossoms...",
          "image": "https://images.unsplash.com/..."
        },
        {
          "id": "content_id",
          "title": "Gion Matsuri",
          "content": "Held in Kyoto throughout July...",
          "image": "https://images.unsplash.com/..."
        }
      ],
      "food": [
        {
          "id": "content_id",
          "title": "Ramen",
          "content": "Japanese ramen features Chinese-style wheat noodles...",
          "image": "https://images.unsplash.com/..."
        },
        {
          "id": "content_id",
          "title": "Tempura",
          "content": "Lightly battering and frying vegetables and seafood...",
          "image": "https://images.unsplash.com/..."
        }
      ],
      "funfacts": [
        {
          "id": "content_id",
          "title": "Vending Machine Paradise",
          "content": "Japan has over 5.5 million vending machines...",
          "image": "https://images.unsplash.com/..."
        }
      ]
    },
    "quiz": {
      "totalQuestions": 10,
      "passingScore": 8,
      "passingPercentage": 80
    }
  }
}
```

---

## Country Quiz APIs (To Be Implemented 🔴)

> **IMPORTANT QUIZ RULES:**
> - Each country has exactly **10 questions**
> - Pass mark is **80%** (8 out of 10 correct)
> - If passed (≥80%): Country is **completed** and user earns **ONE stamp** for that country
> - If failed (<80%): Progress is **saved**, user can **retry** the quiz
> - Questions order must be **shuffled** on each attempt
> - Answer choices (A, B, C, D) must also be **shuffled** on each attempt
> - **ONE stamp per country** (not per topic)

### `GET /api/countries/:countrySlug/quiz`
Get the quiz for a country. Questions and choices should be **shuffled** by the backend.

**Headers:** Requires authentication

**Backend Requirements:**
1. Shuffle the order of questions randomly
2. Shuffle the order of choices (A, B, C, D) for each question
3. Keep track of the shuffle mapping to validate answers correctly
4. Return a `sessionId` to track this specific quiz attempt

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "quiz_session_uuid",
    "countrySlug": "japan",
    "countryName": "Japan",
    "totalQuestions": 10,
    "passingScore": 8,
    "passingPercentage": 80,
    "userHighScore": 6,
    "userAttempts": 1,
    "hasCompletedCountry": false,
    "questions": [
      {
        "id": 1,
        "questionNumber": 1,
        "text": "What is the capital of Japan?",
        "options": [
          { "key": "A", "value": "Kyoto" },
          { "key": "B", "value": "Tokyo" },
          { "key": "C", "value": "Osaka" },
          { "key": "D", "value": "Hiroshima" }
        ]
      },
      {
        "id": 2,
        "questionNumber": 2,
        "text": "What does 'kawaii' mean?",
        "options": [
          { "key": "A", "value": "Strong" },
          { "key": "B", "value": "Fast" },
          { "key": "C", "value": "Cute" },
          { "key": "D", "value": "Smart" }
        ]
      }
    ]
  }
}
```

> **Note**: `correctAnswer` should **NOT** be sent to frontend. Only validate on submit.

### `POST /api/countries/:countrySlug/quiz/submit`
Submit quiz answers and get results.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "sessionId": "quiz_session_uuid",
  "answers": [
    { "questionId": 1, "answer": "B" },
    { "questionId": 2, "answer": "C" },
    { "questionId": 3, "answer": "A" },
    { "questionId": 4, "answer": "D" },
    { "questionId": 5, "answer": "B" },
    { "questionId": 6, "answer": "A" },
    { "questionId": 7, "answer": "C" },
    { "questionId": 8, "answer": "B" },
    { "questionId": 9, "answer": "D" },
    { "questionId": 10, "answer": "A" }
  ]
}
```

**Response (200) - PASSED (≥80%):**
```json
{
  "success": true,
  "data": {
    "score": 9,
    "totalQuestions": 10,
    "percentage": 90,
    "passed": true,
    "isNewHighScore": true,
    "countryCompleted": true,
    "message": "Congratulations! You've completed Japan!",
    "results": [
      { "questionId": 1, "userAnswer": "B", "correctAnswer": "B", "isCorrect": true },
      { "questionId": 2, "userAnswer": "C", "correctAnswer": "C", "isCorrect": true },
      { "questionId": 3, "userAnswer": "A", "correctAnswer": "B", "isCorrect": false }
    ],
    "stampEarned": {
      "id": "stamp_id",
      "countrySlug": "japan",
      "countryName": "Japan",
      "stampImage": "/stamp/japan.png",
      "earnedAt": "2024-12-22T14:30:00Z"
    }
  }
}
```

**Response (200) - FAILED (<80%):**
```json
{
  "success": true,
  "data": {
    "score": 6,
    "totalQuestions": 10,
    "percentage": 60,
    "passed": false,
    "isNewHighScore": true,
    "countryCompleted": false,
    "message": "You scored 60%. You need 80% to complete this country. Try again!",
    "results": [
      { "questionId": 1, "userAnswer": "B", "correctAnswer": "B", "isCorrect": true },
      { "questionId": 2, "userAnswer": "A", "correctAnswer": "C", "isCorrect": false }
    ],
    "stampEarned": null,
    "progress": {
      "highScore": 6,
      "attempts": 2,
      "canRetry": true
    }
  }
}
```

---

## Stamp/Passport APIs (To Be Implemented 🔴)

> **STAMP SYSTEM:**
> - **ONE stamp per country** (not per topic)
> - Stamp is earned when user scores **≥80%** on the country quiz
> - Total possible stamps = Total number of countries (12 countries = 12 stamps max)

### `GET /api/stamps`
Get all stamps earned by current user (for passport page).

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalStamps": 5,
    "maxStamps": 12,
    "stamps": [
      {
        "id": "stamp_id",
        "countrySlug": "japan",
        "countryName": "Japan",
        "flag": "/japan.gif",
        "stampImage": "/stamp/japan.png",
        "quizScore": 9,
        "earnedAt": "2024-11-15T10:30:00Z"
      },
      {
        "id": "stamp_id",
        "countrySlug": "south-korea",
        "countryName": "South Korea",
        "flag": "/south-korea.gif",
        "stampImage": "/stamp/korea.png",
        "quizScore": 8,
        "earnedAt": "2024-11-20T14:30:00Z"
      },
      {
        "id": "stamp_id",
        "countrySlug": "thailand",
        "countryName": "Thailand",
        "flag": "/thailand.gif",
        "stampImage": "/stamp/thailand.png",
        "quizScore": 10,
        "earnedAt": "2024-11-22T09:00:00Z"
      }
    ]
  }
}
```

> **Note**: Stamps are automatically awarded when quiz is passed. No separate claim endpoint needed.

---

## Priority Order

### Phase 1 - Core Features (HIGH PRIORITY)
1. ✅ `GET /auth/google` - Already done
2. ✅ `GET /auth/google/callback` - Already done
3. ✅ `GET /auth/user` - Already done
4. ✅ `GET /auth/logout` - Already done
5. 🔴 `GET /api/countries` - List all countries for dashboard map
6. 🔴 `GET /api/countries/:slug` - Country page with all content (festivals, food, funfacts)

### Phase 2 - Quiz & Gamification (HIGH PRIORITY)
7. 🔴 `GET /api/countries/:countrySlug/quiz` - Get shuffled quiz (10 questions)
8. 🔴 `POST /api/countries/:countrySlug/quiz/submit` - Submit quiz, check 80% pass
9. 🔴 `GET /api/stamps` - User's passport stamps

### Phase 3 - User Features (MEDIUM PRIORITY)
10. 🔴 `GET /api/users/me/profile` - User profile with stats
11. 🔴 `GET /api/users/me/progress` - User progress across countries
12. 🔴 `PATCH /api/users/me/profile` - Update username/bio

---

## New Models Needed

Based on the frontend requirements, the following new MongoDB models need to be created:

### 1. Country Model (NEW)
```javascript
const countrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  flag: { type: String, required: true }, // emoji or image path (e.g., "/japan.gif")
  coordinates: { type: [Number], required: true }, // [longitude, latitude]
  description: { type: String },
  funFact: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
```

### 2. Content Model (NEW)
Stores festivals, food, and funfact cards for each country.
```javascript
const contentSchema = new mongoose.Schema({
  countrySlug: { type: String, required: true, index: true },
  type: { type: String, enum: ['festival', 'food', 'funfact'], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
contentSchema.index({ countrySlug: 1, type: 1 });
```

### 3. Stamp Model (NEW)
One stamp per country, earned when quiz score ≥ 80%.
```javascript
const stampSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  countrySlug: { type: String, required: true },
  countryName: { type: String, required: true },
  flag: { type: String },
  stampImage: { type: String }, // e.g., "/stamp/japan.png"
  quizScore: { type: Number, required: true }, // score when stamp was earned
  earnedAt: { type: Date, default: Date.now }
});
// One stamp per user per country
stampSchema.index({ userId: 1, countrySlug: 1 }, { unique: true });
```

### 4. QuizProgress Model (NEW)
Tracks user's quiz attempts and high scores for each country.
```javascript
const quizProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  countrySlug: { type: String, required: true },
  highScore: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }, // true when score >= 80%
  lastAttemptAt: { type: Date },
  completedAt: { type: Date } // when first passed
});
quizProgressSchema.index({ userId: 1, countrySlug: 1 }, { unique: true });
```

### 5. QuizSession Model (NEW - Optional, for shuffle tracking)
Temporary session to track shuffled questions for answer validation.
```javascript
const quizSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  countrySlug: { type: String, required: true },
  // Maps shuffled question order and answer positions
  questionMapping: [{
    originalId: Number,
    shuffledPosition: Number,
    answerMapping: { // Maps shuffled answer key to original
      A: String, // e.g., "C" means shuffled A = original C
      B: String,
      C: String,
      D: String
    }
  }],
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour
});
```

### Update Existing Quiz Model
Ensure each country has exactly **10 questions**:
```javascript
const quizSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true }, // One quiz per country
  countrySlug: { type: String, required: true, unique: true },
  quiz_title: { type: String, required: true },
  description: { type: String },
  questions: {
    type: [questionSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 10; // Exactly 10 questions
      },
      message: 'A quiz must have exactly 10 questions'
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

## Error Response Format

All error responses should follow this format:

```json
{
  "success": false,
  "message": "Error description here",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common Error Codes
- `401` - Not authenticated
- `403` - Forbidden (not authorized)
- `404` - Resource not found
- `422` - Validation error
- `500` - Internal server error

---

## Frontend Integration Notes

### Current Frontend API URL
```typescript
const API_URL = "https://api.meowtimap.smoltako.space";
```

### Authentication Flow
1. Frontend calls `login()` which redirects to `${API_URL}/auth/google`
2. After Google auth, backend redirects to `${CLIENT_URL}/dashboard`
3. Frontend calls `GET /auth/user` to check authentication status
4. All subsequent requests include `credentials: "include"` for session cookies

### Data Currently Mocked
All data in `lib/mock-data.ts` needs to be replaced with API calls:
- `countries` array → `GET /api/countries`
- `countryContent` array → `GET /api/countries/:slug` (included in response)
- `countryQuizzes` array → `GET /api/countries/:slug/quiz`
- `stamps` array → `GET /api/stamps`

---

## Quiz Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                      COUNTRY QUIZ FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User visits /country/[slug]                                 │
│     └── GET /api/countries/:slug                                │
│         Returns: festivals, food, funfacts, quiz metadata       │
│                                                                 │
│  2. User clicks Quiz tab                                        │
│     └── GET /api/countries/:countrySlug/quiz                    │
│         Backend: Shuffle questions & choices                    │
│         Returns: sessionId, 10 shuffled questions               │
│                                                                 │
│  3. User answers all 10 questions & submits                     │
│     └── POST /api/countries/:countrySlug/quiz/submit            │
│         Send: sessionId, answers                                │
│         Backend: Validate using shuffle mapping                 │
│                                                                 │
│  4. Check Score                                                 │
│     ├── Score >= 8/10 (80%): PASSED ✅                          │
│     │   └── Country completed                                   │
│     │   └── Stamp awarded automatically                         │
│     │   └── Save to QuizProgress (isCompleted: true)            │
│     │   └── Create Stamp record                                 │
│     │                                                           │
│     └── Score < 8/10 (80%): FAILED ❌                           │
│         └── Save high score if new best                         │
│         └── Increment attempts                                  │
│         └── User can retry (new shuffled quiz)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

| Category | Endpoints Needed | Priority |
|----------|-----------------|----------|
| Auth | 4 (all done ✅) | Done |
| Countries | 2 | High |
| Quiz | 2 | High |
| Stamps | 1 | High |
| Users | 3 | Medium |

**Total Endpoints to Implement: 8**

### Key Requirements Recap:
- ✅ **10 questions** per country quiz
- ✅ **80% pass mark** (8/10 correct)
- ✅ **One stamp per country** (earned on quiz pass)
- ✅ **Shuffled questions** on each attempt
- ✅ **Shuffled answer choices** on each attempt
- ✅ **Retry allowed** if failed (progress saved)
