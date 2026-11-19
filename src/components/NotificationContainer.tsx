import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { ToastNotification } from '../types/flashcard';

interface NotificationContainerProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

export function NotificationContainer({
  notifications,
  onDismiss,
}: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 w-[calc(100vw-2.5rem)] max-w-sm pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map((item) => {
        const isSuccess = item.type === 'success';
        return (
          <div
            key={item.id}
            role={isSuccess ? 'status' : 'alert'}
            className={`pointer-events-auto bg-white dark:bg-[#1C1633] rounded-2xl border p-4 shadow-[0_12px_32px_rgba(46,16,101,0.14)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)] flex items-start gap-3 flashcard-enter ${
              isSuccess
                ? 'border-emerald-200 dark:border-emerald-500/40'
                : 'border-rose-200 dark:border-rose-500/40'
            }`}
          >
            <div
              className={`mt-0.5 shrink-0 ${
                isSuccess
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
              aria-hidden="true"
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-900 dark:text-[#F4F1FF]">
                {item.title}
              </p>
              <p className="mt-0.5 text-xs sm:text-sm text-ink-600 dark:text-[#BDB4D6] leading-snug">
                {item.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(item.id)}
              aria-label="Dismiss notification"
              className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-ink-400 dark:text-[#988EB8] hover:text-ink-900 dark:hover:text-white hover:bg-lavender-100/70 dark:hover:bg-[#2A2248] transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
