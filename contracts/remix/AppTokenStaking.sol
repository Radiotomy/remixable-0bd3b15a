// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================================================
// REMIXABLE APP TOKEN STAKING - AppTokenStaking.sol
// ============================================================================
// Deployed automatically by TokenFactory for each AppToken
// Constructor: _appToken (AppToken contract address)
// Network: BASE Mainnet (Chain ID: 8453)
// ============================================================================

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AppTokenStaking
 * @dev Staking contract for individual AppToken holders to earn app revenue
 * - Stake AppTokens to receive 10% of that app's revenue
 * - Rewards distributed proportionally based on stake
 * - No lock period - unstake anytime
 * - Receive ETH directly from AppToken revenue distribution
 */
contract AppTokenStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable appToken;
    
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
    
    // Lifetime stats
    uint256 public totalRewardsDistributed;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDistributed(uint256 amount, uint256 newRewardPerToken);
    
    constructor(address _appToken) Ownable(msg.sender) {
        require(_appToken != address(0), "Invalid token address");
        appToken = IERC20(_appToken);
    }
    
    /**
     * @dev Receive ETH from AppToken contract (10% of app revenue)
     * Automatically distributes to stakers proportionally
     */
    receive() external payable {
        if (msg.value > 0 && totalStaked > 0) {
            // Calculate new reward per token (scaled by 1e18 for precision)
            uint256 rewardPerToken = (msg.value * 1e18) / totalStaked;
            rewardPerTokenStored += rewardPerToken;
            totalRewardsDistributed += msg.value;
            
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
     * @dev Stake AppTokens
     * @param amount The amount of tokens to stake
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
        appToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake AppTokens
     * @param amount The amount of tokens to unstake
     */
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot unstake 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        // Update balances
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        
        // Transfer tokens back to user
        appToken.safeTransfer(msg.sender, amount);
        
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
            appToken.safeTransfer(msg.sender, stakedAmount);
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
     * @dev Get total rewards distributed over lifetime
     * @return Total ETH distributed
     */
    function getTotalRewardsDistributed() external view returns (uint256) {
        return totalRewardsDistributed;
    }
    
    /**
     * @dev Get user's stake percentage
     * @param user The user address
     * @return Percentage in basis points (10000 = 100%)
     */
    function getUserStakePercentage(address user) external view returns (uint256) {
        if (totalStaked == 0) return 0;
        return (stakedBalance[user] * 10000) / totalStaked;
    }
}
