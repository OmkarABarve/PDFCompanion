// Request payload sent to the Gemini API
export interface ExplainRequest {
  text: string;
  prevContext: string;
  nextContext: string;
  pdfId: string;
}

// A single saved explanation / note
export interface Explanation {
  id: string;
  selectedText: string;
  explanation: string;
  page: number;
  timestamp: number; // epoch ms – serialisable, unlike Date
  relatedTerms: string[];
}

// Zustand store shape
export interface PdfState {
  // PDF document state (pdfUrl is transient, not persisted)
  pdfUrl: string | null;
  pdfName: string | null;
  currentPage: number;
  totalPages: number;
  zoom: number;

  // Explanation workflow
  selectedText: string | null;
  currentExplanation: string | null;
  isExplaining: boolean;
  explanations: Explanation[];

  // UI state
  isSidebarOpen: boolean;
  isDarkMode: boolean;

  // Actions
  setPdf: (file: File) => void;
  resetPdf: () => void;
  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedText: (text: string | null) => void;
  setCurrentExplanation: (text: string | null) => void;
  setIsExplaining: (v: boolean) => void;
  addExplanation: (exp: Explanation) => void;
  deleteExplanation: (id: string) => void;
  clearExplanations: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
}
