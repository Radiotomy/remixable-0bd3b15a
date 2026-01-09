// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ============================================================================
// REMIXABLE GOVERNOR - RMXGovernor.sol
// ============================================================================
// Deploy SIXTH (after TimelockController)
// Constructor: _token (RMXToken), _timelock (TimelockController)
// Network: BASE Mainnet (Chain ID: 8453)
// ============================================================================

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title RMXGovernor
 * @dev On-chain governance for the Remixable platform
 * 
 * Features:
 * - RMX token-weighted voting
 * - Proposal creation requires minimum RMX holdings (100,000 RMX)
 * - 1 day voting delay (time to acquire tokens before vote starts)
 * - 7 day voting period
 * - 4% quorum requirement (40M RMX must vote)
 * - 48 hour timelock before execution
 * 
 * Governance Scope:
 * - Platform fee adjustments
 * - Revenue distribution ratios
 * - Contract upgrades
 * - Treasury allocations
 * - Emergency actions
 */
contract RMXGovernor is 
    Governor, 
    GovernorSettings,
    GovernorCountingSimple, 
    GovernorVotes, 
    GovernorVotesQuorumFraction,
    GovernorTimelockControl 
{
    // Custom events
    event ProposalCreatedWithDescription(
        uint256 indexed proposalId,
        address indexed proposer,
        string description
    );
    
    /**
     * @dev Constructor
     * @param _token RMXToken contract (must implement IVotes - ERC20Votes)
     * @param _timelock TimelockController contract address
     * 
     * Settings:
     * - Voting Delay: 7200 blocks (~1 day on Base, 12s blocks)
     * - Voting Period: 50400 blocks (~7 days)
     * - Proposal Threshold: 100,000 RMX (100000e18)
     * - Quorum: 4% of total supply
     */
    constructor(
        IVotes _token,
        TimelockController _timelock
    ) 
        Governor("RMX Governor")
        GovernorSettings(
            7200,       // 1 day voting delay (in blocks)
            50400,      // 7 day voting period (in blocks)
            100000e18   // 100,000 RMX proposal threshold
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {}
    
    // ============ Required Overrides ============
    
    /**
     * @dev Get voting delay in blocks
     */
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }
    
    /**
     * @dev Get voting period in blocks
     */
    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }
    
    /**
     * @dev Get quorum required for a specific block
     */
    function quorum(uint256 blockNumber) 
        public 
        view 
        override(Governor, GovernorVotesQuorumFraction) 
        returns (uint256) 
    {
        return super.quorum(blockNumber);
    }
    
    /**
     * @dev Get current state of a proposal
     */
    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }
    
    /**
     * @dev Check if a proposal needs queuing
     */
    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }
    
    /**
     * @dev Get proposal threshold (minimum tokens needed to create proposal)
     */
    function proposalThreshold() 
        public 
        view 
        override(Governor, GovernorSettings) 
        returns (uint256) 
    {
        return super.proposalThreshold();
    }
    
    /**
     * @dev Internal function to queue operations
     */
    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }
    
    /**
     * @dev Internal function to execute operations
     */
    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }
    
    /**
     * @dev Internal function to cancel operations
     */
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }
    
    /**
     * @dev Get the executor address (timelock)
     */
    function _executor() 
        internal 
        view 
        override(Governor, GovernorTimelockControl) 
        returns (address) 
    {
        return super._executor();
    }
    
    // ============ Helper Functions ============
    
    /**
     * @dev Get proposal details in a friendly format
     * @param proposalId The proposal ID
     * @return currentState The current state of the proposal
     * @return forVotes Number of votes in favor
     * @return againstVotes Number of votes against
     * @return abstainVotes Number of abstain votes
     */
    function getProposalDetails(uint256 proposalId) 
        external 
        view 
        returns (
            ProposalState currentState,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes
        ) 
    {
        currentState = state(proposalId);
        (againstVotes, forVotes, abstainVotes) = proposalVotes(proposalId);
    }
    
    /**
     * @dev Check if an account has voted on a proposal
     * @param proposalId The proposal ID
     * @param account The account to check
     * @return Whether the account has voted
     */
    function hasAccountVoted(uint256 proposalId, address account) 
        external 
        view 
        returns (bool) 
    {
        return hasVoted(proposalId, account);
    }
    
    /**
     * @dev Get the current block number (useful for UI)
     */
    function getCurrentBlock() external view returns (uint256) {
        return block.number;
    }
    
    /**
     * @dev Get voting power of an account at current block
     * @param account The account to check
     */
    function getVotingPower(address account) external view returns (uint256) {
        return getVotes(account, block.number - 1);
    }
}
