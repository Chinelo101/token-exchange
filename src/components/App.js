import { useEffect } from "react"
import { ethers } from "ethers"
import TOKEN_ABI from "../abis/Token.json"
import '../App.css';
import config from "../config.json"

function App() {

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts"}) //func makes an RPC call to node to get MM account; this is standard code
    console.log(accounts[0])

    //connects ethers(turn our app into a blockchain app) to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum) // connection to MM
    const { chainId } = await provider.getNetwork()
    console.log(chainId)

    //connect to token smart contract
    const token = new ethers.Contract(config[chainId].DApp.address, TOKEN_ABI, provider)
    console.log(token.address)
    const symbol = await token.symbol()
    console.log(symbol)

  }


  useEffect(() => {
    loadBlockchainData() //this will make function show up on website
  })

  //code in the return func gets shown on webpage/app

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
