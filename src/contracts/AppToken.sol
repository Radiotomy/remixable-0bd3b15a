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