import { GoogleGenAI } from '@google/genai';

function getAIClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing! Please set VITE_GEMINI_API_KEY in your .env file.");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Gets a structured explanation of an Ethereum transaction using Gemini.
 */
export async function explainTransaction(txData) {
  const ai = getAIClient();

  const prompt = `
You are an expert blockchain security auditor and data analyst.
Explain the following Ethereum transaction data to a user.

Transaction Details:
- Hash: ${txData.hash}
- Status: ${txData.status}
- From: ${txData.from}
- To: ${txData.to}
- Value Transferred: ${txData.valueEther} ETH
- Input Data length: ${txData.originalDataLength} bytes
- Input Data preview: ${txData.inputDataPreview}
- Logs: ${JSON.stringify(txData.logs || [], null, 2)}

Your task is to analyze what happened (e.g. simple transfer, token swap, ERC20 approval, NFT minting, etc.) and check for potential scams (like Zero-Value token transfer phishing, or interacting with a known drainer pattern).
Do not hallucinate facts.

You must respond ONLY with a valid JSON object matching this schema exactly:
{
  "summary": "1-2 sentence high-level summary of what happened.",
  "explanation": "A detailed explanation formatted in Markdown. Use bolding for important values.",
  "isSuspicious": boolean,
  "securityWarning": "If suspicious, explain why in 1-2 sentences. Otherwise make it an empty string.",
  "contractType": "Unknown | ERC20 | DEX | NFT | Simple Transfer"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    // Parse the JSON string from Gemini
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error("Failed to generate AI explanation. Check your API key and connection.");
  }
}

/**
 * Explains a Smart Contract's source code and ABI.
 */
export async function explainContract(contractData) {
  const ai = getAIClient();

  const prompt = `
You are an expert smart contract auditor. 
I will provide you with the metadata and ABI of a verified smart contract. 
(I may not provide the full source code if it's too long, rely mainly on the ABI and Name).

Contract Name: ${contractData.contractName}
Compiler Version: ${contractData.compilerVersion}
License: ${contractData.licenseType}
ABI: ${contractData.abi}

Explain this contract briefly to a non-technical user.
You must respond ONLY with a valid JSON object matching this schema exactly:
{
  "summary": "1 sentence describing the purpose of this contract.",
  "explanation": "A detailed 1-2 paragraph description formatted in Markdown covering its core functionalities.",
  "isSuspicious": boolean,
  "securityWarning": "If there are severe centralized owner privileges or malicious patterns, list them. Otherwise empty string.",
  "contractType": "ERC20 | NFT | DEX | Proxy | Other"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating contract explanation:", error);
    throw new Error("Failed to generate AI explanation for this contract.");
  }
}
