# Remixable Smart Contracts - Foundry Setup

## Overview
This directory contains the Solidity smart contracts for the Remixable platform, configured for compilation and deployment using Foundry.

## Contracts

- **RMXToken.sol** - Platform governance token (1B supply)
- **AppToken.sol** - Template for app-specific tokens with revenue distribution
- **TokenFactory.sol** - Factory for creating new app tokens
- **RevenueDistribution.sol** - Handles platform revenue distribution (85% staking, 10% dev, 5% ops)

## Prerequisites

1. Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Install dependencies:
```bash
forge install OpenZeppelin/openzeppelin-contracts
```

## Compilation

Compile all contracts:
```bash
forge build
```

This generates bytecode and ABIs in `contracts/out/`

## Deployment

### 1. Set Environment Variables

Create a `.env` file in the project root:
```bash
DEPLOYER_PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

### 2. Deploy to BASE Mainnet

Deploy all contracts:
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url base --broadcast --verify
```

Deploy to testnet first (recommended):
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url base_goerli --broadcast --verify
```

### 3. Update Contract Addresses

After deployment, update `src/lib/web3.config.ts` with the deployed addresses.

## Extract Bytecode & ABI

After compilation, extract contract artifacts:
```bash
node contracts/scripts/extract-artifacts.js
```

This creates `contracts/artifacts.json` with bytecode and ABIs for the edge function.

## Testing

Run all tests:
```bash
forge test
```

Run with gas reporting:
```bash
forge test --gas-report
```

Run specific test:
```bash
forge test --match-test testTokenCreation
```

## Verify Contracts

Verify on Basescan after deployment:
```bash
forge verify-contract <CONTRACT_ADDRESS> src/RMXToken.sol:RMXToken --chain base
```

## Project Structure

```
contracts/
├── src/              # Contract source files
├── test/             # Test files
├── script/           # Deployment scripts
├── out/              # Compiled artifacts (gitignored)
├── lib/              # Dependencies (gitignored)
└── scripts/          # Helper scripts
```

## Troubleshooting

**"Library not found"**: Run `forge install OpenZeppelin/openzeppelin-contracts`

**"RPC error"**: Check your `BASE_RPC_URL` in `.env`

**"Verification failed"**: Ensure `BASESCAN_API_KEY` is valid

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [BASE Documentation](https://docs.base.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
