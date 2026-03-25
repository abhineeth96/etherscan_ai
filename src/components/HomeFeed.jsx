import React, { useState, useEffect } from 'react';
import { getLatestFeed } from '../services/ethereum';
import { Box, FileText, Loader2, ArrowRight } from 'lucide-react';

const timeAgo = (timestamp) => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds} secs ago`;
  return `${Math.floor(seconds / 60)} mins ago`;
};

const formatHash = (hash) => {
  if (!hash) return '';
  return hash.substring(0, 10) + '...' + hash.substring(hash.length - 8);
};

export default function HomeFeed({ onSearch }) {
  const [data, setData] = useState({ latestBlocks: [], latestTransactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const feed = await getLatestFeed();
        if (feed.latestBlocks.length > 0) {
          setData(feed);
        }
      } catch (e) {
        console.error("Feed error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
    const interval = setInterval(fetchFeed, 12000);
    return () => clearInterval(interval);
  }, []);

  if (loading && data.latestBlocks.length === 0) {
    return (
      <div className="feed-loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
        <Loader2 size={32} className="animate-spin" color="var(--eth-blue)" />
        <span style={{ marginTop: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Syncing Live Network...</span>
      </div>
    );
  }

  return (
    <div className="home-feed-container">
      
      {/* Latest Blocks */}
      <div className="glass-panel feed-panel">
        <div className="feed-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
             <Box size={20} color="var(--eth-purple)" />
             <h3 style={{margin: 0, fontSize: '1rem', letterSpacing: '0.05em'}}>Latest Blocks</h3>
          </div>
        </div>
        <div className="feed-list">
          {data.latestBlocks.map((block) => (
            <div key={block.number} className="feed-item">
              <div className="feed-item-icon"><Box size={18} strokeWidth={1.5} /></div>
              <div className="feed-item-content">
                <div className="feed-item-row">
                  <span className="feed-link" onClick={() => {
                      // Currently no dedicated Block View in app, so alert or open Etherscan natively
                      window.open(`https://etherscan.io/block/${block.number}`, '_blank');
                  }}>
                    {block.number}
                  </span>
                  <span className="feed-time">{timeAgo(block.timestamp)}</span>
                </div>
                <div className="feed-item-row" style={{ marginTop: '0.25rem' }}>
                  <span className="feed-subtext">Miner: <span className="feed-address" onClick={() => onSearch(block.miner, 'address')}>{formatHash(block.miner)}</span></span>
                </div>
                <div className="feed-item-row">
                  <span className="feed-subtext"><span style={{color: 'var(--eth-blue)'}}>{block.txCount} txns</span> in this block</span>
                  <span className="feed-badge">{block.baseFeeGwei} Gwei</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="feed-footer-btn" onClick={() => window.open('https://etherscan.io/blocks', '_blank')}>
          View all blocks <ArrowRight size={14} />
        </button>
      </div>

      {/* Latest Transactions */}
      <div className="glass-panel feed-panel">
        <div className="feed-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
             <FileText size={20} color="var(--eth-blue)" />
             <h3 style={{margin: 0, fontSize: '1rem', letterSpacing: '0.05em'}}>Latest Transactions</h3>
          </div>
        </div>
        <div className="feed-list">
          {data.latestTransactions.map((tx) => (
            <div key={tx.hash} className="feed-item">
              <div className="feed-item-icon"><FileText size={18} strokeWidth={1.5} /></div>
              <div className="feed-item-content">
                <div className="feed-item-row">
                  <span className="feed-link" onClick={() => onSearch(tx.hash, 'transaction')}>
                    {formatHash(tx.hash)}
                  </span>
                  <span className="feed-time">{timeAgo(tx.timestamp)}</span>
                </div>
                <div className="feed-item-row" style={{ marginTop: '0.25rem' }}>
                  <span className="feed-subtext">From <span className="feed-address" onClick={() => onSearch(tx.from, 'address')}>{formatHash(tx.from)}</span></span>
                </div>
                <div className="feed-item-row">
                  <span className="feed-subtext">To <span className="feed-address" onClick={() => onSearch(tx.to, 'address')}>{formatHash(tx.to)}</span></span>
                  <span className="feed-badge">{parseFloat(tx.value).toFixed(4)} Eth</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="feed-footer-btn" onClick={() => window.open('https://etherscan.io/txs', '_blank')}>
          View all transactions <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
}
