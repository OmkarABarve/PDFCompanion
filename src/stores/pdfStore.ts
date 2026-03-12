import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import type { Explanation, PdfState } from '../lib/types';

// IndexedDB-backed storage adapter for Zustand persist middleware
const idbStorage: StateStorage = {
  getItem: async (name: string) => {
    const val = await idbGet<string>(name);
    return val ?? null;
  },
  setItem: async (name: string, value: string) => {
    await idbSet(name, value);
  },
  removeItem: async (name: string) => {
    await idbDel(name);
  },
};

export const usePdfStore = create<PdfState>()(
  persist(
    (set) => ({
      // --- PDF document state ---
      pdfUrl: null,
      pdfName: null,
      currentPage: 1,
      totalPages: 0,
      zoom: 1.0,

      // --- Explanation workflow ---
      selectedText: null,
      currentExplanation: null,
      isExplaining: false,
      explanations: [] as Explanation[],

      // --- UI ---
      isSidebarOpen: false,
      isDarkMode: true, // dark by default per spec

      // --- Actions ---
      setPdf: (file: File) =>
        set({
          pdfUrl: URL.createObjectURL(file),
          pdfName: file.name,
          currentPage: 1,
          totalPages: 0,
          explanations: [],
        }),

      resetPdf: () =>
        set((state) => {
          // Revoke the old blob URL to free memory
          if (state.pdfUrl) URL.revokeObjectURL(state.pdfUrl);
          return {
            pdfUrl: null,
            pdfName: null,
            currentPage: 1,
            totalPages: 0,
            explanations: [],
            selectedText: null,
            currentExplanation: null,
            isSidebarOpen: false,
          };
        }),

      setPage: (page: number) => set({ currentPage: page }),
      setTotalPages: (total: number) => set({ totalPages: total }),
      setZoom: (zoom: number) => set({ zoom }),

      setSelectedText: (text: string | null) => set({ selectedText: text }),
      setCurrentExplanation: (text: string | null) =>
        set({ currentExplanation: text }),
      setIsExplaining: (v: boolean) => set({ isExplaining: v }),

      addExplanation: (exp: Explanation) =>
        set((state) => ({ explanations: [...state.explanations, exp] })),

      deleteExplanation: (id: string) =>
        set((state) => ({
          explanations: state.explanations.filter((e) => e.id !== id),
        })),

      clearExplanations: () => set({ explanations: [] }),

      setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
      toggleDarkMode: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'pdfexplainr-storage',
      storage: createJSONStorage(() => idbStorage),
      // Only persist the fields that survive page reload (not blob URLs)
      partialize: (state) => ({
        explanations: state.explanations,
        isDarkMode: state.isDarkMode,
        pdfName: state.pdfName,
      }),
    }
  )
);
