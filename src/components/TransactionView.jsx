import React from 'react';
import { Activity, Bot, Hash, Clock, MapPin, Zap, Database, ExternalLink } from 'lucide-react';
import { marked } from 'marked';

export default function TransactionView({ txData, aiExplanation, isLoading }) {
  if (!txData && !isLoading) return null;

  return (
    <div className="tx-container" style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.5s' }}>
      <div className="tx-grid">
        
        {/* Core Detail Panel */}
        <div className="glass-panel tx-panel-left">
          <div className="panel-header">
            <div className="icon-box"><Activity size={20} /></div>
            <h2>On-Chain Data</h2>
          </div>
          
          <div className="data-group">
            <span className="data-label"><Hash size={14} color="var(--eth-purple)" /> Hash</span>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              <span className="data-value" style={{ width: 'fit-content', padding: '0.25rem 0.75rem' }}>{txData?.blockNumber || '---'}</span>
            </div>
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
              {txData?.valueEther || '0.0'} <span style={{ fontSize: '1.25rem', color: 'rgba(98, 126, 234, 0.8)' }}>ETH</span>
            </span>
          </div>
          
          <div className="data-group">
            <span className="data-label"><Database size={14} color="var(--eth-purple)" /> Gas Used</span>
            <span className="data-value" style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--text-secondary)' }}>{txData?.gasUsed || '---'} units</span>
          </div>
        </div>

        {/* AI Explainer Panel */}
        <div className="glass-panel tx-panel-right">
          
          <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '2rem', opacity: 0.03, pointerEvents: 'none' }}>
            <Bot size={280} />
          </div>
          
          <div className="panel-header" style={{ position: 'relative', zIndex: 10 }}>
            <div className="icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
              <Bot size={20} />
            </div>
            <h2 className="eth-gradient-text">AI Translation</h2>
          </div>
          
          <div className="ai-content">
            {aiExplanation ? (
              <div 
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: marked.parse(aiExplanation) }}
              />
            ) : (
              <div className="ai-loading">
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(98, 126, 234, 0.3)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                  <Bot size={40} style={{ color: 'rgba(98, 126, 234, 0.7)', position: 'relative', zIndex: 10 }} />
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
