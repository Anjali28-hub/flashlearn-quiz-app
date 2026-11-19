import {
  BookOpen,
  Layers,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Flashcard, StudyDeck } from '../types/flashcard';

interface MyFlashcardsViewProps {
  flashcards: Flashcard[];
  decks: StudyDeck[];
  viewedIds: Set<string>;
  studiedIds: Set<string>;
  onAddFlashcard: () => void;
  onEditFlashcard: (card: Flashcard) => void;
  onDeleteFlashcard: (card: Flashcard) => void;
  onStudyCard: (cardId: string) => void;
  onRestoreSamples?: () => void;
  variant?: 'page' | 'embedded';
  isLoading?: boolean;
}

export function MyFlashcardsView({
  flashcards,
  decks,
  viewedIds,
  studiedIds,
  onAddFlashcard,
  onEditFlashcard,
  onDeleteFlashcard,
  onStudyCard,
  onRestoreSamples,
  variant = 'page',
  isLoading = false,
}: MyFlashcardsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  const deckCategoryById = useMemo(() => {
    const map = new Map<string, string>();
    for (const deck of decks) {
      map.set(deck.id, deck.category);
    }
    return map;
  }, [decks]);

  const deckCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const card of flashcards) {
      counts.set(card.deckId, (counts.get(card.deckId) ?? 0) + 1);
    }
    return counts;
  }, [flashcards]);

  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return flashcards.filter((card) => {
      const matchesCategory =
        selectedDeckId === 'all' || card.deckId === selectedDeckId;
      const categoryLabel = (deckCategoryById.get(card.deckId) ?? '').toLowerCase();
      const matchesQuery =
        !query ||
        card.question.toLowerCase().includes(query) ||
        card.topic.toLowerCase().includes(query) ||
        categoryLabel.includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [flashcards, searchQuery, selectedDeckId, deckCategoryById]);

  const HeadingTag = variant === 'page' ? 'h1' : 'h2';

  if (isLoading) {
    return (
      <section aria-label="Loading flashcards library" aria-busy="true" className="space-y-5">
        <div className="h-8 w-44 rounded-lg bg-lavender-100 dark:bg-[#241C3D] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((slot) => (
            <div
              key={slot}
              className="bg-white dark:bg-[#17122B] rounded-2xl border border-lavender-200/80 dark:border-[#2C244A] p-6 space-y-4 animate-pulse"
            >
              <div className="h-3.5 w-40 rounded bg-lavender-100 dark:bg-[#261E42]" />
              <div className="h-5 w-full rounded bg-lavender-100 dark:bg-[#261E42]" />
              <div className="h-4 w-5/6 rounded bg-lavender-100 dark:bg-[#261E42]" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="my-flashcards-heading" className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <HeadingTag
            id="my-flashcards-heading"
            className={
              variant === 'page'
                ? 'font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-[#F4F1FF] [text-wrap:balance]'
                : 'font-display text-xl sm:text-2xl font-bold tracking-tight text-ink-900 dark:text-[#F4F1FF]'
            }
          >
            My Flashcards
          </HeadingTag>
          <p className="mt-1.5 text-sm sm:text-base text-ink-600 dark:text-[#BDB4D6] tabular-nums">
            {flashcards.length === 0
              ? 'No flashcards saved yet — add your first card to get started.'
              : searchQuery.trim() || selectedDeckId !== 'all'
                ? `Showing ${filteredCards.length} of ${flashcards.length} ${flashcards.length === 1 ? 'flashcard' : 'flashcards'}`
                : `${flashcards.length} ${flashcards.length === 1 ? 'flashcard' : 'flashcards'} · Filter by category or search by question`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Layout Switcher */}
          {flashcards.length > 0 && (
            <div
              className="inline-flex items-center p-1 bg-white dark:bg-[#17122B] border border-lavender-200 dark:border-[#322954] rounded-xl"
              role="group"
              aria-label="Layout view"
            >
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                aria-pressed={layoutMode === 'grid'}
                aria-label="Grid view"
                className={`p-2 rounded-lg transition-colors duration-150 cursor-pointer ${
                  layoutMode === 'grid'
                    ? 'bg-lavender-100 dark:bg-lavender-500/20 text-lavender-700 dark:text-lavender-300'
                    : 'text-ink-400 dark:text-[#8E84AE] hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                aria-pressed={layoutMode === 'list'}
                aria-label="List view"
                className={`p-2 rounded-lg transition-colors duration-150 cursor-pointer ${
                  layoutMode === 'list'
                    ? 'bg-lavender-100 dark:bg-lavender-500/20 text-lavender-700 dark:text-lavender-300'
                    : 'text-ink-400 dark:text-[#8E84AE] hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onAddFlashcard}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 shadow-[0_2px_10px_rgba(109,40,217,0.26)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flashcard</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs & Question Search Bar */}
      {flashcards.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1"
            role="tablist"
            aria-label="Filter flashcards by category"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedDeckId === 'all'}
              onClick={() => setSelectedDeckId('all')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer tabular-nums ${
                selectedDeckId === 'all'
                  ? 'bg-lavender-600 text-white shadow-[0_2px_8px_rgba(109,40,217,0.24)]'
                  : 'bg-white dark:bg-[#17122B] text-ink-600 dark:text-[#CFC7E6] border border-lavender-200/80 dark:border-[#322954] hover:bg-lavender-50 dark:hover:bg-[#221B3D] hover:text-ink-900 dark:hover:text-white'
              }`}
            >
              All ({flashcards.length})
            </button>

            {decks.map((deck) => {
              const count = deckCounts.get(deck.id) ?? 0;
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
                      : 'bg-white dark:bg-[#17122B] text-ink-600 dark:text-[#CFC7E6] border border-lavender-200/80 dark:border-[#322954] hover:bg-lavender-50 dark:hover:bg-[#221B3D] hover:text-ink-900 dark:hover:text-white'
                  }`}
                >
                  {deck.category} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-80 shrink-0">
            <Search
              className="w-4 h-4 text-ink-400 dark:text-[#8E84AE] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flashcards by question..."
              aria-label="Search flashcards by question"
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white dark:bg-[#17122B] border border-lavender-200 dark:border-[#322954] rounded-xl text-ink-900 dark:text-[#F4F1FF] placeholder:text-ink-400 dark:placeholder:text-[#7E74A0] focus:outline-none focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 dark:focus:ring-lavender-500/30 transition-all duration-150"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md inline-flex items-center justify-center text-ink-400 dark:text-[#988EB8] hover:text-ink-900 dark:hover:text-white hover:bg-lavender-100 dark:hover:bg-[#261E42] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty States or Card Collection */}
      {flashcards.length === 0 ? (
        <div className="bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200/80 dark:border-[#2C244A] p-10 sm:p-14 text-center shadow-[0_4px_20px_rgba(46,16,101,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.22)]">
          <div
            className="w-12 h-12 rounded-2xl bg-lavender-100 dark:bg-lavender-500/15 text-lavender-700 dark:text-lavender-300 flex items-center justify-center mx-auto"
            aria-hidden="true"
          >
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="mt-5 font-display text-xl font-bold text-ink-900 dark:text-[#F4F1FF]">
            Your flashcard library is empty
          </h3>
          <p className="mt-2 text-sm sm:text-base text-ink-600 dark:text-[#BDB4D6] max-w-md mx-auto leading-relaxed">
            Create custom question-and-answer flashcards to build your personal study deck and track your learning progress.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onAddFlashcard}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 active:scale-[0.98] rounded-xl transition-all duration-150 shadow-[0_2px_10px_rgba(109,40,217,0.26)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Flashcard</span>
            </button>
            {onRestoreSamples && (
              <button
                type="button"
                onClick={onRestoreSamples}
                className="px-5 py-2.5 text-sm font-semibold text-lavender-700 dark:text-lavender-300 bg-lavender-100 dark:bg-lavender-500/15 hover:bg-lavender-200/80 dark:hover:bg-lavender-500/25 rounded-xl transition-colors duration-150 cursor-pointer"
              >
                Load Sample Flashcards
              </button>
            )}
          </div>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200/80 dark:border-[#2C244A] p-12 text-center shadow-[0_2px_12px_rgba(46,16,101,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.22)]">
          <p className="font-display text-lg font-semibold text-ink-900 dark:text-[#F4F1FF]">
            No matching flashcards found
          </p>
          <p className="mt-1.5 text-sm text-ink-600 dark:text-[#BDB4D6]">
            Try a different question search term or reset the category filter to view all {flashcards.length} cards.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDeckId('all');
            }}
            className="mt-5 px-4 py-2 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 rounded-xl transition-colors duration-150 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={
            layoutMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-5'
              : 'flex flex-col gap-4'
          }
        >
          {filteredCards.map((card, index) => {
            const isKnown = studiedIds.has(card.id);
            const isViewed = viewedIds.has(card.id);
            const statusText = isKnown
              ? 'Known'
              : isViewed
                ? 'Viewed'
                : 'Not viewed';
            const categoryLabel =
              deckCategoryById.get(card.deckId) ?? 'General Knowledge';

            return (
              <article
                key={card.id}
                className="bg-white dark:bg-[#17122B] rounded-2xl border border-lavender-200/80 dark:border-[#2C244A] p-6 shadow-[0_2px_12px_rgba(46,16,101,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 hover:border-lavender-300 dark:hover:border-lavender-500/45 hover:shadow-[0_10px_28px_rgba(109,40,217,0.07)] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.38)] transition-all duration-200 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3.5">
                  {/* Quiet unboxed metadata line */}
                  <div className="flex items-center justify-between gap-3 text-xs text-ink-400 dark:text-[#8E84AE]">
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <span className="font-semibold text-lavender-700 dark:text-lavender-300 shrink-0">
                        {categoryLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{card.topic}</span>
                    </div>
                    <span className="font-mono shrink-0 tabular-nums">
                      #{String(index + 1).padStart(2, '0')} · {statusText}
                    </span>
                  </div>

                  {/* Question */}
                  <div>
                    <p className="text-xs font-medium text-ink-400 dark:text-[#8E84AE]">
                      Question
                    </p>
                    <h3 className="mt-1 font-display text-base sm:text-lg font-semibold text-ink-900 dark:text-[#F4F1FF] leading-snug">
                      {card.question}
                    </h3>
                  </div>

                  {/* Answer */}
                  <div className="pt-3 border-t border-lavender-100 dark:border-[#2B2347]">
                    <p className="text-xs font-medium text-ink-400 dark:text-[#8E84AE]">
                      Answer
                    </p>
                    <p className="mt-1 text-sm text-ink-600 dark:text-[#BDB4D6] leading-relaxed">
                      {card.answer}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3.5 border-t border-lavender-100 dark:border-[#2B2347] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-ink-400 dark:text-[#8E84AE]">
                    {card.difficulty}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onStudyCard(card.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-lavender-700 dark:text-lavender-300 hover:text-lavender-900 dark:hover:text-lavender-100 hover:bg-lavender-100/70 dark:hover:bg-lavender-500/20 rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Study</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditFlashcard(card)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-600 dark:text-[#CFC7E6] hover:text-ink-900 dark:hover:text-white hover:bg-lavender-100/70 dark:hover:bg-[#241D3E] rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteFlashcard(card)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
