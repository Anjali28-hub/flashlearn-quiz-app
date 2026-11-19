export type NavSection = 'home' | 'flashcards' | 'study' | 'quiz';

export interface Flashcard {
  id: string;
  deckId: string;
  deckName: string;
  topic: string;
  question: string;
  answer: string;
  hint: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
}

export interface StudyDeck {
  id: string;
  title: string;
  category: string;
  description: string;
  cardCount: number;
  masteredCount: number;
  lastStudied: string;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FlashcardFormValues {
  question: string;
  answer: string;
  deckId: string;
  topic: string;
  hint: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export interface StoredProgress {
  viewedCardIds: string[];
  studiedCardIds: string[];
  lastUpdated: string;
}

export interface StoredQuizScore {
  id: string;
  deckId: string;
  deckName: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  completedAt: string;
}
