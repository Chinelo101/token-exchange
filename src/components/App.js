import { useEffect } from "react"
import { useDispatch } from "react-redux"
import config from "../config.json"

import { 
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadTokens, 
  loadExchange,
  loadAllOrders,
  subscribeToEvents
} from "../store/interactions"

import Navbar from "./Navbar"
import Markets from "./Markets"
import Balance from "./Balance"
import Order from "./Order"
import OrderBook from "./OrderBook"

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    //connect ethers to blockchain
    const provider = loadProvider(dispatch)

    //Fetch current network's chainId(eg hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider, dispatch)

    //Reload page when network (Goerli, HH, etc) changes
    window.ethereum.on("chainChanged", () => {
      window.location.reload() //reloads webpage
    })

    //Fetch current account and balance from Metamask when account is changed
    window.ethereum.on("accountsChanged", () => {
      loadAccount(provider, dispatch)
    })

    
    //load token smart contracts
    const DApp = config[chainId].DApp
    const mETH = config[chainId].mETH
    await loadTokens(provider, [DApp.address, mETH.address], dispatch)
 

    //load exchange smart contract
    const exchangeConfig = config[chainId].exchange
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

    //Fetch all orders: open, filled, cancelled
    loadAllOrders(provider, exchange, dispatch)

    //Listen to events 
    subscribeToEvents(exchange, dispatch)

  }


  useEffect(() => {
    loadBlockchainData() //this will make function show up on website
  })

  //code in the return func gets shown on webpage/app

  return (
    <div>
    <Navbar/>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets/>

          <Balance/>

          <Order/>

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          <OrderBook/>

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
