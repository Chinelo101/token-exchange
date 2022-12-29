//blockchain based code/interactions
import { ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json";
import EXCHANGE_ABI from "../abis/Exchange.json"; 


export const loadProvider = (dispatch) => {
	//connects ethers(turn our app into a blockchain app) to blockchain
	const connection = new ethers.providers.Web3Provider(window.ethereum) // connection to MM
	dispatch({ type: "PROVIDER_LOADED", connection })

	return connection
}

export const loadNetwork = async (provider, dispatch) => {
	const { chainId } = await provider.getNetwork()
	dispatch({ type: "NETWORK_LOADED", chainId })

	return chainId
}

export const loadAccount = async (provider, dispatch) => {
	const accounts = await window.ethereum.request({ method: "eth_requestAccounts"}) //func makes an RPC call to node to get MM account; this is standard code
	const account = ethers.utils.getAddress(accounts[0])

	dispatch({ type: "ACCOUNT_LOADED", account })

	let balance = await provider.getBalance(account)
	balance = ethers.utils.formatEther(balance)

	dispatch({ type: "ETHER_BALANCE_LOADED", balance })

	return account
}

export const loadTokens = async (provider, addresses, dispatch) => {
	let token, symbol

	//connect to token smart contract
	token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
	symbol = await token.symbol()

	dispatch({ type: "TOKEN_1_LOADED", token, symbol })

	token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
	symbol = await token.symbol()

	dispatch({ type: "TOKEN_2_LOADED", token, symbol })

	return token
}

export const loadExchange = async (provider, address, dispatch) => {
	const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
	dispatch({ type: "EXCHANGE_LOADED", exchange })

	return exchange
}

export const subscribeToEvents = (exchange, dispatch) => {
	exchange.on("Deposit", (token, user, amount, balance, event) => {
	//Step 4: Notify app that transfer was successful
		dispatch({ type: "TRANSFER_SUCCESS", event }) 
	})
}
//--------------------------------------------------------------------------
//LOAD USER BALANCES (WALLET & EXCHANGE BALANCES)

export const loadBalances = async (exchange, tokens, account, dispatch) => {
	let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18) //wallet balance
	dispatch({ type: "TOKEN_1_BALANCE_LOADED", balance })

	balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18) //exchange balance
	dispatch({ type: "EXCHANGE_TOKEN_1_BALANCE_LOADED", balance })

	balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18) //wallet balance
	dispatch({ type: "TOKEN_2_BALANCE_LOADED", balance })

	balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18) //exchange balance
	dispatch({ type: "EXCHANGE_TOKEN_2_BALANCE_LOADED", balance })
}

//--------------------------------------------------------------------------
//TRANSFER TOKENS (DEPOSIT & WITHDRAWS)

export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
	let transaction

	dispatch({ type: "TRANSFER_REQUEST" }) //a transfer event emitted in redux store

	try{//if transfer fails send an error alert in redux 
		const signer = await provider.getSigner() //MM wallet 
		const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)

		transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
		await transaction.wait()
		transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)

		await transaction.wait()

	} catch(error) {
		dispatch({ type: "TRANSFER_FAIL" }) //a transfer fail message in redux store
	}

}


