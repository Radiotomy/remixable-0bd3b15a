// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================================================
// REMIXABLE REVENUE DISTRIBUTION - RevenueDistribution.sol
// ============================================================================
// Deploy this contract SECOND (after RMXToken)
// Constructor: Requires RMXToken address
// Network: BASE Mainnet (Chain ID: 8453)
// ============================================================================

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title RevenueDistribution
 * @dev Handles platform fee distribution from AppTokens
 * 
 * Revenue Split:
 * - 85% to Staking Contract (rewards for RMX stakers)
 * - 10% to Platform Development
 * - 5% to Platform Operations
 * 
 * This contract receives the 5% platform fee from all AppToken revenue
 */
contract RevenueDistribution is Ownable {
    IERC20 public rmxToken;
    
    // Distribution percentages (in basis points, 10000 = 100%)
    uint256 public constant STAKING_REWARDS = 8500;      // 85%
    uint256 public constant PLATFORM_DEVELOPMENT = 1000; // 10%
    uint256 public constant PLATFORM_OPERATIONS = 500;   // 5%
    
    // Recipient addresses (set by owner after deployment)
    address public stakingContract;
    address public developmentWallet;
    address public operationsWallet;
    
    // Events
    event RevenueDistributed(
        uint256 total, 
        uint256 staking, 
        uint256 development, 
        uint256 operations
    );
    event AddressesUpdated(
        address stakingContract, 
        address developmentWallet, 
        address operationsWallet
    );
    
    /**
     * @dev Constructor
     * @param _rmxToken Address of the RMXToken contract
     */
    constructor(address _rmxToken) Ownable(msg.sender) {
        require(_rmxToken != address(0), "Invalid RMX token address");
        rmxToken = IERC20(_rmxToken);
    }
    
    /**
     * @dev Set the distribution recipient addresses
     * @param _stakingContract Address of staking contract
     * @param _developmentWallet Address for development funds
     * @param _operationsWallet Address for operations funds
     */
    function setAddresses(
        address _stakingContract,
        address _developmentWallet,
        address _operationsWallet
    ) external onlyOwner {
        stakingContract = _stakingContract;
        developmentWallet = _developmentWallet;
        operationsWallet = _operationsWallet;
        
        emit AddressesUpdated(_stakingContract, _developmentWallet, _operationsWallet);
    }
    
    /**
     * @dev Receive ETH and automatically distribute
     */
    receive() external payable {
        if (msg.value > 0) {
            distributeRevenue();
        }
    }
    
    /**
     * @dev Distribute accumulated ETH to recipients
     * Can be called manually if needed
     */
    function distributeRevenue() public {
        uint256 balance = address(this).balance;
        require(balance > 0, "No revenue to distribute");
        
        uint256 stakingAmount = (balance * STAKING_REWARDS) / 10000;
        uint256 developmentAmount = (balance * PLATFORM_DEVELOPMENT) / 10000;
        uint256 operationsAmount = (balance * PLATFORM_OPERATIONS) / 10000;
        
        // Transfer to staking contract
        if (stakingContract != address(0) && stakingAmount > 0) {
            (bool success,) = stakingContract.call{value: stakingAmount}("");
            require(success, "Staking transfer failed");
        }
        
        // Transfer to development wallet
        if (developmentWallet != address(0) && developmentAmount > 0) {
            (bool success,) = developmentWallet.call{value: developmentAmount}("");
            require(success, "Development transfer failed");
        }
        
        // Transfer to operations wallet
        if (operationsWallet != address(0) && operationsAmount > 0) {
            (bool success,) = operationsWallet.call{value: operationsAmount}("");
            require(success, "Operations transfer failed");
        }
        
        emit RevenueDistributed(balance, stakingAmount, developmentAmount, operationsAmount);
    }
    
    /**
     * @dev Get current ETH balance of the contract
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
