//blockchain based code/interactions
import { ethers } from "ethers"
import TOKEN_ABI from "../abis/Token.json"

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

export const loadAccount = async (dispatch) => {
	const accounts = await window.ethereum.request({ method: "eth_requestAccounts"}) //func makes an RPC call to node to get MM account; this is standard code
	const account = ethers.utils.getAddress(accounts[0])

	dispatch({ type: "ACCOUNT_LOADED", account })

	return account
}

export const loadToken = async (provider, address, dispatch) => {
	let token, symbol

	//connect to token smart contract
	token = new ethers.Contract(address, TOKEN_ABI, provider)
	symbol = await token.symbol()

	dispatch({ type: "TOKEN_LOADED", token, symbol })

	return token
}