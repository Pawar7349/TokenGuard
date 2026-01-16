import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './styles.css';

// Components
import Wallet from './components/Wallet';
import Report from './components/Report';
import Return from './components/Return';
import Check from './components/Check';



// Contracts
import {
  TOKENGUARD_ADDRESS,
  MOCK_TOKEN_ADDRESS,
  TOKENGUARD_ABI,
  MOCK_TOKEN_ABI
} from './contracts';

function App() {
  const [account, setAccount] = useState('');
  const [balances, setBalances] = useState({ eth: '0', mock: '0' });
  const [activeTab, setActiveTab] = useState('report');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [contracts, setContracts] = useState(null);

  // Show alert
  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ ...alert, show: false }), 4000);
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      showAlert('Please install MetaMask!', 'error');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Check network
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111) {
        showAlert('Please switch to Sepolia network', 'error');
        return;
      }

      setAccount(accounts[0]);
      
      // Setup contracts
      const tokenGuard = new ethers.Contract(TOKENGUARD_ADDRESS, TOKENGUARD_ABI, signer);
      const mockToken = new ethers.Contract(MOCK_TOKEN_ADDRESS, MOCK_TOKEN_ABI, signer);
      
      setContracts({ tokenGuard, mockToken });
      
      // Load balances
      const ethBalance = await provider.getBalance(accounts[0]);
      const mockBalance = await mockToken.balanceOf(accounts[0]);
      
      setBalances({
        eth: parseFloat(ethers.utils.formatEther(ethBalance)).toFixed(4),
        mock: parseFloat(ethers.utils.formatEther(mockBalance)).toFixed(2)
      });
      
      showAlert('Wallet connected successfully!', 'success');
      
    } catch (error) {
      showAlert('Connection failed: ' + error.message, 'error');
    }
  };

  // Refresh balances
  const refreshBalances = async () => {
    if (!account || !contracts) return;
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const ethBalance = await provider.getBalance(account);
      const mockBalance = await contracts.mockToken.balanceOf(account);
      
      setBalances({
        eth: parseFloat(ethers.utils.formatEther(ethBalance)).toFixed(4),
        mock: parseFloat(ethers.utils.formatEther(mockBalance)).toFixed(2)
      });
      
      showAlert('Balances updated!', 'success');
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  // Mint tokens
  const mintTokens = async () => {
    if (!account || !contracts) {
      showAlert('Connect wallet first', 'error');
      return;
    }
    
    try {
      const tx = await contracts.mockToken.mint(account, ethers.utils.parseEther('1000'));
      await tx.wait();
      showAlert('1000 MOCK tokens minted!', 'success');
      refreshBalances();
    } catch (error) {
      showAlert('Mint failed: ' + error.message, 'error');
    }
  };

  // Auto-connect
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) {
          setTimeout(() => connectWallet(), 500);
        }
      });
    }
  }, []);

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>TokenGuard</h1>
        <p className="tagline">Simple token recovery system</p>
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`alert alert-${alert.type} show`}>
          {alert.message}
        </div>
      )}

      {/* Wallet Info */}
      <Wallet 
        account={account}
        balances={balances}
        onConnect={connectWallet}
        onRefresh={refreshBalances}
        onMint={mintTokens}
      />

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          Report Lost
        </button>
        <button 
          className={`tab ${activeTab === 'return' ? 'active' : ''}`}
          onClick={() => setActiveTab('return')}
        >
          Return & Earn
        </button>
        <button 
          className={`tab ${activeTab === 'check' ? 'active' : ''}`}
          onClick={() => setActiveTab('check')}
        >
          Check Status
        </button>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'report' && (
          <Report 
            contracts={contracts}
            account={account}
            showAlert={showAlert}
          />
        )}
        
        {activeTab === 'return' && (
          <Return 
            contracts={contracts}
            account={account}
            showAlert={showAlert}
          />
        )}
        
        {activeTab === 'check' && (
          <Check 
            contracts={contracts}
            showAlert={showAlert}
          />
        )}
      </div>

      <div className="footer">
        <p>Deployed on Sepolia Testnet</p>
        <p style={{ marginTop: '5px', fontSize: '13px' }}>
          Simple & functional - Built for testing
        </p>
      </div>
    </div>
  );
}

export default App;