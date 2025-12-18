export interface User {
  name: string;
  email: string;
  image: string;
  totalStamps: number;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  flag: string;
  coordinates: [number, number];
  progress: number;
  isUnlocked: boolean;
  totalTopics: number;
  unlockedTopics: number;
  description: string;
  funFact: string;
}

export interface Topic {
  id: string;
  countrySlug: string;
  name: string;
  slug: string;
  icon: string;
  isUnlocked: boolean;
  description: string;
}

export interface Stamp {
  id: string;
  countrySlug: string;
  topicSlug: string;
  countryName: string;
  topicName: string;
  date: string;
  icon: string;
}

export interface Lesson {
  id: string;
  countrySlug: string;
  topicSlug: string;
  title: string;
  sections: LessonSection[];
  quiz: QuizQuestion[];
}

export interface LessonSection {
  title: string;
  content: string;
  image?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface ContentItem {
  id: string;
  countrySlug: string;
  type: 'festival' | 'food' | 'funfact';
  title: string;
  content: string;
  image: string;
}

export interface QuizData {
  countrySlug: string;
  highestScore: number;
  totalQuestions: number;
  questions: QuizQuestion[];
}
