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
 * Features:
 * - Custom name/symbol set by creator
 * - Creator receives full initial supply
 * - Built-in revenue distribution (5% platform fee)
 * - Burn function for deflationary mechanics
 * 
 * Created automatically by TokenFactory.createToken()
 */
contract AppToken is ERC20, Ownable {
    address public revenueContract;
    uint256 public constant PLATFORM_FEE = 500; // 5% in basis points
    
    // Events
    event RevenueDistributed(uint256 total, uint256 platformFee, uint256 creatorAmount);
    event RevenueContractUpdated(address indexed oldContract, address indexed newContract);
    
    /**
     * @dev Constructor - called by TokenFactory
     * @param name Token name (e.g., "My App Token")
     * @param symbol Token symbol (e.g., "MAT")
     * @param totalSupply Total supply in whole tokens (will be multiplied by 10^18)
     * @param creator Address of the token creator (receives ownership and supply)
     * @param _revenueContract Address of RevenueDistribution contract for platform fees
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address creator,
        address _revenueContract
    ) ERC20(name, symbol) Ownable(creator) {
        require(creator != address(0), "Invalid creator address");
        require(totalSupply > 0, "Total supply must be greater than 0");
        
        revenueContract = _revenueContract;
        _mint(creator, totalSupply * 10**18);
    }
    
    /**
     * @dev Distribute revenue - sends 5% to platform, 95% to owner
     * Call this with ETH to distribute app revenue
     */
    function distributeRevenue() external payable {
        require(msg.value > 0, "No ETH sent");
        
        uint256 platformFee = (msg.value * PLATFORM_FEE) / 10000;
        uint256 creatorAmount = msg.value - platformFee;
        
        // Send platform fee to revenue distribution contract
        if (revenueContract != address(0) && platformFee > 0) {
            (bool success,) = revenueContract.call{value: platformFee}("");
            require(success, "Platform fee transfer failed");
        }
        
        // Send remainder to token owner (app creator)
        if (creatorAmount > 0) {
            (bool success,) = owner().call{value: creatorAmount}("");
            require(success, "Creator transfer failed");
        }
        
        emit RevenueDistributed(msg.value, platformFee, creatorAmount);
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
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Get the platform fee percentage
     * @return Fee in basis points (500 = 5%)
     */
    function getPlatformFee() external pure returns (uint256) {
        return PLATFORM_FEE;
    }
}
