// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ============================================================================
// REMIXABLE TIMELOCK CONTROLLER - TimelockController.sol
// ============================================================================
// Deploy FIFTH (after RMXStaking)
// Constructor: minDelay, proposers[], executors[], admin
// Network: BASE Mainnet (Chain ID: 8453)
// ============================================================================

// Re-export OpenZeppelin's TimelockController for deployment via Remix
// This file exists for documentation and deployment guide purposes

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title RMXTimelock
 * @dev Timelock controller for governance execution delay
 * 
 * Deployment Parameters:
 * - minDelay: 172800 (48 hours in seconds)
 * - proposers: [RMXGovernor address] (set after Governor deployment)
 * - executors: [address(0)] (anyone can execute after delay)
 * - admin: deployer address (renounce after setup)
 * 
 * Security:
 * - All governance actions must wait 48 hours before execution
 * - Gives community time to react to malicious proposals
 * - Can cancel pending operations if needed
 * 
 * Post-Deployment:
 * 1. Deploy Governor with this Timelock address
 * 2. Grant PROPOSER_ROLE to Governor
 * 3. Grant EXECUTOR_ROLE to address(0) or specific addresses
 * 4. Renounce TIMELOCK_ADMIN_ROLE from deployer
 */
contract RMXTimelock is TimelockController {
    /**
     * @dev Constructor
     * @param minDelay Minimum delay for operations (48 hours = 172800 seconds)
     * @param proposers Array of addresses that can propose (initially empty, add Governor later)
     * @param executors Array of addresses that can execute (address(0) = anyone)
     * @param admin Admin address for initial setup (should renounce later)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
    
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
}
