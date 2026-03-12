import { useEffect, type RefObject } from 'react';
import { usePdfStore } from '../stores/pdfStore';
import { extractContext } from '../lib/pdfUtils';
import { explainText } from '../lib/gemini';

// Listens for text selection inside the PDF container and triggers a Gemini explanation.
export function usePDFExplain(containerRef: RefObject<HTMLDivElement | null>) {
  const pdfName = usePdfStore((s) => s.pdfName);
  const currentPage = usePdfStore((s) => s.currentPage);
  const setSelectedText = usePdfStore((s) => s.setSelectedText);
  const setCurrentExplanation = usePdfStore((s) => s.setCurrentExplanation);
  const setIsExplaining = usePdfStore((s) => s.setIsExplaining);
  const setSidebarOpen = usePdfStore((s) => s.setSidebarOpen);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseUp = async () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const text = selection.toString().trim();
      // Ignore very short or very long accidental selections
      if (text.length < 2 || text.length > 500) return;

      // Extract surrounding context from the PDF text layer DOM
      const { prevContext, nextContext } = extractContext(selection);

      // Open sidebar and show loading state
      setSelectedText(text);
      setCurrentExplanation(null);
      setIsExplaining(true);
      setSidebarOpen(true);

      try {
        const explanation = await explainText({
          text,
          prevContext,
          nextContext,
          pdfId: pdfName ?? 'unknown',
        });
        setCurrentExplanation(explanation);
      } catch {
        setCurrentExplanation(
          'Something went wrong while generating the explanation. Please try again.'
        );
      } finally {
        setIsExplaining(false);
      }
    };

    container.addEventListener('mouseup', handleMouseUp);
    return () => container.removeEventListener('mouseup', handleMouseUp);
  }, [
    containerRef,
    pdfName,
    currentPage,
    setSelectedText,
    setCurrentExplanation,
    setIsExplaining,
    setSidebarOpen,
  ]);
}
