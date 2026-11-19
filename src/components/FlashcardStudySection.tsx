import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Lightbulb,
  Plus,
  RotateCw,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Flashcard } from '../types/flashcard';

interface FlashcardStudySectionProps {
  cards: Flashcard[];
  activeCardIndex: number;
  onSelectCard: (index: number) => void;
  onCardViewed: (cardId: string) => void;
  onRecordStudy: (cardId: string, wasCorrect: boolean) => void;
  viewedIds: Set<string>;
  studiedIds: Set<string>;
  variant?: 'dashboard' | 'focused';
  onOpenFullStudy?: () => void;
  activeDeckTitle?: string | null;
  onResetDeckFilter?: () => void;
  onAddFlashcard?: () => void;
  isModalOpen?: boolean;
  isLoading?: boolean;
}

export function FlashcardStudySection({
  cards,
  activeCardIndex,
  onSelectCard,
  onCardViewed,
  onRecordStudy,
  viewedIds,
  studiedIds,
  variant = 'dashboard',
  onOpenFullStudy,
  activeDeckTitle,
  onResetDeckFilter,
  onAddFlashcard,
  isModalOpen = false,
  isLoading = false,
}: FlashcardStudySectionProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const hasCards = cards.length > 0;
  const safeIndex = hasCards
    ? Math.max(0, Math.min(activeCardIndex, cards.length - 1))
    : 0;
  const currentCard = hasCards ? cards[safeIndex] : null;
  const isFirstCard = safeIndex === 0;
  const isLastCard = !hasCards || safeIndex === cards.length - 1;

  const viewedInSetCount = cards.reduce(
    (count, card) => count + (viewedIds.has(card.id) ? 1 : 0),
    0
  );
  const viewedPercent = hasCards
    ? Math.round((viewedInSetCount / cards.length) * 100)
    : 0;

  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [safeIndex, currentCard?.id]);

  const handlePrev = useCallback(() => {
    if (safeIndex > 0) {
      const targetCard = cards[safeIndex - 1];
      setStatusMessage(null);
      if (currentCard) onCardViewed(currentCard.id);
      if (targetCard) onCardViewed(targetCard.id);
      onSelectCard(safeIndex - 1);
    }
  }, [safeIndex, cards, currentCard, onCardViewed, onSelectCard]);

  const handleNext = useCallback(() => {
    if (safeIndex < cards.length - 1) {
      const targetCard = cards[safeIndex + 1];
      setStatusMessage(null);
      if (currentCard) onCardViewed(currentCard.id);
      if (targetCard) onCardViewed(targetCard.id);
      onSelectCard(safeIndex + 1);
    }
  }, [safeIndex, cards, currentCard, onCardViewed, onSelectCard]);

  const handleToggleFlip = useCallback(() => {
    if (!currentCard) return;
    onCardViewed(currentCard.id);
    setIsFlipped((prev) => !prev);
  }, [currentCard, onCardViewed]);

  // Keyboard navigation: Left Arrow (Prev), Right Arrow (Next), Spacebar (Flip)
  useEffect(() => {
    if (!hasCards || isModalOpen || isLoading) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.code === 'Space' || event.key === ' ') {
        // Allow Spacebar to activate focused buttons outside the study stage (e.g. Navbar / My Flashcards)
        const focusedExternalButton =
          target &&
          (target.tagName === 'BUTTON' || target.tagName === 'A') &&
          !target.closest('[data-study-section]');
        if (focusedExternalButton) {
          return;
        }
        event.preventDefault();
        handleToggleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasCards, isModalOpen, isLoading, handlePrev, handleNext, handleToggleFlip]);

  const handleSelfCheck = (wasCorrect: boolean) => {
    if (!currentCard) return;
    onRecordStudy(currentCard.id, wasCorrect);
    if (!isLastCard) {
      setStatusMessage(null);
      onSelectCard(safeIndex + 1);
    } else {
      setStatusMessage(
        wasCorrect
          ? 'Marked as known — you have reached the last card in this set.'
          : 'Saved for review — you have reached the last card in this set.'
      );
    }
  };

  if (isLoading) {
    return (
      <section aria-label="Loading flashcards" aria-busy="true" className="space-y-5">
        <div className="h-7 w-44 rounded-lg bg-lavender-100 dark:bg-[#241C3D] animate-pulse" />
        <div className="bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200/80 dark:border-[#2C244A] p-10 min-h-[360px] flex flex-col justify-between animate-pulse">
          <div className="h-4 w-36 rounded bg-lavender-100 dark:bg-[#261E42]" />
          <div className="space-y-3 max-w-lg mx-auto w-full">
            <div className="h-7 w-full rounded bg-lavender-100 dark:bg-[#261E42]" />
            <div className="h-7 w-3/4 mx-auto rounded bg-lavender-100 dark:bg-[#261E42]" />
          </div>
          <div className="h-4 w-48 rounded bg-lavender-100 dark:bg-[#261E42]" />
        </div>
      </section>
    );
  }

  if (!currentCard) {
    return (
      <section
        aria-labelledby="empty-flashcards-heading"
        className="bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200/80 dark:border-[#2C244A] p-10 sm:p-14 text-center shadow-[0_4px_20px_rgba(46,16,101,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] max-w-3xl mx-auto"
      >
        <div
          className="w-12 h-12 rounded-2xl bg-lavender-100 dark:bg-lavender-500/15 text-lavender-700 dark:text-lavender-300 flex items-center justify-center mx-auto"
          aria-hidden="true"
        >
          <Layers className="w-6 h-6" />
        </div>
        <h2
          id="empty-flashcards-heading"
          className="mt-5 font-display text-xl sm:text-2xl font-bold text-ink-900 dark:text-[#F4F1FF]"
        >
          No flashcards to study right now
        </h2>
        <p className="mt-2.5 text-sm sm:text-base text-ink-600 dark:text-[#BDB4D6] max-w-md mx-auto leading-relaxed">
          Your current study set is empty. Create a new flashcard or switch decks to begin practicing active recall.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onAddFlashcard && (
            <button
              type="button"
              onClick={onAddFlashcard}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 active:scale-[0.98] rounded-xl transition-all duration-150 shadow-[0_2px_10px_rgba(109,40,217,0.26)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Flashcard</span>
            </button>
          )}
          {onResetDeckFilter && (
            <button
              type="button"
              onClick={onResetDeckFilter}
              className="px-5 py-2.5 text-sm font-semibold text-lavender-700 dark:text-lavender-300 bg-lavender-100 dark:bg-lavender-500/15 hover:bg-lavender-200/80 dark:hover:bg-lavender-500/25 rounded-xl transition-colors duration-150 cursor-pointer"
            >
              Show All Flashcards
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="study-section-heading"
      data-study-section="true"
      className="space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2
            id="study-section-heading"
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink-900 dark:text-[#F4F1FF]"
          >
            Flashcard Study
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-ink-600 dark:text-[#BDB4D6]">
            <span>{activeDeckTitle || currentCard.deckName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-medium text-lavender-700 dark:text-lavender-300 tabular-nums">
              Card {safeIndex + 1} of {cards.length}
            </span>
            {activeDeckTitle && onResetDeckFilter && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={onResetDeckFilter}
                  className="text-lavender-700 dark:text-lavender-300 hover:text-lavender-900 dark:hover:text-lavender-200 font-medium underline underline-offset-4 cursor-pointer"
                >
                  View all categories
                </button>
              </>
            )}
          </div>
        </div>

        {variant === 'dashboard' && onOpenFullStudy && (
          <button
            type="button"
            onClick={onOpenFullStudy}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-lavender-700 dark:text-lavender-300 hover:text-lavender-900 dark:hover:text-lavender-200 transition-colors duration-150 whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer group"
          >
            <span>Open Study Mode</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Main Layout Grid */}
      <div
        className={
          variant === 'dashboard'
            ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch'
            : 'max-w-3xl mx-auto space-y-6'
        }
      >
        {/* Interactive Flashcard Stage */}
        <div
          className={
            variant === 'dashboard'
              ? 'lg:col-span-8 flex flex-col justify-between gap-5'
              : 'flex flex-col gap-5'
          }
        >
          {/* Viewed Progress Bar */}
          <div className="bg-white dark:bg-[#17122B] rounded-2xl border border-lavender-200/80 dark:border-[#2C244A] px-5 py-3.5 shadow-[0_2px_10px_rgba(46,16,101,0.02)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="font-medium text-ink-600 dark:text-[#BDB4D6] tabular-nums">
                Card {safeIndex + 1} of {cards.length}
              </span>
              <span className="font-mono text-xs text-lavender-700 dark:text-lavender-300 font-medium tabular-nums">
                {viewedInSetCount} of {cards.length} viewed ({viewedPercent}%)
              </span>
            </div>
            <div
              className="mt-2.5 h-2 w-full rounded-full bg-lavender-100 dark:bg-[#261E42] overflow-hidden"
              role="progressbar"
              aria-valuenow={viewedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Flashcards viewed progress"
            >
              <div
                className="h-full rounded-full bg-lavender-600 dark:bg-lavender-400 transition-all duration-300 ease-out"
                style={{ width: `${viewedPercent}%` }}
              />
            </div>
          </div>

          {/* Flippable 3D Card Surface */}
          <div
            key={currentCard.id}
            className="flashcard-perspective flashcard-enter w-full min-h-[340px] sm:min-h-[380px]"
          >
            <div
              className={`flashcard-inner min-h-[340px] sm:min-h-[380px] ${
                isFlipped ? 'is-flipped' : ''
              }`}
            >
              {/* Front Face: Question */}
              <div
                onClick={handleToggleFlip}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target === e.currentTarget) {
                    e.preventDefault();
                    handleToggleFlip();
                  }
                }}
                role="button"
                tabIndex={isFlipped ? -1 : 0}
                aria-hidden={isFlipped}
                aria-label={`Flashcard ${safeIndex + 1} of ${cards.length}, question side. Click or press Space to show answer.`}
                className={`flashcard-face bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200 dark:border-[#322954] p-7 sm:p-10 shadow-[0_10px_32px_rgba(46,16,101,0.06)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.35)] hover:border-lavender-300 dark:hover:border-lavender-500/50 hover:shadow-[0_14px_36px_rgba(109,40,217,0.1)] dark:hover:shadow-[0_18px_42px_rgba(0,0,0,0.45)] transition-all duration-200 flex flex-col justify-between cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400 ${
                  isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-xs text-ink-400 dark:text-[#8E84AE]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-lavender-700 dark:text-lavender-300 whitespace-nowrap">
                      Question
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{currentCard.topic}</span>
                  </div>
                  <span className="whitespace-nowrap shrink-0">
                    {currentCard.difficulty}
                  </span>
                </div>

                <div className="my-auto py-6 text-center overflow-y-auto max-h-[230px] sm:max-h-[250px] px-1">
                  <h3 className="font-display text-xl sm:text-2xl lg:text-[1.75rem] font-semibold leading-snug text-ink-900 dark:text-[#F4F1FF] max-w-xl mx-auto [text-wrap:balance]">
                    {currentCard.question}
                  </h3>

                  {showHint && currentCard.hint && (
                    <p className="mt-5 text-sm text-ink-600 dark:text-[#BDB4D6] max-w-md mx-auto leading-relaxed">
                      Hint: {currentCard.hint}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-lavender-100 dark:border-[#2B2347] text-xs text-ink-400 dark:text-[#8E84AE]">
                  {currentCard.hint ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint((prev) => !prev);
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-ink-600 dark:text-[#CFC7E6] hover:text-lavender-700 dark:hover:text-lavender-300 font-medium transition-colors duration-150 cursor-pointer py-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>
                  ) : (
                    <span className="truncate">{currentCard.deckName}</span>
                  )}
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click card to flip</span>
                  </span>
                </div>
              </div>

              {/* Back Face: Answer */}
              <div
                onClick={handleToggleFlip}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target === e.currentTarget) {
                    e.preventDefault();
                    handleToggleFlip();
                  }
                }}
                role="button"
                tabIndex={isFlipped ? 0 : -1}
                aria-hidden={!isFlipped}
                aria-label={`Flashcard ${safeIndex + 1} of ${cards.length}, answer side. Click or press Space to show question.`}
                className={`flashcard-face flashcard-back bg-gradient-to-br from-white via-lavender-50/80 to-lavender-100/80 dark:from-[#1D1636] dark:via-[#21193D] dark:to-[#291E4D] rounded-3xl border border-lavender-300 dark:border-lavender-500/45 p-7 sm:p-10 shadow-[0_12px_36px_rgba(109,40,217,0.1)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.45)] flex flex-col justify-between cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400 ${
                  isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-xs text-ink-400 dark:text-[#A59BC4]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-lavender-700 dark:text-lavender-300 whitespace-nowrap">
                      Answer
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{currentCard.topic}</span>
                  </div>
                  <span className="whitespace-nowrap shrink-0">
                    {currentCard.deckName}
                  </span>
                </div>

                <div className="my-auto py-6 text-center overflow-y-auto max-h-[230px] sm:max-h-[250px] px-1">
                  <p className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-ink-900 dark:text-[#F4F1FF] max-w-xl mx-auto">
                    {currentCard.answer}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-lavender-200/80 dark:border-[#362B5C] text-xs text-ink-400 dark:text-[#A59BC4]">
                  <span>Click card to return to question</span>
                  <span className="inline-flex items-center gap-1.5 text-lavender-700 dark:text-lavender-300 font-medium whitespace-nowrap shrink-0">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Show Question</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isFirstCard}
                  aria-disabled={isFirstCard}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-ink-600 dark:text-[#CFC7E6] hover:text-ink-900 dark:hover:text-white bg-white dark:bg-[#17122B] hover:bg-lavender-50 dark:hover:bg-[#221B3D] border border-lavender-200 dark:border-[#322954] rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#17122B] disabled:hover:text-ink-600 dark:disabled:hover:text-[#CFC7E6] focus-visible:outline-2 focus-visible:outline-lavender-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLastCard}
                  aria-disabled={isLastCard}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-ink-600 dark:text-[#CFC7E6] hover:text-ink-900 dark:hover:text-white bg-white dark:bg-[#17122B] hover:bg-lavender-50 dark:hover:bg-[#221B3D] border border-lavender-200 dark:border-[#322954] rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#17122B] disabled:hover:text-ink-600 dark:disabled:hover:text-[#CFC7E6] focus-visible:outline-2 focus-visible:outline-lavender-600"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleFlip}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 shadow-[0_2px_10px_rgba(109,40,217,0.26)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400"
                >
                  {isFlipped ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Show Question</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Show Answer</span>
                    </>
                  )}
                </button>

                {isFlipped && (
                  <button
                    type="button"
                    onClick={() => handleSelfCheck(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-lavender-700 dark:text-lavender-300 bg-lavender-100 dark:bg-lavender-500/15 hover:bg-lavender-200/80 dark:hover:bg-lavender-500/25 active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-lavender-600"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark Known</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quiet Keyboard Shortcut Guide & Optional Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-ink-400 dark:text-[#8E84AE]">
              <p>
                Keyboard shortcuts: Left Arrow previous · Right Arrow next · Spacebar flip card
              </p>
              {statusMessage && (
                <p className="text-lavender-700 dark:text-lavender-300 font-medium">
                  {statusMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Panel: Clean Session Queue (Dashboard layout only) */}
        {variant === 'dashboard' && (
          <aside
            aria-label="Study queue"
            className="lg:col-span-4 bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200/80 dark:border-[#2C244A] p-6 shadow-[0_2px_12px_rgba(46,16,101,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.22)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-baseline justify-between gap-2 pb-4 border-b border-lavender-100 dark:border-[#2B2347]">
                <h3 className="font-display text-base font-semibold text-ink-900 dark:text-[#F4F1FF]">
                  Study Queue
                </h3>
                <span className="font-mono text-xs text-ink-400 dark:text-[#8E84AE] tabular-nums">
                  {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                </span>
              </div>

              <ul className="divide-y divide-lavender-100 dark:divide-[#261E42] max-h-[395px] overflow-y-auto pr-1">
                {cards.map((card, index) => {
                  const isActive = index === safeIndex;
                  const isKnown = studiedIds.has(card.id);
                  const isViewed = viewedIds.has(card.id);

                  return (
                    <li key={card.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusMessage(null);
                          onCardViewed(card.id);
                          onSelectCard(index);
                        }}
                        className={`w-full text-left py-3 px-3 rounded-xl transition-colors duration-150 flex items-start justify-between gap-3 cursor-pointer ${
                          isActive
                            ? 'bg-lavender-100/80 dark:bg-lavender-500/20 text-lavender-900 dark:text-[#F4F1FF]'
                            : 'hover:bg-lavender-50 dark:hover:bg-[#20193A] text-ink-900 dark:text-[#E7E2F7]'
                        }`}
                      >
                        <div className="min-w-0">
                          <p
                            className={`text-sm leading-snug line-clamp-1 ${
                              isActive
                                ? 'font-semibold text-lavender-900 dark:text-lavender-200'
                                : 'font-medium text-ink-900 dark:text-[#E7E2F7]'
                            }`}
                          >
                            {card.question}
                          </p>
                          <p className="mt-1 text-xs text-ink-400 dark:text-[#8E84AE] truncate">
                            {card.topic} · {card.difficulty}
                          </p>
                        </div>
                        <span
                          className={`font-mono text-xs shrink-0 pt-0.5 tabular-nums ${
                            isKnown
                              ? 'text-lavender-700 dark:text-lavender-300 font-semibold'
                              : isViewed
                                ? 'text-ink-600 dark:text-[#BDB4D6]'
                                : 'text-ink-400 dark:text-[#7E74A0]'
                          }`}
                        >
                          {isKnown
                            ? 'Known'
                            : isViewed
                              ? 'Viewed'
                              : String(index + 1).padStart(2, '0')}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-lavender-100 dark:border-[#2B2347] flex items-center justify-between text-xs text-ink-400 dark:text-[#8E84AE]">
              <span>Select any card to jump directly</span>
              <span className="font-mono tabular-nums text-lavender-700 dark:text-lavender-300 font-medium">
                {viewedInSetCount}/{cards.length} viewed
              </span>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
