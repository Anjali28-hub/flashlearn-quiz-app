import { RotateCcw } from 'lucide-react';
import { StoredQuizScore } from '../types/flashcard';

interface StatsGridProps {
  totalFlashcards: number;
  cardsStudied: number;
  knownCardsCount: number;
  deckCount: number;
  quizScores: StoredQuizScore[];
  onRequestResetProgress?: () => void;
  isLoading?: boolean;
}

export function StatsGrid({
  totalFlashcards,
  cardsStudied,
  knownCardsCount,
  deckCount,
  quizScores,
  onRequestResetProgress,
  isLoading = false,
}: StatsGridProps) {
  const safeStudied = Math.min(cardsStudied, totalFlashcards);
  const progressPercent =
    totalFlashcards > 0 ? Math.round((safeStudied / totalFlashcards) * 100) : 0;

  // Compute real quiz accuracy percentage across all completed quiz sessions
  const totalQuizQuestions = quizScores.reduce(
    (sum, s) => sum + s.totalQuestions,
    0
  );
  const totalQuizCorrect = quizScores.reduce(
    (sum, s) => sum + s.correctAnswers,
    0
  );
  const hasQuizHistory = totalQuizQuestions > 0;
  const quizAccuracyPercent = hasQuizHistory
    ? Math.round((totalQuizCorrect / totalQuizQuestions) * 100)
    : safeStudied > 0
      ? Math.round((knownCardsCount / safeStudied) * 100)
      : 0;

  const hasProgressToReset =
    safeStudied > 0 || knownCardsCount > 0 || quizScores.length > 0;

  if (isLoading) {
    return (
      <section aria-label="Loading study statistics" aria-busy="true">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((slot) => (
            <div
              key={slot}
              className="bg-white dark:bg-[#17122B] rounded-2xl border border-lavender-200/80 dark:border-[#2C244A] p-6 animate-pulse"
            >
              <div className="h-4 w-28 rounded bg-lavender-100 dark:bg-[#261E42]" />
              <div className="mt-4 h-9 w-20 rounded bg-lavender-100 dark:bg-[#261E42]" />
              <div className="mt-3.5 h-3 w-36 rounded bg-lavender-100 dark:bg-[#261E42]" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Study overview statistics" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs sm:text-sm font-medium text-ink-600 dark:text-[#BDB4D6]">
          Learning Overview
        </p>
        {onRequestResetProgress && (
          <button
            type="button"
            onClick={onRequestResetProgress}
            disabled={!hasProgressToReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 dark:text-[#BDB4D6] hover:text-rose-700 dark:hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-50/70 dark:hover:bg-rose-950/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Total Flashcards */}
        <article className="bg-white dark:bg-[#17122B] rounded-2xl border border-lavender-200/80 dark:border-[#2C244A] p-6 shadow-[0_2px_12px_rgba(46,16,101,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 hover:border-lavender-300 dark:hover:border-lavender-500/40 hover:shadow-[0_10px_26px_rgba(109,40,217,0.07)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-all duration-200">
          <p className="text-sm font-medium text-ink-600 dark:text-[#BDB4D6]">
            Total Flashcards
          </p>
          <p className="mt-3 font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-ink-900 dark:text-[#F4F1FF] tabular-nums">
            {totalFlashcards}
          </p>
          <p className="mt-2.5 text-xs text-ink-400 dark:text-[#8E84AE]">
            {totalFlashcards === 0
              ? 'Add your first flashcard to begin'
              : `Across ${deckCount} ${deckCount === 1 ? 'category' : 'categories'}`}
          </p>
        </article>

        {/* Card 2: Cards Studied */}
        <article className="bg-white dark:bg-[#17122B] rounded-2xl border border-lavender-200/80 dark:border-[#2C244A] p-6 shadow-[0_2px_12px_rgba(46,16,101,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 hover:border-lavender-300 dark:hover:border-lavender-500/40 hover:shadow-[0_10px_26px_rgba(109,40,217,0.07)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-all duration-200">
          <p className="text-sm font-medium text-ink-600 dark:text-[#BDB4D6]">
            Cards Studied
          </p>
          <p className="mt-3 font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-ink-900 dark:text-[#F4F1FF] tabular-nums">
            {safeStudied}
          </p>
          <p className="mt-2.5 text-xs text-ink-400 dark:text-[#8E84AE] tabular-nums">
            {totalFlashcards === 0
              ? 'No cards queued for review'
              : `${Math.max(totalFlashcards - safeStudied, 0)} cards remaining · ${knownCardsCount} known`}
          </p>
        </article>

        {/* Card 3: Quiz Accuracy Percentage */}
        <article className="bg-white dark:bg-[#17122B] rounded-2xl border border-lavender-200/80 dark:border-[#2C244A] p-6 shadow-[0_2px_12px_rgba(46,16,101,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 hover:border-lavender-300 dark:hover:border-lavender-500/40 hover:shadow-[0_10px_26px_rgba(109,40,217,0.07)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-all duration-200">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-ink-600 dark:text-[#BDB4D6]">
              Quiz Accuracy
            </p>
            {hasQuizHistory && (
              <span className="font-mono text-xs text-lavender-700 dark:text-lavender-300 tabular-nums">
                {quizScores.length} {quizScores.length === 1 ? 'quiz' : 'quizzes'}
              </span>
            )}
          </div>
          <p className="mt-3 font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-lavender-700 dark:text-lavender-300 tabular-nums">
            {quizAccuracyPercent}%
          </p>
          <p className="mt-2.5 text-xs text-ink-400 dark:text-[#8E84AE] tabular-nums">
            {hasQuizHistory
              ? `${totalQuizCorrect} of ${totalQuizQuestions} quiz answers correct`
              : `${knownCardsCount} correct answers recorded`}
          </p>
        </article>

        {/* Card 4: Study Progress */}
        <article className="bg-white dark:bg-[#17122B] rounded-2xl border border-lavender-200/80 dark:border-[#2C244A] p-6 shadow-[0_2px_12px_rgba(46,16,101,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 hover:border-lavender-300 dark:hover:border-lavender-500/40 hover:shadow-[0_10px_26px_rgba(109,40,217,0.07)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-all duration-200">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-ink-600 dark:text-[#BDB4D6]">
              Study Progress
            </p>
            <span className="font-mono text-xs font-medium text-lavender-700 dark:text-lavender-300 tabular-nums">
              {safeStudied}/{totalFlashcards}
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-ink-900 dark:text-[#F4F1FF] tabular-nums">
            {progressPercent}%
          </p>
          <div
            className="mt-3.5 h-2 w-full rounded-full bg-lavender-100 dark:bg-[#261E42] overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall study progress"
          >
            <div
              className="h-full rounded-full bg-lavender-600 dark:bg-lavender-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </article>
      </div>
    </section>
  );
}
