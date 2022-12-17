const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), "ether") // convert n eth to wei 
}


describe("Exchange", () => {
	let deployer, feeAccount, exchange

	const feePercent = 10


	beforeEach( async () =>{
		//Fetch Exchange & Token contracts from Blockchain
		const Exchange = await ethers.getContractFactory("Exchange")
		const Token = await ethers.getContractFactory("Token")

		token1 = await Token.deploy("Dapp University", "DAPP", "1000000") 


		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]
		user1 = accounts[2]

		let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))

		exchange = await Exchange.deploy(feeAccount.address, feePercent) // initialize constructor values during deployment


	})

	describe("Deployment", () => {

		it("tracks the fee account", async () => {
			expect(await exchange.feeAccount()).to.equal(feeAccount.address)
		})

		it("tracks the fee percent", async () => {
			expect(await exchange.feePercent()).to.equal(feePercent)
		})
	})


	describe("Depositing Tokens", () => {
		let transaction, result
		let amount = tokens(10)


		describe("Success", () => {
			beforeEach(async () => {
				//Approve Token; this is a req for transferFrom function to work
				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()

				//Deposit token
				transaction = await exchange.connect(user1).depositToken(token1.address, amount)
				result = await transaction.wait()
				
			})

			//check that exchange has received the token
			it("tracks the token deposit", async () => {
				expect(await token1.balanceOf(exchange.address)).to.equal(amount)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
			})

			it("emits a Deposit event", async () => {
				const event = result.events[1] // 2 events are emmitted
				expect(event.event).to.equal("Deposit")

				const args = event.args
				expect(args.token).to.equal(token1.address)
				expect(args.user).to.equal(user1.address)
				expect(args.amount).to.equal(amount)
				expect(args.balance).to.equal(amount)
			})

		})

		describe("Failure", () =>{
			it("fails when no token are approved", async () => {
				//if you try to transfer without getting approval, the function should fail
				await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
			})

		})
	})

	describe("WithdrawingTokens", () => {
		let transaction, result
		let amount = tokens(10)


		describe("Success", () => {
			beforeEach(async () => {
				//Deposit tokens before withdrawing:
				//Approve Token; this is a req for transferFrom function to work
				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()

				//Deposit token
				transaction = await exchange.connect(user1).depositToken(token1.address, amount)
				result = await transaction.wait()

				//Now withdraw tokens
				transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
				result = await transaction.wait()

			})

			//check that exchange has received the token
			it("withdraws token funds", async () => {
				expect(await token1.balanceOf(exchange.address)).to.equal(0)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
			})

			it("emits a Withdraw event", async () => {
				const event = result.events[1] // 2 events are emmitted
				expect(event.event).to.equal("Withdraw")

				const args = event.args
				expect(args.token).to.equal(token1.address)
				expect(args.user).to.equal(user1.address)
				expect(args.amount).to.equal(amount)
				expect(args.balance).to.equal(0)
			})

		})

		describe("Failure", () =>{
			it("fails for insufficent balance", async () => {
				//Attempt to withdraw token without depositing
				await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
			})
		})


	})
	
	describe("Checking Balances", () => {
		let transaction, result
		let amount = tokens(1)


		describe("Success", () => {
			beforeEach(async () => {
				//Approve Token; this is a req for transferFrom function to work
				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()

				//Deposit token
				transaction = await exchange.connect(user1).depositToken(token1.address, amount)
				result = await transaction.wait()
				
			})

			it("returns user balance", async () => {
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
			})
		})

	})
})