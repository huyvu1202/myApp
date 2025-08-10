// Basic types
type Language = 'ja' | 'en' | 'vi'; // Japanese, English, Vietnamese
type FlashcardType = 'vocabulary' | 'kanji' | 'sentence';

// A generic flashcard
interface FlashcardBase {
  id: string;
  type: FlashcardType;
  tags?: string[]; // e.g., ["JLPT N5", "greetings"]
  createdAt: string; // ISO timestamp
  updatedAt?: string;
}

// Vocabulary flashcard
interface VocabFlashcard extends FlashcardBase {
  type: 'vocabulary';
  word: string; // e.g., "食べる"
  reading: string; // e.g., "たべる"
  meaning: string; // e.g., "to eat"
  exampleSentence?: {
    ja: string;
    en?: string;
    vi?: string;
  };
}

// Kanji flashcard
interface KanjiFlashcard extends FlashcardBase {
  type: 'kanji';
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  meaning: string;
  strokes: number;
  radicals?: string[];
  exampleWords?: string[]; // ["食べる", "食堂"]
}

// Sentence flashcard (for grammar or listening practice)
interface SentenceFlashcard extends FlashcardBase {
  type: 'sentence';
  sentence: {
    ja: string;
    en?: string;
    vi?: string;
  };
  grammarPoints?: string[];
  audioUrl?: string;
}

// Union type for all flashcards
type Flashcard = VocabFlashcard;

// Optional: for managing study sessions
interface FlashcardStudyStatus {
  cardId: string;
  lastReviewed: string; // ISO date
  nextReview: string;   // spaced repetition
  easeFactor: number;   // for SM2 algorithm
  correctStreak: number;
}
