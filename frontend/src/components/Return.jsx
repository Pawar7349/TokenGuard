import React, { useState } from 'react';
import { ethers } from 'ethers';
import { TOKENGUARD_ADDRESS } from '../contracts';

const Return = ({ contracts, account, showAlert }) => {
  const [txHash, setTxHash] = useState('');
  const [reportDetails, setReportDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Fetch report details when user enters hash
  const fetchReportDetails = async () => {
    if (!txHash) {
      showAlert('Enter transaction hash first', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await contracts.tokenGuard.checkStatus(txHash);
      
      if (result.reporter === '0x0000000000000000000000000000000000000000') {
        showAlert('No report found for this hash', 'error');
        setReportDetails(null);
        setLoading(false);
        return;
      }

      if (result.resolved) {
        showAlert('This report is already resolved', 'error');
        setReportDetails(null);
        setLoading(false);
        return;
      }

      const amount = parseFloat(ethers.utils.formatEther(result.amount));
      const reward = parseFloat(ethers.utils.formatEther(result.reward));

      setReportDetails({
        reporter: result.reporter,
        amount: amount,
        reward: reward,
        amountToSend: amount, // You send the full amount
        youWillReceive: reward // You get back the reward
      });

      showAlert('Report loaded! You can now approve and return tokens', 'success');
    } catch (error) {
      showAlert('Error loading report: ' + error.message, 'error');
      setReportDetails(null);
    }
    setLoading(false);
  };

  const approveTokens = async () => {
    if (!account || !reportDetails) {
      showAlert('Load report details first', 'error');
      return;
    }

    setLoading(true);
    try {
      // Approve the FULL amount (what you're sending)
      const amountWei = ethers.utils.parseEther(reportDetails.amountToSend.toString());
      const tx = await contracts.mockToken.approve(TOKENGUARD_ADDRESS, amountWei);
      await tx.wait();
      
      showAlert('Tokens approved! Now click "Return & Earn Reward"', 'success');
      setStep(2);
    } catch (error) {
      showAlert('Approval failed: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const returnTokens = async () => {
    if (!account || !txHash) {
      showAlert('Connect wallet and enter hash', 'error');
      return;
    }

    setLoading(true);
    try {
      const tx = await contracts.tokenGuard.returnTokens(txHash);
      await tx.wait();
      
      showAlert(`Success! Tokens returned and you earned ${reportDetails.youWillReceive} MOCK reward!`, 'success');
      
      // Reset form
      setTxHash('');
      setReportDetails(null);
      setStep(1);
    } catch (error) {
      showAlert('Return failed: ' + error.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Return Tokens & Earn 5% Reward</h2>
      <p>Help someone recover lost tokens and automatically earn a reward!</p>
      
      <div className="form-group">
        <label>Transaction Hash (from report)</label>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="0x123abc..."
          disabled={loading}
        />
      </div>

      <button 
        className="btn btn-secondary" 
        onClick={fetchReportDetails}
        disabled={loading}
        style={{ marginBottom: '15px' }}
      >
        {loading ? 'Loading...' : 'Load Report Details'}
      </button>
      
      {reportDetails && (
        <div style={{
          background: '#f0f9ff',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '2px solid #0ea5e9'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#0369a1' }}>📊 Return Summary</h3>
          <div style={{ fontSize: '14px', color: '#0c4a6e', marginBottom: '8px' }}>
            <strong>Amount to Send:</strong> {reportDetails.amountToSend} MOCK
          </div>
          <div style={{ fontSize: '14px', color: '#0c4a6e', marginBottom: '8px' }}>
            <strong>Reporter Receives:</strong> {(reportDetails.amountToSend - reportDetails.reward).toFixed(2)} MOCK
          </div>
          <div style={{ 
            fontSize: '16px', 
            color: '#059669', 
            fontWeight: 'bold',
            padding: '10px',
            background: '#d1fae5',
            borderRadius: '8px',
            marginTop: '10px'
          }}>
            💰 YOU EARN: {reportDetails.youWillReceive} MOCK (5% reward)
          </div>
        </div>
      )}
      
      {reportDetails && step === 1 && (
        <button 
          className="btn btn-primary" 
          onClick={approveTokens}
          disabled={loading}
        >
          {loading ? 'Approving...' : `Step 1: Approve ${reportDetails.amountToSend} MOCK`}
        </button>
      )}

      {reportDetails && step === 2 && (
        <button 
          className="btn btn-secondary" 
          onClick={returnTokens}
          disabled={loading}
        >
          {loading ? 'Returning...' : `Step 2: Return & Earn ${reportDetails.youWillReceive} MOCK`}
        </button>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
        <p><strong>How it works:</strong></p>
        <p>1. Enter the transaction hash from a report</p>
        <p>2. Load details to see how much you'll earn</p>
        <p>3. Approve the full amount</p>
        <p>4. Return tokens - you automatically get 5% back as reward!</p>
      </div>
    </div>
  );
};

export default Return;