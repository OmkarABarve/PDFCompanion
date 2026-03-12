// Extracts surrounding context text from the DOM around a Selection object.
// charRadius controls how many characters of context to grab on each side.
export function extractContext(
  selection: Selection,
  charRadius = 200
): { prevContext: string; nextContext: string } {
  if (!selection.rangeCount) return { prevContext: '', nextContext: '' };

  const range = selection.getRangeAt(0);

  // Collect all text nodes inside the nearest text-layer container
  const container =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as HTMLElement)
      : range.commonAncestorContainer.parentElement;

  // Walk up to find the page's text layer wrapper
  const textLayer =
    container?.closest('.react-pdf__Page__textContent') ??
    container?.closest('.react-pdf__Page') ??
    container;

  if (!textLayer) return { prevContext: '', nextContext: '' };

  const walker = document.createTreeWalker(textLayer, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  // Build a flat string and find the selection boundaries
  let fullText = '';
  let selStart = -1;
  let selEnd = -1;

  for (const node of textNodes) {
    const nodeStart = fullText.length;
    fullText += node.textContent ?? '';

    if (node === range.startContainer)
      selStart = nodeStart + range.startOffset;
    if (node === range.endContainer)
      selEnd = nodeStart + range.endOffset;
  }

  if (selStart === -1 || selEnd === -1) return { prevContext: '', nextContext: '' };

  const prevContext = fullText
    .slice(Math.max(0, selStart - charRadius), selStart)
    .trim();
  const nextContext = fullText
    .slice(selEnd, selEnd + charRadius)
    .trim();

  return { prevContext, nextContext };
}

// Generates a short id for saved explanations
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
