import { SAMPLE_FLASHCARDS } from '../data/sampleCards';
import {
  Flashcard,
  StoredProgress,
  StoredQuizScore,
} from '../types/flashcard';

export const STORAGE_KEYS = {
  CARDS: 'flashlearn_cards',
  PROGRESS: 'flashlearn_progress',
  SCORES: 'flashlearn_scores',
  THEME: 'flashlearn_theme',
} as const;

export type ThemeMode = 'light' | 'dark';

export interface StorageWriteResult {
  ok: boolean;
  error?: string;
}

export interface LoadedFlashcardsResult {
  cards: Flashcard[];
  wasInitializedFromSamples: boolean;
  hadRecoveryError: boolean;
}

const VALID_DIFFICULTIES = new Set<Flashcard['difficulty']>([
  'Foundational',
  'Intermediate',
  'Advanced',
]);

function isStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function isValidFlashcard(item: unknown): item is Flashcard {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.question === 'string' &&
    typeof candidate.answer === 'string' &&
    typeof candidate.deckId === 'string' &&
    typeof candidate.deckName === 'string' &&
    typeof candidate.topic === 'string' &&
    typeof candidate.hint === 'string' &&
    typeof candidate.difficulty === 'string' &&
    VALID_DIFFICULTIES.has(candidate.difficulty as Flashcard['difficulty'])
  );
}

function isValidQuizScore(item: unknown): item is StoredQuizScore {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.deckId === 'string' &&
    typeof candidate.deckName === 'string' &&
    typeof candidate.totalQuestions === 'number' &&
    Number.isFinite(candidate.totalQuestions) &&
    typeof candidate.correctAnswers === 'number' &&
    Number.isFinite(candidate.correctAnswers) &&
    typeof candidate.incorrectAnswers === 'number' &&
    Number.isFinite(candidate.incorrectAnswers) &&
    typeof candidate.percentage === 'number' &&
    Number.isFinite(candidate.percentage) &&
    typeof candidate.completedAt === 'string'
  );
}

/**
 * Loads saved flashcards from LocalStorage using JSON.parse().
 * Seeds sample flashcards ONLY when no saved data exists yet.
 * Preserves an intentionally empty array ([]) if the user deleted all cards.
 */
export function loadFlashcards(): LoadedFlashcardsResult {
  if (!isStorageAvailable()) {
    return {
      cards: SAMPLE_FLASHCARDS,
      wasInitializedFromSamples: true,
      hadRecoveryError: false,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.CARDS);

    // First-time visit: no saved key exists yet -> seed sample flashcards once
    if (raw === null) {
      saveFlashcards(SAMPLE_FLASHCARDS);
      return {
        cards: SAMPLE_FLASHCARDS,
        wasInitializedFromSamples: true,
        hadRecoveryError: false,
      };
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error('Stored flashcards payload is not an array.');
    }

    const validCards = parsed.filter(isValidFlashcard);

    // If user intentionally saved an empty list, preserve it without overwriting
    if (parsed.length === 0) {
      return {
        cards: [],
        wasInitializedFromSamples: false,
        hadRecoveryError: false,
      };
    }

    // If array had entries but none were valid flashcards, recover with samples
    if (validCards.length === 0) {
      throw new Error('Stored flashcards contained no valid entries.');
    }

    return {
      cards: validCards,
      wasInitializedFromSamples: false,
      hadRecoveryError: validCards.length !== parsed.length,
    };
  } catch (error) {
    console.warn('FlashLearn: Unable to parse flashlearn_cards, falling back to defaults.', error);
    return {
      cards: SAMPLE_FLASHCARDS,
      wasInitializedFromSamples: true,
      hadRecoveryError: true,
    };
  }
}

/**
 * Saves flashcards to LocalStorage using JSON.stringify().
 */
export function saveFlashcards(cards: Flashcard[]): StorageWriteResult {
  if (!isStorageAvailable()) {
    return { ok: false, error: 'LocalStorage is unavailable in this browser.' };
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    return { ok: true };
  } catch (error) {
    console.error('FlashLearn: Failed to save flashcards to LocalStorage.', error);
    return {
      ok: false,
      error: 'Could not save flashcards to browser storage. Check available storage space.',
    };
  }
}

/**
 * Loads saved study progress (viewed and mastered card IDs) from LocalStorage.
 */
export function loadProgress(cards: Flashcard[]): {
  viewedCardIds: Set<string>;
  studiedCardIds: Set<string>;
  hadRecoveryError: boolean;
} {
  const validCardIds = new Set(cards.map((c) => c.id));
  const defaultViewed = new Set<string>(cards.length > 0 ? [cards[0].id] : []);

  if (!isStorageAvailable()) {
    return {
      viewedCardIds: defaultViewed,
      studiedCardIds: new Set<string>(),
      hadRecoveryError: false,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PROGRESS);

    if (raw === null) {
      const initialProgress: StoredProgress = {
        viewedCardIds: Array.from(defaultViewed),
        studiedCardIds: [],
        lastUpdated: new Date().toISOString(),
      };
      saveProgress(defaultViewed, new Set<string>());
      return {
        viewedCardIds: new Set(initialProgress.viewedCardIds),
        studiedCardIds: new Set(initialProgress.studiedCardIds),
        hadRecoveryError: false,
      };
    }

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Stored progress payload is not a valid object.');
    }

    const record = parsed as Record<string, unknown>;
    const rawViewed = Array.isArray(record.viewedCardIds)
      ? record.viewedCardIds.filter(
          (id): id is string => typeof id === 'string' && validCardIds.has(id)
        )
      : [];
    const rawStudied = Array.isArray(record.studiedCardIds)
      ? record.studiedCardIds.filter(
          (id): id is string => typeof id === 'string' && validCardIds.has(id)
        )
      : [];

    return {
      viewedCardIds: new Set(rawViewed),
      studiedCardIds: new Set(rawStudied),
      hadRecoveryError: false,
    };
  } catch (error) {
    console.warn('FlashLearn: Unable to parse flashlearn_progress, resetting progress.', error);
    return {
      viewedCardIds: defaultViewed,
      studiedCardIds: new Set<string>(),
      hadRecoveryError: true,
    };
  }
}

/**
 * Saves study progress to LocalStorage using JSON.stringify().
 */
export function saveProgress(
  viewedCardIds: Set<string>,
  studiedCardIds: Set<string>
): StorageWriteResult {
  if (!isStorageAvailable()) {
    return { ok: false, error: 'LocalStorage is unavailable in this browser.' };
  }

  try {
    const payload: StoredProgress = {
      viewedCardIds: Array.from(viewedCardIds),
      studiedCardIds: Array.from(studiedCardIds),
      lastUpdated: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(payload));
    return { ok: true };
  } catch (error) {
    console.error('FlashLearn: Failed to save progress to LocalStorage.', error);
    return {
      ok: false,
      error: 'Could not save study progress to browser storage.',
    };
  }
}

/**
 * Loads saved quiz score history from LocalStorage using JSON.parse().
 */
export function loadQuizScores(): {
  scores: StoredQuizScore[];
  hadRecoveryError: boolean;
} {
  if (!isStorageAvailable()) {
    return { scores: [], hadRecoveryError: false };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SCORES);

    if (raw === null) {
      return { scores: [], hadRecoveryError: false };
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Stored quiz scores payload is not an array.');
    }

    const validScores = parsed.filter(isValidQuizScore);
    return {
      scores: validScores,
      hadRecoveryError: validScores.length !== parsed.length,
    };
  } catch (error) {
    console.warn('FlashLearn: Unable to parse flashlearn_scores, resetting scores.', error);
    return { scores: [], hadRecoveryError: true };
  }
}

/**
 * Saves quiz score history to LocalStorage using JSON.stringify().
 */
export function saveQuizScores(scores: StoredQuizScore[]): StorageWriteResult {
  if (!isStorageAvailable()) {
    return { ok: false, error: 'LocalStorage is unavailable in this browser.' };
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
    return { ok: true };
  } catch (error) {
    console.error('FlashLearn: Failed to save quiz scores to LocalStorage.', error);
    return {
      ok: false,
      error: 'Could not save quiz score to browser storage.',
    };
  }
}

/**
 * Resets study progress and quiz scores in LocalStorage while preserving saved flashcards.
 */
export function resetStoredProgressAndScores(): StorageWriteResult {
  const progressResult = saveProgress(new Set<string>(), new Set<string>());
  const scoresResult = saveQuizScores([]);

  if (!progressResult.ok) return progressResult;
  if (!scoresResult.ok) return scoresResult;
  return { ok: true };
}

/**
 * Loads saved light/dark theme preference from LocalStorage.
 */
export function loadTheme(): ThemeMode {
  if (!isStorageAvailable()) return 'light';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'light';
  } catch {
    return 'light';
  }
}

/**
 * Persists light/dark theme preference to LocalStorage.
 */
export function saveTheme(theme: ThemeMode): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.warn('FlashLearn: Unable to persist theme preference.', error);
  }
}
