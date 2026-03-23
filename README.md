# AI Etherscan Explorer

An AI-powered Ethereum block explorer that allows any user to explore Ethereum transactions and instantly understand them in plain English. The app was built prioritizing a premium, high-quality aesthetic with a sleek Dark Mode and glassmorphism UI.

## Features

- **Premium UI/UX:** Custom Vanilla CSS with dark mode, animated gradient backgrounds, and glassmorphism styling.
- **Web3 Integration:** Fetches real-time on-chain data directly using `ethers.js` connected to a free public RPC (`https://cloudflare-eth.com`), requiring no Etherscan API keys.
- **AI Explainer Module:** Uses the Google Gemini API (`@google/genai`) to act as a blockchain analyst, translating raw transaction data into straightforward English.

---

## Validation & Required Steps

To run and use the explorer locally, please follow these steps:

1. **Set up your Environment Variables:**
   You must create a `.env` file in the root directory (`/home/abhineeth/Documents/final_project`).
   
2. **Add your Gemini API Key:**
   Inside the `.env` file, add your Gemini API key like so:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Install Dependencies (if you haven't already):**
   ```bash
   npm install
   ```

4. **Start the Development Server:**
   Start the Vite dev server in your terminal:
   ```bash
   npm run dev
   ```

5. **Test the Application:**
   Open the provided local URL (usually `http://localhost:5173/`) in your browser.
   Enter a known mainnet hash (e.g. `0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060`) to search and see the AI explanation in action!
