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

	/*mapping for allowance; a nested mapping with a mapping
	maps owners address to address of all spenders and max 
	amount of tokens allowed for spending*/

	mapping(address => mapping(address => uint256)) public allowance;


	// a transfer event is required for ERC20 tokens - this format was pulled from eth docs
	event Transfer(
		address indexed from, 
		address indexed to, 
		uint256 value
	);

	event Approval(
		address indexed owner, 
		address indexed spender,
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

		_transfer(msg.sender, _to, _value); // function call, see func below

		return true;
	}

	//_tranfer is a group function for tranfer & tranferFrom

	function _transfer(address _from, address _to, uint256 _value) internal {
		require(_to != address(0)); //address 0 = burn address

		//Deduct token from sender
		balanceOf[_from] -= _value;
		//Credit tokens to receiver
		balanceOf[_to] += _value;

		//Emit Event
		emit Transfer(_from, _to, _value);

	}

	function approve(address _spender, uint256 _value) 
		public 
		returns(bool success) 
	{ 
		require(_spender != address(0)); //address 0 = burn address
	//update value of allowance
		allowance[msg.sender][_spender] = _value;

		emit Approval(msg.sender, _spender, _value);	
		return true;

	}

	function transferFrom(address _from, address _to, uint256 _value) 
		public 
		returns (bool success)
	{

		//check approval & sender has enough tokens 
		require(_value <= balanceOf[_from], "insufficient balance");
		require(_value <= allowance[_from][msg.sender], "user has not approved transaction");

		//Reset allowance to avoid double spending
		allowance[_from][msg.sender] -= _value;


		//spend tokens
		_transfer(_from, _to, _value);
		return true;

	}



}
