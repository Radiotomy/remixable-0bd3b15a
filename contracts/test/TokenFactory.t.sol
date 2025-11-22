// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/TokenFactory.sol";
import "../src/AppToken.sol";

contract TokenFactoryTest is Test {
    TokenFactory public factory;
    address public user = address(0x1);
    address public revenueContract = address(0x2);

    function setUp() public {
        factory = new TokenFactory();
    }

    function testCreateToken() public {
        vm.prank(user);
        address tokenAddress = factory.createToken(
            "MyApp Token",
            "MYAPP",
            1000000,
            revenueContract
        );

        assertTrue(tokenAddress != address(0), "Token address should not be zero");
        
        AppToken token = AppToken(tokenAddress);
        assertEq(token.name(), "MyApp Token");
        assertEq(token.symbol(), "MYAPP");
        assertEq(token.owner(), user);
        assertEq(token.revenueContract(), revenueContract);
    }

    function testGetUserTokens() public {
        vm.startPrank(user);
        
        address token1 = factory.createToken("Token1", "TK1", 1000, revenueContract);
        address token2 = factory.createToken("Token2", "TK2", 2000, revenueContract);
        
        vm.stopPrank();

        address[] memory userTokens = factory.getUserTokens(user);
        assertEq(userTokens.length, 2);
        assertEq(userTokens[0], token1);
        assertEq(userTokens[1], token2);
    }

    function testTotalTokens() public {
        assertEq(factory.getTotalTokens(), 0);

        vm.prank(user);
        factory.createToken("Token1", "TK1", 1000, revenueContract);
        
        assertEq(factory.getTotalTokens(), 1);
    }
}
