import { ethers } from 'ethers';

// Contract Addresses
export const TOKENGUARD_ADDRESS = '0x9FECAeCc66369b4cDb68cC687B983E87D0aab091';
export const MOCK_TOKEN_ADDRESS = '0x7cD9B8689C5D19CB4e4F45A23d14Beb4411aB87E';

// ABIs 
export const TOKENGUARD_ABI = [
  "function reportLost(string txHash, address token, uint256 amount)",
  "function returnTokens(string txHash)",
  "function checkStatus(string txHash) view returns (address reporter, address token, uint256 amount, uint256 reward, bool resolved, bool disputed, address returnedBy)"
];

export const MOCK_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) external"
];

//  Short address
export const shortAddress = (addr) => {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
};