# 🛡️ TokenGuard

A decentralized protocol for recovering lost ERC-20 tokens on Ethereum. If you accidentally send tokens to the wrong address, you can report the transaction, and community members can help return them in exchange for a 5% reward. TokenGuard demonstrates how blockchain technology and economic incentives can solve real-world problems.

---

## 🚀 Live Demo & Deployment

**🌐 Live Application:** [tokenguard.netlify.app](https://tokenn-guard.netlify.app/)

**📜 Verified Smart Contracts (Sepolia Testnet):**
- **TokenGuard Contract:** [`0x9FECAeCc66369b4cDb68cC687B983E87D0aab091`](https://sepolia.etherscan.io/address/0x9FECAeCc66369b4cDb68cC687B983E87D0aab091)
- **MockERC20 Token:** [`0x7cD9B8689C5D19CB4e4F45A23d14Beb4411aB87E`](https://sepolia.etherscan.io/address/0x7cD9B8689C5D19CB4e4F45A23d14Beb4411aB87E)

**💻 Source Code:** [github.com/Pawar7349/TokenGuard](https://github.com/Pawar7349/TokenGuard)

---

## 🎯 Problem Statement

Blockchain transactions are irreversible. If you accidentally send tokens to the wrong address, there's no "undo" button. TokenGuard creates a community-driven solution where economic incentives encourage honest returns.

---

## ✨ Key Features

- **Report Lost Tokens:** Submit transaction hash, token address, and amount to create a public recovery request
- **Automated 5% Reward System:** Returners automatically earn rewards when helping recover tokens
- ** Transparent Status Tracking:** Anyone can check the status of any report on-chain
- **Dispute Mechanism:** Reporters can flag incorrect returns for review
- **Secure & Trustless:** All logic runs on-chain with no intermediaries
- **Configurable Rewards:** Contract owner can adjust reward percentage (capped at 20%)

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Smart Contracts** | Solidity 0.8.20 |
| **Development Framework** | Hardhat 2.22.0 |
| **Testing** | Hardhat/Waffle/Chai |
| **Frontend** | React.js, Ethers.js v5 |
| **Styling** | Custom CSS |
| **Blockchain** | Ethereum Sepolia Testnet |
| **Deployment** | Netlify (Frontend), Hardhat (Contracts) |
| **Web3 Integration** | MetaMask, Ethers.js |

---

## 🏗️ How It Works

### 1️⃣ **Report Lost Tokens**
Alice accidentally sends 100 MOCK tokens to the wrong address. She calls `reportLost()` with:
- Transaction hash
- Token contract address
- Amount lost (100 MOCK)

The contract automatically calculates the 5% reward (5 MOCK) and stores the report.

### 2️⃣ **Return Tokens & Earn Reward**
Bob, who received the tokens, sees the report and decides to return them:
1. Approves 100 MOCK to the TokenGuard contract
2. Calls `returnTokens()` with the transaction hash
3. The contract automatically:
   - Receives 100 MOCK from Bob
   - Sends 95 MOCK to Alice (original owner)
   - Sends 5 MOCK back to Bob (reward)

### 3️⃣ **Verify & Dispute**
Anyone can call `checkStatus()` to view report details. If something's wrong, Alice can file a dispute with `fileDispute()`.

---

## 📦 Quick Start Guide

### Prerequisites
- Node.js v16+
- MetaMask browser extension
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone repository
git clone https://github.com/Pawar7349/TokenGuard.git
cd TokenGuard

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY
```

### Local Testing

```bash
# Compile contracts
npx hardhat compile

# Run test suite (26/26 tests should pass)
npx hardhat test

# Start local Hardhat node
npx hardhat node

# In new terminal: Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy to Sepolia

```bash
# Deploy contracts
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <TOKENGUARD_ADDRESS>
npx hardhat verify --network sepolia <MOCK_TOKEN_ADDRESS>
```

---



---

## Smart Contract Functions

### TokenGuard.sol

**Public Functions:**
```solidity
// Report lost tokens
function reportLost(string txHash, address token, uint256 amount)

// Return tokens to reporter and earn reward
function returnTokens(string txHash)

// Check report status (view function)
function checkStatus(string txHash) view returns (...)

// File dispute on incorrect return
function fileDispute(string txHash, string reason)
```

**Owner Functions:**
```solidity
// Adjust reward percentage (max 20%)
function setRewardPercent(uint256 newPercent) onlyOwner
```

---

## 🧪 Testing

Comprehensive test suite with 26 passing tests covering:
- ✅ Contract deployment and initialization
- ✅ Report creation and validation
- ✅ Token approval and return flow
- ✅ Reward calculation and distribution
- ✅ Dispute filing mechanism
- ✅ Edge cases (double reports, self-returns, insufficient balance)
- ✅ Access control (owner-only functions)

**Run tests:**
```bash
npx hardhat test
```

**Expected output:**
```
TokenGuard Tests
  ✓ Should deploy correctly
  ✓ Should report lost tokens
  ✓ Should return tokens and pay reward
  ✓ Should prevent double reporting
  ✓ Should allow dispute filing
  ... (26 passing)
```

---


---

## 🔐 Security Considerations

**Implemented:**
- ✅ OpenZeppelin-style interfaces
- ✅ Reentrancy protection through checks-effects-interactions pattern
- ✅ Input validation on all functions
- ✅ Access control for admin functions
- ✅ Safe math (Solidity 0.8.x built-in overflow protection)

**Limitations & Future Improvements:**
- No stake required for reporting (could enable spam)
- Purely incentive-based (relies on economic rationality)
- No transaction hash verification on-chain
- Simple dispute mechanism (no arbitration)

See **Roadmap** section for planned improvements.

---


---

---

## 💡 Use Cases

1. **Accidental Wrong Address:** User sends USDT to wrong address, can request return
2. **Fat-finger Mistakes:** User sends 1000 tokens instead of 100
3. **Educational Tool:** Demonstrates blockchain recovery mechanisms
4. **Community Building:** Encourages honest behavior through economic incentives

---

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Author & Contact

**Pratik Pawar** - Blockchain Developer

- Email: [pawarpratik7349@gmail.com](mailto:pawarpratik7349@gmail.com)
- LinkedIn: [linkedin.com/in/pratik-pawar-600731237](https://www.linkedin.com/in/pratik-pawar-600731237/)
- Twitter: [@PratikP43786754](https://twitter.com/PratikP43786754)
- GitHub: [@Pawar7349](https://github.com/Pawar7349)
- Portfolio: [pratik-myportfolio.netlify.app](https://pratik-myportfolio.netlify.app)

---

