/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertCircle, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FlashcardFormModal } from './components/FlashcardFormModal';
import { FlashcardStudySection } from './components/FlashcardStudySection';
import { MyFlashcardsView } from './components/MyFlashcardsView';
import { Navbar } from './components/Navbar';
import { NotificationContainer } from './components/NotificationContainer';
import { QuizModeView } from './components/QuizModeView';
import { ResetProgressModal } from './components/ResetProgressModal';
import { StatsGrid } from './components/StatsGrid';
import { SAMPLE_FLASHCARDS, STUDY_DECKS } from './data/sampleCards';
import {
  Flashcard,
  FlashcardFormValues,
  NavSection,
  StoredQuizScore,
  ToastNotification,
} from './types/flashcard';
import {
  ThemeMode,
  loadFlashcards,
  loadProgress,
  loadQuizScores,
  loadTheme,
  resetStoredProgressAndScores,
  saveFlashcards,
  saveProgress,
  saveQuizScores,
  saveTheme,
} from './utils/storage';

interface InitialAppData {
  cards: Flashcard[];
  viewedCardIds: Set<string>;
  studiedCardIds: Set<string>;
  quizScores: StoredQuizScore[];
  theme: ThemeMode;
  hadRecoveryError: boolean;
}

function hydrateInitialAppData(): InitialAppData {
  const loadedCards = loadFlashcards();
  const loadedProgress = loadProgress(loadedCards.cards);
  const loadedScores = loadQuizScores();
  const theme = loadTheme();

  return {
    cards: loadedCards.cards,
    viewedCardIds: loadedProgress.viewedCardIds,
    studiedCardIds: loadedProgress.studiedCardIds,
    quizScores: loadedScores.scores,
    theme,
    hadRecoveryError:
      loadedCards.hadRecoveryError ||
      loadedProgress.hadRecoveryError ||
      loadedScores.hadRecoveryError,
  };
}

export default function App() {
  // Hydrate synchronously once from LocalStorage so existing user data is never overwritten on reload
  const initialDataRef = useRef<InitialAppData | null>(null);
  if (initialDataRef.current === null) {
    initialDataRef.current = hydrateInitialAppData();
  }
  const initialData = initialDataRef.current;

  const [theme, setTheme] = useState<ThemeMode>(() => initialData.theme);
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [flashcards, setFlashcards] = useState<Flashcard[]>(
    () => initialData.cards
  );
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const [viewedCardIds, setViewedCardIds] = useState<Set<string>>(
    () => initialData.viewedCardIds
  );
  const [studiedCardIds, setStudiedCardIds] = useState<Set<string>>(
    () => initialData.studiedCardIds
  );
  const [quizScores, setQuizScores] = useState<StoredQuizScore[]>(
    () => initialData.quizScores
  );

  // UI, Modal, Error & Loading state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [deletingCard, setDeletingCard] = useState<Flashcard | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isTransitionLoading, setIsTransitionLoading] = useState(false);
  const [storageErrorBanner, setStorageErrorBanner] = useState<string | null>(
    () =>
      initialData.hadRecoveryError
        ? 'Some stored browser data was invalid and safely restored to defaults.'
        : null
  );
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const hasMountedProgressRef = useRef(false);
  const isAnyModalOpen =
    isFormModalOpen || deletingCard !== null || isResetModalOpen;

  // Apply light/dark class on <html> and persist preference
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushNotification = useCallback(
    (type: 'success' | 'error', title: string, message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setNotifications((prev) => [...prev.slice(-2), { id, type, title, message }]);
      window.setTimeout(() => {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
      }, 3800);
    },
    []
  );

  // Persist study progress whenever viewed/studied sets change after initial mount
  useEffect(() => {
    if (!hasMountedProgressRef.current) {
      hasMountedProgressRef.current = true;
      return;
    }
    const result = saveProgress(viewedCardIds, studiedCardIds);
    if (!result.ok && result.error) {
      setStorageErrorBanner(result.error);
      pushNotification('error', 'Storage error', result.error);
    }
  }, [viewedCardIds, studiedCardIds, pushNotification]);

  // Live dashboard metrics synced with CRUD operations and LocalStorage
  const totalFlashcards = flashcards.length;

  const activeDeckCount = useMemo(() => {
    const deckIds = new Set(flashcards.map((card) => card.deckId));
    return deckIds.size;
  }, [flashcards]);

  const cardsStudied = useMemo(() => {
    const validIds = new Set(flashcards.map((card) => card.id));
    let count = 0;
    viewedCardIds.forEach((id) => {
      if (validIds.has(id)) count += 1;
    });
    return count;
  }, [flashcards, viewedCardIds]);

  const knownCardsCount = useMemo(() => {
    const validIds = new Set(flashcards.map((card) => card.id));
    let knownCount = 0;
    studiedCardIds.forEach((id) => {
      if (validIds.has(id)) knownCount += 1;
    });
    return knownCount;
  }, [flashcards, studiedCardIds]);

  const visibleCards = useMemo(() => {
    if (!activeDeckId) return flashcards;
    return flashcards.filter((card) => card.deckId === activeDeckId);
  }, [flashcards, activeDeckId]);

  const activeDeckTitle = useMemo(() => {
    if (!activeDeckId) return null;
    return STUDY_DECKS.find((d) => d.id === activeDeckId)?.title ?? null;
  }, [activeDeckId]);

  const handleCardViewed = useCallback((cardId: string) => {
    setViewedCardIds((prev) => {
      if (prev.has(cardId)) return prev;
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);

  const handleRecordStudy = useCallback((cardId: string, wasCorrect: boolean) => {
    if (!wasCorrect) return;
    setStudiedCardIds((prev) => {
      if (prev.has(cardId)) return prev;
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);

  const handleQuizAnswerCorrect = useCallback((cardId: string) => {
    setViewedCardIds((prev) => {
      if (prev.has(cardId)) return prev;
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
    setStudiedCardIds((prev) => {
      if (prev.has(cardId)) return prev;
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);

  const handleQuizComplete = useCallback(
    (summary: {
      deckId: string;
      deckName: string;
      total: number;
      correct: number;
      incorrect: number;
      percentage: number;
    }) => {
      const newRecord: StoredQuizScore = {
        id: `score-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        deckId: summary.deckId,
        deckName: summary.deckName,
        totalQuestions: summary.total,
        correctAnswers: summary.correct,
        incorrectAnswers: summary.incorrect,
        percentage: summary.percentage,
        completedAt: new Date().toISOString(),
      };

      const nextScores = [newRecord, ...quizScores].slice(0, 25);
      const writeResult = saveQuizScores(nextScores);
      setQuizScores(nextScores);

      if (!writeResult.ok && writeResult.error) {
        setStorageErrorBanner(writeResult.error);
        pushNotification('error', 'Storage error', writeResult.error);
      } else {
        pushNotification(
          'success',
          'Quiz score saved',
          `You scored ${summary.correct} of ${summary.total} (${summary.percentage}%).`
        );
      }
    },
    [quizScores, pushNotification]
  );

  // CRUD Handlers with immediate LocalStorage persistence
  const handleOpenAddModal = useCallback(() => {
    setEditingCard(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((card: Flashcard) => {
    setEditingCard(card);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingCard(null);
  }, []);

  const handleSaveFlashcard = useCallback(
    (values: FlashcardFormValues, editingCardId?: string) => {
      const selectedDeck = STUDY_DECKS.find((d) => d.id === values.deckId);
      const deckName = selectedDeck?.title ?? 'General Knowledge';

      if (editingCardId) {
        const nextCards = flashcards.map((card) =>
          card.id === editingCardId
            ? {
                ...card,
                question: values.question,
                answer: values.answer,
                deckId: values.deckId,
                deckName,
                topic: values.topic,
                hint: values.hint,
                difficulty: values.difficulty,
              }
            : card
        );

        const writeResult = saveFlashcards(nextCards);
        setFlashcards(nextCards);
        handleCloseFormModal();

        if (!writeResult.ok && writeResult.error) {
          setStorageErrorBanner(writeResult.error);
          pushNotification('error', 'Save failed', writeResult.error);
        } else {
          pushNotification(
            'success',
            'Flashcard updated',
            'Your changes have been saved to browser storage.'
          );
        }
      } else {
        const normalizedNewQuestion = values.question.trim().toLowerCase();
        const alreadyExists = flashcards.some(
          (card) => card.question.trim().toLowerCase() === normalizedNewQuestion
        );
        if (alreadyExists) {
          pushNotification(
            'error',
            'Duplicate flashcard',
            'A flashcard with this exact question already exists.'
          );
          return;
        }

        const newCard: Flashcard = {
          id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          deckId: values.deckId,
          deckName,
          topic: values.topic,
          question: values.question,
          answer: values.answer,
          hint: values.hint,
          difficulty: values.difficulty,
        };

        const nextCards = [newCard, ...flashcards];
        const writeResult = saveFlashcards(nextCards);
        setFlashcards(nextCards);
        setActiveDeckId(null);
        setActiveCardIndex(0);
        handleCloseFormModal();

        if (!writeResult.ok && writeResult.error) {
          setStorageErrorBanner(writeResult.error);
          pushNotification('error', 'Save failed', writeResult.error);
        } else {
          pushNotification(
            'success',
            'Flashcard saved',
            'Your new flashcard has been added and saved.'
          );
        }
      }
    },
    [flashcards, handleCloseFormModal, pushNotification]
  );

  const handleValidationError = useCallback(
    (message: string) => {
      pushNotification('error', 'Missing required fields', message);
    },
    [pushNotification]
  );

  const handleConfirmDelete = useCallback(
    (cardId: string) => {
      const nextCards = flashcards.filter((card) => card.id !== cardId);
      const remainingVisibleCount = activeDeckId
        ? nextCards.filter((card) => card.deckId === activeDeckId).length
        : nextCards.length;

      const nextViewed = new Set(viewedCardIds);
      nextViewed.delete(cardId);
      const nextStudied = new Set(studiedCardIds);
      nextStudied.delete(cardId);

      const writeResult = saveFlashcards(nextCards);
      saveProgress(nextViewed, nextStudied);

      setFlashcards(nextCards);
      setViewedCardIds(nextViewed);
      setStudiedCardIds(nextStudied);
      setActiveCardIndex((curr) =>
        remainingVisibleCount === 0
          ? 0
          : Math.min(curr, remainingVisibleCount - 1)
      );

      setDeletingCard(null);

      if (!writeResult.ok && writeResult.error) {
        setStorageErrorBanner(writeResult.error);
        pushNotification('error', 'Storage error', writeResult.error);
      } else {
        pushNotification(
          'success',
          'Flashcard deleted',
          'Removed permanently and updated your saved collection.'
        );
      }
    },
    [flashcards, viewedCardIds, studiedCardIds, activeDeckId, pushNotification]
  );

  const handleConfirmResetProgress = useCallback(() => {
    setIsResetModalOpen(false);
    setIsTransitionLoading(true);

    const writeResult = resetStoredProgressAndScores();
    setViewedCardIds(new Set());
    setStudiedCardIds(new Set());
    setQuizScores([]);
    setActiveCardIndex(0);

    window.setTimeout(() => {
      setIsTransitionLoading(false);
    }, 180);

    if (!writeResult.ok && writeResult.error) {
      setStorageErrorBanner(writeResult.error);
      pushNotification('error', 'Reset failed', writeResult.error);
    } else {
      pushNotification(
        'success',
        'Progress reset',
        'Study progress and quiz scores were cleared. Your flashcards remain saved.'
      );
    }
  }, [pushNotification]);

  const handleRestoreSamples = useCallback(() => {
    setIsTransitionLoading(true);
    const writeResult = saveFlashcards(SAMPLE_FLASHCARDS);
    setFlashcards(SAMPLE_FLASHCARDS);
    setActiveDeckId(null);
    setActiveCardIndex(0);
    setViewedCardIds(
      new Set(SAMPLE_FLASHCARDS.length > 0 ? [SAMPLE_FLASHCARDS[0].id] : [])
    );
    setStudiedCardIds(new Set());

    window.setTimeout(() => {
      setIsTransitionLoading(false);
    }, 180);

    if (!writeResult.ok && writeResult.error) {
      setStorageErrorBanner(writeResult.error);
      pushNotification('error', 'Storage error', writeResult.error);
    } else {
      pushNotification(
        'success',
        'Sample flashcards loaded',
        'Restored the starter flashcards to your collection.'
      );
    }
  }, [pushNotification]);

  const handleStudyCard = useCallback(
    (cardId: string) => {
      setActiveDeckId(null);
      const targetIndex = flashcards.findIndex((c) => c.id === cardId);
      setActiveCardIndex(targetIndex >= 0 ? targetIndex : 0);
      handleCardViewed(cardId);
      setActiveSection('study');
    },
    [flashcards, handleCardViewed]
  );

  const handleResetDeckFilter = () => {
    setActiveDeckId(null);
    setActiveCardIndex(0);
  };

  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    if (section === 'home') {
      setActiveDeckId(null);
      setActiveCardIndex(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-lavender-50 dark:bg-[#0E0B1A] text-ink-900 dark:text-[#F4F1FF] transition-colors duration-200">
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Non-blocking Storage Error State Banner */}
        {storageErrorBanner && (
          <div
            role="alert"
            className="mb-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5 text-sm text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{storageErrorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setStorageErrorBanner(null)}
              aria-label="Dismiss error banner"
              className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeSection === 'home' && (
          <div className="space-y-10 sm:space-y-12">
            {/* Welcome Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight text-ink-900 dark:text-[#F4F1FF] leading-[1.12] [text-wrap:balance]">
                  Welcome to FlashLearn
                </h1>
                <p className="mt-2.5 text-base sm:text-lg text-ink-600 dark:text-[#BDB4D6] leading-relaxed">
                  Learn smarter, remember longer.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 shadow-[0_2px_10px_rgba(109,40,217,0.26)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Flashcard</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('quiz')}
                  className="px-4 py-2.5 text-sm font-semibold text-lavender-700 dark:text-lavender-300 bg-lavender-100 dark:bg-lavender-500/15 hover:bg-lavender-200/80 dark:hover:bg-lavender-500/25 active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Start Quiz
                </button>
              </div>
            </header>

            {/* Dashboard Overview Cards */}
            <StatsGrid
              totalFlashcards={totalFlashcards}
              cardsStudied={cardsStudied}
              knownCardsCount={knownCardsCount}
              deckCount={activeDeckCount}
              quizScores={quizScores}
              onRequestResetProgress={() => setIsResetModalOpen(true)}
              isLoading={isTransitionLoading}
            />

            {/* Main Flashcard Study Section */}
            <FlashcardStudySection
              cards={visibleCards}
              activeCardIndex={activeCardIndex}
              onSelectCard={setActiveCardIndex}
              onCardViewed={handleCardViewed}
              onRecordStudy={handleRecordStudy}
              viewedIds={viewedCardIds}
              studiedIds={studiedCardIds}
              variant="dashboard"
              onOpenFullStudy={() => setActiveSection('study')}
              onAddFlashcard={handleOpenAddModal}
              isModalOpen={isAnyModalOpen}
              isLoading={isTransitionLoading}
            />

            {/* Organized My Flashcards Section on Dashboard */}
            <div className="pt-4 border-t border-lavender-200/70 dark:border-[#2A2146]">
              <MyFlashcardsView
                flashcards={flashcards}
                decks={STUDY_DECKS}
                viewedIds={viewedCardIds}
                studiedIds={studiedCardIds}
                onAddFlashcard={handleOpenAddModal}
                onEditFlashcard={handleOpenEditModal}
                onDeleteFlashcard={setDeletingCard}
                onStudyCard={handleStudyCard}
                onRestoreSamples={handleRestoreSamples}
                variant="embedded"
                isLoading={isTransitionLoading}
              />
            </div>
          </div>
        )}

        {activeSection === 'flashcards' && (
          <MyFlashcardsView
            flashcards={flashcards}
            decks={STUDY_DECKS}
            viewedIds={viewedCardIds}
            studiedIds={studiedCardIds}
            onAddFlashcard={handleOpenAddModal}
            onEditFlashcard={handleOpenEditModal}
            onDeleteFlashcard={setDeletingCard}
            onStudyCard={handleStudyCard}
            onRestoreSamples={handleRestoreSamples}
            variant="page"
            isLoading={isTransitionLoading}
          />
        )}

        {activeSection === 'study' && (
          <div className="space-y-8">
            <header className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-[#F4F1FF]">
                  Study Mode
                </h1>
                <p className="mt-2 text-base text-ink-600 dark:text-[#BDB4D6]">
                  Focus on one concept at a time — click the card or press Space to reveal the answer, and use Left/Right arrows to move between cards.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-lavender-700 dark:text-lavender-300 bg-lavender-100 dark:bg-lavender-500/15 hover:bg-lavender-200/80 dark:hover:bg-lavender-500/25 rounded-xl transition-colors duration-150 whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Flashcard</span>
              </button>
            </header>

            <FlashcardStudySection
              cards={visibleCards}
              activeCardIndex={activeCardIndex}
              onSelectCard={setActiveCardIndex}
              onCardViewed={handleCardViewed}
              onRecordStudy={handleRecordStudy}
              viewedIds={viewedCardIds}
              studiedIds={studiedCardIds}
              variant="focused"
              activeDeckTitle={activeDeckTitle}
              onResetDeckFilter={activeDeckId ? handleResetDeckFilter : undefined}
              onAddFlashcard={handleOpenAddModal}
              isModalOpen={isAnyModalOpen}
              isLoading={isTransitionLoading}
            />
          </div>
        )}

        {activeSection === 'quiz' && (
          <QuizModeView
            flashcards={flashcards}
            decks={STUDY_DECKS}
            quizScores={quizScores}
            onAddFlashcard={handleOpenAddModal}
            onAnswerCorrect={handleQuizAnswerCorrect}
            onQuizComplete={handleQuizComplete}
          />
        )}
      </main>

      <footer className="border-t border-lavender-200/70 dark:border-[#2A2146] bg-white/70 dark:bg-[#130E24]/80 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-400 dark:text-[#8E84AE]">
          <p>FlashLearn · Learn smarter, remember longer.</p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className="hover:text-lavender-700 dark:hover:text-lavender-300 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('flashcards')}
              className="hover:text-lavender-700 dark:hover:text-lavender-300 transition-colors cursor-pointer"
            >
              My Flashcards
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('study')}
              className="hover:text-lavender-700 dark:hover:text-lavender-300 transition-colors cursor-pointer"
            >
              Study Mode
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('quiz')}
              className="hover:text-lavender-700 dark:hover:text-lavender-300 transition-colors cursor-pointer"
            >
              Quiz Mode
            </button>
          </div>
        </div>
      </footer>

      {/* Add / Edit Flashcard Modal */}
      <FlashcardFormModal
        isOpen={isFormModalOpen}
        editingCard={editingCard}
        existingCards={flashcards}
        decks={STUDY_DECKS}
        onClose={handleCloseFormModal}
        onSave={handleSaveFlashcard}
        onValidationError={handleValidationError}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmModal
        card={deletingCard}
        onCancel={() => setDeletingCard(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Reset Progress Confirmation Dialog */}
      <ResetProgressModal
        isOpen={isResetModalOpen}
        studiedCount={cardsStudied}
        quizSessionsCount={quizScores.length}
        onCancel={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmResetProgress}
      />

      {/* Success & Error Notifications */}
      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
