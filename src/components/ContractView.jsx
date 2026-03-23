import React from 'react';
import { Bot, Code, CheckCircle, ShieldAlert, FileText, ExternalLink, Zap } from 'lucide-react';
import { marked } from 'marked';

export default function ContractView({ contractData, aiExplanation, isLoading }) {
  if (!contractData && !isLoading) return null;

  return (
    <div className="tx-container" style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.5s' }}>
      {aiExplanation?.isSuspicious && (
        <div className="glass-panel error-panel mb-6" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', background: 'rgba(239, 68, 68, 0.05)' }}>
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
            <div className="icon-box"><Code size={20} /></div>
            <h2>Smart Contract</h2>
          </div>
          
          <div className="data-group">
            <span className="data-label"><CheckCircle size={14} color="var(--eth-purple)" /> Contract Name</span>
            <span className="data-value" style={{ color: '#d8b4fe', fontWeight: 'bold' }}>{contractData?.contractName || '---'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="data-group">
              <span className="data-label"><FileText size={14} color="var(--eth-purple)" /> License</span>
              <span className="data-value" style={{ width: 'fit-content', padding: '0.25rem 0.75rem' }}>{contractData?.licenseType || '---'}</span>
            </div>
            <div className="data-group">
              <span className="data-label"><Code size={14} color="var(--eth-purple)" /> Compiler</span>
              <span className="data-value" style={{ width: 'fit-content', padding: '0.25rem 0.75rem' }}>{contractData?.compilerVersion || '---'}</span>
            </div>
          </div>
          
          {aiExplanation && (
            <div className="data-group" style={{ marginTop: '1rem' }}>
              <span className="data-label"><Zap size={14} color="var(--eth-blue)" /> AI Detected Type</span>
              <span className="data-value" style={{ color: '#67e8f9' }}>{aiExplanation.contractType}</span>
            </div>
          )}
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
            <h2 className="eth-gradient-text">Contract Analysis</h2>
          </div>
          
          <div className="ai-content">
            {aiExplanation ? (
              <div className="markdown-body">
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e0e7ff', marginBottom: '1rem' }}>
                  {aiExplanation.summary}
                </p>
                <div dangerouslySetInnerHTML={{ __html: marked.parse(aiExplanation.explanation) }} />
              </div>
            ) : (
              <div className="ai-loading">
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(98, 126, 234, 0.3)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                  <Bot size={40} style={{ color: 'rgba(98, 126, 234, 0.7)', position: 'relative', zIndex: 10 }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Auditing Contract Code...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
