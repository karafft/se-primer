import { GoogleGenAI } from '@google/genai';
import type { Generate } from './core.ts';

// Ücretsiz katmanda flash-lite'ın günlük kotası daha yüksek.
export const MODEL = 'gemini-flash-lite-latest';

export function makeGenerate(apiKey: string | undefined, model = MODEL): Generate | null {
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });
  return async (systemInstruction, contents) => {
    const res = await ai.models.generateContent({ model, contents, config: { systemInstruction, temperature: 0.4 } });
    return res.text ?? '';
  };
}
