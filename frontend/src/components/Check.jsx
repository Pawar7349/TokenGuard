import React, { useState } from 'react';
import { shortAddress } from '../contracts';
import { ethers } from 'ethers';

const Check = ({ contracts, showAlert }) => {
  const [txHash, setTxHash] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    if (!txHash) {
      showAlert('Enter transaction hash', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await contracts.tokenGuard.checkStatus(txHash);
      
      setStatus({
        reporter: result.reporter,
        amount: parseFloat(ethers.utils.formatEther(result.amount)).toFixed(2),
        reward: parseFloat(ethers.utils.formatEther(result.reward)).toFixed(2),
        resolved: result.resolved,
        returnedBy: result.returnedBy
      });
      
      showAlert('Status loaded', 'success');
    } catch (error) {
      setStatus(null);
      showAlert('Report not found', 'error');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Check Report Status</h2>
      <p>Look up any transaction to see if it's been reported.</p>
      
      <div className="form-group">
        <label>Transaction Hash</label>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="0x123abc..."
          disabled={loading}
        />
      </div>
      
      <button 
        className="btn btn-primary" 
        onClick={checkStatus}
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Check Status'}
      </button>
      
      {status && (
        <div className="status-box">
          <div className="status-item">
            <span className="status-label">Reporter</span>
            <span className="status-value">{shortAddress(status.reporter)}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Amount</span>
            <span className="status-value">{status.amount} MOCK</span>
          </div>
          <div className="status-item">
            <span className="status-label">Reward (5%)</span>
            <span className="status-value">{status.reward} MOCK</span>
          </div>
          <div className="status-item">
            <span className="status-label">Status</span>
            <span className="status-value">
              {status.resolved ? (
                <span style={{ color: '#10b981' }}>✅ Returned</span>
              ) : (
                <span style={{ color: '#f59e0b' }}>⏳ Waiting</span>
              )}
            </span>
          </div>
          {status.returnedBy !== '0x0000000000000000000000000000000000000000' && (
            <div className="status-item">
              <span className="status-label">Returned By</span>
              <span className="status-value">{shortAddress(status.returnedBy)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Check;