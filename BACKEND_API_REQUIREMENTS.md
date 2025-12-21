# Meowtimap Backend API Requirements

> **Document Purpose**: This document outlines all the backend APIs needed to support the Meowtimap frontend application. It serves as a reference for backend developers to understand what endpoints need to be implemented.

**Last Updated**: December 21, 2025

---

## Table of Contents

1. [Current State](#current-state)
2. [MongoDB Schema (Already Implemented)](#mongodb-schema-already-implemented)
3. [Authentication APIs (Implemented ✅)](#authentication-apis-implemented-)
4. [User APIs (To Be Implemented 🔴)](#user-apis-to-be-implemented-)
5. [Country APIs (To Be Implemented 🔴)](#country-apis-to-be-implemented-)
6. [Topic APIs (To Be Implemented 🔴)](#topic-apis-to-be-implemented-)
7. [Lesson APIs (To Be Implemented 🔴)](#lesson-apis-to-be-implemented-)
8. [Quiz APIs (To Be Implemented 🔴)](#quiz-apis-to-be-implemented-)
9. [Stamp/Passport APIs (To Be Implemented 🔴)](#stamppassport-apis-to-be-implemented-)
10. [Fun Facts APIs (To Be Implemented 🔴)](#fun-facts-apis-to-be-implemented-)
11. [Content APIs (To Be Implemented 🔴)](#content-apis-to-be-implemented-)
12. [Priority Order](#priority-order)

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
- Countries list
- Topics per country
- Lessons content
- Quiz questions
- Stamps/achievements
- User progress

### API Base URL
```
Production: https://api.meowtimap.smoltako.space
Development: http://localhost:3000
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

## Country APIs (To Be Implemented 🔴)

> **Note**: Need to create a new `Country` model in MongoDB or seed country data.

### `GET /api/countries`
Get all countries with user's progress (if authenticated).

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
      "totalTopics": 8,
      "progress": 78,
      "unlockedTopics": 5,
      "isUnlocked": true
    },
    {
      "id": "country_id",
      "name": "China",
      "slug": "china",
      "flag": "🇨🇳",
      "coordinates": [104.1954, 35.8617],
      "description": "Ancient civilization...",
      "funFact": "The Great Wall is over 13,000 miles!",
      "totalTopics": 8,
      "progress": 0,
      "unlockedTopics": 0,
      "isUnlocked": false
    }
  ]
}
```

### `GET /api/countries/:slug`
Get single country with topics list.

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
    "funFact": "Japan has more than 6,800 islands!",
    "totalTopics": 8,
    "progress": 78,
    "unlockedTopics": 5,
    "isUnlocked": true,
    "topics": [
      {
        "id": "topic_id",
        "name": "Sushi Culture",
        "slug": "sushi-culture",
        "icon": "🍣",
        "description": "Discover the art...",
        "isUnlocked": true
      }
    ]
  }
}
```

---

## Topic APIs (To Be Implemented 🔴)

> **Note**: Need to create a new `Topic` model in MongoDB or embed in Country.

### `GET /api/countries/:countrySlug/topics`
Get all topics for a country.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "topic_id",
      "countrySlug": "japan",
      "name": "Sushi Culture",
      "slug": "sushi-culture",
      "icon": "🍣",
      "description": "Discover the art and history...",
      "isUnlocked": true
    },
    {
      "id": "topic_id",
      "countrySlug": "japan",
      "name": "Mount Fuji",
      "slug": "fuji",
      "icon": "🗻",
      "description": "Sacred mountain...",
      "isUnlocked": false
    }
  ]
}
```

### `POST /api/countries/:countrySlug/topics/:topicSlug/unlock`
Unlock a topic for the user (after completing prerequisite).

**Response (200):**
```json
{
  "success": true,
  "message": "Topic unlocked successfully",
  "data": {
    "topicSlug": "fuji",
    "unlockedAt": "2024-11-20T10:00:00Z"
  }
}
```

---

## Lesson APIs (To Be Implemented 🔴)

> **Note**: Need to create a new `Lesson` model in MongoDB.

### `GET /api/countries/:countrySlug/topics/:topicSlug/lesson`
Get lesson content for a topic.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "lesson_id",
    "countrySlug": "japan",
    "topicSlug": "sushi-culture",
    "title": "The Art of Sushi: From Edo to Modern Mastery",
    "sections": [
      {
        "title": "Origins of Sushi",
        "content": "Sushi's journey began over 1,000 years ago...",
        "image": "https://images.unsplash.com/..."
      },
      {
        "title": "Types of Sushi",
        "content": "Nigiri features hand-pressed rice...",
        "image": "https://images.unsplash.com/..."
      }
    ],
    "quiz": {
      "totalQuestions": 4,
      "passingScore": 3
    }
  }
}
```

### `POST /api/countries/:countrySlug/topics/:topicSlug/lesson/complete`
Mark lesson as read (progress tracking).

**Response (200):**
```json
{
  "success": true,
  "message": "Lesson progress saved"
}
```

---

## Quiz APIs (To Be Implemented 🔴)

### `GET /api/quizzes`
Get all quizzes (admin/listing).

**Query Parameters:**
- `country`: Filter by country name
- `difficulty`: Filter by difficulty (Easy, Medium, Hard)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "quiz_id",
      "country": "Malaysia",
      "quiz_title": "Kuala Lumpur Landmarks",
      "difficulty": "Easy",
      "description": "A quick test on famous sites...",
      "questionCount": 10
    }
  ]
}
```

### `GET /api/quizzes/:quizId`
Get single quiz with questions.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "quiz_id",
    "country": "Malaysia",
    "quiz_title": "Kuala Lumpur Landmarks",
    "difficulty": "Easy",
    "description": "A quick test...",
    "questions": [
      {
        "id": 1,
        "text": "What is the name of the iconic twin skyscrapers?",
        "options": {
          "A": "Menara Kuala Lumpur",
          "B": "Petronas Twin Towers",
          "C": "Exchange 106",
          "D": "The St. Regis KL"
        }
      }
    ]
  }
}
```

> **Note**: `correctAnswer` should NOT be sent to frontend on GET. Only validate on submit.

### `GET /api/countries/:countrySlug/quiz`
Get quiz for a specific country (for country page quiz tab).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "quiz_id",
    "country": "Japan",
    "quiz_title": "Japan Knowledge Quiz",
    "difficulty": "Medium",
    "totalQuestions": 10,
    "userHighestScore": 8,
    "questions": [
      {
        "id": 1,
        "text": "What is the capital of Japan?",
        "options": {
          "A": "Osaka",
          "B": "Kyoto",
          "C": "Tokyo",
          "D": "Hiroshima"
        }
      }
    ]
  }
}
```

### `POST /api/quizzes/:quizId/submit`
Submit quiz answers and get results.

**Request Body:**
```json
{
  "answers": [
    { "questionId": 1, "answer": "B" },
    { "questionId": 2, "answer": "C" },
    { "questionId": 3, "answer": "A" }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "score": 8,
    "totalQuestions": 10,
    "passed": true,
    "correctAnswers": [
      { "questionId": 1, "correctAnswer": "B", "userAnswer": "B", "isCorrect": true },
      { "questionId": 2, "correctAnswer": "C", "userAnswer": "C", "isCorrect": true }
    ],
    "stampEarned": {
      "id": "stamp_id",
      "countrySlug": "japan",
      "topicSlug": "sushi-culture",
      "earnedAt": "2024-11-20T14:30:00Z"
    }
  }
}
```

### `GET /api/countries/:countrySlug/topics/:topicSlug/quiz`
Get quiz associated with a specific lesson/topic.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question": "What does 'omakase' literally mean?",
        "options": ["Fresh fish", "I'll leave it up to you", "Master chef", "Rice ball"]
      }
    ],
    "totalQuestions": 4,
    "passingScore": 3
  }
}
```

### `POST /api/countries/:countrySlug/topics/:topicSlug/quiz/submit`
Submit lesson quiz answers.

**Request Body:**
```json
{
  "answers": [1, 2, 1, 2]
}
```

> Note: answers are 0-indexed matching `correctAnswer` in mock data

**Response (200):**
```json
{
  "success": true,
  "data": {
    "score": 4,
    "totalQuestions": 4,
    "passed": true,
    "stampEarned": {
      "id": "stamp_id",
      "countrySlug": "japan",
      "topicSlug": "sushi-culture",
      "stampImage": "/stamp/japan.png",
      "earnedAt": "2024-11-20T14:30:00Z"
    }
  }
}
```

---

## Stamp/Passport APIs (To Be Implemented 🔴)

> **Note**: Need to create a new `Stamp` model in MongoDB.

### `GET /api/stamps`
Get all stamps earned by current user (for passport page).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalStamps": 12,
    "maxStamps": 48,
    "stamps": [
      {
        "id": "stamp_id",
        "countrySlug": "japan",
        "topicSlug": "sushi-culture",
        "countryName": "Japan",
        "topicName": "Sushi Culture",
        "icon": "🍣",
        "stampImage": "/stamp/japan.png",
        "earnedAt": "2024-11-15T10:30:00Z",
        "isVisible": true
      },
      {
        "id": "stamp_id",
        "countrySlug": "south-korea",
        "topicSlug": "k-pop-history",
        "countryName": "South Korea",
        "topicName": "K-Pop History",
        "icon": "🎤",
        "stampImage": "/stamp/korea.png",
        "earnedAt": "2024-11-20T14:30:00Z",
        "isVisible": true
      }
    ]
  }
}
```

### `POST /api/stamps/claim`
Claim a stamp after completing a quiz (called after quiz submit).

**Request Body:**
```json
{
  "countrySlug": "japan",
  "topicSlug": "sushi-culture"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stamp": {
      "id": "stamp_id",
      "countrySlug": "japan",
      "topicSlug": "sushi-culture",
      "countryName": "Japan",
      "topicName": "Sushi Culture",
      "stampImage": "/stamp/japan.png",
      "earnedAt": "2024-11-20T14:30:00Z"
    },
    "newTotalStamps": 13
  }
}
```

---

## Fun Facts APIs (To Be Implemented 🔴)

Uses existing `FunFact` model.

### `GET /api/funfacts`
Get all fun facts.

**Query Parameters:**
- `country`: Filter by country name

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "funfact_id",
      "country": "Malaysia",
      "funFacts": [
        "Malaysia has the world's oldest tropical rainforest at 130 million years!",
        "The Petronas Twin Towers were the tallest buildings in the world from 1998-2004."
      ]
    }
  ]
}
```

### `GET /api/countries/:countrySlug/funfacts`
Get fun facts for a specific country.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "country": "Malaysia",
    "funFacts": [
      "Malaysia has the world's oldest tropical rainforest at 130 million years!",
      "The Petronas Twin Towers were the tallest buildings in the world from 1998-2004."
    ]
  }
}
```

---

## Content APIs (To Be Implemented 🔴)

> **Note**: Need to create a new `Content` model for festivals, food, and fun fact cards.

### `GET /api/countries/:countrySlug/content`
Get all content for a country (festivals, food, funfacts for cards).

**Query Parameters:**
- `type`: Filter by type (festival, food, funfact)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "content_id",
      "countrySlug": "japan",
      "type": "festival",
      "title": "Hanami (Cherry Blossom Festival)",
      "content": "Hanami is the beloved Japanese tradition...",
      "image": "https://images.unsplash.com/..."
    },
    {
      "id": "content_id",
      "countrySlug": "japan",
      "type": "food",
      "title": "Ramen",
      "content": "Japanese ramen features Chinese-style wheat noodles...",
      "image": "https://images.unsplash.com/..."
    }
  ]
}
```

---

## Priority Order

### Phase 1 - Core Features (HIGH PRIORITY)
1. ✅ `GET /auth/google` - Already done
2. ✅ `GET /auth/google/callback` - Already done
3. ✅ `GET /auth/user` - Already done
4. ✅ `GET /auth/logout` - Already done
5. 🔴 `GET /api/countries` - List all countries
6. 🔴 `GET /api/countries/:slug` - Single country with topics

### Phase 2 - Learning Features (MEDIUM PRIORITY)
7. 🔴 `GET /api/countries/:countrySlug/topics` - Topics list
8. 🔴 `GET /api/countries/:countrySlug/topics/:topicSlug/lesson` - Lesson content
9. 🔴 `GET /api/countries/:countrySlug/topics/:topicSlug/quiz` - Lesson quiz
10. 🔴 `POST /api/countries/:countrySlug/topics/:topicSlug/quiz/submit` - Submit quiz

### Phase 3 - Gamification (MEDIUM PRIORITY)
11. 🔴 `GET /api/stamps` - User's stamps
12. 🔴 `POST /api/stamps/claim` - Claim stamp
13. 🔴 `GET /api/users/me/progress` - User progress

### Phase 4 - Content & Extras (LOW PRIORITY)
14. 🔴 `GET /api/countries/:countrySlug/content` - Country content cards
15. 🔴 `GET /api/countries/:countrySlug/quiz` - Country quiz (quiz tab)
16. 🔴 `GET /api/countries/:countrySlug/funfacts` - Fun facts
17. 🔴 `PATCH /api/users/me/profile` - Update profile

---

## New Models Needed

Based on the frontend requirements, the following new MongoDB models need to be created:

### 1. Country Model (NEW)
```javascript
const countrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  flag: { type: String, required: true }, // emoji or image path
  coordinates: { type: [Number], required: true }, // [longitude, latitude]
  description: { type: String },
  funFact: { type: String },
  totalTopics: { type: Number, default: 8 },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});
```

### 2. Topic Model (NEW)
```javascript
const topicSchema = new mongoose.Schema({
  countrySlug: { type: String, required: true, index: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  icon: { type: String, required: true }, // emoji
  description: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});
topicSchema.index({ countrySlug: 1, slug: 1 }, { unique: true });
```

### 3. Lesson Model (NEW)
```javascript
const lessonSchema = new mongoose.Schema({
  countrySlug: { type: String, required: true },
  topicSlug: { type: String, required: true },
  title: { type: String, required: true },
  sections: [{
    title: String,
    content: String,
    image: String
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number // 0-indexed
  }]
});
lessonSchema.index({ countrySlug: 1, topicSlug: 1 }, { unique: true });
```

### 4. Stamp Model (NEW)
```javascript
const stampSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  countrySlug: { type: String, required: true },
  topicSlug: { type: String, required: true },
  countryName: { type: String, required: true },
  topicName: { type: String, required: true },
  icon: { type: String },
  stampImage: { type: String }, // path to stamp image
  earnedAt: { type: Date, default: Date.now },
  isVisible: { type: Boolean, default: true }
});
stampSchema.index({ userId: 1, countrySlug: 1, topicSlug: 1 }, { unique: true });
```

### 5. Content Model (NEW)
```javascript
const contentSchema = new mongoose.Schema({
  countrySlug: { type: String, required: true, index: true },
  type: { type: String, enum: ['festival', 'food', 'funfact'], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  displayOrder: { type: Number, default: 0 }
});
```

### 6. UserProgress Model (NEW - or embed in User)
```javascript
const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  countrySlug: { type: String, required: true },
  progress: { type: Number, default: 0 }, // 0-100
  unlockedTopics: [String], // array of topic slugs
  updatedAt: { type: Date, default: Date.now }
});
userProgressSchema.index({ userId: 1, countrySlug: 1 }, { unique: true });
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
- `topics` array → `GET /api/countries/:slug/topics`
- `lessons` object → `GET /api/countries/:countrySlug/topics/:topicSlug/lesson`
- `stamps` array → `GET /api/stamps`
- `countryContent` array → `GET /api/countries/:slug/content`
- `countryQuizzes` array → `GET /api/countries/:slug/quiz`

---

## Summary

| Category | Endpoints Needed | Priority |
|----------|-----------------|----------|
| Auth | 4 (all done ✅) | Done |
| Users | 3 | High |
| Countries | 2 | High |
| Topics | 2 | High |
| Lessons | 2 | Medium |
| Quizzes | 5 | Medium |
| Stamps | 2 | Medium |
| Fun Facts | 2 | Low |
| Content | 1 | Low |

**Total Endpoints to Implement: ~19**
