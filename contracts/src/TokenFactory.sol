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