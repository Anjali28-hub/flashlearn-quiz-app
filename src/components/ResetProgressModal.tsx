import { RotateCcw, X } from 'lucide-react';
import { useEffect } from 'react';

interface ResetProgressModalProps {
  isOpen: boolean;
  studiedCount: number;
  quizSessionsCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetProgressModal({
  isOpen,
  studiedCount,
  quizSessionsCount,
  onCancel,
  onConfirm,
}: ResetProgressModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 dark:bg-black/70 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-progress-title"
      aria-describedby="reset-progress-description"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200 dark:border-[#2F2650] shadow-[0_24px_60px_rgba(46,16,101,0.22)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] p-6 sm:p-7 modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close reset confirmation"
            className="w-9 h-9 rounded-xl inline-flex items-center justify-center text-ink-400 dark:text-[#988EB8] hover:text-ink-900 dark:hover:text-white hover:bg-lavender-100/70 dark:hover:bg-[#241D3E] transition-colors duration-150 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2
          id="reset-progress-title"
          className="mt-4 font-display text-lg sm:text-xl font-bold text-ink-900 dark:text-[#F4F1FF]"
        >
          Reset study progress?
        </h2>
        <p
          id="reset-progress-description"
          className="mt-2 text-sm text-ink-600 dark:text-[#BDB4D6] leading-relaxed"
        >
          This clears your studied cards, mastered status, and saved quiz history. Your flashcards themselves will stay intact.
        </p>

        <div className="mt-4 pt-3.5 border-t border-lavender-100 dark:border-[#2B2347] flex items-center justify-between text-xs text-ink-400 dark:text-[#988EB8] font-mono tabular-nums">
          <span>{studiedCount} cards studied</span>
          <span>
            {quizSessionsCount} saved {quizSessionsCount === 1 ? 'quiz' : 'quizzes'}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-ink-600 dark:text-[#CFC7E6] hover:text-ink-900 dark:hover:text-white bg-white dark:bg-[#1E1836] hover:bg-lavender-50 dark:hover:bg-[#272044] border border-lavender-200 dark:border-[#342B58] rounded-xl transition-colors duration-150 whitespace-nowrap cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.99] rounded-xl transition-all duration-150 whitespace-nowrap shadow-[0_2px_8px_rgba(225,29,72,0.25)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}
