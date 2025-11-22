// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/RMXToken.sol";
import "../src/TokenFactory.sol";
import "../src/RevenueDistribution.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy RMX Token
        console.log("Deploying RMXToken...");
        RMXToken rmxToken = new RMXToken();
        console.log("RMXToken deployed at:", address(rmxToken));
        
        // 2. Deploy Revenue Distribution
        console.log("Deploying RevenueDistribution...");
        RevenueDistribution revenueDistribution = new RevenueDistribution(address(rmxToken));
        console.log("RevenueDistribution deployed at:", address(revenueDistribution));
        
        // 3. Deploy Token Factory
        console.log("Deploying TokenFactory...");
        TokenFactory tokenFactory = new TokenFactory();
        console.log("TokenFactory deployed at:", address(tokenFactory));
        
        vm.stopBroadcast();
        
        // Log all addresses for easy copying
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("RMXToken:", address(rmxToken));
        console.log("RevenueDistribution:", address(revenueDistribution));
        console.log("TokenFactory:", address(tokenFactory));
        console.log("\nUpdate these addresses in src/lib/web3.config.ts");
    }
}
