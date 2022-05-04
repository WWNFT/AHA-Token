const { ethers } = require("hardhat");

const MintableERC20PredicateProxyAddTestNet = "0x37c3bfC05d5ebF9EBb3FF80ce0bd0133Bf221BC8";
const ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS

async function main() {
    console.log("ADMIN WALLET:", ADMIN_WALLET_ADDRESS)
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const AHAEthContract = await ethers.getContractFactory("AHAEth");
    const token = await AHAEthContract.deploy([], ADMIN_WALLET_ADDRESS, MintableERC20PredicateProxyAddTestNet)

    console.log("Token address:", token.address)
}

main().then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });