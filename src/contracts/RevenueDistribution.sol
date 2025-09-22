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