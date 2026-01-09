// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ============================================================================
// REMIXABLE TIMELOCK CONTROLLER - TimelockController.sol
// ============================================================================
// Deploy FIFTH (after RMXStaking)
// Network: BASE Mainnet (Chain ID: 8453)
// ============================================================================
//
// REMIX DEPLOYMENT PARAMETERS:
// ============================
// minDelay:   172800
// proposers:  []
// executors:  ["0x0000000000000000000000000000000000000000"]
// admin:      [YOUR_DEPLOYER_WALLET_ADDRESS]
//
// EXAMPLE (copy/paste ready):
// ---------------------------
// minDelay:   172800
// proposers:  []
// executors:  ["0x0000000000000000000000000000000000000000"]
// admin:      0xYourWalletAddressHere
//
// ============================================================================

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title RMXTimelock
 * @dev Timelock controller for governance execution delay
 * 
 * DEPLOYMENT CONFIGURATION:
 * -------------------------
 * minDelay: 172800 seconds (48 hours)
 *   - All governance actions must wait 48 hours before execution
 *   - Gives community time to react to malicious proposals
 * 
 * proposers: [] (empty array)
 *   - Initially empty - will add RMXGovernor address after its deployment
 *   - Use grantRole(PROPOSER_ROLE, governorAddress) after deploying Governor
 * 
 * executors: ["0x0000000000000000000000000000000000000000"]
 *   - address(0) means ANYONE can execute after delay expires
 *   - This is the recommended setting for decentralized governance
 * 
 * admin: Your deployer wallet address
 *   - Temporary admin for initial setup
 *   - MUST renounce this role after configuration is complete
 * 
 * POST-DEPLOYMENT STEPS:
 * ----------------------
 * 1. Record this Timelock contract address
 * 2. Deploy RMXGovernor with this Timelock address
 * 3. Call: grantRole(PROPOSER_ROLE, RMXGovernorAddress)
 * 4. Call: grantRole(CANCELLER_ROLE, RMXGovernorAddress)
 * 5. Call: renounceRole(TIMELOCK_ADMIN_ROLE, yourAddress)
 */
contract RMXTimelock is TimelockController {
    
    // ========================================================================
    // CONSTANTS - Reference values for deployment
    // ========================================================================
    
    /// @notice Recommended minimum delay: 48 hours in seconds
    uint256 public constant RECOMMENDED_MIN_DELAY = 172800;
    
    /// @notice Zero address for open executor role
    address public constant OPEN_EXECUTOR = address(0);
    
    // ========================================================================
    // CONSTRUCTOR
    // ========================================================================
    
    /**
     * @dev Constructor - Deploy with these exact values in Remix:
     * 
     * @param minDelay      Enter: 172800
     * @param proposers     Enter: []
     * @param executors     Enter: ["0x0000000000000000000000000000000000000000"]
     * @param admin         Enter: Your wallet address (e.g., 0x742d35Cc6...)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
    
    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================
    
    /**
     * @dev Get the minimum delay for operations
     * @return Delay in seconds (172800 = 48 hours)
     */
    function getDelay() external view returns (uint256) {
        return getMinDelay();
    }
    
    /**
     * @dev Check if an operation is pending
     * @param id The operation id (hash of the operation)
     */
    function isOperationPendingById(bytes32 id) external view returns (bool) {
        return isOperationPending(id);
    }
    
    /**
     * @dev Check if an operation is ready to execute
     * @param id The operation id
     */
    function isOperationReadyById(bytes32 id) external view returns (bool) {
        return isOperationReady(id);
    }
    
    /**
     * @dev Check if an operation has been executed
     * @param id The operation id
     */
    function isOperationDoneById(bytes32 id) external view returns (bool) {
        return isOperationDone(id);
    }
    
    /**
     * @dev Get the timestamp when an operation becomes executable
     * @param id The operation id
     * @return Timestamp or 0 if not scheduled
     */
    function getOperationTimestamp(bytes32 id) external view returns (uint256) {
        return getTimestamp(id);
    }
    
    // ========================================================================
    // ROLE CONSTANTS (for reference in Remix)
    // ========================================================================
    
    /**
     * @dev Returns the PROPOSER_ROLE hash for granting to Governor
     * Use this when calling grantRole after Governor deployment
     */
    function getProposerRole() external pure returns (bytes32) {
        return PROPOSER_ROLE;
    }
    
    /**
     * @dev Returns the EXECUTOR_ROLE hash
     */
    function getExecutorRole() external pure returns (bytes32) {
        return EXECUTOR_ROLE;
    }
    
    /**
     * @dev Returns the CANCELLER_ROLE hash for granting to Governor
     */
    function getCancellerRole() external pure returns (bytes32) {
        return CANCELLER_ROLE;
    }
    
    /**
     * @dev Returns the TIMELOCK_ADMIN_ROLE hash for renouncing
     */
    function getAdminRole() external pure returns (bytes32) {
        return DEFAULT_ADMIN_ROLE;
    }
}
