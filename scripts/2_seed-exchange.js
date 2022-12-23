const config = require("../src/config.json") //import the json file

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether") // convert n eth to wei 
} 

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
  //Fetch accounts from wallet - these are unlocked
  const accounts = await ethers.getSigners()

  //Fetch network
  const { chainId } = await ethers.provider.getNetwork() //this is the HH config id 31337
  console.log("Using chainId:", chainId)

  //Fetch deployed tokens
  const DApp = await ethers.getContractAt("Token", config[chainId].DApp.address)
  console.log(`Dapp Token fetched: ${DApp.address}\n`)

  const mETH = await ethers.getContractAt("Token", config[chainId].mETH.address)
  console.log(`mETH Token fetched: ${mETH.address}\n`)

  const mDAI = await ethers.getContractAt("Token", config[chainId].mDAI.address)
  console.log(`mDAI Token fetched: ${mDAI.address}\n`)
  
  const exchange = await ethers.getContractAt("Exchange", config[chainId].exchange.address)
  console.log(`Exchange fetched: ${exchange.address}\n`)

  //Set up users accounts NB: sender is the deployer and owns all the tokens
  const sender = accounts[0]
  const receiver = accounts[1]
  let amount = tokens(10000)

  //msg.sender transfers 10000mETH  to receiver account
  let transaction, result
  transaction = await mETH.connect(sender).transfer(receiver.address, amount)
  console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

  //Set up exchange users
  const user1 = accounts[0]
  const user2 = accounts[1]
  amount = tokens(10000)

  //user1 approves 10,000 Dapp...
  transaction = await DApp.connect(user1).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user1.address}\n`)

  //user1 deposits 10,000 DApp on the exchange
  transaction = await exchange.connect(user1).depositToken(DApp.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} tokens from ${user1.address}\n`)

  //user2 approves 10,000 mETH...
  transaction = await mETH.connect(user2).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user2.address}\n`)

  //user2 deposits 10,000 DApp on the exchange
  transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} tokens from ${user2.address}\n`)

  /////////////////////////////////////////////////////////////////
  //Seed a Cancelled Order

  //User 1 makes order to get 100 mETH for 5 DApp tokens (tokenGive)
  let orderId
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(5))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  //User 1 Cancels order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

  //Wait 1 sec
  await wait(1)

  /////////////////////////////////////////////////////////////////
  //Seed Filled Order

  //User 1 makes order to get 100 mETH for 10 DApp tokens (tokenGive)
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(10))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  //User 2 Fills order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user2.address}\n`)

  //Wait 1 sec
  await wait(1)

  //User 1 makes another order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, tokens(15))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  //User 2 fills second order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user2.address}\n`)

  //Wait 1 sec
  await wait(1)

  //User 1 makes final order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), DApp.address, tokens(20))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  //User 2 fills final order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user2.address}\n`)

  //Wait 1 sec
  await wait(1)

  /////////////////////////////////////////////////////////////////
  //Seed a Open Orders

  //User 1 makes orders (10 orders)

  for(let i = 1;  i <= 10; i++){
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i ), DApp.address, tokens(10))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}\n`)
    //Wait 1 sec
    await wait(1)
  }

  //User 1 makes orders (10 orders)

  for(let i = 1;  i <= 10; i++){
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}\n`)
    //Wait 1 sec
    await wait(1)
  }

  //User 2 makes orders (10 orders)

  for(let i = 1;  i <= 10; i++){
    transaction = await exchange.connect(user2).makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i))
    result = await transaction.wait()
    console.log(`Made order from ${user2.address}\n`)
    //Wait 1 sec
    await wait(1)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});