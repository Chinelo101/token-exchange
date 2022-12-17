const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), "ether") // convert n eth to wei 
}


describe("Exchange", () => {
	let deployer, feeAccount, exchange

	const feePercent = 10


	beforeEach( async () =>{
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]

		//Fetch Exchange contract from Blockchain
		const Exchange = await ethers.getContractFactory("Exchange")
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
})
