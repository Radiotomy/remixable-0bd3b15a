#!/bin/bash

echo "🔧 Setting up Foundry for Remixable Smart Contracts"
echo "=================================================="

# Check if foundry is installed
if ! command -v forge &> /dev/null
then
    echo "❌ Foundry not found. Installing..."
    curl -L https://foundry.paradigm.xyz | bash
    foundryup
    echo "✅ Foundry installed"
else
    echo "✅ Foundry already installed"
fi

# Navigate to contracts directory
cd "$(dirname "$0")"

echo ""
echo "📦 Installing dependencies..."
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit

echo ""
echo "🔨 Compiling contracts..."
forge build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Contracts compiled successfully!"
    echo ""
    echo "📄 Extracting bytecode and ABIs..."
    node scripts/extract-artifacts.js
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Setup complete!"
        echo ""
        echo "Next steps:"
        echo "1. Add DEPLOYER_PRIVATE_KEY to your .env file"
        echo "2. Add BASE_RPC_URL to your .env file"
        echo "3. Run: forge script script/Deploy.s.sol:DeployScript --rpc-url base_goerli --broadcast"
    fi
else
    echo ""
    echo "❌ Compilation failed. Check errors above."
fi
