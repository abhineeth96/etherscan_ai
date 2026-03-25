import React, { useState, useEffect } from 'react';
import { getRecentBlocks } from '../services/ethereum';
import { Network, Activity } from 'lucide-react';

export default function NetworkHeatmap() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlocks() {
      try {
        const data = await getRecentBlocks(10);
        setBlocks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlocks();
    // Refresh every 12 seconds (approx Ethereum block time)
    const interval = setInterval(fetchBlocks, 12000);
    return () => clearInterval(interval);
  }, []);

  if (loading || blocks.length === 0) {
    return (
      <div className="heatmap-widget">
         <div className="market-ticker-glass" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
            <Activity className="animate-pulse" size={24} color="var(--eth-blue)" style={{marginBottom: '0.5rem'}} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SCANNING BLOCKS...</span>
         </div>
      </div>
    );
  }

  // Find max for scaling
  const maxGas = Math.max(...blocks.map(b => b.gasUsedRatio), 0.1);

  const getBarColor = (ratio) => {
    if (ratio > 0.8) return '#ef4444'; // Red (High Congestion)
    if (ratio > 0.5) return '#eab308'; // Yellow (Medium)
    return 'var(--eth-blue)'; // Neon Green (Low/Normal)
  };

  return (
    <div className="heatmap-widget">
      <div className="market-ticker-glass heatmap-glass" style={{ flexDirection: 'column', alignItems: 'flex-start', width: '100%', height: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', width: '100%' }}>
          <div className="ticker-label"><Network size={14} color="var(--eth-blue)" /> Network Congestion</div>
          <div className="ticker-label" style={{ fontSize: '0.65rem' }}>LAST 10 BLOCKS</div>
        </div>

        <div className="heatmap-bars-container">
          {blocks.map((block) => {
            // Scale height relative to the max gas in this window (min 15% so it's visible)
            const heightPercent = Math.max(15, (block.gasUsedRatio / maxGas) * 100);
            
            return (
              <div key={block.number} className="heat-bar-wrapper">
                <div 
                  className="heat-bar" 
                  style={{ 
                    height: `${heightPercent}%`, 
                    background: getBarColor(block.gasUsedRatio),
                    boxShadow: `0 0 10px ${getBarColor(block.gasUsedRatio)}40`
                  }}
                >
                  <div className="heat-tooltip">
                    <div style={{ color: '#fff', marginBottom: '4px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
                      <strong>Block {block.number}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{color: '#a1a1aa'}}>Base Fee:</span> 
                      <span>{block.baseFeeGwei} Gwei</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{color: '#a1a1aa'}}>Full:</span> 
                      <span>{(block.gasUsedRatio * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
