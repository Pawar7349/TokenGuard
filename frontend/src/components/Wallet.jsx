import React from 'react';
import { shortAddress } from '../contracts';

const Wallet = ({ account, balances, onConnect, onRefresh, onMint }) => {
  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    alert('Address copied!');
  };

  return (
    <div className="wallet-info">
      {account ? (
        <>
          <div className="wallet-address">
            {shortAddress(account)}
            <button 
              onClick={copyAddress}
              style={{
                marginLeft: '10px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Copy
            </button>
          </div>
          
          <div className="balances">
            <div className="balance">
              <div className="label">ETH Balance</div>
              <div className="value">{balances.eth} ETH</div>
            </div>
            <div className="balance">
              <div className="label">MOCK Balance</div>
              <div className="value">{balances.mock} MOCK</div>
            </div>
          </div>
          
          <div className="quick-actions">
            <button className="quick-btn" onClick={onRefresh}>
              Refresh
            </button>
            <button className="quick-btn" onClick={onMint}>
              Get MOCK
            </button>
          </div>
        </>
      ) : (
        <button className="btn btn-primary" onClick={onConnect}>
          Connect MetaMask
        </button>
      )}
    </div>
  );
};

export default Wallet;