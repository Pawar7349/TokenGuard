// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TokenGuard {
    struct LostToken {
        address reporter;
        address token;
        uint256 amount;
        uint256 reward;
        bool resolved;
        bool disputed;
        address returnedBy;
        uint256 reportTime;
    }
    
    mapping(string => LostToken) public lostTokens;
    
    address public owner;
    uint256 public rewardPercent = 5;
    
    event TokenReported(string txHash, address reporter, uint256 amount, uint256 reward);
    event TokenReturned(string txHash, address returnedBy, uint256 amountToReporter, uint256 rewardToReturner);
    event DisputeFiled(string txHash, address reporter, string reason);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Report lost tokens
    function reportLost(string memory txHash, address tokenAddress, uint256 amount) external {
        require(lostTokens[txHash].reporter == address(0), "Already reported");
        require(amount > 0, "Amount must be > 0");
        
        uint256 reward = (amount * rewardPercent) / 100;
        
        lostTokens[txHash] = LostToken({
            reporter: msg.sender,
            token: tokenAddress,
            amount: amount,
            reward: reward,
            resolved: false,
            disputed: false,
            returnedBy: address(0),
            reportTime: block.timestamp
        });
        
        emit TokenReported(txHash, msg.sender, amount, reward);
    }
    
    // Return lost tokens - FIXED REWARD LOGIC
    function returnTokens(string memory txHash) external {
        LostToken storage lost = lostTokens[txHash];
        require(lost.reporter != address(0), "Token not reported");
        require(!lost.resolved, "Already returned");
        require(msg.sender != lost.reporter, "Cannot return your own token");
        
        IERC20 token = IERC20(lost.token);
        
        // Calculate amounts
        uint256 amountToReporter = lost.amount - lost.reward;  // Reporter gets: original - reward
        uint256 rewardToReturner = lost.reward;                // Returner gets: reward
        
        // Transfer full amount from returner to this contract first
        require(
            token.transferFrom(msg.sender, address(this), lost.amount),
            "Transfer to contract failed"
        );
        
        // Send amount-reward to reporter
        require(
            token.transfer(lost.reporter, amountToReporter),
            "Transfer to reporter failed"
        );
        
        // Send reward to returner
        require(
            token.transfer(msg.sender, rewardToReturner),
            "Transfer reward failed"
        );
        
        // Mark as resolved
        lost.resolved = true;
        lost.returnedBy = msg.sender;
        
        emit TokenReturned(txHash, msg.sender, amountToReporter, rewardToReturner);
    }
    
    // Check status
    function checkStatus(string memory txHash) external view returns(
        address reporter,
        address token,
        uint256 amount,
        uint256 reward,
        bool resolved,
        bool disputed,
        address returnedBy
    ) {
        LostToken memory lost = lostTokens[txHash];
        return (
            lost.reporter,
            lost.token,
            lost.amount,
            lost.reward,
            lost.resolved,
            lost.disputed,
            lost.returnedBy
        );
    }
    
    // File dispute
    function fileDispute(string memory txHash, string memory reason) external {
        LostToken storage lost = lostTokens[txHash];
        require(lost.resolved, "Token not returned yet");
        require(msg.sender == lost.reporter, "Only reporter can dispute");
        require(!lost.disputed, "Already disputed");
        
        lost.disputed = true;
        emit DisputeFiled(txHash, msg.sender, reason);
    }
    
    // Change reward percentage
    function setRewardPercent(uint256 newPercent) external onlyOwner {
        require(newPercent <= 20, "Reward too high");
        rewardPercent = newPercent;
    }
}