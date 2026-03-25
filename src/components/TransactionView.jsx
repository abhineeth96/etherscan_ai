import React from 'react';
import { Activity, Bot, Hash, Clock, MapPin, Zap, Database, ExternalLink, ShieldAlert, Calendar, Coins, Fuel } from 'lucide-react';
import TransactionChat from './TransactionChat';

const formatTime = (ts) => {
  if (!ts) return '---';
  return new Date(ts * 1000).toLocaleString();
};

export default function TransactionView({ txData, aiExplanation, isLoading }) {
  if (!txData && !isLoading) return null;

  return (
    <div className="tx-container" style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.5s' }}>
      
      {aiExplanation?.isSuspicious && (
        <div className="glass-panel error-panel mb-6" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', background: 'rgba(239, 68, 68, 0.05)', marginBottom: '1.5rem' }}>
          <div className="error-icon" style={{ background: 'rgba(239, 68, 68, 0.2)' }}><ShieldAlert size={24} color="#ef4444" /></div>
          <div>
            <h3 style={{fontWeight: 600, color: '#fca5a5', marginBottom: '0.25rem'}}>Security Warning</h3>
            <p style={{fontSize: '0.875rem', color: '#fecaca', lineHeight: 1.5}}>{aiExplanation.securityWarning}</p>
          </div>
        </div>
      )}

      <div className="tx-grid">
        
        {/* Core Detail Panel */}
        <div className="glass-panel tx-panel-left">
          <div className="panel-header">
            <div className="icon-box"><Activity size={20} /></div>
            <h2>Transaction Details</h2>
          </div>
          
          <div className="data-group">
            <span className="data-label"><Hash size={14} color="var(--eth-purple)" /> Transaction Hash</span>
            <a 
              href={`https://etherscan.io/tx/${txData?.hash}`} 
              target="_blank" 
              rel="noreferrer"
              className="data-value link"
            >
              <span>{txData?.hash}</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="data-group">
              <span className="data-label"><Activity size={14} color="var(--eth-purple)" /> Status</span>
              <div>
                <span className={`status-badge ${txData?.status === 'Success' ? 'success' : txData?.status === 'Failed' ? 'failed' : 'pending'}`}>
                  {txData?.status || 'Pending'}
                </span>
              </div>
            </div>
            <div className="data-group">
              <span className="data-label"><Clock size={14} color="var(--eth-purple)" /> Block</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="data-value" style={{ width: 'fit-content', padding: '0.25rem 0.75rem' }}>{txData?.blockNumber || '---'}</span>
                {txData?.confirmations > 0 && (
                  <span className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                    {txData.confirmations} Confirmations
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="data-group">
            <span className="data-label"><Calendar size={14} color="var(--eth-purple)" /> Timestamp</span>
            <span className="data-value" style={{ color: 'var(--text-secondary)' }}>{formatTime(txData?.timestamp)}</span>
          </div>
          
          <div className="data-group">
            <span className="data-label"><MapPin size={14} color="var(--eth-purple)" /> From</span>
            <span className="data-value" style={{ color: '#d8b4fe' }}>{txData?.from || '---'}</span>
          </div>
          
          <div className="data-group">
            <span className="data-label"><MapPin size={14} color="var(--eth-purple)" /> To</span>
            <span className="data-value" style={{ color: '#67e8f9' }}>{txData?.to || '---'}</span>
          </div>
          
          <div className="value-highlight">
            <span className="data-label" style={{ color: 'var(--eth-blue)' }}><Zap size={14} /> Value Transferred</span>
            <span className="value-amount">
              {txData?.valueEther || '0.0'} <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)' }}>ETH</span>
              {txData?.valueUsd && <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>(${txData.valueUsd})</span>}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="data-group">
              <span className="data-label"><Coins size={14} color="var(--eth-purple)" /> Transaction Fee</span>
              <span className="data-value" style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{txData?.txFeeEther || '---'} ETH</span>
                {txData?.txFeeUsd && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>${txData.txFeeUsd}</span>}
              </span>
            </div>
            <div className="data-group">
              <span className="data-label"><Fuel size={14} color="var(--eth-purple)" /> Gas Price</span>
              <span className="data-value" style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{txData?.gasPriceGwei || '---'} Gwei</span>
                {txData?.gasPriceEther !== 'N/A' && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({txData?.gasPriceEther} ETH)</span>}
              </span>
            </div>
          </div>
        </div>

        {/* AI Explainer Panel */}
        <div className="glass-panel tx-panel-right">
          
          <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '2rem', opacity: 0.03, pointerEvents: 'none' }}>
            <Bot size={280} />
          </div>
          
          <div className="panel-header" style={{ position: 'relative', zIndex: 10 }}>
            <div className="icon-box" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
              <Bot size={20} />
            </div>
            <h2 className="eth-gradient-text">AI Translation</h2>
          </div>
          
          <div className="ai-content chat-enabled">
            {aiExplanation ? (
              <TransactionChat txData={txData} aiExplanation={aiExplanation} />
            ) : (
              <div className="ai-loading">
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(0, 255, 102, 0.3)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                  <Bot size={40} style={{ color: 'rgba(0, 255, 102, 0.7)', position: 'relative', zIndex: 10 }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Synthesizing On-Chain Reality...</span>
              </div>
            )}
          </div>
          
          {aiExplanation && (
            <div className="ai-footer">
              <Zap size={14} color="#eab308" /> 
              Analysis generated by Google Gemini 2.5
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
