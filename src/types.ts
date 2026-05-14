import { Models } from 'appwrite';

export interface UserProfile extends Models.Document {
  name: string;
  surname: string;
  phone: string;
  branch: string;
  ageCategory: string;
  role: 'student' | 'admin';
}

export interface Quiz extends Models.Document {
  title: string;
  description: string;
  subject: string;
  category: string;
  imageUrl?: string;
}

export interface Question extends Models.Document {
  quizId: string;
  text: string;
  imageUrl?: string;
  options: string; 
  correctAnswer: number;
}

export interface QuizResult extends Models.Document {
  userId: string;
  userName: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  answers: string; // Stored as JSON string
  completedAt: string;
}

// Input Types (Omit Appwrite internal fields)
export type QuizInput = Omit<Quiz, keyof Models.Document>;
export type QuestionInput = Omit<Question, keyof Models.Document>;
export type QuizResultInput = Omit<QuizResult, keyof Models.Document>;
export type UserProfileInput = Omit<UserProfile, keyof Models.Document>;


