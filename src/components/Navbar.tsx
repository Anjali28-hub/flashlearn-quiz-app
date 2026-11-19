import { Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { NavSection } from '../types/flashcard';
import { ThemeMode } from '../utils/storage';

interface NavbarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'flashcards', label: 'My Flashcards' },
  { id: 'study', label: 'Study Mode' },
  { id: 'quiz', label: 'Quiz Mode' },
];

export function Navbar({
  activeSection,
  onNavigate,
  theme,
  onToggleTheme,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (section: NavSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#130E24]/95 backdrop-blur-md border-b border-lavender-200/80 dark:border-[#2A2146] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand mark + single-line wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400 cursor-pointer group"
          aria-label="FlashLearn Home"
        >
          <span
            className="w-8 h-8 rounded-lg bg-lavender-600 group-hover:bg-lavender-700 flex items-center justify-center shadow-[0_2px_10px_rgba(109,40,217,0.3)] transition-all duration-150 group-hover:scale-[1.03]"
            aria-hidden="true"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="6"
                width="14"
                height="14"
                rx="3"
                fill="#DDD6FE"
                fillOpacity="0.45"
              />
              <rect x="7" y="4" width="14" height="14" rx="3" fill="#FFFFFF" />
              <path
                d="M14.7 7.5L11.5 11.4H14L13.3 14.5L16.5 10.6H14L14.7 7.5Z"
                fill="#6D28D9"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink-900 dark:text-[#F4F1FF]">
            FlashLearn
          </span>
        </button>

        {/* Zone 2: Clean single-line text navigation */}
        <nav
          className="hidden md:flex items-center gap-7"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400 rounded ${
                  isActive
                    ? 'text-lavender-700 dark:text-lavender-300'
                    : 'text-ink-600 dark:text-[#BDB4D6] hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 right-0 -bottom-[13px] h-0.5 rounded-full transition-opacity duration-150 ${
                    isActive
                      ? 'bg-lavender-600 dark:bg-lavender-400 opacity-100'
                      : 'bg-lavender-300 opacity-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Theme toggle + primary action + mobile menu */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-ink-600 dark:text-[#CFC7E6] bg-lavender-50 dark:bg-[#1E1736] hover:bg-lavender-100 dark:hover:bg-[#29204A] border border-lavender-200/80 dark:border-[#332956] transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400"
          >
            {isDark ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              handleSelect(activeSection === 'study' ? 'quiz' : 'study')
            }
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 shadow-[0_2px_10px_rgba(109,40,217,0.26)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600 dark:focus-visible:outline-lavender-400"
          >
            {activeSection === 'study' ? 'Take a Quiz' : 'Start Studying'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-ink-600 dark:text-[#CFC7E6] hover:text-ink-900 dark:hover:text-white hover:bg-lavender-100/80 dark:hover:bg-[#241D3E] transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-lavender-600"
            aria-expanded={mobileMenuOpen}
            aria-label={
              mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-lavender-200/80 dark:border-[#2A2146] bg-white dark:bg-[#130E24] px-4 py-3">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-lavender-100 dark:bg-lavender-500/20 text-lavender-700 dark:text-lavender-300 font-semibold'
                      : 'text-ink-600 dark:text-[#BDB4D6] hover:bg-lavender-50 dark:hover:bg-[#1D1635] hover:text-ink-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="pt-2 mt-1 border-t border-lavender-100 dark:border-[#2A2146] sm:hidden">
              <button
                type="button"
                onClick={() =>
                  handleSelect(activeSection === 'study' ? 'quiz' : 'study')
                }
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 rounded-xl transition-colors duration-150 cursor-pointer"
              >
                {activeSection === 'study' ? 'Take a Quiz' : 'Start Studying'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
