// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================================================
// REMIXABLE TOKEN FACTORY - TokenFactory.sol
// ============================================================================
// Deploy this contract SEVENTH (after RMXGovernor)
// Constructor: No parameters required
// Network: BASE Mainnet (Chain ID: 8453)
// ============================================================================

import "./AppToken.sol";
import "./AppTokenStaking.sol";

/**
 * @title TokenFactory
 * @dev Factory contract for creating AppTokens with integrated staking on Remixable platform
 * 
 * Features:
 * - Creates new AppToken instances for users
 * - Automatically deploys AppTokenStaking for each token
 * - Tracks all tokens created per user
 * - Uses CREATE2 for deterministic addresses
 * - Emits events for indexing and tracking
 * 
 * Usage:
 * 1. Deploy this contract
 * 2. Call createToken() with token details
 * 3. New AppToken + AppTokenStaking are created and tracked
 */
contract TokenFactory {
    // Events
    event TokenCreated(
        address indexed token, 
        address indexed staking,
        address indexed creator, 
        string name, 
        string symbol,
        uint256 totalSupply,
        uint256 timestamp
    );
    
    // Token info struct
    struct TokenInfo {
        address token;
        address staking;
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 createdAt;
    }
    
    // Storage
    mapping(address => TokenInfo[]) public userTokens;
    TokenInfo[] public allTokens;
    
    // Mapping token address to staking address
    mapping(address => address) public tokenToStaking;
    
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
     * @dev Create a new AppToken with integrated staking
     * @param name Token name (e.g., "My App Token")
     * @param symbol Token symbol (e.g., "MAT")
     * @param totalSupply Total supply in whole tokens
     * @param revenueContract Optional: specific revenue contract (0x0 uses default)
     * @return tokenAddress Address of the newly created token
     * @return stakingAddress Address of the staking contract for this token
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address revenueContract
    ) external returns (address tokenAddress, address stakingAddress) {
        // Use default revenue contract if none specified
        address actualRevenueContract = revenueContract != address(0) 
            ? revenueContract 
            : defaultRevenueContract;
        
        // Generate salt for CREATE2 (deterministic address)
        bytes32 salt = keccak256(
            abi.encodePacked(msg.sender, name, symbol, block.timestamp)
        );
        
        // First deploy the staking contract (needs token address, but we'll set it after)
        // We need to deploy token first to get its address for staking
        
        // Deploy AppToken first with placeholder staking address
        AppToken token = new AppToken{salt: salt}(
            name,
            symbol,
            totalSupply,
            msg.sender,
            actualRevenueContract,
            address(0)  // Placeholder, will update
        );
        tokenAddress = address(token);
        
        // Deploy AppTokenStaking with the token address
        bytes32 stakingSalt = keccak256(
            abi.encodePacked(salt, "staking")
        );
        AppTokenStaking staking = new AppTokenStaking{salt: stakingSalt}(tokenAddress);
        stakingAddress = address(staking);
        
        // Update token with staking address
        // Note: This requires the token owner to call setStakingContract
        // We transfer ownership of staking to token creator
        staking.transferOwnership(msg.sender);
        
        // Store mapping
        tokenToStaking[tokenAddress] = stakingAddress;
        
        // Track the token
        TokenInfo memory info = TokenInfo({
            token: tokenAddress,
            staking: stakingAddress,
            name: name,
            symbol: symbol,
            totalSupply: totalSupply,
            createdAt: block.timestamp
        });
        
        userTokens[msg.sender].push(info);
        allTokens.push(info);
        
        // Emit event for indexing
        emit TokenCreated(
            tokenAddress,
            stakingAddress,
            msg.sender, 
            name, 
            symbol, 
            totalSupply,
            block.timestamp
        );
        
        return (tokenAddress, stakingAddress);
    }
    
    /**
     * @dev Get all tokens created by a specific user
     * @param user Address of the user
     * @return Array of token info
     */
    function getUserTokens(address user) external view returns (TokenInfo[] memory) {
        return userTokens[user];
    }
    
    /**
     * @dev Get token addresses only for a user
     * @param user Address of the user
     * @return tokens Array of token addresses
     * @return stakings Array of staking addresses
     */
    function getUserTokenAddresses(address user) external view returns (
        address[] memory tokens,
        address[] memory stakings
    ) {
        TokenInfo[] storage infos = userTokens[user];
        tokens = new address[](infos.length);
        stakings = new address[](infos.length);
        
        for (uint256 i = 0; i < infos.length; i++) {
            tokens[i] = infos[i].token;
            stakings[i] = infos[i].staking;
        }
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
     * @dev Get staking contract for a token
     * @param token The token address
     * @return The staking contract address
     */
    function getStakingContract(address token) external view returns (address) {
        return tokenToStaking[token];
    }
    
    /**
     * @dev Get all tokens (paginated)
     * @param offset Starting index
     * @param limit Maximum number of tokens to return
     * @return Array of token info
     */
    function getAllTokens(uint256 offset, uint256 limit) external view returns (TokenInfo[] memory) {
        uint256 total = allTokens.length;
        
        if (offset >= total) {
            return new TokenInfo[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 resultLength = end - offset;
        TokenInfo[] memory result = new TokenInfo[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allTokens[offset + i];
        }
        
        return result;
    }
    
    /**
     * @dev Get token info by index
     * @param index The index in allTokens array
     */
    function getTokenInfo(uint256 index) external view returns (TokenInfo memory) {
        require(index < allTokens.length, "Index out of bounds");
        return allTokens[index];
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
