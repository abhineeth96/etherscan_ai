import React, { useState } from 'react';
import { Search, ChevronRight, Cpu } from 'lucide-react';

export default function SearchBar({ onSearch, isLoading }) {
  const [hash, setHash] = useState('');
  const [searchType, setSearchType] = useState('transaction');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hash.trim()) {
      onSearch(hash.trim(), searchType);
    }
  };

  return (
    <div className="search-hero">
      <div className="hero-badge">
        <Cpu size={16} className="animate-pulse" />
        <span>Gemini AI Analysis Engine Online</span>
      </div>

      <h2 className="hero-title">
        Decode the Blockchain with <br/>
        <span className="eth-gradient-text">Intelligent Analytics</span>
      </h2>
      
      <p className="hero-subtitle">
        Enter a mainnet transaction hash or smart contract address below. Our AI engine will fetch the raw on-chain data and translate it into a human-readable summary instantly.
      </p>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-type-selector">
          <button 
            type="button" 
            className={`type-btn ${searchType === 'transaction' ? 'active' : ''}`}
            onClick={() => setSearchType('transaction')}
          >
            Transaction Hash
          </button>
          <button 
            type="button" 
            className={`type-btn ${searchType === 'address' ? 'active' : ''}`}
            onClick={() => setSearchType('address')}
          >
            Wallet / Contract Address
          </button>
        </div>
        <div className="search-glow"></div>
        <div className="glass-panel search-input-wrapper">
          <Search size={22} color="var(--eth-blue)" style={{marginLeft: '0.75rem'}} />
          <input
            type="text"
            placeholder={searchType === 'transaction' ? 'Enter Txn Hash (0x...)' : 'Enter Address (0x...)'}
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            disabled={isLoading}
            spellCheck="false"
          />
          <button type="submit" disabled={isLoading || !hash.trim()}>
            {isLoading ? (
              <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <svg className="animate-spin" style={{height: '1.25rem', width: '1.25rem', color: 'white'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing
              </span>
            ) : (
              <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                Analyze <ChevronRight size={18} />
              </span>
            )}
          </button>
        </div>
      </form>
      
      <div className="example-hash">
        <span>Example:</span>
        <button 
          className="example-btn"
          onClick={() => {
            setSearchType('transaction');
            setHash('0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060');
          }}
          type="button"
        >
          0x5c504ed432cb...22060
        </button>
      </div>
    </div>
  );
}
