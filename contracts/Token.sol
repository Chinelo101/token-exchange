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


	// a transfer event is required for ERC20 tokens - this format was pulled from eth docs
	event Transfer(
		address indexed from, 
		address indexed to, 
		uint256 value
	);


	//send tokens
	constructor(
		string memory _name, 
		string memory _symbol, 
		uint256 _totalSupply
	) {
		name = _name;
		symbol = _symbol;
		totalSupply = _totalSupply* (10**decimals);
		balanceOf[msg.sender] = totalSupply; //msg.sender is the address of the deployer

	}

	function transfer(address _to, uint256 _value) 
		public 
		returns (bool success) 
	{
		//Require that sender has enough tokens to spend
		require(balanceOf[msg.sender] >= _value);
		require(_to != address(0)); //address 0 = burn address


		//Deduct token from sender
		balanceOf[msg.sender] -= _value;
		//Credit tokens to receiver
		balanceOf[_to] += _value;

		//Emit Event
		emit Transfer(msg.sender, _to, _value);

		return true;
	}



}
