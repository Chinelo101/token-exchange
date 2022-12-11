// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token{//basic structure of ERC token

	string public name;
	string public symbol;
	uint256 public decimals = 18;
	uint256 public totalSupply; // 1,000,000 x 10^18

	//track balances
	mapping(address => uint256) public balanceOf;


	//send tokens



	constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
		name = _name;
		symbol = _symbol;
		totalSupply = _totalSupply* (10**decimals);
		balanceOf[msg.sender] = totalSupply; //msg.sender is the address of the deployer

	}


}
