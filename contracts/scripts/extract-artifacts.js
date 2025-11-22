/**
 * Extract compiled contract artifacts for use in edge functions
 * Run after: forge build
 */

const fs = require('fs');
const path = require('path');

const contracts = ['RMXToken', 'AppToken', 'TokenFactory', 'RevenueDistribution'];
const outDir = path.join(__dirname, '..', 'out');
const outputFile = path.join(__dirname, '..', 'artifacts.json');

const artifacts = {};

console.log('Extracting contract artifacts...\n');

contracts.forEach(contractName => {
  const artifactPath = path.join(outDir, `${contractName}.sol`, `${contractName}.json`);
  
  if (!fs.existsSync(artifactPath)) {
    console.error(`❌ Artifact not found: ${contractName}`);
    return;
  }
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  artifacts[contractName] = {
    abi: artifact.abi,
    bytecode: artifact.bytecode.object,
    deployedBytecode: artifact.deployedBytecode.object,
  };
  
  console.log(`✅ Extracted ${contractName}`);
  console.log(`   Bytecode length: ${artifact.bytecode.object.length} chars`);
});

fs.writeFileSync(outputFile, JSON.stringify(artifacts, null, 2));

console.log(`\n✅ Artifacts saved to: ${outputFile}`);
console.log('\nYou can now use these artifacts in your edge functions.');
console.log('Copy the bytecode and ABI to environment variables or use directly in deployment logic.');
