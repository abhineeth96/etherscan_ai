import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import TransactionView from './components/TransactionView';
import { getTransactionDetails } from './services/ethereum';
import { explainTransaction } from './services/gemini';
import { AlertTriangle } from 'lucide-react';

const EthLogo = () => (
  <svg width="24" height="24" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
    <path fill="#ffffff" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
    <path fill="#c0c0c0" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
    <path fill="#8c8c8c" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
    <path fill="#c0c0c0" d="M127.962 416.905v-104.72L0 236.585z"/>
    <path fill="#404040" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/>
    <path fill="#8c8c8c" d="M0 212.32l127.96 75.638v-133.8z"/>
  </svg>
);

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txData, setTxData] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);

  const handleSearch = async (hash) => {
    setLoading(true);
    setError(null);
    setTxData(null);
    setAiExplanation(null);

    try {
      const data = await getTransactionDetails(hash);
      setTxData(data);

      try {
        const explanation = await explainTransaction(data);
        setAiExplanation(explanation);
      } catch (aiErr) {
        console.error("AI Error:", aiErr);
        setAiExplanation("⚠️ **AI Module Error**: The analysis model failed to respond. Please verify your Gemini API key in the `.env` file.");
      }
    } catch (err) {
      console.error("Eth Error:", err);
      setError(err.message || 'Transaction not found or invalid format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="bg-grid"></div>
      <div className="glow-orb" style={{ top: '10%', left: '5%', width: '400px', height: '400px', opacity: 0.1 }}></div>
      <div className="glow-orb" style={{ top: '60%', right: '0%', width: '500px', height: '500px', background: 'var(--eth-purple)', opacity: 0.05 }}></div>

      <header className="app-header">
        <div className="container header-content">
          <div className="header-logo animate-float">
            <div className="logo-icon"><EthLogo /></div>
            <div>
              <h1 style={{fontSize: '1.25rem', lineHeight: 1}}>AI Etherscan</h1>
              <span style={{color: 'var(--eth-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem'}}>Mainnet Explorer</span>
            </div>
          </div>
          <div className="header-network">
            <span className="dot"></span>
            Network: Mainnet
          </div>
        </div>
      </header>

      <main className="app-main container">
        <SearchBar onSearch={handleSearch} isLoading={loading} />

        {error && (
          <div className="glass-panel error-panel">
            <div className="error-icon"><AlertTriangle size={24} /></div>
            <div>
              <h3 style={{fontWeight: 600, color: '#fecaca', marginBottom: '0.25rem'}}>Search Failed</h3>
              <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: '#fca5a5'}}>{error}</p>
            </div>
          </div>
        )}

        {(txData || loading) && (
          <TransactionView txData={txData} aiExplanation={aiExplanation} isLoading={loading} />
        )}
      </main>
      
      <footer className="app-footer">
        <div className="container footer-content">
          <p>© {new Date().getFullYear()} AI Etherscan. Decoding the blockchain.</p>
          <div className="footer-tags">
            <span className="footer-tag">Vite</span>
            <span className="footer-tag">React</span>
            <span className="footer-tag" style={{color: 'var(--eth-blue)', borderColor: 'rgba(98, 126, 234, 0.3)'}}>ethers.js</span>
            <span className="footer-tag">Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
