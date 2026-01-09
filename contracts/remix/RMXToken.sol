// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================================================
// REMIXABLE PLATFORM TOKEN - RMXToken.sol
// ============================================================================
// Deploy this contract FIRST
// Constructor: No parameters required
// Network: BASE Mainnet (Chain ID: 8453)
// ============================================================================

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RMXToken
 * @dev The native platform token for Remixable
 * - Total Supply: 1,000,000,000 RMX (1 billion)
 * - Includes burn function for deflationary mechanics
 * - Owner receives entire supply on deployment
 */
contract RMXToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens
    
    constructor() ERC20("Remixable", "RMX") Ownable(msg.sender) {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    /**
     * @dev Allows token holders to burn their tokens
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
