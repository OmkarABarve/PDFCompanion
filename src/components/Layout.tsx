import { type ReactNode } from 'react';
import { Moon, Sun, FileText } from 'lucide-react';
import { usePdfStore } from '../stores/pdfStore';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isDarkMode = usePdfStore((s) => s.isDarkMode);
  const toggleDarkMode = usePdfStore((s) => s.toggleDarkMode);
  const pdfName = usePdfStore((s) => s.pdfName);
  const resetPdf = usePdfStore((s) => s.resetPdf);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen flex-col bg-gray-50 text-gray-900 dark:bg-navy dark:text-gray-100">
        {/* ---- Header ---- */}
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-white/10">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-accent" />
            <h1 className="text-lg font-bold tracking-tight">
              PDF<span className="text-accent">Explainr</span>
            </h1>

            {/* Show current file name when a PDF is loaded */}
            {pdfName && (
              <span className="ml-3 max-w-[200px] truncate rounded bg-gray-200 px-2 py-0.5 text-xs dark:bg-white/10">
                {pdfName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Reset / upload new PDF */}
            {pdfName && (
              <button
                onClick={resetPdf}
                className="rounded px-3 py-1 text-sm hover:bg-gray-200 dark:hover:bg-white/10"
              >
                New PDF
              </button>
            )}

            {/* Dark / light mode toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-white/10"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* ---- Main content ---- */}
        <main className="relative flex flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
