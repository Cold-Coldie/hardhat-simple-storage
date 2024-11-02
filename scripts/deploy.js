const { ethers, run, network } = require("hardhat");

async function main() {
  try {
    const SimpleStorageFactory = await ethers.getContractFactory(
      "SimpleStorage"
    );

    console.log("Deploying contract...");
    const simpleStorage = await SimpleStorageFactory.deploy();
    await simpleStorage.waitForDeployment();

    const contractAddress = await simpleStorage.getAddress();
    console.log(`Deployed contract to: ${contractAddress}`);

    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
      console.log("Waiting for block txes...");
      await simpleStorage.deploymentTransaction().wait(6);
      await verify(contractAddress);
    }

    const currentValue = await simpleStorage.retrieve();
    console.log(`Current value is: ${currentValue}`);

    // Update the current value
    const transactionResponse = await simpleStorage.store(7);
    await transactionResponse.wait(1);
    const updatedValue = await simpleStorage.retrieve();
    console.log(`Update Value is: ${updatedValue}`);
  } catch (error) {
    console.error(error);
  }
}

async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified");
    } else {
      console.error(error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
