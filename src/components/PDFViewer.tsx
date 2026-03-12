import { useCallback, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
} from 'lucide-react';
import { usePdfStore } from '../stores/pdfStore';
import { usePDFExplain } from '../hooks/usePDFExplain';

// CSS required by react-pdf's text and annotation layers
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure the PDF.js worker for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function PDFViewer() {
  const pdfUrl = usePdfStore((s) => s.pdfUrl);
  const currentPage = usePdfStore((s) => s.currentPage);
  const totalPages = usePdfStore((s) => s.totalPages);
  const zoom = usePdfStore((s) => s.zoom);
  const setPage = usePdfStore((s) => s.setPage);
  const setTotalPages = usePdfStore((s) => s.setTotalPages);
  const setZoom = usePdfStore((s) => s.setZoom);

  const containerRef = useRef<HTMLDivElement>(null);

  // Hook that wires text selection → Gemini explanation
  usePDFExplain(containerRef);

  // Memoise file prop so react-pdf doesn't re-load on every render
  const file = useMemo(() => pdfUrl, [pdfUrl]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => setTotalPages(numPages),
    [setTotalPages]
  );

  // ---- Page navigation helpers ----
  const goToPrev = () => setPage(Math.max(1, currentPage - 1));
  const goToNext = () => setPage(Math.min(totalPages, currentPage + 1));

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (v >= 1 && v <= totalPages) setPage(v);
  };

  // ---- Zoom helpers ----
  const zoomIn = () => setZoom(Math.min(3, +(zoom + 0.25).toFixed(2)));
  const zoomOut = () => setZoom(Math.max(0.25, +(zoom - 0.25).toFixed(2)));

  if (!pdfUrl) return null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ---- PDF canvas area ---- */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 dark:bg-navy-light"
      >
        <div className="flex justify-center py-4">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center gap-2 py-20 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading PDF…
              </div>
            }
            error={
              <p className="py-20 text-center text-red-400">
                Failed to load PDF. Make sure the file is valid.
              </p>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={zoom}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <div className="flex items-center gap-2 py-20 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Rendering page…
                </div>
              }
            />
          </Document>
        </div>
      </div>

      {/* ---- Bottom toolbar: page nav + zoom ---- */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 text-sm dark:border-white/10">
        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrev}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="rounded p-1 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={handlePageInput}
            className="w-14 rounded border border-gray-300 bg-transparent px-1 py-0.5 text-center text-sm dark:border-white/20"
          />
          <span className="text-gray-500 dark:text-gray-400">/ {totalPages}</span>

          <button
            onClick={goToNext}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="rounded p-1 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={zoom <= 0.25}
            aria-label="Zoom out"
            className="rounded p-1 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-white/10"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="w-14 text-center">{Math.round(zoom * 100)}%</span>

          <button
            onClick={zoomIn}
            disabled={zoom >= 3}
            aria-label="Zoom in"
            className="rounded p-1 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-white/10"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
