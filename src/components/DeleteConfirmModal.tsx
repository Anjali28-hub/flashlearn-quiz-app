import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';
import { Flashcard } from '../types/flashcard';

interface DeleteConfirmModalProps {
  card: Flashcard | null;
  onCancel: () => void;
  onConfirm: (cardId: string) => void;
}

export function DeleteConfirmModal({
  card,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!card) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [card, onCancel]);

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 dark:bg-black/70 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#17122B] rounded-3xl border border-lavender-200 dark:border-[#2F2650] shadow-[0_24px_60px_rgba(46,16,101,0.22)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] p-6 sm:p-7 modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close confirmation dialog"
            className="w-9 h-9 rounded-xl inline-flex items-center justify-center text-ink-400 dark:text-[#988EB8] hover:text-ink-900 dark:hover:text-white hover:bg-lavender-100/70 dark:hover:bg-[#241D3E] transition-colors duration-150 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2
          id="delete-modal-title"
          className="mt-4 font-display text-lg sm:text-xl font-bold text-ink-900 dark:text-[#F4F1FF]"
        >
          Delete this flashcard?
        </h2>
        <p
          id="delete-modal-description"
          className="mt-2 text-sm text-ink-600 dark:text-[#BDB4D6] leading-relaxed"
        >
          This flashcard will be permanently removed from your collection and dashboard progress.
        </p>

        <div className="mt-4 pt-3.5 border-t border-lavender-100 dark:border-[#2B2347]">
          <p className="text-xs text-ink-400 dark:text-[#988EB8]">
            {card.deckName} · {card.topic}
          </p>
          <p className="mt-1 text-sm font-medium text-ink-900 dark:text-[#F4F1FF] line-clamp-2">
            {card.question}
          </p>
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
            onClick={() => onConfirm(card.id)}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap shadow-[0_2px_8px_rgba(225,29,72,0.25)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          >
            Delete Flashcard
          </button>
        </div>
      </div>
    </div>
  );
}
