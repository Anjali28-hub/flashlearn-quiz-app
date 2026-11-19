# FlashLearn

**Learn smarter, remember longer.**

FlashLearn is a modern, responsive flashcard study and multiple-choice quiz web application built with React, TypeScript, Tailwind CSS, and browser LocalStorage persistence.

---

## Features

### Dashboard & Progress Analytics
- **Live Overview Metrics**: Dynamically tracks **Total Flashcards**, **Cards Studied**, **Quiz Accuracy**, and **Study Progress** with a visual progress bar.
- **Reset Progress**: Clear study progress and quiz score history with a confirmation dialog while preserving all saved flashcards.
- **Light & Dark Mode**: Built-in theme toggle persisted across sessions without initial load flicker.

### Interactive Flashcard Study
- **3D Flip Animation**: Click any flashcard or use the **Show Answer** / **Show Question** button to smoothly flip between the question and answer sides.
- **Optional Hints & Self-Check**: Reveal optional hints on the front face and mark cards as **Known** after checking the answer.
- **Bounded Navigation & Viewed Progress**: Step cleanly through cards with **Previous** and **Next** controls (automatically disabled on the first and last cards) alongside a live viewed progress bar and clickable **Study Queue**.
- **Keyboard Shortcuts**:
  - `Left Arrow` — Previous card
  - `Right Arrow` — Next card
  - `Spacebar` — Flip the active card

### Flashcard Management (CRUD)
- **Add & Edit Flashcards**: Clean modal form with required field validation, duplicate question prevention, category assignment, difficulty level, and optional topic/hint fields.
- **Delete with Confirmation**: Confirmation dialog displaying the selected card before permanent deletion, immediately updating dashboard statistics.
- **Search & Category Filters**: Filter flashcards by **Science**, **Technology**, **History**, or **General Knowledge**, search live by question, and switch between **Grid** and **List** views.

### Interactive Quiz Mode
- **Dynamic Quiz Generation**: Builds shuffled 4-option multiple-choice questions directly from your saved flashcards using other flashcard answers as distractors—no external API required.
- **Instant Feedback**: Highlights the correct answer in green and any incorrect selection in red with clear icons, text labels, and a running score.
- **Final Results & Score History**: Summarizes **Total Questions**, **Correct Answers**, **Incorrect Answers**, and **Final Percentage**, includes a question-by-question **Answer Review**, saves completed runs to **Recent Quiz Scores**, and supports instant reshuffled restarts.

### LocalStorage Persistence
All user data persists automatically in the browser with JSON validation and error recovery:
- `flashlearn_cards` — Saved flashcards (seeds starter sample cards only on first visit; preserves empty decks if all cards are deleted).
- `flashlearn_progress` — Viewed and mastered card IDs.
- `flashlearn_scores` — Completed quiz score history.
- `flashlearn_theme` — Selected light/dark theme preference.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage API

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation & Development

```bash
# Install dependencies
npm install

# Start the development server on http://localhost:3000
npm run dev
```

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server on port 3000 |
| `npm run build` | Builds the production bundle to `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |

---

## Project Structure

```text
├── index.html
├── src/
│   ├── App.tsx                           # Main layout, navigation, state & persistence wiring
│   ├── index.css                         # Tailwind v4 theme tokens, dark variant & 3D flip styles
│   ├── components/
│   │   ├── Navbar.tsx                    # Top navigation bar, theme toggle & mobile drawer
│   │   ├── StatsGrid.tsx                 # Dynamic dashboard statistics & Reset Progress trigger
│   │   ├── FlashcardStudySection.tsx     # 3D flippable card stage, keyboard nav & Study Queue
│   │   ├── MyFlashcardsView.tsx          # Searchable, filterable card library (Grid/List)
│   │   ├── QuizModeView.tsx              # Dynamic multiple-choice quiz, results & score history
│   │   ├── FlashcardFormModal.tsx        # Add/Edit flashcard modal with validation
│   │   ├── DeleteConfirmModal.tsx        # Delete confirmation dialog
│   │   ├── ResetProgressModal.tsx        # Reset progress confirmation dialog
│   │   └── NotificationContainer.tsx     # Success & error toast notifications
│   ├── data/
│   │   └── sampleCards.ts                # Starter categories and sample flashcards
│   ├── types/
│   │   └── flashcard.ts                  # TypeScript interfaces
│   └── utils/
│       ├── quizGenerator.ts              # Fisher-Yates shuffling & distractor option generator
│       └── storage.ts                    # LocalStorage read/write helpers & recovery logic
└── package.json
```
