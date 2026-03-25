import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import TransactionView from './components/TransactionView';
import ContractView from './components/ContractView';
import AddressView from './components/AddressView';
import InfoModal from './components/InfoModal';
import EthMarketTicker from './components/EthMarketTicker';
import NetworkHeatmap from './components/NetworkHeatmap';
import HomeFeed from './components/HomeFeed';
import { getTransactionDetails, getAddressDetails, getContractDetails } from './services/ethereum';
import { explainTransaction, explainContract } from './services/gemini';
import { AlertTriangle, Info, Terminal } from 'lucide-react';

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
  const [aiExplanation, setAiExplanation] = useState(null);
  const [data, setData] = useState(null);
  const [viewMode, setViewMode] = useState(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 2500); // 2.5s boot delay
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async (query, searchType) => {
    setLoading(true);
    setError(null);
    setData(null);
    setAiExplanation(null);
    setViewMode(null);

    try {
      let formatted = query.trim();
      if (!formatted.startsWith('0x')) {
        formatted = '0x' + formatted;
      }
      
      if (searchType === 'transaction') {
        setViewMode('transaction');
        const txInfo = await getTransactionDetails(formatted);
        setData(txInfo);

        try {
          const explanation = await explainTransaction(txInfo);
          setAiExplanation(explanation);
        } catch (aiErr) {
          console.error("AI Error:", aiErr);
          setAiExplanation({ 
            summary: "AI Engine Error", 
            explanation: "The analysis model failed to respond. Please verify your Gemini API key in the `.env` file.", 
            isSuspicious: true, 
            securityWarning: aiErr.message 
          });
        }
      } else if (searchType === 'address') {
        const addrInfo = await getAddressDetails(formatted);
        
        if (addrInfo.isContract) {
          setViewMode('contract');
          const contractInfo = await getContractDetails(input.formatted);
          const fullData = { ...addrInfo, ...contractInfo };
          setData(fullData);
          
          if (contractInfo.isVerified) {
            try {
              const explanation = await explainContract(fullData);
              setAiExplanation(explanation);
            } catch (aiErr) {
               console.error("AI Error:", aiErr);
               setAiExplanation({ summary: "AI Engine Error", explanation: aiErr.message, isSuspicious: false, securityWarning: "" });
            }
          } else {
             setAiExplanation({ 
               summary: "Unverified Contract", 
               explanation: "This contract has not published its source code to Etherscan. Without the source code or ABI, the AI cannot confidently analyze its inner workings.", 
               isSuspicious: true, 
               securityWarning: "Interacting with unverified closed-source contracts carries a high risk of malicious behavior. Exercise extreme caution." 
             });
          }
        } else {
          setViewMode('address');
          setData(addrInfo); // Normal EOA wallet
        }
      }
    } catch (err) {
      console.error("Eth/App Error:", err);
      setError(err.message || 'Entity not found or invalid format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      {isBooting && (
        <div className="boot-screen">
          <Terminal size={48} color="var(--eth-blue)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
          <h2 style={{ fontSize: '2.5rem', letterSpacing: '0.1em' }}>AI ETHERSCAN</h2>
          <div className="boot-text">Establishing Secure Connection to Mainnet...</div>
          <div className="boot-progress">
            <div className="boot-bar"></div>
          </div>
        </div>
      )}

      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      <div className="bg-grid"></div>

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
            <button 
              className="info-btn" 
              onClick={() => setIsInfoOpen(true)} 
              title="Project Information"
            >
              <Info size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="app-main container">
        <div className="analytics-dashboard">
          <EthMarketTicker />
          <NetworkHeatmap />
        </div>
        <SearchBar onSearch={handleSearch} isLoading={loading} />

        {!viewMode && !error && !loading && (
          <HomeFeed onSearch={handleSearch} />
        )}

        {error && (
          <div className="glass-panel error-panel mb-6">
            <div className="error-icon"><AlertTriangle size={24} /></div>
            <div>
              <h3 style={{fontWeight: 600, color: '#fecaca', marginBottom: '0.25rem'}}>Search Failed</h3>
              <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: '#fca5a5'}}>{error}</p>
            </div>
          </div>
        )}
        {viewMode === 'transaction' && (data || loading) && (
          <TransactionView txData={data} aiExplanation={aiExplanation} isLoading={loading} />
        )}
        
        {viewMode === 'contract' && (data || loading) && (
          <ContractView contractData={data} aiExplanation={aiExplanation} isLoading={loading} />
        )}
        
        {viewMode === 'address' && (data || loading) && (
          <AddressView addressData={data} isLoading={loading} />
        )}
        
        {loading && !viewMode && (
          <div className="tx-container" style={{ opacity: 0.5, marginTop: '2rem' }}>
             <div className="ai-loading" style={{ padding: '4rem', textAlign: 'center' }}>
               <span className="animate-pulse" style={{ color: 'var(--eth-blue)' }}>Connecting to Ethereum Mainnet...</span>
             </div>
          </div>
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
