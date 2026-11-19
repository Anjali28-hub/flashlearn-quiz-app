import { Flashcard, QuizQuestion, StudyDeck } from '../types/flashcard';

export const STUDY_DECKS: StudyDeck[] = [
  {
    id: 'biology-foundations',
    title: 'Cellular Biology & Life Sciences',
    category: 'Science',
    description: 'Organelle functions, metabolic pathways, and membrane transport.',
    cardCount: 18,
    masteredCount: 11,
    lastStudied: 'Today',
  },
  {
    id: 'web-engineering',
    title: 'Modern Web & Computing',
    category: 'Technology',
    description: 'Rendering pipelines, HTTP caching headers, and accessibility standards.',
    cardCount: 14,
    masteredCount: 10,
    lastStudied: 'Yesterday',
  },
  {
    id: 'world-history',
    title: 'Modern World History',
    category: 'History',
    description: 'Key treaties, industrial milestones, and cultural movements since 1750.',
    cardCount: 12,
    masteredCount: 9,
    lastStudied: '2 days ago',
  },
  {
    id: 'cognitive-science',
    title: 'Memory & Everyday Reasoning',
    category: 'General Knowledge',
    description: 'Core principles of learning, active recall, spacing, and working memory.',
    cardCount: 16,
    masteredCount: 12,
    lastStudied: 'Today',
  },
];

export const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: 'card-1',
    deckId: 'cognitive-science',
    deckName: 'Memory & Cognitive Science',
    topic: 'Spaced Repetition',
    question: 'What is the Spacing Effect in human memory research?',
    answer:
      'Long-term retention improves significantly when study sessions are distributed over increasing intervals of time rather than massed into a single session.',
    hint: 'Think about reviewing material across multiple days instead of cramming overnight.',
    difficulty: 'Foundational',
  },
  {
    id: 'card-2',
    deckId: 'cognitive-science',
    deckName: 'Memory & Cognitive Science',
    topic: 'Active Recall',
    question: 'Why does retrieving an answer from memory outperform passive re-reading?',
    answer:
      'Retrieval practice strengthens neural recall pathways and exposes knowledge gaps, creating durable memory traces known as the testing effect.',
    hint: 'Consider what happens when you close the textbook and explain a concept aloud.',
    difficulty: 'Foundational',
  },
  {
    id: 'card-3',
    deckId: 'web-engineering',
    deckName: 'Modern Web Architecture',
    topic: 'Browser Performance',
    question: 'Which CSS properties can browsers animate on the compositor thread without triggering layout reflow?',
    answer:
      'Transform, opacity, and filter can be animated directly on the GPU compositor layer, avoiding costly layout recalculations and repaints.',
    hint: 'Two of these properties change visual position or transparency without altering box geometry.',
    difficulty: 'Intermediate',
  },
  {
    id: 'card-4',
    deckId: 'web-engineering',
    deckName: 'Modern Web Architecture',
    topic: 'Accessibility',
    question: 'What minimum color contrast ratio does WCAG AA require for standard body text?',
    answer:
      'WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt regular or 14pt bold).',
    hint: 'It is a ratio between 4 and 5 to 1 for regular paragraph text.',
    difficulty: 'Foundational',
  },
  {
    id: 'card-5',
    deckId: 'biology-foundations',
    deckName: 'Cellular Biology Essentials',
    topic: 'Cell Energetics',
    question: 'What primary role does ATP synthase play across the inner mitochondrial membrane?',
    answer:
      'It harnesses the proton gradient created by the electron transport chain to phosphorylate ADP into ATP, supplying usable chemical energy for the cell.',
    hint: 'Look at the enzyme name: it synthesizes the universal cellular energy molecule.',
    difficulty: 'Intermediate',
  },
  {
    id: 'card-6',
    deckId: 'world-history',
    deckName: 'Modern World History',
    topic: 'Industrial Era',
    question: 'How did the Bessemer process transform nineteenth-century infrastructure?',
    answer:
      'By blowing air through molten iron to remove impurities, it enabled inexpensive mass production of steel for railways, bridges, and urban frameworks.',
    hint: 'It made a crucial structural alloy fast and affordable to produce at scale.',
    difficulty: 'Intermediate',
  },
  {
    id: 'card-7',
    deckId: 'cognitive-science',
    deckName: 'Memory & Cognitive Science',
    topic: 'Working Memory',
    question: 'What is chunking and how does it expand effective working memory capacity?',
    answer:
      'Chunking groups individual pieces of information into larger meaningful units, allowing the brain to hold and process more data within working memory limits.',
    hint: 'Think about how phone numbers are broken into three short groups rather than ten single digits.',
    difficulty: 'Foundational',
  },
  {
    id: 'card-8',
    deckId: 'web-engineering',
    deckName: 'Modern Web Architecture',
    topic: 'HTTP Caching',
    question: 'What is the difference between Cache-Control max-age and ETag validation?',
    answer:
      'max-age defines how long a response stays fresh without contacting the server, while ETag lets the browser validate whether a stale resource actually changed via a lightweight conditional request.',
    hint: 'One avoids network requests entirely for a duration; the other checks a version fingerprint.',
    difficulty: 'Advanced',
  },
  {
    id: 'card-9',
    deckId: 'biology-foundations',
    deckName: 'Cellular Biology Essentials',
    topic: 'Membrane Transport',
    question: 'How does active transport differ from facilitated diffusion across a cell membrane?',
    answer:
      'Active transport uses cellular energy (usually ATP) to move solutes against their concentration gradient, whereas facilitated diffusion moves solutes down their gradient passively through carrier proteins.',
    hint: 'Compare which direction solutes travel relative to their concentration gradient and whether energy is required.',
    difficulty: 'Foundational',
  },
  {
    id: 'card-10',
    deckId: 'world-history',
    deckName: 'Modern World History',
    topic: 'Global Diplomacy',
    question: 'What core economic goal guided the 1944 Bretton Woods Conference?',
    answer:
      'Delegates established stable international exchange rates and created institutions like the IMF and World Bank to prevent competitive devaluations and support postwar reconstruction.',
    hint: 'Focus on postwar monetary stability and international financial institutions.',
    difficulty: 'Intermediate',
  },
];

export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'quiz-1',
    topic: 'Cognitive Science',
    prompt: 'Which study technique strengthens long-term retention by forcing the brain to pull information without cues?',
    options: [
      'Highlighting key paragraphs repeatedly',
      'Active recall with spaced intervals',
      'Copying textbook definitions verbatim',
      'Listening to recorded lectures at double speed',
    ],
    correctIndex: 1,
    explanation:
      'Active recall combined with spaced intervals engages retrieval pathways and consistently outperforms passive review strategies.',
  },
  {
    id: 'quiz-2',
    topic: 'Web Architecture',
    prompt: 'Which HTTP status code indicates that a cached resource has not been modified since the last request?',
    options: ['200 OK', '204 No Content', '304 Not Modified', '412 Precondition Failed'],
    correctIndex: 2,
    explanation:
      '304 Not Modified tells the client that its cached representation is still fresh, saving bandwidth by omitting the response body.',
  },
  {
    id: 'quiz-3',
    topic: 'Cellular Biology',
    prompt: 'Where in a eukaryotic cell does glycolysis take place?',
    options: ['Mitochondrial matrix', 'Cytoplasm (cytosol)', 'Golgi apparatus', 'Rough endoplasmic reticulum'],
    correctIndex: 1,
    explanation:
      'Glycolysis occurs in the cytosol and does not require oxygen, breaking glucose into two molecules of pyruvate.',
  },
];
