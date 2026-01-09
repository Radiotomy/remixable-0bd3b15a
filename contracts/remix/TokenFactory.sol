// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================================================
// REMIXABLE TOKEN FACTORY - TokenFactory.sol
// ============================================================================
// Deploy this contract THIRD (after RMXToken and RevenueDistribution)
// Constructor: No parameters required
// Network: BASE Mainnet (Chain ID: 8453)
// ============================================================================

import "./AppToken.sol";

/**
 * @title TokenFactory
 * @dev Factory contract for creating AppTokens on Remixable platform
 * 
 * Features:
 * - Creates new AppToken instances for users
 * - Tracks all tokens created per user
 * - Uses CREATE2 for deterministic addresses
 * - Emits events for indexing and tracking
 * 
 * Usage:
 * 1. Deploy this contract
 * 2. Call createToken() with token details
 * 3. New AppToken is created and tracked
 */
contract TokenFactory {
    // Events
    event TokenCreated(
        address indexed token, 
        address indexed creator, 
        string name, 
        string symbol,
        uint256 totalSupply,
        uint256 timestamp
    );
    
    // Storage
    mapping(address => address[]) public userTokens;
    address[] public allTokens;
    
    // Default revenue contract (can be updated per-token)
    address public defaultRevenueContract;
    
    // Owner for admin functions
    address public owner;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @dev Constructor
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Set the default revenue distribution contract
     * @param _revenueContract Address of RevenueDistribution contract
     */
    function setDefaultRevenueContract(address _revenueContract) external onlyOwner {
        defaultRevenueContract = _revenueContract;
    }
    
    /**
     * @dev Create a new AppToken
     * @param name Token name (e.g., "My App Token")
     * @param symbol Token symbol (e.g., "MAT")
     * @param totalSupply Total supply in whole tokens
     * @param revenueContract Optional: specific revenue contract (0x0 uses default)
     * @return tokenAddress Address of the newly created token
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address revenueContract
    ) external returns (address tokenAddress) {
        // Use default revenue contract if none specified
        address actualRevenueContract = revenueContract != address(0) 
            ? revenueContract 
            : defaultRevenueContract;
        
        // Generate salt for CREATE2 (deterministic address)
        bytes32 salt = keccak256(
            abi.encodePacked(msg.sender, name, symbol, block.timestamp)
        );
        
        // Deploy new AppToken using CREATE2
        AppToken token = new AppToken{salt: salt}(
            name,
            symbol,
            totalSupply,
            msg.sender,
            actualRevenueContract
        );
        
        tokenAddress = address(token);
        
        // Track the token
        userTokens[msg.sender].push(tokenAddress);
        allTokens.push(tokenAddress);
        
        // Emit event for indexing
        emit TokenCreated(
            tokenAddress, 
            msg.sender, 
            name, 
            symbol, 
            totalSupply,
            block.timestamp
        );
        
        return tokenAddress;
    }
    
    /**
     * @dev Get all tokens created by a specific user
     * @param user Address of the user
     * @return Array of token addresses
     */
    function getUserTokens(address user) external view returns (address[] memory) {
        return userTokens[user];
    }
    
    /**
     * @dev Get the total number of tokens created
     * @return Total count of all tokens
     */
    function getTotalTokens() external view returns (uint256) {
        return allTokens.length;
    }
    
    /**
     * @dev Get token count for a specific user
     * @param user Address of the user
     * @return Number of tokens created by the user
     */
    function getUserTokenCount(address user) external view returns (uint256) {
        return userTokens[user].length;
    }
    
    /**
     * @dev Get all tokens (paginated)
     * @param offset Starting index
     * @param limit Maximum number of tokens to return
     * @return Array of token addresses
     */
    function getAllTokens(uint256 offset, uint256 limit) external view returns (address[] memory) {
        uint256 total = allTokens.length;
        
        if (offset >= total) {
            return new address[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 resultLength = end - offset;
        address[] memory result = new address[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allTokens[offset + i];
        }
        
        return result;
    }
    
    /**
     * @dev Transfer ownership
     * @param newOwner Address of new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
