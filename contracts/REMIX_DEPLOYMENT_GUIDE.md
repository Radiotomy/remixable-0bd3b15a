# Remixable Smart Contract Deployment Guide

## Complete step-by-step guide for deploying contracts via Remix IDE

---

## Prerequisites

Before starting, ensure you have:
- [ ] MetaMask wallet installed in your browser
- [ ] Wallet connected to **BASE Mainnet**
- [ ] At least **0.02 ETH** on BASE for gas fees (5 contracts)
- [ ] This guide open alongside Remix IDE

### Add BASE Mainnet to MetaMask

If BASE isn't in your MetaMask:
1. Go to [chainlist.org](https://chainlist.org)
2. Search for "Base"
3. Click "Add to MetaMask" for Base Mainnet (Chain ID: 8453)

Or manually add:
- **Network Name**: Base
- **RPC URL**: `https://mainnet.base.org`
- **Chain ID**: `8453`
- **Symbol**: `ETH`
- **Block Explorer**: `https://basescan.org`

---

## Contract Overview

| Contract | Purpose | Constructor Params |
|----------|---------|-------------------|
| `RMXToken.sol` | Platform governance token (1B supply) | None |
| `RevenueDistribution.sol` | Distributes platform fees | RMXToken address |
| `RMXStaking.sol` | Stake RMX to earn 85% of fees | RMXToken address |
| `AppToken.sol` | Template for user app tokens | (Created by factory) |
| `TokenFactory.sol` | Factory to create AppTokens | None |

---

## Phase 1: Setup Remix IDE

### Step 1.1: Open Remix IDE

1. Navigate to **[remix.ethereum.org](https://remix.ethereum.org)**
2. You'll see the Remix IDE interface with:
   - **Left sidebar**: File Explorer, Search, Compiler, Deploy icons
   - **Main panel**: Code editor
   - **Bottom panel**: Terminal/console

### Step 1.2: Create Contract Files

In the File Explorer (left sidebar):

1. **Right-click** on the `contracts` folder
2. Select **"New File"**
3. Create these 5 files (one at a time):

| File Name | Purpose |
|-----------|---------|
| `RMXToken.sol` | Platform governance token |
| `RevenueDistribution.sol` | Revenue sharing contract |
| `RMXStaking.sol` | Staking for rewards |
| `AppToken.sol` | Template for user app tokens |
| `TokenFactory.sol` | Factory to create AppTokens |

---

## Phase 2: Add Contract Code

### Step 2.1: RMXToken.sol

Click on `RMXToken.sol` and paste this entire code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RMXToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens
    
    constructor() ERC20("Remixable", "RMX") Ownable(msg.sender) {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
```

### Step 2.2: RevenueDistribution.sol

Click on `RevenueDistribution.sol` and paste:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RevenueDistribution is Ownable {
    IERC20 public rmxToken;
    
    uint256 public constant STAKING_REWARDS = 8500; // 85%
    uint256 public constant PLATFORM_DEVELOPMENT = 1000; // 10%
    uint256 public constant PLATFORM_OPERATIONS = 500; // 5%
    
    address public stakingContract;
    address public developmentWallet;
    address public operationsWallet;
    
    event RevenueDistributed(uint256 total, uint256 staking, uint256 development, uint256 operations);
    event AddressesUpdated(address staking, address development, address operations);
    
    constructor(address _rmxToken) Ownable(msg.sender) {
        rmxToken = IERC20(_rmxToken);
    }
    
    function setAddresses(
        address _stakingContract,
        address _developmentWallet,
        address _operationsWallet
    ) external onlyOwner {
        stakingContract = _stakingContract;
        developmentWallet = _developmentWallet;
        operationsWallet = _operationsWallet;
        emit AddressesUpdated(_stakingContract, _developmentWallet, _operationsWallet);
    }
    
    receive() external payable {
        distributeRevenue();
    }
    
    function distributeRevenue() public {
        uint256 balance = address(this).balance;
        require(balance > 0, "No revenue to distribute");
        
        uint256 stakingAmount = (balance * STAKING_REWARDS) / 10000;
        uint256 developmentAmount = (balance * PLATFORM_DEVELOPMENT) / 10000;
        uint256 operationsAmount = (balance * PLATFORM_OPERATIONS) / 10000;
        
        if (stakingContract != address(0)) {
            (bool success,) = stakingContract.call{value: stakingAmount}("");
            require(success, "Staking transfer failed");
        }
        
        if (developmentWallet != address(0)) {
            (bool success,) = developmentWallet.call{value: developmentAmount}("");
            require(success, "Development transfer failed");
        }
        
        if (operationsWallet != address(0)) {
            (bool success,) = operationsWallet.call{value: operationsAmount}("");
            require(success, "Operations transfer failed");
        }
        
        emit RevenueDistributed(balance, stakingAmount, developmentAmount, operationsAmount);
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
```

### Step 2.3: RMXStaking.sol

Click on `RMXStaking.sol` and paste:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RMXStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable rmxToken;
    
    uint256 public totalStaked;
    mapping(address => uint256) public stakedBalance;
    
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public pendingRewards;
    
    address[] public stakers;
    mapping(address => bool) public isStaker;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDistributed(uint256 amount, uint256 newRewardPerToken);
    
    constructor(address _rmxToken) Ownable(msg.sender) {
        require(_rmxToken != address(0), "Invalid token address");
        rmxToken = IERC20(_rmxToken);
    }
    
    receive() external payable {
        if (msg.value > 0 && totalStaked > 0) {
            uint256 rewardPerToken = (msg.value * 1e18) / totalStaked;
            rewardPerTokenStored += rewardPerToken;
            emit RewardsDistributed(msg.value, rewardPerTokenStored);
        }
    }
    
    modifier updateReward(address account) {
        if (account != address(0) && stakedBalance[account] > 0) {
            pendingRewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    function earned(address account) public view returns (uint256) {
        uint256 balance = stakedBalance[account];
        if (balance == 0) return pendingRewards[account];
        uint256 rewardDelta = rewardPerTokenStored - userRewardPerTokenPaid[account];
        return pendingRewards[account] + (balance * rewardDelta) / 1e18;
    }
    
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        
        if (!isStaker[msg.sender]) {
            stakers.push(msg.sender);
            isStaker[msg.sender] = true;
        }
        
        stakedBalance[msg.sender] += amount;
        totalStaked += amount;
        
        rmxToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot unstake 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        
        rmxToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }
    
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        
        pendingRewards[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Reward transfer failed");
        emit RewardsClaimed(msg.sender, reward);
    }
    
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
    
    function getStakerCount() external view returns (uint256) {
        return stakers.length;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
```

### Step 2.4: AppToken.sol

Click on `AppToken.sol` and paste:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AppToken is ERC20, Ownable {
    address public revenueContract;
    uint256 public constant PLATFORM_FEE = 500; // 5%
    
    event RevenueDistributed(uint256 amount, uint256 platformFee);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address creator,
        address _revenueContract
    ) ERC20(name, symbol) Ownable(creator) {
        revenueContract = _revenueContract;
        _mint(creator, totalSupply * 10**18);
    }
    
    function distributeRevenue() external payable {
        require(msg.value > 0, "No ETH sent");
        
        uint256 platformFee = (msg.value * PLATFORM_FEE) / 10000;
        uint256 ownerAmount = msg.value - platformFee;
        
        if (revenueContract != address(0)) {
            (bool success,) = revenueContract.call{value: platformFee}("");
            require(success, "Platform fee transfer failed");
        }
        
        (bool success,) = owner().call{value: ownerAmount}("");
        require(success, "Owner transfer failed");
        
        emit RevenueDistributed(msg.value, platformFee);
    }
    
    function setRevenueContract(address _newRevenueContract) external onlyOwner {
        revenueContract = _newRevenueContract;
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
```

### Step 2.5: TokenFactory.sol

Click on `TokenFactory.sol` and paste:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AppToken.sol";

contract TokenFactory {
    event TokenCreated(address indexed token, address indexed creator, string name, string symbol);
    
    mapping(address => address[]) public userTokens;
    address[] public allTokens;
    address public defaultRevenueContract;
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function setDefaultRevenueContract(address _revenueContract) external onlyOwner {
        defaultRevenueContract = _revenueContract;
    }
    
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address revenueContract
    ) external returns (address) {
        address revContract = revenueContract != address(0) ? revenueContract : defaultRevenueContract;
        
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, name, symbol, block.timestamp));
        
        AppToken token = new AppToken{salt: salt}(
            name,
            symbol,
            totalSupply,
            msg.sender,
            revContract
        );
        
        address tokenAddress = address(token);
        userTokens[msg.sender].push(tokenAddress);
        allTokens.push(tokenAddress);
        
        emit TokenCreated(tokenAddress, msg.sender, name, symbol);
        return tokenAddress;
    }
    
    function getUserTokens(address user) external view returns (address[] memory) {
        return userTokens[user];
    }
    
    function getTotalTokens() external view returns (uint256) {
        return allTokens.length;
    }
    
    function getUserTokenCount(address user) external view returns (uint256) {
        return userTokens[user].length;
    }
}
```

> ✅ **Checkpoint**: You should now have 5 files with code and no red error underlines

---

## Phase 3: Configure Compiler

### Step 3.1: Open Compiler Panel

1. Click the **Solidity Compiler** icon in the left sidebar (looks like an "S" with arrows)
2. You'll see compiler settings panel

### Step 3.2: Set Compiler Version

1. Click the **compiler version dropdown**
2. Select: `0.8.19+commit.7dd6d404`
3. If exact version isn't available, select any `0.8.19` version

### Step 3.3: Enable Optimization

1. Click **"Advanced Configurations"** to expand
2. Check ✅ **"Enable optimization"**
3. Set optimization runs to: `200`

### Step 3.4: Compile All Contracts

1. In File Explorer, click on `TokenFactory.sol` (this imports others)
2. Click the blue **"Compile TokenFactory.sol"** button
3. Wait for compilation (may take 10-30 seconds)
4. **Also compile** `RMXStaking.sol` separately (it's standalone)

**Success indicators:**
- ✅ Green checkmark appears on compiler icon
- ✅ No red errors in the terminal
- ✅ "Compilation successful" message

---

## Phase 4: Deploy Contracts

### Step 4.1: Connect MetaMask

1. In **ENVIRONMENT** dropdown, select: `Injected Provider - MetaMask`
2. MetaMask popup will appear - click **Connect**
3. Ensure you're on **BASE Mainnet** (Chain ID 8453)

---

## ⚠️ Deploy Order: CRITICAL!

You **MUST** deploy in this exact order:

```
1. RMXToken (no parameters)
     ↓
2. RevenueDistribution (needs RMXToken address)
     ↓  
3. RMXStaking (needs RMXToken address)
     ↓
4. TokenFactory (no parameters)
```

---

### Step 4.2: Deploy RMXToken (First)

1. In **CONTRACT** dropdown, select: `RMXToken`
2. Leave constructor parameters empty
3. Click orange **"Deploy"** button
4. Confirm in MetaMask
5. Wait for confirmation

**📋 SAVE THIS ADDRESS:**
```
RMXToken = 0x________________________________
```

---

### Step 4.3: Deploy RevenueDistribution (Second)

1. In **CONTRACT** dropdown, select: `RevenueDistribution`
2. In the deploy input field, paste your **RMXToken address**
3. Click orange **"Deploy"** button
4. Confirm in MetaMask

**📋 SAVE THIS ADDRESS:**
```
RevenueDistribution = 0x________________________________
```

---

### Step 4.4: Deploy RMXStaking (Third)

1. In **CONTRACT** dropdown, select: `RMXStaking`
2. In the deploy input field, paste your **RMXToken address** (same as step 4.3)
3. Click orange **"Deploy"** button
4. Confirm in MetaMask

**📋 SAVE THIS ADDRESS:**
```
RMXStaking = 0x________________________________
```

---

### Step 4.5: Deploy TokenFactory (Fourth)

1. In **CONTRACT** dropdown, select: `TokenFactory`
2. Leave parameters empty
3. Click orange **"Deploy"** button
4. Confirm in MetaMask

**📋 SAVE THIS ADDRESS:**
```
TokenFactory = 0x________________________________
```

---

## Phase 5: Post-Deployment Configuration

### Step 5.1: Configure RevenueDistribution

This is **CRITICAL** - connects staking to receive 85% of fees!

1. In "Deployed Contracts", expand **RevenueDistribution**
2. Find the `setAddresses` function
3. Fill in parameters:
   - `_stakingContract`: Your RMXStaking address
   - `_developmentWallet`: Your dev wallet address
   - `_operationsWallet`: Your ops wallet address
4. Click **"transact"**
5. Confirm in MetaMask

### Step 5.2: Configure TokenFactory

1. In "Deployed Contracts", expand **TokenFactory**
2. Find the `setDefaultRevenueContract` function
3. Enter your **RevenueDistribution address**
4. Click **"transact"**
5. Confirm in MetaMask

---

## Phase 6: Verification Checklist

### ✅ Deployment Complete Checklist

| Contract | Deployed? | Address Saved? | Configured? |
|----------|-----------|----------------|-------------|
| RMXToken | ☐ | ☐ | N/A |
| RevenueDistribution | ☐ | ☐ | ☐ setAddresses called |
| RMXStaking | ☐ | ☐ | N/A |
| TokenFactory | ☐ | ☐ | ☐ setDefaultRevenueContract called |

### Your Deployed Addresses

```
╔══════════════════════════════════════════════════════════════════╗
║                    DEPLOYED CONTRACTS                            ║
╠══════════════════════════════════════════════════════════════════╣
║ Network: BASE Mainnet (Chain ID: 8453)                           ║
║                                                                  ║
║ RMXToken:             0x________________________________________  ║
║ RevenueDistribution:  0x________________________________________  ║
║ RMXStaking:           0x________________________________________  ║
║ TokenFactory:         0x________________________________________  ║
║                                                                  ║
║ Deployer Wallet:      0x________________________________________  ║
║ Development Wallet:   0x________________________________________  ║
║ Operations Wallet:    0x________________________________________  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Phase 7: Verify on BaseScan (Optional)

1. Go to [basescan.org](https://basescan.org)
2. Paste contract address in search
3. Click "Contract" → "Verify and Publish"
4. Settings: Solidity (Single file), v0.8.19, MIT, Optimization: Yes/200
5. Paste source code and verify

---

## Phase 8: Test Contracts

**Test RMXToken:**
```
- totalSupply → 1000000000000000000000000000 (1B with 18 decimals)
- name → "Remixable"
- symbol → "RMX"
```

**Test RMXStaking:**
```
- rmxToken → Should return RMXToken address
- totalStaked → 0 (no stakers yet)
```

**Test TokenFactory:**
```
- getTotalTokens → 0 (no tokens created yet)
- defaultRevenueContract → RevenueDistribution address
```

---

## Revenue Flow Diagram

```
User App Revenue (ETH)
        │
        ▼
   AppToken.sol
  ┌─────┴─────┐
  │           │
 95%         5%
  │           │
  ▼           ▼
Creator   RevenueDistribution.sol
          ┌───────┬───────┬───────┐
          │       │       │
         85%     10%      5%
          │       │       │
          ▼       ▼       ▼
    RMXStaking   Dev     Ops
    (Stakers)  Wallet  Wallet
```

---

## Troubleshooting

### "Insufficient funds for gas"
- Need more ETH on BASE Mainnet
- Bridge via [bridge.base.org](https://bridge.base.org)

### "Compilation failed"
- Ensure compiler version is `0.8.19`
- Check code was copied correctly

### "Transaction failed"
- Check you're on BASE Mainnet
- Increase gas limit in MetaMask

### "setAddresses reverts"
- Only owner can call - use deployer wallet
- Ensure all addresses are valid

---

## Need Help?

Share your deployed addresses with the Remixable team to complete platform integration!
