import { useEffect, useRef, useCallback } from 'react';
import {
  X,
  Copy,
  BookmarkPlus,
  Trash2,
  Download,
  Loader2,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { usePdfStore } from '../stores/pdfStore';
import { generateId } from '../lib/pdfUtils';
import type { Explanation } from '../lib/types';

export default function ExplainSidebar() {
  const isSidebarOpen = usePdfStore((s) => s.isSidebarOpen);
  const setSidebarOpen = usePdfStore((s) => s.setSidebarOpen);
  const selectedText = usePdfStore((s) => s.selectedText);
  const currentExplanation = usePdfStore((s) => s.currentExplanation);
  const isExplaining = usePdfStore((s) => s.isExplaining);
  const explanations = usePdfStore((s) => s.explanations);
  const currentPage = usePdfStore((s) => s.currentPage);
  const addExplanation = usePdfStore((s) => s.addExplanation);
  const deleteExplanation = usePdfStore((s) => s.deleteExplanation);
  const clearExplanations = usePdfStore((s) => s.clearExplanations);

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setSidebarOpen]);

  // Close on click outside the panel
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    if (isSidebarOpen) {
      // Delay listener so the opening click doesn't immediately close it
      const id = setTimeout(() => document.addEventListener('mousedown', onClick), 100);
      return () => {
        clearTimeout(id);
        document.removeEventListener('mousedown', onClick);
      };
    }
  }, [isSidebarOpen, setSidebarOpen]);

  // Copy explanation text to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard API may fail in some contexts */
    }
  }, []);

  // Save the current explanation as a note
  const saveNote = useCallback(() => {
    if (!selectedText || !currentExplanation) return;
    const note: Explanation = {
      id: generateId(),
      selectedText,
      explanation: currentExplanation,
      page: currentPage,
      timestamp: Date.now(),
      relatedTerms: [],
    };
    addExplanation(note);
  }, [selectedText, currentExplanation, currentPage, addExplanation]);

  // ---- Export helpers ----
  const exportCSV = useCallback(() => {
    if (explanations.length === 0) return;
    const header = 'Page,Selected Text,Explanation,Timestamp\n';
    const rows = explanations
      .map(
        (e) =>
          `${e.page},"${e.selectedText.replace(/"/g, '""')}","${e.explanation.replace(/"/g, '""')}",${new Date(e.timestamp).toISOString()}`
      )
      .join('\n');
    downloadFile(header + rows, 'pdfexplainr-notes.csv', 'text/csv');
  }, [explanations]);

  const exportAnki = useCallback(() => {
    if (explanations.length === 0) return;
    // Tab-separated: front <TAB> back
    const rows = explanations
      .map((e) => `${e.selectedText}\t${e.explanation}`)
      .join('\n');
    downloadFile(rows, 'pdfexplainr-anki.txt', 'text/plain');
  }, [explanations]);

  if (!isSidebarOpen) return null;

  return (
    <div
      ref={panelRef}
      role="complementary"
      aria-label="Explanation sidebar"
      className="sidebar-enter flex w-full flex-col border-l border-gray-200 bg-white dark:border-white/10 dark:bg-navy-light md:w-[350px]"
    >
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
        <h2 className="text-sm font-semibold">Explanation</h2>
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="rounded p-1 hover:bg-gray-200 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4" aria-live="polite">
        {/* ---- Selected text chip ---- */}
        {selectedText && (
          <div className="mb-3 rounded-lg bg-accent/10 px-3 py-2 text-sm font-medium text-accent">
            "{selectedText}"
          </div>
        )}

        {/* ---- Loading state ---- */}
        {isExplaining && (
          <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating explanation…
          </div>
        )}

        {/* ---- Explanation result ---- */}
        {!isExplaining && currentExplanation && (
          <div className="mb-4 space-y-3">
            <p className="text-sm leading-relaxed">{currentExplanation}</p>

            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(currentExplanation)}
                className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
              <button
                onClick={saveNote}
                className="flex items-center gap-1 rounded-md bg-accent/10 px-3 py-1.5 text-xs text-accent hover:bg-accent/20"
              >
                <BookmarkPlus className="h-3 w-3" /> Save Note
              </button>
            </div>
          </div>
        )}

        {/* ---- Saved notes ---- */}
        {explanations.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-white/10">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Saved Notes ({explanations.length})
              </h3>
              <button
                onClick={clearExplanations}
                className="text-xs text-red-400 hover:text-red-500"
              >
                Clear All
              </button>
            </div>

            <ul className="space-y-2">
              {explanations.map((note) => (
                <li
                  key={note.id}
                  className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-white/5"
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="font-medium text-accent">
                      "{note.selectedText}"
                    </span>
                    <button
                      onClick={() => deleteExplanation(note.id)}
                      aria-label="Delete note"
                      className="shrink-0 rounded p-0.5 hover:bg-gray-200 dark:hover:bg-white/10"
                    >
                      <Trash2 className="h-3 w-3 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                    {note.explanation}
                  </p>
                  <span className="mt-1 block text-[10px] text-gray-400">
                    Page {note.page} · {new Date(note.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ---- Footer: export buttons ---- */}
      {explanations.length > 0 && (
        <div className="flex gap-2 border-t border-gray-200 p-3 dark:border-white/10">
          <button
            onClick={exportCSV}
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-gray-100 py-2 text-xs hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={exportAnki}
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-gray-100 py-2 text-xs hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20"
          >
            <Layers className="h-3.5 w-3.5" /> Export Anki
          </button>
        </div>
      )}
    </div>
  );
}

// Triggers a browser file download for the given content string
function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
