
async function main() {
  //Step 1: Fetch contract to deploy

  const Token = await ethers.getContractFactory("Token");

  //Step 2: Deploy Contract

  const token = await Token.deploy();
  await token.deployed()
  console.log(`Token Deployed to: ${token.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
