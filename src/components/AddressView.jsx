import React from 'react';
import { Wallet, Activity, ExternalLink } from 'lucide-react';

export default function AddressView({ addressData, isLoading }) {
  if (!addressData && !isLoading) return null;

  return (
    <div className="tx-container" style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.5s' }}>
      <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="panel-header">
          <div className="icon-box"><Wallet size={20} /></div>
          <h2>Wallet / Address Overview</h2>
        </div>
        
        <div className="data-group">
          <span className="data-label">Address</span>
          <a 
            href={`https://etherscan.io/address/${addressData?.address}`} 
            target="_blank" 
            rel="noreferrer"
            className="data-value link"
            style={{ color: '#d8b4fe' }}
          >
            <span>{addressData?.address}</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="data-group">
            <span className="data-label">ETH Balance</span>
            <span className="value-amount" style={{ color: 'var(--eth-blue)', fontSize: '1.75rem' }}>
              {addressData?.balanceEther || '0.0'} <span style={{ fontSize: '1rem' }}>ETH</span>
            </span>
          </div>
          <div className="data-group">
            <span className="data-label"><Activity size={14} color="var(--eth-purple)" /> Total Transactions Sent</span>
            <span className="data-value" style={{ width: 'fit-content', padding: '0.5rem 1rem', fontSize: '1.25rem' }}>
              {addressData?.txCount ?? '---'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
