import { AlertCircle, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Flashcard, FlashcardFormValues, StudyDeck } from '../types/flashcard';

interface FlashcardFormModalProps {
  isOpen: boolean;
  editingCard: Flashcard | null;
  existingCards: Flashcard[];
  decks: StudyDeck[];
  onClose: () => void;
  onSave: (values: FlashcardFormValues, editingCardId?: string) => void;
  onValidationError: (message: string) => void;
}

interface FormErrors {
  question?: string;
  answer?: string;
}

export function FlashcardFormModal({
  isOpen,
  editingCard,
  existingCards,
  decks,
  onClose,
  onSave,
  onValidationError,
}: FlashcardFormModalProps) {
  const defaultDeckId = decks[0]?.id ?? 'biology-foundations';

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [deckId, setDeckId] = useState(defaultDeckId);
  const [topic, setTopic] = useState('');
  const [hint, setHint] = useState('');
  const [difficulty, setDifficulty] =
    useState<FlashcardFormValues['difficulty']>('Foundational');
  const [errors, setErrors] = useState<FormErrors>({});

  const questionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    hasSubmittedRef.current = false;

    if (editingCard) {
      setQuestion(editingCard.question);
      setAnswer(editingCard.answer);
      const validDeckId = decks.some((d) => d.id === editingCard.deckId)
        ? editingCard.deckId
        : defaultDeckId;
      setDeckId(validDeckId);
      setTopic(editingCard.topic);
      setHint(editingCard.hint);
      setDifficulty(editingCard.difficulty);
    } else {
      setQuestion('');
      setAnswer('');
      setDeckId(defaultDeckId);
      setTopic('');
      setHint('');
      setDifficulty('Foundational');
    }
    setErrors({});

    const timer = window.setTimeout(() => {
      questionInputRef.current?.focus();
    }, 40);

    return () => window.clearTimeout(timer);
  }, [isOpen, editingCard, decks, defaultDeckId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (hasSubmittedRef.current) return;

    const trimmedQuestion = question.trim();
    const trimmedAnswer = answer.trim();
    const nextErrors: FormErrors = {};

    if (!trimmedQuestion) {
      nextErrors.question = 'Please enter a question for the front of the card.';
    } else {
      const normalizedQuestion = trimmedQuestion.toLowerCase();
      const duplicateExists = existingCards.some(
        (card) =>
          card.id !== editingCard?.id &&
          card.question.trim().toLowerCase() === normalizedQuestion
      );
      if (duplicateExists) {
        nextErrors.question = 'A flashcard with this exact question already exists.';
      }
    }

    if (!trimmedAnswer) {
      nextErrors.answer = 'Please enter an answer for the back of the card.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const message =
        nextErrors.question && nextErrors.answer
          ? 'Both question and answer fields are required.'
          : nextErrors.question ?? nextErrors.answer ?? 'Please check the form fields.';
      onValidationError(message);
      return;
    }

    hasSubmittedRef.current = true;
    const selectedDeck = decks.find((d) => d.id === deckId);

    onSave(
      {
        question: trimmedQuestion,
        answer: trimmedAnswer,
        deckId,
        topic: topic.trim() || selectedDeck?.category || 'General Knowledge',
        hint: hint.trim(),
        difficulty,
      },
      editingCard?.id
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 dark:bg-black/70 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flashcard-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200 dark:border-[#2F2650] shadow-[0_24px_60px_rgba(46,16,101,0.22)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 sm:px-7 py-5 border-b border-lavender-100 dark:border-[#2B2347] flex items-center justify-between gap-4">
          <div>
            <h2
              id="flashcard-modal-title"
              className="font-display text-xl font-bold text-ink-900 dark:text-[#F4F1FF]"
            >
              {editingCard ? 'Edit Flashcard' : 'Add Flashcard'}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-ink-600 dark:text-[#BDB4D6]">
              {editingCard
                ? 'Update the question, answer, or category for this card.'
                : 'Create a new question-and-answer card for your study collection.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-10 h-10 rounded-xl inline-flex items-center justify-center text-ink-400 dark:text-[#988EB8] hover:text-ink-900 dark:hover:text-white hover:bg-lavender-100/70 dark:hover:bg-[#241D3E] transition-colors duration-150 shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-lavender-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-7 space-y-5">
          {/* Question Field */}
          <div>
            <label
              htmlFor="flashcard-question"
              className="block text-sm font-semibold text-ink-900 dark:text-[#F4F1FF] mb-1.5"
            >
              Question <span className="text-lavender-600 dark:text-lavender-400">*</span>
            </label>
            <textarea
              ref={questionInputRef}
              id="flashcard-question"
              rows={3}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (errors.question) {
                  setErrors((prev) => ({ ...prev, question: undefined }));
                }
              }}
              placeholder="e.g., What is the difference between active recall and passive review?"
              aria-invalid={Boolean(errors.question)}
              aria-describedby={errors.question ? 'question-error' : undefined}
              className={`w-full px-4 py-3 text-sm bg-lavender-50/40 dark:bg-[#100C20] border rounded-2xl text-ink-900 dark:text-[#F4F1FF] placeholder:text-ink-400 dark:placeholder:text-[#7E74A0] focus:outline-none focus:bg-white dark:focus:bg-[#130E26] focus:ring-2 transition-all duration-150 resize-none ${
                errors.question
                  ? 'border-rose-400 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-900/50'
                  : 'border-lavender-200 dark:border-[#322954] focus:border-lavender-500 focus:ring-lavender-200 dark:focus:ring-lavender-500/30'
              }`}
            />
            {errors.question && (
              <p
                id="question-error"
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.question}</span>
              </p>
            )}
          </div>

          {/* Answer Field */}
          <div>
            <label
              htmlFor="flashcard-answer"
              className="block text-sm font-semibold text-ink-900 dark:text-[#F4F1FF] mb-1.5"
            >
              Answer <span className="text-lavender-600 dark:text-lavender-400">*</span>
            </label>
            <textarea
              id="flashcard-answer"
              rows={3}
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (errors.answer) {
                  setErrors((prev) => ({ ...prev, answer: undefined }));
                }
              }}
              placeholder="Write a concise, clear explanation for the back of the card..."
              aria-invalid={Boolean(errors.answer)}
              aria-describedby={errors.answer ? 'answer-error' : undefined}
              className={`w-full px-4 py-3 text-sm bg-lavender-50/40 dark:bg-[#100C20] border rounded-2xl text-ink-900 dark:text-[#F4F1FF] placeholder:text-ink-400 dark:placeholder:text-[#7E74A0] focus:outline-none focus:bg-white dark:focus:bg-[#130E26] focus:ring-2 transition-all duration-150 resize-none ${
                errors.answer
                  ? 'border-rose-400 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-900/50'
                  : 'border-lavender-200 dark:border-[#322954] focus:border-lavender-500 focus:ring-lavender-200 dark:focus:ring-lavender-500/30'
              }`}
            />
            {errors.answer && (
              <p
                id="answer-error"
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.answer}</span>
              </p>
            )}
          </div>

          {/* Category & Difficulty Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="flashcard-deck"
                className="block text-xs font-semibold text-ink-600 dark:text-[#BDB4D6] mb-1.5"
              >
                Category
              </label>
              <select
                id="flashcard-deck"
                value={deckId}
                onChange={(e) => setDeckId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-lavender-50/40 dark:bg-[#100C20] border border-lavender-200 dark:border-[#322954] rounded-xl text-ink-900 dark:text-[#F4F1FF] focus:outline-none focus:bg-white dark:focus:bg-[#130E26] focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 dark:focus:ring-lavender-500/30 transition-all duration-150"
              >
                {decks.map((deck) => (
                  <option
                    key={deck.id}
                    value={deck.id}
                    className="bg-white dark:bg-[#17122B] text-ink-900 dark:text-[#F4F1FF]"
                  >
                    {deck.category} — {deck.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="flashcard-difficulty"
                className="block text-xs font-semibold text-ink-600 dark:text-[#BDB4D6] mb-1.5"
              >
                Difficulty
              </label>
              <select
                id="flashcard-difficulty"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(
                    e.target.value as FlashcardFormValues['difficulty']
                  )
                }
                className="w-full px-3.5 py-2.5 text-sm bg-lavender-50/40 dark:bg-[#100C20] border border-lavender-200 dark:border-[#322954] rounded-xl text-ink-900 dark:text-[#F4F1FF] focus:outline-none focus:bg-white dark:focus:bg-[#130E26] focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 dark:focus:ring-lavender-500/30 transition-all duration-150"
              >
                <option
                  value="Foundational"
                  className="bg-white dark:bg-[#17122B] text-ink-900 dark:text-[#F4F1FF]"
                >
                  Foundational
                </option>
                <option
                  value="Intermediate"
                  className="bg-white dark:bg-[#17122B] text-ink-900 dark:text-[#F4F1FF]"
                >
                  Intermediate
                </option>
                <option
                  value="Advanced"
                  className="bg-white dark:bg-[#17122B] text-ink-900 dark:text-[#F4F1FF]"
                >
                  Advanced
                </option>
              </select>
            </div>
          </div>

          {/* Optional Topic & Hint Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="flashcard-topic"
                className="block text-xs font-semibold text-ink-600 dark:text-[#BDB4D6] mb-1.5"
              >
                Topic (optional)
              </label>
              <input
                id="flashcard-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Memory Systems"
                className="w-full px-3.5 py-2.5 text-sm bg-lavender-50/40 dark:bg-[#100C20] border border-lavender-200 dark:border-[#322954] rounded-xl text-ink-900 dark:text-[#F4F1FF] placeholder:text-ink-400 dark:placeholder:text-[#7E74A0] focus:outline-none focus:bg-white dark:focus:bg-[#130E26] focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 dark:focus:ring-lavender-500/30 transition-all duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="flashcard-hint"
                className="block text-xs font-semibold text-ink-600 dark:text-[#BDB4D6] mb-1.5"
              >
                Hint (optional)
              </label>
              <input
                id="flashcard-hint"
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Short memory cue..."
                className="w-full px-3.5 py-2.5 text-sm bg-lavender-50/40 dark:bg-[#100C20] border border-lavender-200 dark:border-[#322954] rounded-xl text-ink-900 dark:text-[#F4F1FF] placeholder:text-ink-400 dark:placeholder:text-[#7E74A0] focus:outline-none focus:bg-white dark:focus:bg-[#130E26] focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 dark:focus:ring-lavender-500/30 transition-all duration-150"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-lavender-100 dark:border-[#2B2347] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-ink-600 dark:text-[#CFC7E6] hover:text-ink-900 dark:hover:text-white bg-white dark:bg-[#1E1836] hover:bg-lavender-50 dark:hover:bg-[#272044] border border-lavender-200 dark:border-[#342B58] rounded-xl transition-colors duration-150 whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap shadow-[0_2px_10px_rgba(109,40,217,0.28)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400"
            >
              {editingCard ? 'Save Changes' : 'Save Flashcard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
