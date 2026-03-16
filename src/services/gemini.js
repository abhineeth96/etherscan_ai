import { GoogleGenAI } from '@google/genai';

/**
 * Gets a human-readable explanation of an Ethereum transaction using Gemini.
 * @param {Object} txData The transaction data fetched from the blockchain.
 * @returns {Promise<string>} The explanation in Markdown.
 */
export async function explainTransaction(txData) {
  // Try to get the API key from Vite's env variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is missing! Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert blockchain analyst tasked with explaining an Ethereum transaction to a non-technical user.
Use clear, simple English. Avoid overly technical jargon where possible. 
Be concise but informative. Format your response cleanly using Markdown (use bolding for important values like addresses or amounts).

Here are the details of the transaction:
- **Transaction Hash**: ${txData.hash}
- **Status**: ${txData.status}
- **From Address**: ${txData.from}
- **To Address**: ${txData.to}
- **Value Transferred**: ${txData.valueEther} ETH
- **Block Number**: ${txData.blockNumber}
- **Gas Used**: ${txData.gasUsed}
- **Input Data**: ${txData.inputDataPreview}

Based on this data, provide:
1. A 1-2 sentence high-level summary of what happened.
2. An explanation of the transaction (e.g. "This was a simple transfer of ETH" or "This looks like a smart contract interaction because input data was present").
3. A brief comment on the transaction status and gas used.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error("Failed to generate AI explanation. Check your API key and connection.");
  }
}
