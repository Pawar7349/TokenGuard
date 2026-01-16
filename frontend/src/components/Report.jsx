import React, { useState } from 'react';
import { ethers } from 'ethers';
import { MOCK_TOKEN_ADDRESS } from '../contracts';

const Report = ({ contracts, account, showAlert }) => {
  const [txHash, setTxHash] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const generateHash = () => {
    const hash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    setTxHash(hash);
    showAlert('Random hash generated', 'info');
  };

  const handleSubmit = async () => {
    if (!account) {
      showAlert('Connect wallet first', 'error');
      return;
    }

    if (!txHash || !amount) {
      showAlert('Fill all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const amountWei = ethers.utils.parseEther(amount);
      const tx = await contracts.tokenGuard.reportLost(txHash, MOCK_TOKEN_ADDRESS, amountWei);
      await tx.wait();
      
      showAlert('Report submitted successfully', 'success');
      setTxHash('');
      setAmount('');
    } catch (error) {
      showAlert('Error: ' + error.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Report Lost Tokens</h2>
      <p>Report accidentally sent tokens so others can help return them.</p>
      
      <div className="quick-actions">
        <button className="quick-btn" onClick={generateHash}>
          Generate Hash
        </button>
        <button className="quick-btn" onClick={() => setAmount('100')}>
          Set 100 MOCK
        </button>
      </div>
      
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
      
      <div className="form-group">
        <label>Amount Lost</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100"
          step="0.01"
          disabled={loading}
        />
      </div>
      
      <button 
        className="btn btn-primary" 
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </div>
  );
};

export default Report;