import React, { useState, useEffect } from 'react';
import { getEthMarketData } from '../services/ethereum';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

export default function EthMarketTicker() {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getEthMarketData();
        if (data) {
          setMarketData(data);
        }
      } catch (e) {
        console.error("Failed to fetch market data", e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !marketData) return null;

  const isPositive = marketData.priceChange24h >= 0;
  // Use compact formatting for large numbers like Market Cap
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: "compact",
    compactDisplay: "short"
  });

  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  return (
    <div className="market-ticker-wrapper">
      <div className="market-ticker-glass">
        
        <div className="ticker-item price-main">
          <div className="ticker-label"><DollarSign size={14} color="var(--text-muted)" /> ETH PRICE</div>
          <div className="ticker-value highlight">
            {priceFormatter.format(marketData.currentPrice)}
          </div>
        </div>

        <div className="ticker-divider"></div>

        <div className="ticker-item">
          <div className="ticker-label"><Activity size={14} color="var(--text-muted)" /> 24H TREND</div>
          <div className={`ticker-value trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
            {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {Math.abs(marketData.priceChange24h).toFixed(2)}%
          </div>
        </div>

        <div className="ticker-divider"></div>

        <div className="ticker-item hidden-mobile">
          <div className="ticker-label">MARKET CAP</div>
          <div className="ticker-value">
            {formatter.format(marketData.marketCap)}
          </div>
        </div>

        <div className="ticker-divider hidden-mobile"></div>

        <div className="ticker-item hidden-mobile">
          <div className="ticker-label">24H VOLUME</div>
          <div className="ticker-value">
            {formatter.format(marketData.volume24h)}
          </div>
        </div>

      </div>
    </div>
  );
}
