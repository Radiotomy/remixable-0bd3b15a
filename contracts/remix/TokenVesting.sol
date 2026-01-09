// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================================================
// REMIXABLE TOKEN VESTING - TokenVesting.sol
// ============================================================================
// Deploy SECOND (after RMXToken)
// Constructor: _rmxToken (RMXToken contract address)
// Network: BASE Mainnet (Chain ID: 8453)
// ============================================================================

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenVesting
 * @dev Vesting contract for RMX token distribution to team and partners
 * 
 * Tokenomics Allocations (per documentation):
 * - Development Team: 20% (200M RMX) - 6 month cliff, 24 month linear vest
 * - Partnerships: 15% (150M RMX) - Flexible vesting, revocable
 * 
 * Features:
 * - Multiple vesting schedules per beneficiary
 * - Configurable cliff and duration
 * - Revocable schedules (for partnerships)
 * - Irrevocable schedules (for team)
 * - Claim vested tokens anytime after cliff
 */
contract TokenVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable rmxToken;
    
    struct VestingSchedule {
        uint256 totalAmount;      // Total tokens to vest
        uint256 startTime;        // Vesting start timestamp
        uint256 cliffDuration;    // Cliff period in seconds
        uint256 vestingDuration;  // Total vesting duration (including cliff)
        uint256 released;         // Amount already released
        bool revocable;           // Can be revoked by owner
        bool revoked;             // Has been revoked
    }
    
    // Beneficiary => Schedule ID => VestingSchedule
    mapping(address => mapping(uint256 => VestingSchedule)) public vestingSchedules;
    mapping(address => uint256) public scheduleCount;
    
    // Track all beneficiaries
    address[] public beneficiaries;
    mapping(address => bool) public isBeneficiary;
    
    // Total tokens held for vesting
    uint256 public totalVestedAmount;
    uint256 public totalReleasedAmount;
    
    // Events
    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 indexed scheduleId,
        uint256 amount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    );
    event TokensReleased(address indexed beneficiary, uint256 indexed scheduleId, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 indexed scheduleId, uint256 unvestedAmount);
    
    constructor(address _rmxToken) Ownable(msg.sender) {
        require(_rmxToken != address(0), "Invalid token address");
        rmxToken = IERC20(_rmxToken);
    }
    
    /**
     * @dev Create a new vesting schedule
     * @param beneficiary Address to receive vested tokens
     * @param amount Total amount of tokens to vest
     * @param startTime When vesting begins (use block.timestamp for immediate)
     * @param cliffDuration Cliff period in seconds (e.g., 6 months = 15778800)
     * @param vestingDuration Total vesting period including cliff (e.g., 24 months = 63115200)
     * @param revocable Whether owner can revoke unvested tokens
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        require(vestingDuration >= cliffDuration, "Vesting must be >= cliff");
        require(vestingDuration > 0, "Duration must be > 0");
        
        // Transfer tokens to this contract
        rmxToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Add to beneficiaries list if new
        if (!isBeneficiary[beneficiary]) {
            beneficiaries.push(beneficiary);
            isBeneficiary[beneficiary] = true;
        }
        
        // Create schedule
        uint256 scheduleId = scheduleCount[beneficiary];
        vestingSchedules[beneficiary][scheduleId] = VestingSchedule({
            totalAmount: amount,
            startTime: startTime,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            released: 0,
            revocable: revocable,
            revoked: false
        });
        
        scheduleCount[beneficiary]++;
        totalVestedAmount += amount;
        
        emit VestingScheduleCreated(
            beneficiary,
            scheduleId,
            amount,
            startTime,
            cliffDuration,
            vestingDuration,
            revocable
        );
    }
    
    /**
     * @dev Calculate vested amount for a schedule
     * @param beneficiary The beneficiary address
     * @param scheduleId The schedule index
     * @return The amount of tokens vested so far
     */
    function vestedAmount(address beneficiary, uint256 scheduleId) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary][scheduleId];
        
        if (schedule.revoked) {
            return schedule.released; // Only count what was already released
        }
        
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0; // Still in cliff period
        }
        
        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return schedule.totalAmount; // Fully vested
        }
        
        // Linear vesting after cliff
        uint256 timeVested = block.timestamp - schedule.startTime;
        return (schedule.totalAmount * timeVested) / schedule.vestingDuration;
    }
    
    /**
     * @dev Calculate releasable (vested but unclaimed) amount
     * @param beneficiary The beneficiary address
     * @param scheduleId The schedule index
     * @return The amount of tokens that can be claimed
     */
    function releasableAmount(address beneficiary, uint256 scheduleId) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary][scheduleId];
        return vestedAmount(beneficiary, scheduleId) - schedule.released;
    }
    
    /**
     * @dev Release vested tokens for a schedule
     * @param scheduleId The schedule index
     */
    function release(uint256 scheduleId) external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[msg.sender][scheduleId];
        require(schedule.totalAmount > 0, "No vesting schedule");
        require(!schedule.revoked, "Schedule was revoked");
        
        uint256 amount = releasableAmount(msg.sender, scheduleId);
        require(amount > 0, "Nothing to release");
        
        schedule.released += amount;
        totalReleasedAmount += amount;
        
        rmxToken.safeTransfer(msg.sender, amount);
        
        emit TokensReleased(msg.sender, scheduleId, amount);
    }
    
    /**
     * @dev Release all vested tokens across all schedules
     */
    function releaseAll() external nonReentrant {
        uint256 totalReleasable = 0;
        uint256 count = scheduleCount[msg.sender];
        
        for (uint256 i = 0; i < count; i++) {
            uint256 amount = releasableAmount(msg.sender, i);
            if (amount > 0) {
                vestingSchedules[msg.sender][i].released += amount;
                totalReleasable += amount;
                emit TokensReleased(msg.sender, i, amount);
            }
        }
        
        require(totalReleasable > 0, "Nothing to release");
        totalReleasedAmount += totalReleasable;
        rmxToken.safeTransfer(msg.sender, totalReleasable);
    }
    
    /**
     * @dev Revoke a vesting schedule (only for revocable schedules)
     * @param beneficiary The beneficiary address
     * @param scheduleId The schedule index
     */
    function revoke(address beneficiary, uint256 scheduleId) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[beneficiary][scheduleId];
        require(schedule.totalAmount > 0, "No vesting schedule");
        require(schedule.revocable, "Schedule not revocable");
        require(!schedule.revoked, "Already revoked");
        
        // Calculate unvested amount
        uint256 vested = vestedAmount(beneficiary, scheduleId);
        uint256 unvested = schedule.totalAmount - vested;
        
        // Mark as revoked
        schedule.revoked = true;
        
        // Return unvested tokens to owner
        if (unvested > 0) {
            totalVestedAmount -= unvested;
            rmxToken.safeTransfer(owner(), unvested);
        }
        
        emit VestingRevoked(beneficiary, scheduleId, unvested);
    }
    
    /**
     * @dev Get beneficiary summary
     * @param beneficiary The beneficiary address
     * @return totalVested Total amount across all schedules
     * @return totalReleased Total amount released
     * @return totalReleasableNow Total amount releasable now
     */
    function getBeneficiarySummary(address beneficiary) external view returns (
        uint256 totalVested,
        uint256 totalReleased,
        uint256 totalReleasableNow
    ) {
        uint256 count = scheduleCount[beneficiary];
        for (uint256 i = 0; i < count; i++) {
            VestingSchedule storage schedule = vestingSchedules[beneficiary][i];
            if (!schedule.revoked) {
                totalVested += schedule.totalAmount;
            }
            totalReleased += schedule.released;
            totalReleasableNow += releasableAmount(beneficiary, i);
        }
    }
    
    /**
     * @dev Get total number of beneficiaries
     */
    function getBeneficiaryCount() external view returns (uint256) {
        return beneficiaries.length;
    }
    
    /**
     * @dev Get schedule details
     * @param beneficiary The beneficiary address
     * @param scheduleId The schedule index
     */
    function getScheduleDetails(address beneficiary, uint256 scheduleId) external view returns (
        uint256 total,
        uint256 released,
        uint256 releasable,
        uint256 vested,
        uint256 startTime,
        uint256 cliffEnd,
        uint256 vestingEnd,
        bool revocable,
        bool revoked
    ) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary][scheduleId];
        return (
            schedule.totalAmount,
            schedule.released,
            releasableAmount(beneficiary, scheduleId),
            vestedAmount(beneficiary, scheduleId),
            schedule.startTime,
            schedule.startTime + schedule.cliffDuration,
            schedule.startTime + schedule.vestingDuration,
            schedule.revocable,
            schedule.revoked
        );
    }
    
    /**
     * @dev Emergency withdraw for stuck tokens (not vested tokens)
     * @param token The token address
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(rmxToken)) {
            // For RMX, only allow withdrawal of excess tokens
            uint256 required = totalVestedAmount - totalReleasedAmount;
            uint256 balance = rmxToken.balanceOf(address(this));
            require(balance - amount >= required, "Cannot withdraw vested tokens");
        }
        IERC20(token).safeTransfer(owner(), amount);
    }
}
