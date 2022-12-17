// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "./Token.sol"; //import token smart contract into this one

contract Exchange{
	address public feeAccount;
	uint256 public feePercent;

	mapping(address => mapping(address => uint256)) public tokens; //token address, user address, how many tokens they've deposited

	event Deposit(address token, address user, uint256 amount, uint256 balance);

	//track fees collected by exchange
	constructor(
		address _feeAccount, 
		uint256 _feePercent)
	{
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}


	//--------------------------
	//DEPOSIT & WITHDRAW TOKENS

	//Deposit Token
	function depositToken(
		address _token, 
		uint256 _amount) 
		public
	{
		//1. Transfer tokens to exchange
		require(Token(_token).transferFrom(msg.sender, address(this), _amount)); //we are using transferFrom from Token smart contract; this represents the current smart contract we are working on
		
		//2. Update user balance on exchange 
		tokens[_token][msg.sender] += _amount;

		//3. Emit an event 
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);

	}

	// Check Balances
	function balanceOf(
		address _token, 
		address _user) 
		public 
		view 
		returns (uint256)
	{
		return tokens[_token][_user];
	}
}
