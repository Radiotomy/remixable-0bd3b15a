# Remixable Smart Contracts - Complete Deployment Guide

## 9 Contract Suite - Step-by-Step Remix IDE Deployment

---

## Contract Deployment Checklist

| # | Contract | Deploy | Constructor Needs | Records After Deploy |
|---|----------|--------|-------------------|---------------------|
| 1 | RMXToken | ✅ Manual | None | `RMX_TOKEN` address |
| 2 | TokenVesting | ✅ Manual | `RMX_TOKEN` | `TOKEN_VESTING` address |
| 3 | RevenueDistribution | ✅ Manual | `RMX_TOKEN` | `REVENUE_DIST` address |
| 4 | RMXStaking | ✅ Manual | `RMX_TOKEN` | `RMX_STAKING` address |
| 5 | TimelockController | ✅ Manual | minDelay, proposers[], executors[], admin | `TIMELOCK` address |
| 6 | RMXGovernor | ✅ Manual | `RMX_TOKEN`, `TIMELOCK` | `GOVERNOR` address |
| 7 | TokenFactory | ✅ Manual | None | `TOKEN_FACTORY` address |
| 8 | AppToken | 🔄 Auto | (Created by TokenFactory) | N/A |
| 9 | AppTokenStaking | 🔄 Auto | (Created by TokenFactory) | N/A |

---

## Prerequisites

- [ ] MetaMask installed with BASE Mainnet configured
- [ ] At least **0.05 ETH** on BASE for gas (7 deployments + configurations)
- [ ] Development wallet address ready
- [ ] Operations wallet address ready

### Add BASE Mainnet to MetaMask
- **Network Name**: Base
- **RPC URL**: `https://mainnet.base.org`
- **Chain ID**: `8453`
- **Symbol**: ETH
- **Explorer**: `https://basescan.org`

---

## Phase 1: Setup Remix IDE

1. Go to **[remix.ethereum.org](https://remix.ethereum.org)**
2. Create these 9 files in the `contracts` folder:

```
contracts/
├── RMXToken.sol
├── TokenVesting.sol
├── RevenueDistribution.sol
├── RMXStaking.sol
├── TimelockController.sol
├── RMXGovernor.sol
├── TokenFactory.sol
├── AppToken.sol
└── AppTokenStaking.sol
```

---

## Phase 2: Contract Code

Copy each contract from the `/contracts/remix/` folder in this repository into the corresponding Remix file.

---

## Phase 3: Compiler Settings

1. Click **Solidity Compiler** (left sidebar)
2. Version: `0.8.19+commit.7dd6d404`
3. Enable **Optimization**: 200 runs
4. Compile each contract

---

## Phase 4: Connect Wallet

1. Go to **Deploy & Run Transactions**
2. Environment: `Injected Provider - MetaMask`
3. Confirm MetaMask is on **BASE Mainnet** (8453)

---

# 🚀 DEPLOYMENT STEPS

## ADDRESS TRACKER (Fill as you deploy)

```
┌────────────────────────────────────────────────────────────┐
│ DEPLOYED ADDRESSES - RECORD EACH ONE                       │
├────────────────────────────────────────────────────────────┤
│ 1. RMX_TOKEN        = 0x______________________________     │
│ 2. TOKEN_VESTING    = 0x______________________________     │
│ 3. REVENUE_DIST     = 0x______________________________     │
│ 4. RMX_STAKING      = 0x______________________________     │
│ 5. TIMELOCK         = 0x______________________________     │
│ 6. GOVERNOR         = 0x______________________________     │
│ 7. TOKEN_FACTORY    = 0x______________________________     │
├────────────────────────────────────────────────────────────┤
│ WALLETS                                                    │
│ DEV_WALLET          = 0x______________________________     │
│ OPS_WALLET          = 0x______________________________     │
│ YOUR_WALLET         = 0x______________________________     │
└────────────────────────────────────────────────────────────┘
```

---

## STEP 1: Deploy RMXToken

### Contract: `RMXToken.sol`
### Constructor: None
### Depends on: Nothing (first contract)

**Actions:**
1. Select `RMXToken` in Contract dropdown
2. Leave Deploy parameters empty
3. Click **Deploy** → Confirm in MetaMask

**📝 RECORD:**
```
RMX_TOKEN = 0x________________________________
```

**✅ Verify:** 
- Call `totalSupply()` → Should return `1000000000000000000000000000` (1B with 18 decimals)
- Call `name()` → Should return "Remixable"
- Call `symbol()` → Should return "RMX"

---

## STEP 2: Deploy TokenVesting

### Contract: `TokenVesting.sol`
### Constructor: `_rmxToken`
### Depends on: RMX_TOKEN (Step 1)

**Actions:**
1. Select `TokenVesting` in Contract dropdown
2. In Deploy parameters, enter:
   ```
   _rmxToken: [paste RMX_TOKEN address from Step 1]
   ```
3. Click **Deploy** → Confirm in MetaMask

**📝 RECORD:**
```
TOKEN_VESTING = 0x________________________________
```

**✅ Verify:**
- Call `rmxToken()` → Should return your RMX_TOKEN address

---

## STEP 3: Deploy RevenueDistribution

### Contract: `RevenueDistribution.sol`
### Constructor: `_rmxToken`
### Depends on: RMX_TOKEN (Step 1)

**Actions:**
1. Select `RevenueDistribution` in Contract dropdown
2. In Deploy parameters, enter:
   ```
   _rmxToken: [paste RMX_TOKEN address from Step 1]
   ```
3. Click **Deploy** → Confirm in MetaMask

**📝 RECORD:**
```
REVENUE_DIST = 0x________________________________
```

**✅ Verify:**
- Call `STAKING_REWARDS()` → Should return `8500` (85%)
- Call `PLATFORM_DEVELOPMENT()` → Should return `1000` (10%)
- Call `PLATFORM_OPERATIONS()` → Should return `500` (5%)

---

## STEP 4: Deploy RMXStaking

### Contract: `RMXStaking.sol`
### Constructor: `_rmxToken`
### Depends on: RMX_TOKEN (Step 1)

**Actions:**
1. Select `RMXStaking` in Contract dropdown
2. In Deploy parameters, enter:
   ```
   _rmxToken: [paste RMX_TOKEN address from Step 1]
   ```
3. Click **Deploy** → Confirm in MetaMask

**📝 RECORD:**
```
RMX_STAKING = 0x________________________________
```

**✅ Verify:**
- Call `rmxToken()` → Should return your RMX_TOKEN address
- Call `totalStaked()` → Should return `0`

---

## STEP 5: Deploy TimelockController (RMXTimelock)

### Contract: `RMXTimelock.sol`
### Constructor: `minDelay`, `proposers`, `executors`, `admin`
### Depends on: Nothing (but will link to Governor later)

**Actions:**
1. Select `RMXTimelock` in Contract dropdown
2. In Deploy parameters, enter:
   ```
   minDelay: 172800
   proposers: []
   executors: ["0x0000000000000000000000000000000000000000"]
   admin: [YOUR_WALLET address]
   ```
   
   **Parameter explanation:**
   - `minDelay`: 172800 seconds = 48 hours
   - `proposers`: Empty array `[]` (Governor will be added after Step 6)
   - `executors`: `["0x0000000000000000000000000000000000000000"]` means anyone can execute
   - `admin`: Your wallet for initial setup

3. Click **Deploy** → Confirm in MetaMask

**📝 RECORD:**
```
TIMELOCK = 0x________________________________
```

**✅ Verify:**
- Call `getMinDelay()` → Should return `172800`

---

## STEP 6: Deploy RMXGovernor

### Contract: `RMXGovernor.sol`
### Constructor: `_token`, `_timelock`
### Depends on: RMX_TOKEN (Step 1), TIMELOCK (Step 5)

**Actions:**
1. Select `RMXGovernor` in Contract dropdown
2. In Deploy parameters, enter:
   ```
   _token: [paste RMX_TOKEN address from Step 1]
   _timelock: [paste TIMELOCK address from Step 5]
   ```
3. Click **Deploy** → Confirm in MetaMask

**📝 RECORD:**
```
GOVERNOR = 0x________________________________
```

**✅ Verify:**
- Call `votingDelay()` → Should return `7200` (~1 day in blocks)
- Call `votingPeriod()` → Should return `50400` (~7 days in blocks)
- Call `proposalThreshold()` → Should return `100000000000000000000000` (100k RMX)

---

## STEP 7: Deploy TokenFactory

### Contract: `TokenFactory.sol`
### Constructor: None
### Depends on: Nothing directly (will be configured after)

**Actions:**
1. Select `TokenFactory` in Contract dropdown
2. Leave Deploy parameters empty
3. Click **Deploy** → Confirm in MetaMask

**📝 RECORD:**
```
TOKEN_FACTORY = 0x________________________________
```

**✅ Verify:**
- Call `owner()` → Should return your wallet address
- Call `getTotalTokens()` → Should return `0`

---

# ⚙️ POST-DEPLOYMENT CONFIGURATION

After all 7 contracts are deployed, configure them:

---

## CONFIG 1: Configure RevenueDistribution

On the `RevenueDistribution` contract, call `setAddresses`:

```
_stakingContract: [RMX_STAKING address from Step 4]
_developmentWallet: [Your DEV_WALLET address]
_operationsWallet: [Your OPS_WALLET address]
```

**✅ Verify:**
- Call `stakingContract()` → Should return RMX_STAKING address
- Call `developmentWallet()` → Should return DEV_WALLET
- Call `operationsWallet()` → Should return OPS_WALLET

---

## CONFIG 2: Configure TokenFactory

On the `TokenFactory` contract, call `setDefaultRevenueContract`:

```
_revenueContract: [REVENUE_DIST address from Step 3]
```

**✅ Verify:**
- Call `defaultRevenueContract()` → Should return REVENUE_DIST address

---

## CONFIG 3: Grant Governor Role to Timelock

On the `TimelockController` contract:

1. First, get the PROPOSER_ROLE:
   - Call `PROPOSER_ROLE()` → Returns `0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1`

2. Grant PROPOSER_ROLE to Governor:
   - Call `grantRole`:
   ```
   role: 0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1
   account: [GOVERNOR address from Step 6]
   ```

**✅ Verify:**
- Call `hasRole(PROPOSER_ROLE, GOVERNOR)` → Should return `true`

---

## CONFIG 4: (Optional) Create Vesting Schedules

For team/partner token vesting, first approve then create schedules:

### 4a. Approve TokenVesting to spend RMX
On `RMXToken`, call `approve`:
```
spender: [TOKEN_VESTING address from Step 2]
amount: 350000000000000000000000000 (350M RMX for team + partners)
```

### 4b. Create Team Vesting (20% = 200M RMX)
On `TokenVesting`, call `createVestingSchedule`:
```
beneficiary: [TEAM_WALLET address]
amount: 200000000000000000000000000 (200M * 10^18)
startTime: [current timestamp or future date]
cliffDuration: 15778800 (6 months in seconds)
vestingDuration: 63115200 (24 months in seconds)
revocable: false
```

### 4c. Create Partnership Vesting (15% = 150M RMX)
On `TokenVesting`, call `createVestingSchedule`:
```
beneficiary: [PARTNERSHIP_WALLET address]
amount: 150000000000000000000000000 (150M * 10^18)
startTime: [current timestamp]
cliffDuration: 0 (no cliff for partners)
vestingDuration: 31557600 (12 months in seconds)
revocable: true
```

---

## CONFIG 5: (Final) Renounce Timelock Admin

⚠️ **ONLY DO THIS WHEN EVERYTHING IS CONFIRMED WORKING**

On `TimelockController`, call `renounceRole`:
```
role: [TIMELOCK_ADMIN_ROLE - call TIMELOCK_ADMIN_ROLE() first]
callerConfirmation: [YOUR_WALLET address]
```

This removes your admin access, making the system fully decentralized.

---

# 📊 ARCHITECTURE DIAGRAMS

## Revenue Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     APP REVENUE (ETH)                       │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    AppToken     │
                    │ (auto-deployed) │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
    ┌─────────┐       ┌────────────┐      ┌─────────────┐
    │   85%   │       │    10%     │      │     5%      │
    │ Builder │       │  Stakers   │      │  Platform   │
    └─────────┘       └─────┬──────┘      └──────┬──────┘
                            │                    │
                            ▼                    ▼
                   ┌────────────────┐    ┌─────────────────┐
                   │AppTokenStaking │    │RevenueDistribution│
                   │ (auto-deployed)│    └────────┬────────┘
                   └────────────────┘             │
                                      ┌──────────┼──────────┐
                                      │          │          │
                                      ▼          ▼          ▼
                                 ┌────────┐ ┌────────┐ ┌────────┐
                                 │  85%   │ │  10%   │ │   5%   │
                                 │RMX Stak│ │Dev Fund│ │Ops Fund│
                                 └───┬────┘ └────────┘ └────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  RMXStaking  │
                              └──────────────┘
```

## Governance Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     GOVERNANCE PROCESS                        │
└──────────────────────────────────────────────────────────────┘

Step 1: PROPOSAL (requires 100,000 RMX)
        └── RMX holder calls RMXGovernor.propose()

Step 2: VOTING DELAY (~1 day / 7200 blocks)
        └── Users can acquire RMX before voting

Step 3: VOTING PERIOD (~7 days / 50400 blocks)
        └── RMX holders vote: For / Against / Abstain
        └── Quorum: 4% of supply (40M RMX)

Step 4: QUEUE (if passed)
        └── Governor.queue() → TimelockController

Step 5: TIMELOCK DELAY (48 hours)
        └── Community can react

Step 6: EXECUTION
        └── Anyone calls Governor.execute()
```

---

# ✅ FINAL VERIFICATION CHECKLIST

After all deployments and configurations:

- [ ] RMXToken deployed with 1B supply
- [ ] TokenVesting linked to RMXToken
- [ ] RevenueDistribution configured with staking, dev, ops wallets
- [ ] RMXStaking linked to RMXToken
- [ ] TimelockController with 48-hour delay
- [ ] RMXGovernor linked to token and timelock
- [ ] Governor has PROPOSER_ROLE on Timelock
- [ ] TokenFactory configured with RevenueDistribution
- [ ] (Optional) Vesting schedules created for team/partners
- [ ] (Optional) Timelock admin renounced

---

# 🔧 TROUBLESHOOTING

### "Insufficient funds for gas"
Add more ETH to your wallet on BASE

### "Transaction failed"
- Check constructor parameters are correct
- Verify addresses are from the correct step
- Ensure you're on BASE Mainnet

### "Compilation failed"
- Use Solidity 0.8.19 exactly
- Check for typos in contract code

### "Governor proposal failed"
- Need >= 100,000 RMX to propose
- Must delegate to yourself first: `rmxToken.delegate(yourAddress)`

---

# 📋 FINAL ADDRESS SUMMARY

Fill in after completion:

```
═══════════════════════════════════════════════════════════════
REMIXABLE CONTRACT DEPLOYMENT - BASE MAINNET
Deployed: [DATE]
═══════════════════════════════════════════════════════════════

CORE CONTRACTS:
1. RMXToken:            0x...
2. TokenVesting:        0x...
3. RevenueDistribution: 0x...
4. RMXStaking:          0x...
5. TimelockController:  0x...
6. RMXGovernor:         0x...
7. TokenFactory:        0x...

WALLETS:
- Development:          0x...
- Operations:           0x...
- Team Vesting:         0x...
- Partnership Vesting:  0x...

AUTO-DEPLOYED (by TokenFactory):
- AppToken:            (created per user)
- AppTokenStaking:     (created per user)

═══════════════════════════════════════════════════════════════
```
