# AI Etherscan Explorer
## Official Project Manual & Technical Guide

---

## 1. Introduction & Project Goal
The **AI Etherscan Explorer** is a next-generation blockchain analytics dashboard. Built as a comprehensive academic final project, it goes beyond the constraints of traditional block explorers by infusing real-time on-chain data with the power of Artificial Intelligence. 

The primary goal is to **humanize blockchain data**. Instead of overwhelming users with raw hexadecimals, undecipherable smart contract bytecode, and complex event logs, this explorer presents actionable, beautifully designed insights using natural language and interactive visualizations.

---

## 2. Core Features & Architecture

### 2.1 The Context-Aware AI Chat Engine
When searching for a transaction, the app fetches the raw data from the blockchain and passes it to the Google Gemini AI Engine. Instead of just returning a static explanation, the platform initializes a **Context-Aware Chat Session**.
- **Human-Readable Summaries:** The AI translates gas limits, base fees, and execution logic into plain English.
- **Interactive Q&A:** Users can follow up with specific questions like *"Why did this swap fail?"* or *"Was this a MEV arbitrage transaction?"* and the AI will analyze the context dynamically.

### 2.2 Replicating Etherscan.io (Live Feeds)
The dashboard features an exact structural recreation of the iconic Etherscan homepage, updated with modern Cyberpunk aesthetics:
- **Latest Blocks Feed:** Instantly streams the 6 most recent Ethereum blocks, displaying minter keys, transaction counts, and base fees in Gwei.
- **Latest Transactions Feed:** Extracts 6 live transactions from the most recent block, showing sender/receiver addresses and ETH values transferred.
- **Instant AI Routing:** Clicking any transaction or address completely bypasses the search bar, snapping the user directly to the AI analysis interface.

### 2.3 Real-Time Network Congestion Heatmap
To provide instant visibility into network health, the application includes a custom-built **CSS Bar Chart Heatmap**.
- **Concurrent Polling:** The app synchronously polls the 15 most recent Ethereum blocks to build a historical trend of gas consumption.
- **Color-Coded Capacity:** The bars dynamically scale in height based on how "full" a block is, colored vividly with bright Neon Greens (Empty) and Intense Reds (Congested).

### 2.4 ETH Market Ticker Dashboard
A live dashboard element querying the CoinGecko API every 60 seconds to display:
- Live 24H Price Tracker vs USD
- Current Cryptocurrency Market Cap
- Real-Time Trade Volume

### 2.5 Cyberpunk Web3 Glassmorphism UI
The user interface avoids heavy component libraries in favor of high-performance **Vanilla CSS Grid & Flexbox**. 
- Built around a completely custom **Electric Cyan (`#00f0ff`) & Vibrant Purple (`#b026ff`)** aesthetic.
- Employs heavy use of **Glassmorphism** (frosted, translucent layers overlaying dynamic background gradients), glowing neon shadows, and interactive hover states.

---

## 3. Technology Stack

- **Frontend Framework:** React 18, Vite (Fast Hot-Module Replacement)
- **Blockchain Interface:** `ethers.js` v6 & free public RPC endpoints (`https://eth.drpc.org`)
- **Artificial Intelligence:** Google Gemini API (`@google/genai`)
- **Market Data:** CoinGecko API
- **Styling:** Custom Vanilla CSS Grid + `lucide-react` scalable vector icons

---

## 4. System Logic & Data Flow

1. **User Request:** The user visits the homepage and either clicks a live transaction from the feed or pastes a hash into the Search Bar.
2. **Blockchain Fetching:** The `ethereum.js` service parses the input string, identifies it as an EOA Address, a Smart Contract, or a Transaction, and queries the Ethereum blockchain.
3. **Data Aggregation:** Variables like ERC-20 transfer logs, internal calls, and block receipts are aggregated natively in the browser.
4. **AI Processing:** The `gemini.js` service synthesizes the raw JSON response into an engineered prompt template and hits the Gemini API for a natural language analysis.
5. **State Rendering:** The root `App.jsx` handles state execution, gracefully switching between the `HomeFeed`, `TransactionChat`, or `ContractView` components.

---

## 5. Getting Started & Development

### 5.1 Prerequisites
- **Node.js**: v18 or newer
- **Google Gemini API Key**: For the AI text generation.

### 5.2 Local Setup Instructions
1. Navigate to the project directory: `cd final_project`
2. Install dependencies: `npm install`
3. Configure the Environment:
   Create a `.env` file in the root folder and add your key:
   `VITE_GEMINI_API_KEY="your-api-key-here"`
4. Run the Development Server:
   Execute `npm run dev`
5. Open your local browser to `http://localhost:5173`

---

*This manual was generated specifically for the AI Etherscan Web3 Analytics Dashboard project presentation.*
