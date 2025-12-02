// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RoyaltyDistribution
 * @dev Handles royalty payments and distribution for collaborators
 */
contract RoyaltyDistribution is ReentrancyGuard, Ownable {
    
    // Mapping from tokenId to royalty payouts
    mapping(uint256 => RoyaltyInfo) public royalties;
    
    // Mapping from address to pending balance
    mapping(address => uint256) public pendingBalances;
    
    // Mapping from tokenId to payout history
    mapping(uint256 => Payout[]) public payoutHistory;
    
    struct RoyaltyInfo {
        address[] recipients;
        uint256[] shares; // in basis points (100 = 1%)
        uint256 totalEarnings;
        uint256 lastPayoutTime;
    }
    
    struct Payout {
        address recipient;
        uint256 amount;
        uint256 timestamp;
        string reason;
    }
    
    event RoyaltyConfigured(
        uint256 indexed tokenId,
        address[] recipients,
        uint256[] shares
    );
    
    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 amount
    );
    
    event BalanceWithdrawn(
        address indexed recipient,
        uint256 amount
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Configure royalty distribution for a recipe
     */
    function configureRoyalty(
        uint256 tokenId,
        address[] memory recipients,
        uint256[] memory shares
    ) public {
        require(recipients.length == shares.length, "Mismatched recipients and shares");
        require(recipients.length > 0, "Must have at least one recipient");
        
        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            require(shares[i] > 0, "Share must be greater than 0");
            totalShares += shares[i];
        }
        
        require(totalShares == 10000, "Total shares must equal 10000 (100%)");
        
        // Remove duplicates validation
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            for (uint256 j = i + 1; j < recipients.length; j++) {
                require(recipients[i] != recipients[j], "Duplicate recipient");
            }
        }
        
        royalties[tokenId].recipients = recipients;
        royalties[tokenId].shares = shares;
        royalties[tokenId].lastPayoutTime = block.timestamp;
        
        emit RoyaltyConfigured(tokenId, recipients, shares);
    }
    
    /**
     * @dev Distribute royalties to all recipients
     */
    function distributeRoyalties(
        uint256 tokenId,
        uint256 amount,
        string memory reason
    ) public payable nonReentrant {
        require(msg.value == amount, "Payment amount mismatch");
        require(amount > 0, "Amount must be greater than 0");
        
        RoyaltyInfo memory royaltyInfo = royalties[tokenId];
        require(royaltyInfo.recipients.length > 0, "No royalty configuration found");
        
        uint256 totalDistributed = 0;
        
        for (uint256 i = 0; i < royaltyInfo.recipients.length; i++) {
            uint256 share = (amount * royaltyInfo.shares[i]) / 10000;
            
            if (share > 0) {
                pendingBalances[royaltyInfo.recipients[i]] += share;
                totalDistributed += share;
                
                // Record payout
                payoutHistory[tokenId].push(Payout({
                    recipient: royaltyInfo.recipients[i],
                    amount: share,
                    timestamp: block.timestamp,
                    reason: reason
                }));
                
                emit RoyaltyPaid(tokenId, royaltyInfo.recipients[i], share);
            }
        }
        
        // Update total earnings
        royalties[tokenId].totalEarnings += amount;
        royalties[tokenId].lastPayoutTime = block.timestamp;
        
        // Handle dust (rounding errors)
        if (totalDistributed < amount) {
            uint256 dust = amount - totalDistributed;
            pendingBalances[royaltyInfo.recipients[0]] += dust;
        }
    }
    
    /**
     * @dev Withdraw pending balance
     */
    function withdrawBalance() public nonReentrant {
        uint256 balance = pendingBalances[msg.sender];
        require(balance > 0, "No pending balance");
        
        pendingBalances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit BalanceWithdrawn(msg.sender, balance);
    }
    
    /**
     * @dev Get pending balance for an address
     */
    function getPendingBalance(address recipient) 
        public 
        view 
        returns (uint256) 
    {
        return pendingBalances[recipient];
    }
    
    /**
     * @dev Get royalty configuration
     */
    function getRoyaltyConfig(uint256 tokenId) 
        public 
        view 
        returns (address[] memory recipients, uint256[] memory shares) 
    {
        return (royalties[tokenId].recipients, royalties[tokenId].shares);
    }
    
    /**
     * @dev Get payout history for a recipe
     */
    function getPayoutHistory(uint256 tokenId) 
        public 
        view 
        returns (Payout[] memory) 
    {
        return payoutHistory[tokenId];
    }
    
    /**
     * @dev Get total earnings for a recipe
     */
    function getTotalEarnings(uint256 tokenId) 
        public 
        view 
        returns (uint256) 
    {
        return royalties[tokenId].totalEarnings;
    }
    
    /**
     * @dev Get earnings breakdown for a recipe
     */
    function getEarningsBreakdown(uint256 tokenId) 
        public 
        view 
        returns (address[] memory recipients, uint256[] memory earnings) 
    {
        RoyaltyInfo memory royaltyInfo = royalties[tokenId];
        uint256[] memory earningsArray = new uint256[](royaltyInfo.recipients.length);
        
        // Calculate earnings per recipient from payout history
        for (uint256 i = 0; i < payoutHistory[tokenId].length; i++) {
            for (uint256 j = 0; j < royaltyInfo.recipients.length; j++) {
                if (payoutHistory[tokenId][i].recipient == royaltyInfo.recipients[j]) {
                    earningsArray[j] += payoutHistory[tokenId][i].amount;
                }
            }
        }
        
        return (royaltyInfo.recipients, earningsArray);
    }
}
