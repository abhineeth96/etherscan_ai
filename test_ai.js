import { GoogleGenAI } from '@google/genai';
import { env } from 'process';

const apiKey = process.env.VITE_GEMINI_API_KEY;
console.log("Key:", apiKey ? "Loaded length " + apiKey.length : "Not loaded");

const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Explain the word Hello',
    });
    console.log("Response Type:", typeof response);
    console.log("Response keys:", Object.keys(response));
    console.log("Response text:", response.text);
  } catch (e) {
    console.error("Caught error:", e);
  }
}

run();
