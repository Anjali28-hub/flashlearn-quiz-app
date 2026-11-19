import { Flashcard } from '../types/flashcard';

export interface GeneratedQuizQuestion {
  id: string;
  sourceCardId: string;
  deckName: string;
  topic: string;
  difficulty: Flashcard['difficulty'];
  prompt: string;
  options: string[];
  correctIndex: number;
  correctAnswer: string;
}

const FALLBACK_DISTRACTORS = [
  'A passive review process that relies solely on repeated highlighting without retrieval.',
  'A temporary storage buffer that discards all incoming information within seconds.',
  'An automated compression layer that strips metadata before rendering content.',
  'A fixed linear sequence that prevents revisiting earlier concepts during practice.',
];

/**
 * Returns a new Fisher-Yates shuffled copy of the input array.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a shuffled multiple-choice quiz from saved flashcards.
 * Uses answers from other saved flashcards as distractors and guarantees
 * the correct answer is always included among the 4 shuffled options.
 */
export function generateQuizFromFlashcards(
  targetCards: Flashcard[],
  allFlashcards: Flashcard[]
): GeneratedQuizQuestion[] {
  if (targetCards.length === 0) return [];

  const shuffledQuestions = shuffleArray(targetCards);

  // Build a pool of unique normalized answers from all saved flashcards
  const answerPool = allFlashcards
    .map((card) => card.answer.trim())
    .filter((ans) => ans.length > 0);

  return shuffledQuestions.map((card, index) => {
    const correctAnswer = card.answer.trim();
    const normalizedCorrect = correctAnswer.toLowerCase();

    // Gather unique distractor answers from other saved flashcards
    const seen = new Set<string>([normalizedCorrect]);
    const uniqueDistractors: string[] = [];

    for (const candidate of shuffleArray(answerPool)) {
      const normalized = candidate.toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        uniqueDistractors.push(candidate);
        if (uniqueDistractors.length === 3) break;
      }
    }

    // If fewer than 3 unique distractors exist across all saved flashcards,
    // top up with neutral study fallback options so every question always has 4 choices.
    if (uniqueDistractors.length < 3) {
      for (const fallback of shuffleArray(FALLBACK_DISTRACTORS)) {
        const normalized = fallback.toLowerCase();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          uniqueDistractors.push(fallback);
          if (uniqueDistractors.length === 3) break;
        }
      }
    }

    const options = shuffleArray([correctAnswer, ...uniqueDistractors.slice(0, 3)]);
    const correctIndex = options.indexOf(correctAnswer);

    return {
      id: `quiz-q-${card.id}-${index}-${Date.now()}`,
      sourceCardId: card.id,
      deckName: card.deckName,
      topic: card.topic,
      difficulty: card.difficulty,
      prompt: card.question,
      options,
      correctIndex,
      correctAnswer,
    };
  });
}
