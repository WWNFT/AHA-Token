const { ethers } = require("hardhat");

const ChildContractAddressTestnet = "0xb5505a6d998549090530911180f38aC5130101c6";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const AHAPolygonContract = await ethers.getContractFactory("AHAPolygon");
    const token = await AHAPolygonContract.deploy([], ChildContractAddressTestnet)

    console.log("Token address:", token.address)
}

main().then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });