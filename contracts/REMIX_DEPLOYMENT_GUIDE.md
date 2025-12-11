# Remixable Smart Contract Deployment Guide

## Complete step-by-step guide for deploying contracts via Remix IDE

---

## Prerequisites

Before starting, ensure you have:
- [ ] MetaMask wallet installed in your browser
- [ ] Wallet connected to **BASE Mainnet**
- [ ] At least **0.01 ETH** on BASE for gas fees
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

## Phase 1: Setup Remix IDE

### Step 1.1: Open Remix IDE

1. Navigate to **[remix.ethereum.org](https://remix.ethereum.org)**
2. You'll see the Remix IDE interface with:
   - **Left sidebar**: File Explorer, Search, Compiler, Deploy icons
   - **Main panel**: Code editor
   - **Bottom panel**: Terminal/console

> 📸 **What you'll see**: A dark IDE interface with a file tree on the left showing "contracts" and "scripts" folders

### Step 1.2: Create Contract Files

In the File Explorer (left sidebar):

1. **Right-click** on the `contracts` folder
2. Select **"New File"**
3. Create these 4 files (one at a time):

| File Name | Purpose |
|-----------|---------|
| `RMXToken.sol` | Platform governance token |
| `RevenueDistribution.sol` | Revenue sharing contract |
| `AppToken.sol` | Template for user app tokens |
| `TokenFactory.sol` | Factory to create AppTokens |

> 📸 **What you'll see**: Four new `.sol` files in your contracts folder

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
    
    constructor() ERC20("Remixable", "RMX") {
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
    
    constructor(address _rmxToken) {
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
}
```

### Step 2.3: AppToken.sol

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
    ) ERC20(name, symbol) {
        _transferOwnership(creator);
        revenueContract = _revenueContract;
        _mint(creator, totalSupply * 10**18);
    }
    
    function distributeRevenue() external payable {
        require(msg.value > 0, "No ETH sent");
        
        uint256 platformFee = (msg.value * PLATFORM_FEE) / 10000;
        uint256 ownerAmount = msg.value - platformFee;
        
        // Send platform fee to revenue contract
        if (revenueContract != address(0)) {
            (bool success,) = revenueContract.call{value: platformFee}("");
            require(success, "Platform fee transfer failed");
        }
        
        // Send remainder to token owner
        (bool success,) = owner().call{value: ownerAmount}("");
        require(success, "Owner transfer failed");
        
        emit RevenueDistributed(msg.value, platformFee);
    }
}
```

### Step 2.4: TokenFactory.sol

Click on `TokenFactory.sol` and paste:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AppToken.sol";

contract TokenFactory {
    event TokenCreated(address indexed token, address indexed creator, string name, string symbol);
    
    mapping(address => address[]) public userTokens;
    address[] public allTokens;
    
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address revenueContract
    ) external returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, name, symbol, block.timestamp));
        
        AppToken token = new AppToken{salt: salt}(
            name,
            symbol,
            totalSupply,
            msg.sender,
            revenueContract
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
}
```

> ✅ **Checkpoint**: You should now have 4 files with code and no red error underlines

---

## Phase 3: Configure Compiler

### Step 3.1: Open Compiler Panel

1. Click the **Solidity Compiler** icon in the left sidebar (looks like an "S" with arrows)
2. You'll see compiler settings panel

> 📸 **What you'll see**: A panel titled "SOLIDITY COMPILER" with version dropdown and compile button

### Step 3.2: Set Compiler Version

1. Click the **compiler version dropdown**
2. Select: `0.8.19+commit.7dd6d404`
3. If exact version isn't available, select any `0.8.19` version

### Step 3.3: Enable Optimization

1. Click **"Advanced Configurations"** to expand
2. Check ✅ **"Enable optimization"**
3. Set optimization runs to: `200`

> 📸 **What you'll see**: Optimization checkbox checked, runs field showing "200"

### Step 3.4: Compile All Contracts

1. In File Explorer, click on `TokenFactory.sol` (this imports others)
2. Click the blue **"Compile TokenFactory.sol"** button
3. Wait for compilation (may take 10-30 seconds)

**Success indicators:**
- ✅ Green checkmark appears on compiler icon
- ✅ No red errors in the terminal
- ✅ "Compilation successful" message

> ⚠️ **If you see errors**: Make sure you copied the code exactly, including all import statements

---

## Phase 4: Deploy Contracts

### Step 4.1: Open Deploy Panel

1. Click the **Deploy & Run** icon in left sidebar (looks like an arrow pointing to a box)
2. You'll see deployment settings

> 📸 **What you'll see**: Panel with "ENVIRONMENT", "ACCOUNT", "CONTRACT" dropdowns

### Step 4.2: Connect MetaMask

1. In **ENVIRONMENT** dropdown, select: `Injected Provider - MetaMask`
2. MetaMask popup will appear - click **Connect**
3. Ensure you're on **BASE Mainnet** (Chain ID 8453)

**Verify connection:**
- Account field shows your wallet address
- Balance shows your ETH on BASE

> ⚠️ **Wrong network?** Click the network name in MetaMask and switch to "Base"

---

## Deploy Order: Critical!

You **MUST** deploy in this exact order:

```
1. RMXToken (no parameters)
     ↓
2. RevenueDistribution (needs RMXToken address)
     ↓  
3. TokenFactory (no parameters)
```

---

### Step 4.3: Deploy RMXToken (First)

1. In **CONTRACT** dropdown, select: `RMXToken - contracts/RMXToken.sol`
2. Leave the constructor parameters empty (none needed)
3. Click orange **"Deploy"** button
4. MetaMask popup appears - click **Confirm**
5. Wait for transaction confirmation (10-30 seconds)

**After deployment:**
- Contract appears in "Deployed Contracts" section below
- **COPY THE ADDRESS** by clicking the copy icon next to contract name

```
📋 Save this: RMXToken Address = 0x________________
```

> 📸 **What you'll see**: Deployed contract expandable section showing RMXToken with its address

---

### Step 4.4: Deploy RevenueDistribution (Second)

1. In **CONTRACT** dropdown, select: `RevenueDistribution`
2. In the deploy input field, paste your **RMXToken address**:
   ```
   0xYOUR_RMX_TOKEN_ADDRESS_HERE
   ```
3. Click orange **"Deploy"** button
4. Confirm in MetaMask
5. Wait for confirmation

**After deployment:**
- **COPY THE ADDRESS**

```
📋 Save this: RevenueDistribution Address = 0x________________
```

> ⚠️ **Constructor parameter**: The input field next to Deploy button should show your RMXToken address before clicking deploy

---

### Step 4.5: Deploy TokenFactory (Third)

1. In **CONTRACT** dropdown, select: `TokenFactory`
2. Leave parameters empty (none needed)
3. Click orange **"Deploy"** button
4. Confirm in MetaMask
5. Wait for confirmation

**After deployment:**
- **COPY THE ADDRESS**

```
📋 Save this: TokenFactory Address = 0x________________
```

---

## Phase 5: Verification Checklist

### ✅ Deployment Complete Checklist

| Contract | Deployed? | Address Saved? |
|----------|-----------|----------------|
| RMXToken | ☐ | ☐ |
| RevenueDistribution | ☐ | ☐ |
| TokenFactory | ☐ | ☐ |

### Your Deployed Addresses

Copy this template and fill in your addresses:

```
╔══════════════════════════════════════════════════════════════╗
║                    DEPLOYED CONTRACTS                        ║
╠══════════════════════════════════════════════════════════════╣
║ Network: BASE Mainnet (Chain ID: 8453)                       ║
║                                                              ║
║ RMXToken:            0x________________________________      ║
║ RevenueDistribution: 0x________________________________      ║
║ TokenFactory:        0x________________________________      ║
║                                                              ║
║ Deployer Wallet:     0x________________________________      ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Phase 6: Verify on BaseScan (Optional but Recommended)

### Step 6.1: Open BaseScan

1. Go to [basescan.org](https://basescan.org)
2. Paste any of your contract addresses in the search bar

### Step 6.2: Verify Contract

1. Click on the **"Contract"** tab
2. Click **"Verify and Publish"**
3. Fill in:
   - **Compiler Type**: Solidity (Single file)
   - **Compiler Version**: v0.8.19+commit.7dd6d404
   - **License**: MIT
4. Paste the contract source code
5. Enable optimization: Yes, 200 runs
6. Click **"Verify and Publish"**

---

## Phase 7: Configure Remixable Platform

Once you have all three addresses, share them and we'll update:

1. **`src/lib/web3.config.ts`** - Add contract addresses
2. **Supabase Secrets** - Add `DEPLOYER_PRIVATE_KEY`
3. **Edge Function** - Update to call TokenFactory

---

## Troubleshooting

### "Insufficient funds for gas"
- You need more ETH on BASE Mainnet
- Bridge ETH from Ethereum via [bridge.base.org](https://bridge.base.org)

### "Compilation failed"
- Ensure compiler version is exactly `0.8.19`
- Check all code was copied correctly (no missing characters)
- OpenZeppelin imports should auto-resolve in Remix

### "Transaction failed"
- Check you're on BASE Mainnet, not testnet
- Increase gas limit in MetaMask advanced options
- Wait and retry - network may be congested

### "MetaMask not connecting"
- Refresh Remix page
- Disconnect/reconnect MetaMask
- Try a different browser

---

## Quick Reference Commands

After deployment, you can test contracts in Remix:

**Test RMXToken:**
- Click `totalSupply` → Should return 1000000000000000000000000000 (1B with 18 decimals)
- Click `name` → Should return "Remixable"
- Click `symbol` → Should return "RMX"

**Test TokenFactory:**
- Click `getTotalTokens` → Should return 0 (no tokens created yet)

---

## Need Help?

If you encounter issues:
1. Take a screenshot of the error
2. Note which step you're on
3. Share the error message with the team

**Common transaction explorer:**
Check your transactions at: `https://basescan.org/address/YOUR_WALLET_ADDRESS`
