# Meowtimap Backend API Documentation

## Project Overview

**Meowtimap** is an interactive educational platform that allows users to explore Asian cultures, complete lessons, and collect virtual "passport stamps" as achievements. This document provides the complete API specification for backend developers.

---

## Table of Contents

1. [Tech Stack Recommendations](#tech-stack-recommendations)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Data Models](#data-models)
6. [Frontend Integration Guide](#frontend-integration-guide)

---

## Tech Stack Recommendations

### Recommended Stack
- **Runtime**: Node.js with Express.js / NestJS OR Python with FastAPI
- **Database**: PostgreSQL (relational) + Redis (caching)
- **Authentication**: Google OAuth 2.0 only (no email/password)
- **Hosting**: Vercel / Railway / AWS / Azure

> **Note**: Profile pictures are fetched directly from Google account. No file storage needed for avatars.

### Alternative Stack
- **Supabase** (PostgreSQL + Auth + Storage + Real-time) - Recommended for faster development
- **Firebase** (Firestore + Auth + Storage)

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE NOT NULL,      -- Google OAuth sub/id
  email VARCHAR(255) UNIQUE NOT NULL,           -- From Google
  nickname VARCHAR(255) NOT NULL,               -- Editable by user
  google_name VARCHAR(255) NOT NULL,            -- Original name from Google (read-only)
  google_image_url TEXT,                        -- Profile picture from Google (read-only)
  total_stamps INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Countries Table
```sql
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  flag VARCHAR(10) NOT NULL, -- emoji flag
  coordinates POINT NOT NULL, -- [longitude, latitude]
  description TEXT,
  fun_fact TEXT,
  total_topics INTEGER DEFAULT 8,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Topics Table
```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  icon VARCHAR(10) NOT NULL, -- emoji icon
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(country_id, slug)
);
```

### Lessons Table
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Lesson Sections Table
```sql
CREATE TABLE lesson_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0
);
```

### Quiz Questions Table
```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- ["option1", "option2", "option3", "option4"]
  correct_answer INTEGER NOT NULL, -- 0-indexed
  display_order INTEGER DEFAULT 0
);
```

### User Progress Table
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0, -- 0-100
  unlocked_topics INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, country_id)
);
```

### User Topic Unlocks Table
```sql
CREATE TABLE user_topic_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_id)
);
```

### Stamps Table (User Achievements)
```sql
CREATE TABLE stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_id)
);
```

### Quiz Attempts Table (Optional - for analytics)
```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- number of correct answers
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Base URL
```
Production: https://api1.meowtimedia-test.smoltako.space
Development: http://localhost:3001/api/v1
```

---

### Authentication Endpoints

> **Important**: This application uses **Google OAuth only**. No email/password registration or login.

#### GET `/auth/google`
Redirect to Google OAuth consent screen.

**Response:** Redirects to Google OAuth URL

#### GET `/auth/google/callback`
Google OAuth callback endpoint. Handles the OAuth flow and creates/logs in user.

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: CSRF state token (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "nickname": "John Doe",
      "googleName": "John Doe",
      "image": "https://lh3.googleusercontent.com/...",
      "totalStamps": 12
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "isNewUser": false
  }
}
```

#### POST `/auth/google/token`
Alternative: Exchange Google ID token directly (for mobile/SPA).

**Request Body:**
```json
{
  "idToken": "google_id_token_from_frontend"
}
```

**Response (200):** Same as callback response above

#### POST `/auth/refresh`
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

#### POST `/auth/logout`
Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### User Endpoints

#### GET `/users/me`
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@gmail.com",
    "nickname": "CatLover123",
    "googleName": "John Doe",
    "image": "https://lh3.googleusercontent.com/a/...",
    "totalStamps": 12,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

> **Note**: The `image` field always returns the Google profile picture URL. It cannot be changed by the user.

#### PATCH `/users/me`
Update current user nickname.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "nickname": "NewNickname123"
}
```

**Validation Rules:**
- `nickname`: 2-30 characters, alphanumeric and underscores only

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@gmail.com",
    "nickname": "NewNickname123",
    "googleName": "John Doe",
    "image": "https://lh3.googleusercontent.com/a/...",
    "totalStamps": 12
  }
}
```

> **Note**: Users can only update their `nickname`. Email and profile picture are managed by Google.

---

### Countries Endpoints

#### GET `/countries`
Get all countries with user progress.

**Headers:** `Authorization: Bearer <token>` (optional - returns base data if not authenticated)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Japan",
      "slug": "japan",
      "flag": "🇯🇵",
      "coordinates": [138.2529, 36.2048],
      "description": "Land of the Rising Sun...",
      "funFact": "Japan has more than 6,800 islands!",
      "totalTopics": 8,
      "progress": 78,
      "unlockedTopics": 5,
      "isUnlocked": true
    },
    {
      "id": "uuid",
      "name": "South Korea",
      "slug": "south-korea",
      "flag": "🇰🇷",
      "coordinates": [127.7669, 35.9078],
      "description": "Dynamic nation famous for K-pop...",
      "funFact": "South Korea has the fastest internet!",
      "totalTopics": 8,
      "progress": 65,
      "unlockedTopics": 4,
      "isUnlocked": true
    }
    // ... more countries
  ]
}
```

#### GET `/countries/:slug`
Get single country details with topics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Japan",
    "slug": "japan",
    "flag": "🇯🇵",
    "coordinates": [138.2529, 36.2048],
    "description": "Land of the Rising Sun...",
    "funFact": "Japan has more than 6,800 islands!",
    "totalTopics": 8,
    "progress": 78,
    "unlockedTopics": 5,
    "isUnlocked": true,
    "topics": [
      {
        "id": "uuid",
        "name": "Sushi Culture",
        "slug": "sushi-culture",
        "icon": "🍣",
        "description": "Discover the art and history...",
        "isUnlocked": true
      },
      {
        "id": "uuid",
        "name": "Mount Fuji",
        "slug": "fuji",
        "icon": "🗻",
        "description": "Sacred mountain and national symbol",
        "isUnlocked": false
      }
      // ... more topics
    ]
  }
}
```

---

### Topics Endpoints

#### GET `/countries/:countrySlug/topics`
Get all topics for a country.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "countrySlug": "japan",
      "name": "Sushi Culture",
      "slug": "sushi-culture",
      "icon": "🍣",
      "description": "Discover the art and history...",
      "isUnlocked": true
    }
    // ... more topics
  ]
}
```

#### GET `/countries/:countrySlug/topics/:topicSlug`
Get single topic with lesson.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "countrySlug": "japan",
    "name": "Sushi Culture",
    "slug": "sushi-culture",
    "icon": "🍣",
    "description": "Discover the art and history...",
    "isUnlocked": true,
    "lesson": {
      "id": "uuid",
      "title": "The Art of Sushi: From Edo to Modern Mastery",
      "sections": [
        {
          "title": "Origins of Sushi",
          "content": "Sushi's journey began over 1,000 years ago...",
          "image": "https://images.unsplash.com/..."
        }
        // ... more sections
      ],
      "quiz": [
        {
          "id": "uuid",
          "question": "What does 'omakase' literally mean?",
          "options": ["Fresh fish", "I'll leave it up to you", "Master chef", "Rice ball"],
          "correctAnswer": 1
        }
        // ... more questions
      ]
    }
  }
}
```

---

### Lessons Endpoints

#### GET `/lessons/:countrySlug/:topicSlug`
Get lesson content (alias for topic with lesson).

**Headers:** `Authorization: Bearer <token>`

**Response:** Same as GET `/countries/:countrySlug/topics/:topicSlug`

#### POST `/lessons/:countrySlug/:topicSlug/complete`
Mark lesson as complete and award stamp.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quizScore": 4,
  "totalQuestions": 4
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "passed": true,
    "stampAwarded": true,
    "stamp": {
      "id": "uuid",
      "countrySlug": "japan",
      "topicSlug": "sushi-culture",
      "countryName": "Japan",
      "topicName": "Sushi Culture",
      "icon": "🍣",
      "earnedAt": "2024-11-27T15:30:00Z"
    },
    "newProgress": {
      "countryProgress": 85,
      "totalStamps": 13,
      "unlockedTopics": 6,
      "newTopicsUnlocked": ["language"] // newly unlocked topic slugs
    }
  }
}
```

**Response (200) - Quiz Failed:**
```json
{
  "success": true,
  "data": {
    "passed": false,
    "stampAwarded": false,
    "message": "You need at least 75% correct answers to pass. Try again!",
    "score": 2,
    "required": 3
  }
}
```

---

### Stamps Endpoints

#### GET `/stamps`
Get all stamps earned by current user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `countrySlug` (optional): Filter by country

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "countrySlug": "japan",
      "topicSlug": "sushi-culture",
      "countryName": "Japan",
      "topicName": "Sushi Culture",
      "icon": "🍣",
      "earnedAt": "2024-11-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "countrySlug": "japan",
      "topicSlug": "festivals",
      "countryName": "Japan",
      "topicName": "Traditional Festivals",
      "icon": "🎌",
      "earnedAt": "2024-11-18T14:20:00Z"
    }
    // ... more stamps
  ],
  "meta": {
    "total": 12,
    "byCountry": {
      "japan": 2,
      "south-korea": 1,
      "thailand": 1,
      "singapore": 2,
      "india": 2,
      "malaysia": 1,
      "china": 1,
      "vietnam": 1,
      "indonesia": 1
    }
  }
}
```

#### GET `/stamps/:id`
Get single stamp details.

---

### Progress Endpoints

#### GET `/progress`
Get user's overall progress.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalStamps": 12,
    "maxStamps": 96, // 12 countries × 8 topics
    "overallProgress": 12.5,
    "countriesStarted": 9,
    "countriesCompleted": 0,
    "countries": [
      {
        "countrySlug": "japan",
        "countryName": "Japan",
        "flag": "🇯🇵",
        "progress": 78,
        "unlockedTopics": 5,
        "totalTopics": 8,
        "stamps": 5
      }
      // ... more countries
    ]
  }
}
```

#### GET `/progress/:countrySlug`
Get progress for specific country.

---

## Authentication

### JWT Token Structure
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "iat": 1699000000,
  "exp": 1699086400
}
```

### Token Expiration
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

### Protected Routes
All routes except the following require authentication:
- `GET /auth/google` (initiates OAuth flow)
- `GET /auth/google/callback` (OAuth callback)
- `POST /auth/google/token` (token exchange)
- `POST /auth/refresh`
- `GET /countries` (returns limited data without auth)

---

## Data Models

### TypeScript Interfaces (Frontend Reference)

```typescript
// These are the interfaces the frontend expects

interface User {
  id: string;
  email: string;           // From Google (read-only)
  nickname: string;        // Editable by user
  googleName: string;      // Original name from Google (read-only)
  image: string;           // Google profile picture URL (read-only)
  totalStamps: number;
}

interface Country {
  id: string;
  name: string;
  slug: string;
  flag: string; // emoji
  coordinates: [number, number]; // [longitude, latitude]
  progress: number; // 0-100
  isUnlocked: boolean;
  totalTopics: number;
  unlockedTopics: number;
  description: string;
  funFact: string;
}

interface Topic {
  id: string;
  countrySlug: string;
  name: string;
  slug: string;
  icon: string; // emoji
  isUnlocked: boolean;
  description: string;
}

interface Stamp {
  id: string;
  countrySlug: string;
  topicSlug: string;
  countryName: string;
  topicName: string;
  date: string; // ISO date string
  icon: string; // emoji
}

interface Lesson {
  id: string;
  countrySlug: string;
  topicSlug: string;
  title: string;
  sections: LessonSection[];
  quiz: QuizQuestion[];
}

interface LessonSection {
  title: string;
  content: string;
  image?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
}
```

---

## Frontend Integration Guide

### Current Mock Data Location
The frontend currently uses mock data from:
```
lib/mock-data.ts
lib/types.ts
```

### Integration Steps

1. **Create API Client**
```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api1.meowtimedia-test.smoltako.space';

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
```

2. **Replace Mock Imports**
```typescript
// Before (mock data)
import { countries, mockUser, stamps } from '@/lib/mock-data';

// After (API calls)
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const [countries, setCountries] = useState([]);
const [user, setUser] = useState(null);

useEffect(() => {
  api.get('/countries').then(res => setCountries(res.data));
  api.get('/users/me').then(res => setUser(res.data));
}, []);
```

3. **Environment Variables**
```env
# .env.local
NEXT_PUBLIC_API_URL=https://api1.meowtimedia-test.smoltako.space
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Pages to Update

| Page | Current Mock Usage | API Endpoints Needed |
|------|-------------------|---------------------|
| `/` (landing) | - | `GET /auth/google` (login button) |
| `/dashboard` | `countries`, `mockUser`, `stamps` | `GET /countries`, `GET /users/me`, `GET /stamps` |
| `/passport` | `mockUser`, `stamps`, `countries` | `GET /users/me`, `GET /stamps`, `GET /countries` |
| `/profile` | `mockUser` | `GET /users/me`, `PATCH /users/me` (nickname only) |
| `/country/[slug]` | `countries`, `topics` | `GET /countries/:slug` |
| `/learn/[country]/[topic]` | `lessons`, `topics` | `GET /lessons/:country/:topic`, `POST /lessons/:country/:topic/complete` |

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

Recommended limits:
- **General API**: 100 requests per minute
- **Authentication**: 10 requests per minute
- **File Upload**: 5 requests per minute

---

## CORS Configuration

Allow the following origins:
```
https://meowtimap.com
https://www.meowtimap.com
http://localhost:3000 (development)
```

---

## Seed Data

### Initial Countries (12 total)
```
Japan, South Korea, China, Thailand, Vietnam, Indonesia, 
Malaysia, Philippines, Singapore, India, Taiwan, Brunei
```

### Topics per Country (8 each)
Each country has 8 cultural topics covering:
- Food/Cuisine
- Festivals/Celebrations  
- History/Heritage
- Language basics
- Landmarks
- Traditions/Customs
- Arts/Entertainment
- Nature/Geography

### Unlocking Logic
- First 2 topics per country: Unlocked by default
- Remaining topics: Unlock sequentially after completing previous topics
- Country unlocks: All countries unlocked by default (can add premium gating later)

---

## Deployment Checklist

### Backend
- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Set up Redis for caching (optional)
- [ ] Configure S3/R2 for file storage
- [ ] Set up OAuth providers (Google, etc.)
- [ ] Configure CORS
- [ ] Set up rate limiting
- [ ] Deploy to hosting platform
- [ ] Set up SSL certificate
- [ ] Configure domain

### Integration
- [ ] Update frontend `.env` with API URL
- [ ] Test authentication flow
- [ ] Test all CRUD operations
- [ ] Verify file uploads work
- [ ] Test quiz completion flow
- [ ] Verify stamp awarding logic

---

## Contact

For questions about this API specification, contact the frontend team.

**Frontend Repository**: https://github.com/YJ0310/meowtimedia-2-frontend

---

*Document Version: 1.0*
*Last Updated: December 4, 2025*
