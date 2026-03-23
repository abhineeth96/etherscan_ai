import React from 'react';
import { X, Info, Database, Brain, Cpu, Shield } from 'lucide-react';

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="icon-box"><Info size={24} /></div>
            <h2>Project Overview</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', fontFamily: 'var(--font-mono)' }}>
          
          <section>
            <h3 style={{ color: 'var(--eth-blue)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} /> What is the Blockchain?
            </h3>
            <p style={{ color: '#d4d4d8', lineHeight: 1.8 }}>
              Imagine an incredibly secure, shared public notebook that anyone can view, but no single person can secretly erase or change. Instead of one company holding this notebook (like a traditional bank), it is copied and stored across thousands of scattered computers worldwide. When someone makes a transaction, it gets permanently locked into this global notebook. This is what makes networks like Ethereum safe, trustless, and transparent!
            </p>
          </section>

          <section>
            <h3 style={{ color: 'var(--eth-blue)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} /> What does this app do?
            </h3>
            <p style={{ color: '#d4d4d8', lineHeight: 1.8 }}>
              While blockchains are fully transparent, the data they store is written in deep computer code (hexadecimals) that is nearly impossible for a normal person to read.
            </p>
            <p style={{ color: '#d4d4d8', lineHeight: 1.8, marginTop: '1rem' }}>
              <strong>AI Etherscan</strong> acts as your intelligent translator. It uses powerful Artificial Intelligence (Google Gemini) to look at the raw, confusing data on the Ethereum network and instantly translates it into simple, plain English—so absolutely anyone can understand exactly what is happening under the hood!
            </p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            <div style={{ border: '1px solid var(--border-light)', padding: '1.5rem', background: '#050505' }}>
              <Brain size={24} color="var(--eth-blue)" style={{ marginBottom: '1rem' }} />
              <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Smart Contract Explainer</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Automatically reads complex Smart Contracts and explains their exact purpose to you.</p>
            </div>
            <div style={{ border: '1px solid var(--border-light)', padding: '1.5rem', background: '#050505' }}>
              <Shield size={24} color="#ef4444" style={{ marginBottom: '1rem' }} />
              <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Scam & Phishing Detection</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Acts as a security guard, reading logs to warn you if a transaction looks like a dangerous scam.</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
