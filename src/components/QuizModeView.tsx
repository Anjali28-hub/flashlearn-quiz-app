import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Play,
  Plus,
  RotateCcw,
  Shuffle,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Flashcard, StoredQuizScore, StudyDeck } from '../types/flashcard';
import {
  GeneratedQuizQuestion,
  generateQuizFromFlashcards,
} from '../utils/quizGenerator';

interface QuizModeViewProps {
  flashcards: Flashcard[];
  decks: StudyDeck[];
  quizScores: StoredQuizScore[];
  onAddFlashcard: () => void;
  onAnswerCorrect: (cardId: string) => void;
  onQuizComplete: (summary: {
    deckId: string;
    deckName: string;
    total: number;
    correct: number;
    incorrect: number;
    percentage: number;
  }) => void;
}

interface AnswerRecord {
  question: GeneratedQuizQuestion;
  selectedIndex: number;
  isCorrect: boolean;
}

type QuizPhase = 'setup' | 'active' | 'results';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function QuizModeView({
  flashcards,
  decks,
  quizScores,
  onAddFlashcard,
  onAnswerCorrect,
  onQuizComplete,
}: QuizModeViewProps) {
  const [phase, setPhase] = useState<QuizPhase>('setup');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [questions, setQuestions] = useState<GeneratedQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const deckCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const card of flashcards) {
      counts.set(card.deckId, (counts.get(card.deckId) ?? 0) + 1);
    }
    return counts;
  }, [flashcards]);

  const targetCards = useMemo(() => {
    if (selectedDeckId === 'all') return flashcards;
    return flashcards.filter((card) => card.deckId === selectedDeckId);
  }, [flashcards, selectedDeckId]);

  useEffect(() => {
    if (selectedDeckId !== 'all' && targetCards.length === 0 && flashcards.length > 0) {
      setSelectedDeckId('all');
    }
  }, [selectedDeckId, targetCards.length, flashcards.length]);

  const startNewQuiz = (cardsForQuiz: Flashcard[] = targetCards) => {
    if (cardsForQuiz.length === 0) return;
    const generated = generateQuizFromFlashcards(cardsForQuiz, flashcards);
    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setPhase('active');
  };

  const handleSelectOption = (optionIndex: number) => {
    if (selectedOption !== null) return;
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    setSelectedOption(optionIndex);
    setAnswers((prev) => [
      ...prev,
      {
        question: currentQuestion,
        selectedIndex: optionIndex,
        isCorrect,
      },
    ]);

    if (isCorrect) {
      onAnswerCorrect(currentQuestion.sourceCardId);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      const correctTotal = answers.filter((a) => a.isCorrect).length;
      const incorrectTotal = questions.length - correctTotal;
      const percentage =
        questions.length > 0
          ? Math.round((correctTotal / questions.length) * 100)
          : 0;
      const deckName =
        selectedDeckId === 'all'
          ? 'All Categories'
          : decks.find((d) => d.id === selectedDeckId)?.category ?? 'Selected Category';

      setPhase('results');
      onQuizComplete({
        deckId: selectedDeckId,
        deckName,
        total: questions.length,
        correct: correctTotal,
        incorrect: incorrectTotal,
        percentage,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  };

  const handleRestartQuiz = () => {
    const refreshedTargets =
      selectedDeckId === 'all'
        ? flashcards
        : flashcards.filter((card) => card.deckId === selectedDeckId);
    const pool = refreshedTargets.length > 0 ? refreshedTargets : flashcards;
    if (pool.length === 0) {
      setPhase('setup');
      return;
    }
    startNewQuiz(pool);
  };

  // Empty state when no flashcards exist at all
  if (flashcards.length === 0) {
    return (
      <section aria-labelledby="quiz-empty-heading" className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200/80 dark:border-[#2C244A] p-10 sm:p-14 text-center shadow-[0_4px_20px_rgba(46,16,101,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <div
            className="w-12 h-12 rounded-2xl bg-lavender-100 dark:bg-lavender-500/15 text-lavender-700 dark:text-lavender-300 flex items-center justify-center mx-auto"
            aria-hidden="true"
          >
            <Layers className="w-6 h-6" />
          </div>
          <h1
            id="quiz-empty-heading"
            className="mt-5 font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-[#F4F1FF]"
          >
            No flashcards available for a quiz
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-ink-600 dark:text-[#BDB4D6] max-w-md mx-auto leading-relaxed">
            Quiz Mode generates shuffled multiple-choice questions directly from your saved flashcards. Add flashcards to get started.
          </p>
          <button
            type="button"
            onClick={onAddFlashcard}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 active:scale-[0.98] rounded-xl transition-all duration-150 shadow-[0_2px_10px_rgba(109,40,217,0.26)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flashcard</span>
          </button>
        </div>
      </section>
    );
  }

  // Phase 1: Quiz Setup & Start Quiz Screen
  if (phase === 'setup') {
    const activeCategoryLabel =
      selectedDeckId === 'all'
        ? 'All Categories'
        : decks.find((d) => d.id === selectedDeckId)?.category ?? 'Selected Category';

    return (
      <section aria-labelledby="quiz-mode-heading" className="max-w-3xl mx-auto space-y-7">
        <header>
          <h1
            id="quiz-mode-heading"
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-[#F4F1FF] [text-wrap:balance]"
          >
            Quiz Mode
          </h1>
          <p className="mt-2 text-base text-ink-600 dark:text-[#BDB4D6] leading-relaxed">
            Test your recall with shuffled multiple-choice questions built automatically from your saved flashcards.
          </p>
        </header>

        <div className="bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200 dark:border-[#2C244A] p-7 sm:p-10 shadow-[0_8px_30px_rgba(46,16,101,0.05)] dark:shadow-[0_10px_32px_rgba(0,0,0,0.3)] space-y-7">
          {/* Category Filter Selector */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-ink-900 dark:text-[#F4F1FF]">
              Choose category to quiz
            </p>
            <div
              className="flex flex-wrap items-center gap-2"
              role="tablist"
              aria-label="Filter quiz by category"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedDeckId === 'all'}
                onClick={() => setSelectedDeckId('all')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer tabular-nums ${
                  selectedDeckId === 'all'
                    ? 'bg-lavender-600 text-white shadow-[0_2px_8px_rgba(109,40,217,0.24)]'
                    : 'bg-lavender-50 dark:bg-[#1F1838] text-ink-600 dark:text-[#CFC7E6] border border-lavender-200/80 dark:border-[#322954] hover:bg-lavender-100/70 dark:hover:bg-[#29204A] hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                All Categories ({flashcards.length})
              </button>

              {decks.map((deck) => {
                const count = deckCounts.get(deck.id) ?? 0;
                if (count === 0) return null;
                const active = selectedDeckId === deck.id;
                return (
                  <button
                    key={deck.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedDeckId(deck.id)}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer tabular-nums ${
                      active
                        ? 'bg-lavender-600 text-white shadow-[0_2px_8px_rgba(109,40,217,0.24)]'
                        : 'bg-lavender-50 dark:bg-[#1F1838] text-ink-600 dark:text-[#CFC7E6] border border-lavender-200/80 dark:border-[#322954] hover:bg-lavender-100/70 dark:hover:bg-[#29204A] hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    {deck.category} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quiz Session Overview */}
          <div className="pt-6 border-t border-lavender-100 dark:border-[#2B2347] grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <p className="text-xs font-medium text-ink-400 dark:text-[#8E84AE]">
                Selected Category
              </p>
              <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-[#F4F1FF]">
                {activeCategoryLabel}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-400 dark:text-[#8E84AE]">
                Questions
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-ink-900 dark:text-[#F4F1FF] tabular-nums">
                {targetCards.length} {targetCards.length === 1 ? 'question' : 'questions'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-400 dark:text-[#8E84AE]">
                Format
              </p>
              <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-[#F4F1FF]">
                4 choices · Shuffled
              </p>
            </div>
          </div>

          {flashcards.length < 4 && (
            <p className="text-xs text-ink-600 dark:text-[#CFC7E6] bg-lavender-50 dark:bg-[#1F1838] border border-lavender-200/70 dark:border-[#322954] rounded-xl px-4 py-3">
              Tip: You currently have {flashcards.length} saved{' '}
              {flashcards.length === 1 ? 'flashcard' : 'flashcards'}. Add at least 4 flashcards to use all-custom distractor answers from your own cards.
            </p>
          )}

          {/* Start Quiz CTA */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-400 dark:text-[#8E84AE]">
              <Shuffle className="w-3.5 h-3.5 text-lavender-600 dark:text-lavender-400" />
              <span>Questions and answer order shuffle on every session</span>
            </span>

            <button
              type="button"
              onClick={() => startNewQuiz(targetCards)}
              disabled={targetCards.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 shadow-[0_4px_14px_rgba(109,40,217,0.3)] cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Quiz</span>
            </button>
          </div>
        </div>

        {/* Saved Recent Quiz Scores */}
        {quizScores.length > 0 && (
          <div className="bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200/80 dark:border-[#2C244A] p-6 sm:p-8 shadow-[0_2px_12px_rgba(46,16,101,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.22)]">
            <div className="flex items-baseline justify-between gap-3 pb-4 border-b border-lavender-100 dark:border-[#2B2347]">
              <h2 className="font-display text-base sm:text-lg font-semibold text-ink-900 dark:text-[#F4F1FF]">
                Recent Quiz Scores
              </h2>
              <span className="font-mono text-xs text-lavender-700 dark:text-lavender-300 font-medium tabular-nums">
                Best: {Math.max(...quizScores.map((s) => s.percentage))}% · {quizScores.length}{' '}
                {quizScores.length === 1 ? 'session' : 'sessions'}
              </span>
            </div>

            <ul className="divide-y divide-lavender-100 dark:divide-[#261E42]">
              {quizScores.slice(0, 5).map((entry) => {
                const formattedDate = new Date(entry.completedAt).toLocaleDateString(
                  undefined,
                  { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                );
                return (
                  <li
                    key={entry.id}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900 dark:text-[#F4F1FF] truncate">
                        {entry.deckName}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-400 dark:text-[#8E84AE]">
                        {formattedDate} · {entry.correctAnswers} correct, {entry.incorrectAnswers} incorrect
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-semibold text-lavender-700 dark:text-lavender-300 tabular-nums">
                        {entry.percentage}%
                      </p>
                      <p className="font-mono text-xs text-ink-400 dark:text-[#8E84AE] tabular-nums">
                        {entry.correctAnswers}/{entry.totalQuestions}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    );
  }

  // Phase 3: Final Quiz Results Summary
  if (phase === 'results') {
    const totalQuestions = questions.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const incorrectCount = totalQuestions - correctCount;
    const finalPercentage =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const feedbackLine =
      finalPercentage >= 90
        ? 'Outstanding recall across your flashcards.'
        : finalPercentage >= 70
          ? 'Strong session — review the missed answers below to lock them in.'
          : 'Good practice run — revisiting these cards in Study Mode will boost retention.';

    return (
      <section aria-labelledby="quiz-results-heading" className="max-w-4xl mx-auto space-y-7">
        <div className="bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200 dark:border-[#2C244A] p-7 sm:p-10 shadow-[0_8px_30px_rgba(46,16,101,0.05)] dark:shadow-[0_10px_32px_rgba(0,0,0,0.3)] space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-lavender-700 dark:text-lavender-300">
                Quiz Results
              </p>
              <h1
                id="quiz-results-heading"
                className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-[#F4F1FF]"
              >
                Session Complete
              </h1>
              <p className="mt-2 text-sm sm:text-base text-ink-600 dark:text-[#BDB4D6]">
                {feedbackLine}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPhase('setup')}
                className="px-4 py-2.5 text-sm font-medium text-ink-600 dark:text-[#CFC7E6] hover:text-ink-900 dark:hover:text-white bg-white dark:bg-[#1E1836] hover:bg-lavender-50 dark:hover:bg-[#272044] border border-lavender-200 dark:border-[#342B58] rounded-xl transition-colors duration-150 whitespace-nowrap cursor-pointer"
              >
                Change Category
              </button>
              <button
                type="button"
                onClick={handleRestartQuiz}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap shadow-[0_2px_10px_rgba(109,40,217,0.26)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Quiz</span>
              </button>
            </div>
          </div>

          {/* 4 Required Score Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="rounded-2xl bg-lavender-50/70 dark:bg-[#1F1838] border border-lavender-200/70 dark:border-[#322954] p-5">
              <p className="text-xs font-medium text-ink-600 dark:text-[#BDB4D6]">
                Total Questions
              </p>
              <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-[#F4F1FF] tabular-nums">
                {totalQuestions}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/35 border border-emerald-200/80 dark:border-emerald-500/35 p-5">
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                Correct Answers
              </p>
              <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
                {correctCount}
              </p>
            </div>

            <div className="rounded-2xl bg-rose-50/60 dark:bg-rose-950/35 border border-rose-200/80 dark:border-rose-500/35 p-5">
              <p className="text-xs font-medium text-rose-800 dark:text-rose-300">
                Incorrect Answers
              </p>
              <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-rose-700 dark:text-rose-300 tabular-nums">
                {incorrectCount}
              </p>
            </div>

            <div className="rounded-2xl bg-lavender-100/70 dark:bg-lavender-500/15 border border-lavender-200 dark:border-lavender-500/35 p-5">
              <p className="text-xs font-medium text-lavender-800 dark:text-lavender-300">
                Final Percentage
              </p>
              <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-lavender-700 dark:text-lavender-300 tabular-nums">
                {finalPercentage}%
              </p>
            </div>
          </div>

          {/* Overall Score Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-ink-600 dark:text-[#BDB4D6] mb-2">
              <span>Overall Accuracy</span>
              <span className="font-mono font-semibold text-lavender-700 dark:text-lavender-300 tabular-nums">
                {correctCount} / {totalQuestions} ({finalPercentage}%)
              </span>
            </div>
            <div
              className="h-2.5 w-full rounded-full bg-lavender-100 dark:bg-[#261E42] overflow-hidden"
              role="progressbar"
              aria-valuenow={finalPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Final quiz score percentage"
            >
              <div
                className="h-full rounded-full bg-lavender-600 dark:bg-lavender-400 transition-all duration-300"
                style={{ width: `${finalPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question-by-Question Review */}
        <div className="bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200/80 dark:border-[#2C244A] p-6 sm:p-8 shadow-[0_2px_12px_rgba(46,16,101,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.22)]">
          <div className="flex items-baseline justify-between pb-4 border-b border-lavender-100 dark:border-[#2B2347]">
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-[#F4F1FF]">
              Answer Review
            </h2>
            <span className="font-mono text-xs text-ink-400 dark:text-[#8E84AE] tabular-nums">
              {totalQuestions} {totalQuestions === 1 ? 'item' : 'items'}
            </span>
          </div>

          <ul className="divide-y divide-lavender-100 dark:divide-[#261E42]">
            {answers.map((record, idx) => (
              <li key={record.question.id} className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm sm:text-base font-semibold text-ink-900 dark:text-[#F4F1FF] leading-snug">
                    <span className="font-mono text-xs text-ink-400 dark:text-[#8E84AE] mr-2 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    {record.question.prompt}
                  </p>
                  {record.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400 whitespace-nowrap shrink-0">
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>

                {!record.isCorrect && (
                  <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300">
                    Your answer: {record.question.options[record.selectedIndex]}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                  Correct answer: {record.question.correctAnswer}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  // Phase 2: Active Quiz Question (One question at a time)
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return null;
  }

  const runningScore = answers.filter((a) => a.isCorrect).length;
  const isAnswered = selectedOption !== null;
  const wasSelectedCorrect =
    isAnswered && selectedOption === currentQuestion.correctIndex;
  const progressPercent = Math.round(
    ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100
  );

  return (
    <section aria-labelledby="active-quiz-heading" className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1
            id="active-quiz-heading"
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 dark:text-[#F4F1FF]"
          >
            Quiz Mode
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-ink-600 dark:text-[#BDB4D6]">
            <span>{currentQuestion.deckName}</span>
            <span aria-hidden="true">·</span>
            <span>{currentQuestion.topic}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-medium text-lavender-700 dark:text-lavender-300 tabular-nums">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <p className="font-mono text-sm font-semibold text-lavender-700 dark:text-lavender-300 tabular-nums">
            Score: {runningScore}/{answers.length}
          </p>
          <button
            type="button"
            onClick={handleRestartQuiz}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 dark:text-[#CFC7E6] hover:text-lavender-700 dark:hover:text-lavender-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div
        className="h-2 w-full rounded-full bg-lavender-100 dark:bg-[#261E42] overflow-hidden"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Quiz completion progress"
      >
        <div
          className="h-full rounded-full bg-lavender-600 dark:bg-lavender-400 transition-all duration-300 ease-out"
          style={{ width: `${Math.max(progressPercent, 8)}%` }}
        />
      </div>

      {/* Single Question Card */}
      <div
        key={currentQuestion.id}
        className="bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200 dark:border-[#2C244A] p-7 sm:p-10 shadow-[0_8px_30px_rgba(46,16,101,0.05)] dark:shadow-[0_12px_34px_rgba(0,0,0,0.3)] space-y-7 flashcard-enter"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold text-lavender-700 dark:text-lavender-300">
            Question {currentIndex + 1} · {currentQuestion.difficulty}
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-900 dark:text-[#F4F1FF] leading-snug [text-wrap:balance]">
            {currentQuestion.prompt}
          </h2>
        </div>

        {/* 4 Multiple-Choice Answer Buttons */}
        <div className="space-y-3" role="radiogroup" aria-label="Answer options">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === currentQuestion.correctIndex;

            let optionClasses =
              'bg-white dark:bg-[#1E1836] border-lavender-200 dark:border-[#322954] text-ink-900 dark:text-[#F4F1FF] hover:border-lavender-400 dark:hover:border-lavender-400 hover:bg-lavender-50/70 dark:hover:bg-[#272045]';
            let letterClasses =
              'bg-lavender-100/90 dark:bg-lavender-500/20 text-lavender-800 dark:text-lavender-200';

            if (isAnswered) {
              if (isCorrectOption) {
                optionClasses =
                  'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-400 text-emerald-950 dark:text-emerald-100';
                letterClasses = 'bg-emerald-600 text-white';
              } else if (isSelected && !isCorrectOption) {
                optionClasses =
                  'bg-rose-50 dark:bg-rose-950/50 border-rose-500 dark:border-rose-400 text-rose-950 dark:text-rose-100';
                letterClasses = 'bg-rose-600 text-white';
              } else {
                optionClasses =
                  'bg-white dark:bg-[#161129] border-lavender-100 dark:border-[#261E42] text-ink-400 dark:text-[#7E74A0] opacity-70';
                letterClasses =
                  'bg-lavender-50 dark:bg-[#211A3B] text-ink-400 dark:text-[#7E74A0]';
              }
            }

            return (
              <button
                key={`${currentQuestion.id}-opt-${idx}`}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400 ${optionClasses}`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <span
                    className={`font-mono text-xs font-semibold w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${letterClasses}`}
                  >
                    {OPTION_LETTERS[idx]}
                  </span>
                  <span className="text-sm sm:text-base font-medium leading-snug">
                    {option}
                  </span>
                </div>

                {isAnswered && isCorrectOption && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct</span>
                  </span>
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 whitespace-nowrap shrink-0">
                    <XCircle className="w-4 h-4" />
                    <span>Incorrect</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Feedback & Next Question Action */}
        {isAnswered && (
          <div className="pt-5 border-t border-lavender-100 dark:border-[#2B2347] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-2.5 min-w-0">
              {wasSelectedCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-sm font-semibold ${
                    wasSelectedCorrect
                      ? 'text-emerald-800 dark:text-emerald-300'
                      : 'text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {wasSelectedCorrect
                    ? 'Correct answer!'
                    : 'Not quite — review the correct answer highlighted in green.'}
                </p>
                <p className="mt-0.5 text-xs sm:text-sm text-ink-600 dark:text-[#BDB4D6]">
                  {wasSelectedCorrect
                    ? 'Nice recall. Continue to the next question when ready.'
                    : 'Active recall strengthens memory fastest when you compare missed options.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 self-start sm:self-auto shadow-[0_2px_10px_rgba(109,40,217,0.26)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400"
            >
              <span>
                {currentIndex + 1 >= questions.length
                  ? 'View Final Results'
                  : 'Next Question'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
