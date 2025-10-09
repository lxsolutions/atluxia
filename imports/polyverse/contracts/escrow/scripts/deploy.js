










const hre = require("hardhat");

async function main() {
  // USDC token addresses for different networks
  const usdcAddresses = {
    polygon: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon USDC
    base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
    sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" // Sepolia test USDC
  };

  // Get network
  const network = hre.network.name;
  console.log(`Deploying to ${network} network...`);

  // Get USDC address for current network
  const usdcAddress = usdcAddresses[network];
  if (!usdcAddress) {
    throw new Error(`USDC address not configured for ${network} network`);
  }

  console.log(`Using USDC address: ${usdcAddress}`);

  // Deploy TributeEscrow contract
  const TributeEscrow = await hre.ethers.getContractFactory("TributeEscrow");
  const tributeEscrow = await TributeEscrow.deploy(usdcAddress);
  
  await tributeEscrow.deployed();
  console.log(`TributeEscrow deployed to: ${tributeEscrow.address}`);

  // Verify contract on Etherscan if not on local network
  if (network !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await tributeEscrow.deployTransaction.wait(5);
    
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: tributeEscrow.address,
      constructorArguments: [usdcAddress],
    });
  }

  // Save deployment info
  const deploymentInfo = {
    network: network,
    contractAddress: tributeEscrow.address,
    usdcAddress: usdcAddress,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    timestamp: Date.now()
  };

  console.log("Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  const deploymentFile = `deployments/${network}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });












