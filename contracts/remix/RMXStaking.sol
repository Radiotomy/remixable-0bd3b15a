// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================================================
// REMIXABLE STAKING CONTRACT - RMXStaking.sol
// ============================================================================
// Deploy THIRD (after RMXToken and RevenueDistribution)
// Constructor: _rmxToken (RMXToken contract address)
// Network: BASE Mainnet (Chain ID: 8453)
// ============================================================================

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RMXStaking
 * @dev Staking contract for RMX token holders to earn platform revenue
 * - Stake RMX tokens to receive share of platform fees (85% of all revenue)
 * - Rewards distributed proportionally based on stake
 * - No lock period - unstake anytime
 * - Receive ETH directly from RevenueDistribution contract
 */
contract RMXStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable rmxToken;
    
    // Staking state
    uint256 public totalStaked;
    mapping(address => uint256) public stakedBalance;
    
    // Rewards tracking
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public pendingRewards;
    
    // Staker list for enumeration
    address[] public stakers;
    mapping(address => bool) public isStaker;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDistributed(uint256 amount, uint256 newRewardPerToken);
    
    constructor(address _rmxToken) Ownable(msg.sender) {
        require(_rmxToken != address(0), "Invalid token address");
        rmxToken = IERC20(_rmxToken);
    }
    
    /**
     * @dev Receive ETH from RevenueDistribution contract
     * Automatically distributes to stakers proportionally
     */
    receive() external payable {
        if (msg.value > 0 && totalStaked > 0) {
            // Calculate new reward per token (scaled by 1e18 for precision)
            uint256 rewardPerToken = (msg.value * 1e18) / totalStaked;
            rewardPerTokenStored += rewardPerToken;
            
            emit RewardsDistributed(msg.value, rewardPerTokenStored);
        }
    }
    
    /**
     * @dev Update rewards for a user before any state change
     */
    modifier updateReward(address account) {
        if (account != address(0) && stakedBalance[account] > 0) {
            pendingRewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    /**
     * @dev Calculate earned rewards for an account
     * @param account The address to check
     * @return The amount of ETH rewards earned
     */
    function earned(address account) public view returns (uint256) {
        uint256 balance = stakedBalance[account];
        if (balance == 0) return pendingRewards[account];
        
        uint256 rewardDelta = rewardPerTokenStored - userRewardPerTokenPaid[account];
        return pendingRewards[account] + (balance * rewardDelta) / 1e18;
    }
    
    /**
     * @dev Stake RMX tokens
     * @param amount The amount of RMX to stake
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        
        // Add to staker list if first time
        if (!isStaker[msg.sender]) {
            stakers.push(msg.sender);
            isStaker[msg.sender] = true;
        }
        
        // Update balances
        stakedBalance[msg.sender] += amount;
        totalStaked += amount;
        
        // Transfer tokens to contract
        rmxToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake RMX tokens
     * @param amount The amount of RMX to unstake
     */
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot unstake 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        // Update balances
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        
        // Transfer tokens back to user
        rmxToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev Claim pending ETH rewards
     */
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        
        pendingRewards[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Reward transfer failed");
        
        emit RewardsClaimed(msg.sender, reward);
    }
    
    /**
     * @dev Unstake all and claim rewards in one transaction
     */
    function exit() external nonReentrant updateReward(msg.sender) {
        uint256 stakedAmount = stakedBalance[msg.sender];
        uint256 reward = pendingRewards[msg.sender];
        
        if (stakedAmount > 0) {
            stakedBalance[msg.sender] = 0;
            totalStaked -= stakedAmount;
            rmxToken.safeTransfer(msg.sender, stakedAmount);
            emit Unstaked(msg.sender, stakedAmount);
        }
        
        if (reward > 0) {
            pendingRewards[msg.sender] = 0;
            (bool success, ) = msg.sender.call{value: reward}("");
            require(success, "Reward transfer failed");
            emit RewardsClaimed(msg.sender, reward);
        }
    }
    
    /**
     * @dev Get the number of unique stakers
     * @return The count of stakers
     */
    function getStakerCount() external view returns (uint256) {
        return stakers.length;
    }
    
    /**
     * @dev Get staker info at index
     * @param index The index in the stakers array
     * @return staker The staker address
     * @return balance The staked balance
     * @return rewards The pending rewards
     */
    function getStakerInfo(uint256 index) external view returns (
        address staker,
        uint256 balance,
        uint256 rewards
    ) {
        require(index < stakers.length, "Index out of bounds");
        staker = stakers[index];
        balance = stakedBalance[staker];
        rewards = earned(staker);
    }
    
    /**
     * @dev Get contract ETH balance (undistributed rewards)
     * @return The ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Emergency withdraw for owner (only if contract is deprecated)
     * @param token The token address (address(0) for ETH)
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = owner().call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }
}
