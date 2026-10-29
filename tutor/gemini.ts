import { GoogleGenAI } from '@google/genai';
import type { Generate } from './core.ts';

// Ücretsiz katmanda flash-lite'ın günlük kotası daha yüksek.
export const MODEL = 'gemini-flash-lite-latest';

export function makeGenerate(apiKey: string | undefined, model = MODEL): Generate | null {
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });
  return async (systemInstruction, contents) => {
    const params = { model, contents, config: { systemInstruction, temperature: 0.4 } };
    // AI Studio'da paylaşılan uygulamaların proxy'si generateContent'i desteklemiyor
    // (PROXY_GENERATION_DISABLED); akışlı çağrı ile dene, olmazsa düz çağrıya dön.
    try {
      let text = '';
      for await (const chunk of await ai.models.generateContentStream(params)) text += chunk.text ?? '';
      return text;
    } catch (e) {
      if (/PROXY_GENERATION_DISABLED/.test(String((e as Error)?.message))) throw e;
      const res = await ai.models.generateContent(params);
      return res.text ?? '';
    }
  };
}
