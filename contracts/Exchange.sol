// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "./Token.sol"; //import token smart contract into this one

/**N.B so you're not confused in the future msg.sender, token1.adddres, user1.address are all diff addresses
 * msg.sender might be a wallet addy
 * token1 and user1 are addresses on the exchange **/

contract Exchange{
	address public feeAccount;
	uint256 public feePercent;
	mapping(address => mapping(address => uint256)) public tokens; //token address, user address, how many tokens they've deposited
	mapping(uint256 => _Order) public orders; //orders mapping, maps id to order struct 
	uint256 public orderCount; //to track # of orders
	mapping(uint256 => bool) public orderCancelled; //true/false
	mapping(uint256 => bool) public orderFilled; //true/false


	event Deposit(address token, address user, uint256 amount, uint256 balance);
	event Withdraw(address token, address user, uint256 amount, uint256 balance);
	event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
	event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
	event Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address creator, uint256 timestamp);

	//for storing orders information
	struct _Order { 
		//Attributes of the order
		uint256 id; // unique identifier for order
		address user; //user who made the order
		address tokenGet; //address of the token they receive
		uint256 amountGet; //amount they receive
		address tokenGive; //address of the token they give
		uint256 amountGive; //amount they give
		uint256 timestamp; //when order was created
	}
	

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

	function withdrawToken(address _token, uint256 _amount) public {
		//Ensure user has enough tokens to withdraw
		require(tokens[_token][msg.sender] >= _amount, "not enough tokens to withdraw");

		//1. Transfer tokens to user; we are using the transfer function here not transfer from cause we know that the exchange is the sender 
		require(Token(_token).transfer(msg.sender, _amount)); //args = to, amount

		//2. Update user balance on exchange 
		tokens[_token][msg.sender] -= _amount;

		//3. Emit event 
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
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


	//--------------------------
	//MAKE & CANCEL ORDERS


	function makeOrder(
		address _tokenGet, 
		uint256 _amountGet, 
		address _tokenGive, 
		uint256 _amountGive)
		public
	{
	// Token Give (the token they want to spend) - which token, and how much?
	// Token Get (the token they want to receive) - which token, and how much?


		//prevent orders if tokens are not on exchange

		require(balanceOf(_tokenGive, msg.sender) >= _amountGive);


		//instantiate new orders

		orderCount ++;

		orders[orderCount] = _Order(//populating order struct 
			orderCount, //id 1, 2,3 etc
			msg.sender, //user 
			_tokenGet, //tokenGet
			_amountGet, //amountGet
			_tokenGive, //tokenGive
			_amountGive, //amountGive
			block.timestamp //timestamp
		);

		//Emit event
		emit Order(
			orderCount, 
			msg.sender, 
			_tokenGet, 
			_amountGet, 
			_tokenGive, 
			_amountGive, 
			block.timestamp 
		);
	}


	function cancelOrder(uint256 _id) public {
		//Fetch Order
		_Order storage _order = orders[_id];  // _Order, our struct is the data type for the _order variable and we're pulling this data from storage

		//Ensure the caller of the function is the owner of the order
		require(address(_order.user) == msg.sender);

		//Order must exist
		require(_order.id == _id);

		//Cancel Order
		orderCancelled[_id] = true;

		//Emit event
		emit Cancel(
			_order.id, 
			msg.sender, 
			_order.tokenGet, 
			_order.amountGet, 
			_order.tokenGive, 
			_order.amountGive, 
			block.timestamp 
		);

	}

	//--------------------------
	//EXECUTING ORDERS

	function fillOrder(uint256 _id) public {
		/**Reqs:
		 * 1. Must be valid orderId
		 * 2. Order can't already be filled
		 * 3. Order can't be cancelled **/

		 require(0 < _id  &&  _id<= orderCount, "Order does not exist");
		 require(!orderFilled[_id]);
		 require(!orderCancelled[_id]);


		//Step 1: Fetch Order
		_Order storage _order = orders[_id];


		//Execute the trade 
		_trade(
			_order.id,
			_order.user,
			_order.tokenGet,
			_order.amountGet,
			_order.tokenGive,
			_order.amountGive
		);

		//Mark order as filled
		orderFilled[_order.id] = true;
	}

	function _trade(
		uint256 _orderId,
		address _user,
		address _tokenGet,
		uint256 _amountGet,
		address _tokenGive,
		uint256 _amountGive
	) internal {

		//Fee is paid by the user who filled the order (msg.sender)
		//Fee is deducted from _amountGet 10% of order

		uint256 _feeAmount = (_amountGet * feePercent) / 100;


		//Execute the trade; msg.sender filled the order, _user created the order
		//mDAI
		tokens[_tokenGet][msg.sender] -= (_amountGet + _feeAmount); //subtract amount from the address of the user filling the order
		tokens[_tokenGet][_user] += _amountGet; //add amount to the address of the user making the order

		//Send fees to feeAccount/Exchange account
		tokens[_tokenGet][feeAccount] += _feeAmount;

		//DAPP
		tokens[_tokenGive][_user] -= _amountGive; //subtract 1DAPP from the address of the user making the order
		tokens[_tokenGive][msg.sender] += _amountGive; //add 1DAPP to the address of the user filling the order

		//Emit trade event
		emit Trade(
			_orderId, 
			msg.sender, 
			_tokenGet, 
			_amountGet, 
			_tokenGive, 
			_amountGive, 
			_user,
			block.timestamp 
		);


	}
}


