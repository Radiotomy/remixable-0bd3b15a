// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================================================
// REMIXABLE APP TOKEN TEMPLATE - AppToken.sol
// ============================================================================
// DO NOT DEPLOY DIRECTLY - This is created by TokenFactory
// This file must be in Remix for TokenFactory to compile
// Network: BASE Mainnet (Chain ID: 8453)
// ============================================================================

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AppToken
 * @dev ERC20 token template for user-created apps on Remixable
 * 
 * Revenue Distribution (per platform tokenomics):
 * - 85% to App Builder (token owner)
 * - 10% to App Token Stakers (AppTokenStaking contract)
 * - 5% to Platform (RevenueDistribution contract)
 * 
 * Features:
 * - Custom name/symbol set by creator
 * - Creator receives full initial supply
 * - Built-in revenue distribution
 * - Burn function for deflationary mechanics
 * 
 * Created automatically by TokenFactory.createToken()
 */
contract AppToken is ERC20, Ownable {
    address public revenueContract;        // Platform revenue distribution
    address public stakingContract;         // App token staking contract
    
    // Revenue split in basis points (10000 = 100%)
    uint256 public constant BUILDER_FEE = 8500;    // 85% to app builder
    uint256 public constant STAKER_FEE = 1000;     // 10% to token stakers
    uint256 public constant PLATFORM_FEE = 500;    // 5% to platform
    
    // Events
    event RevenueDistributed(
        uint256 total, 
        uint256 builderAmount, 
        uint256 stakerAmount, 
        uint256 platformAmount
    );
    event RevenueContractUpdated(address indexed oldContract, address indexed newContract);
    event StakingContractUpdated(address indexed oldContract, address indexed newContract);
    
    /**
     * @dev Constructor - called by TokenFactory
     * @param name Token name (e.g., "My App Token")
     * @param symbol Token symbol (e.g., "MAT")
     * @param totalSupply Total supply in whole tokens (will be multiplied by 10^18)
     * @param creator Address of the token creator (receives ownership and supply)
     * @param _revenueContract Address of RevenueDistribution contract for platform fees
     * @param _stakingContract Address of AppTokenStaking contract for holder rewards
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address creator,
        address _revenueContract,
        address _stakingContract
    ) ERC20(name, symbol) Ownable(creator) {
        require(creator != address(0), "Invalid creator address");
        require(totalSupply > 0, "Total supply must be greater than 0");
        
        revenueContract = _revenueContract;
        stakingContract = _stakingContract;
        _mint(creator, totalSupply * 10**18);
    }
    
    /**
     * @dev Distribute revenue according to tokenomics
     * - 85% to App Builder (owner)
     * - 10% to App Token Stakers
     * - 5% to Platform
     * Call this with ETH to distribute app revenue
     */
    function distributeRevenue() external payable {
        require(msg.value > 0, "No ETH sent");
        
        uint256 platformAmount = (msg.value * PLATFORM_FEE) / 10000;
        uint256 stakerAmount = (msg.value * STAKER_FEE) / 10000;
        uint256 builderAmount = msg.value - platformAmount - stakerAmount;
        
        // Send platform fee to revenue distribution contract
        if (revenueContract != address(0) && platformAmount > 0) {
            (bool success,) = revenueContract.call{value: platformAmount}("");
            require(success, "Platform fee transfer failed");
        }
        
        // Send staker rewards to staking contract
        if (stakingContract != address(0) && stakerAmount > 0) {
            (bool success,) = stakingContract.call{value: stakerAmount}("");
            require(success, "Staker reward transfer failed");
        } else if (stakerAmount > 0) {
            // If no staking contract, add to builder amount
            builderAmount += stakerAmount;
            stakerAmount = 0;
        }
        
        // Send remainder to token owner (app builder)
        if (builderAmount > 0) {
            (bool success,) = owner().call{value: builderAmount}("");
            require(success, "Builder transfer failed");
        }
        
        emit RevenueDistributed(msg.value, builderAmount, stakerAmount, platformAmount);
    }
    
    /**
     * @dev Update the revenue contract address
     * @param _newRevenueContract New RevenueDistribution contract address
     */
    function setRevenueContract(address _newRevenueContract) external onlyOwner {
        address oldContract = revenueContract;
        revenueContract = _newRevenueContract;
        emit RevenueContractUpdated(oldContract, _newRevenueContract);
    }
    
    /**
     * @dev Update the staking contract address
     * @param _newStakingContract New AppTokenStaking contract address
     */
    function setStakingContract(address _newStakingContract) external onlyOwner {
        address oldContract = stakingContract;
        stakingContract = _newStakingContract;
        emit StakingContractUpdated(oldContract, _newStakingContract);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Get the fee percentages
     * @return builder Builder fee in basis points
     * @return staker Staker fee in basis points
     * @return platform Platform fee in basis points
     */
    function getFees() external pure returns (uint256 builder, uint256 staker, uint256 platform) {
        return (BUILDER_FEE, STAKER_FEE, PLATFORM_FEE);
    }
    
    /**
     * @dev Receive ETH and auto-distribute (convenience function)
     */
    receive() external payable {
        if (msg.value > 0) {
            // Calculate splits
            uint256 platformAmount = (msg.value * PLATFORM_FEE) / 10000;
            uint256 stakerAmount = (msg.value * STAKER_FEE) / 10000;
            uint256 builderAmount = msg.value - platformAmount - stakerAmount;
            
            // Distribute
            if (revenueContract != address(0) && platformAmount > 0) {
                (bool s1,) = revenueContract.call{value: platformAmount}("");
                require(s1, "Platform transfer failed");
            }
            
            if (stakingContract != address(0) && stakerAmount > 0) {
                (bool s2,) = stakingContract.call{value: stakerAmount}("");
                require(s2, "Staker transfer failed");
            } else {
                builderAmount += stakerAmount;
            }
            
            if (builderAmount > 0) {
                (bool s3,) = owner().call{value: builderAmount}("");
                require(s3, "Builder transfer failed");
            }
            
            emit RevenueDistributed(msg.value, builderAmount, stakerAmount, platformAmount);
        }
    }
}
