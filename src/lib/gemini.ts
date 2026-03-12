import { GoogleGenAI } from '@google/genai';
import type { ExplainRequest } from './types';
import { getMockExplanation } from '../utils/mockResponses';

// Lazily initialised so the app still works without an API key
let ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (ai) return ai;
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') return null;
  ai = new GoogleGenAI({ apiKey: key });
  return ai;
}

// Sends the selected text + surrounding context to Gemini and returns an explanation
export async function explainText(request: ExplainRequest): Promise<string> {
  const client = getClient();

  if (!client) {
    console.warn('[Gemini] No valid API key — using mock response');
    return getMockExplanation(request.text);
  }

  const prompt = [
    `Explain "${request.text}" in 2 simple sentences max.`,
    `CONTEXT: …${request.prevContext} | "${request.text}" | ${request.nextContext}…`,
    'Target audience: ML / Finance engineering grad student. Avoid academic jargon.',
  ].join('\n');

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text ?? getMockExplanation(request.text);
  } catch (err) {
    console.error('[Gemini API error]', err);
    return getMockExplanation(request.text);
  }
}
