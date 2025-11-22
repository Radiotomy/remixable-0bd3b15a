# Quick Start - Compile & Deploy Contracts

## Step 1: Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Step 2: Install Dependencies

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std
```

## Step 3: Compile Contracts

```bash
forge build
```

You should see:
```
[⠊] Compiling...
[⠒] Compiling 4 files with 0.8.19
[⠢] Solc 0.8.19 finished in X.XXs
Compiler run successful!
```

## Step 4: Extract Bytecode & ABI

```bash
node scripts/extract-artifacts.js
```

This creates `artifacts.json` with all contract bytecode and ABIs.

## Step 5: Deploy to BASE

### Testnet (Recommended First)

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url base_goerli \
  --broadcast \
  --verify
```

### Mainnet

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url base \
  --broadcast \
  --verify
```

## Step 6: Update Contract Addresses

Copy the deployed addresses from the output and update `src/lib/web3.config.ts`:

```typescript
export const CONTRACT_ADDRESSES: Record<number, {...}> = {
  [base.id]: {
    rmxToken: '0xYOUR_RMX_TOKEN_ADDRESS',
    tokenFactory: '0xYOUR_FACTORY_ADDRESS',
    revenueDistribution: '0xYOUR_REVENUE_ADDRESS',
  }
}
```

## Troubleshooting

**"forge: command not found"**
- Run `foundryup` to install/update Foundry

**"Library not found: forge-std"**
- Run `forge install foundry-rs/forge-std`

**"Insufficient funds for gas"**
- Ensure your deployer wallet has BASE ETH

**Need BASE ETH?**
- Bridge from Ethereum: https://bridge.base.org
- Or use an exchange that supports BASE

## Next Steps

✅ Contracts compiled
✅ Bytecode extracted  
✅ Deployed to BASE
⏭️  Update web3.config.ts with addresses
⏭️  Test token creation in the app
⏭️  Configure revenue distribution addresses
