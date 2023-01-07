import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"

import dapp from "../assets/dapp.svg"
import eth from "../assets/eth.svg"

import { 
  loadBalances,
  transferTokens } from "../store/interactions"

const Balance = () => {
  const [isDeposit, setIsDeposit] = useState(true)
  const [token1TransferAmount, setToken1TransferAmount] = useState(0)
  const [token2TransferAmount, setToken2TransferAmount] = useState(0)

  const dispatch = useDispatch()

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account)

  const exchange = useSelector(state => state.exchange.contract)
  const exchangeBalances = useSelector(state => state.exchange.balances)
  const transferInProgress = useSelector(state => state.exchange.transferInProgress)

  const tokens = useSelector(state => state.tokens.contracts)
  const symbols = useSelector(state => state.tokens.symbols)
  const tokenBalances = useSelector(state => state.tokens.balances)

  const depositRef = useRef(null)
  const withdrawRef = useRef(null)

  const tabHandler = (e) => { // function to switch/toggle tabs (deposit/withdraw)
    if(e.target.className !== depositRef.current.className) { //just switching class names to enable the css feature
      e.target.className = "tab tab--active"
      depositRef.current.className = "tab"
      setIsDeposit(false)
    } else {
      e.target.className = "tab tab--active"
      withdrawRef.current.className = "tab"
      setIsDeposit(true)
    }
  }

  const amountHandler = (e, token) => {
    if (token.address === tokens[0].address){
      setToken1TransferAmount(e.target.value)
    }else{
      setToken2TransferAmount(e.target.value)
    }
  }

  //To ensure wallet and exchange balance automatically update without having to refresh page(re-load called in use effect load-balances)
  //Step 1: do transfer (depositHandler -- balance.js)
  //Step 2: Notify app that transfer is pending (transfer_request -- reducers.js)
  //Step 3: Get confirmation from blockchain that transfer was successful (subcribe to events -- intractions.js; transfer_success -- reducers.js)
  //Step 4: Notify app that transfer was successful (subcribe to events -- intractions.js; transfer_success -- reducers.js)
  //Step 5: Handle transfer fails - notify app (transfer_fail -- reducers & interactions.js)


  const depositHandler = (e, token) => {
    e.preventDefault() //to prevent page from refreshing everytime you hit enter or click deposit

    if (token.address === tokens[0].address){
      transferTokens(provider, exchange, "Deposit", token, token1TransferAmount, dispatch)
      setToken1TransferAmount(0) //clear transfer back to zero after transfer
    } else {
      transferTokens(provider, exchange, "Deposit", token, token2TransferAmount, dispatch)
      setToken2TransferAmount(0) //clear transfer back to zero after transfer
    }
  }

  const withdrawHandler = (e, token) => {
    e.preventDefault() //to prevent page from refreshing everytime you hit enter or click deposit

    if (token.address === tokens[0].address){
      transferTokens(provider, exchange, "Withdraw", token, token1TransferAmount, dispatch)
      setToken1TransferAmount(0) //clear transfer back to zero after transfer
    } else {
      transferTokens(provider, exchange, "Withdraw", token, token2TransferAmount, dispatch)
      setToken2TransferAmount(0) //clear transfer back to zero after transfer
    }
  }

  useEffect(() => {
    if(exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch)
    }
  }, [exchange, tokens, account, transferInProgress, dispatch]) //if any of these variables change, refect the balances (i.e call load balances func))

  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balance</h2>
        <div className='tabs'>
          <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
          <button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) -- a comment */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={dapp} alt="Token Logo" />{symbols && symbols[0]}</p>
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
        </div>

        <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[0]) : (e) => withdrawHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
          <input 
            type="text" 
            id='token0' 
            placeholder='0.0000' 
            value={token1TransferAmount === 0 ? "" : token1TransferAmount}
            onChange={(e) => amountHandler(e, tokens[0])}/>

          <button className='button' type='submit'>

            {isDeposit ? (//change button depending on Dep/With
              <span>Deposit</span>
            ) : (
              <span>Withdraw</span>
            )}

          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={eth} alt="Token Logo" />{symbols && symbols[1]}</p>
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[1]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[1]}</p> 
        </div>

        <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[1]) : (e) => withdrawHandler(e, tokens[1])}>
          <label htmlFor="token1">{symbols && symbols[1]} Amount</label>
          <input 
            type="text" 
            id='token1' 
            placeholder='0.0000'
            value={token2TransferAmount === 0 ? "" : token2TransferAmount}
            onChange={(e) => amountHandler(e, tokens[1])}
            />

          <button className='button' type='submit'>
            {isDeposit ? (//change button depending on Dep/With
              <span>Deposit</span>
            ) : (
              <span>Withdraw</span>
            )}

          </button>
        </form>
      </div>

      <hr />
    </div>
  );
}

export default Balance;