const { expect } = require("chai");

describe("Transfer operations", function () {
    let TVEContract;
    let owner, addr1, addr2, addr3;
    let deployedInstance;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        TVEContract = await ethers.getContractFactory("AHAPolygon");
        [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

        deployedInstance = await TVEContract.deploy([addr1.address], owner.address, addr1.address);
    })

    describe("whitelist", function () {
        it("Should add whitelist correctly via constructor", async function () {
            expect(await deployedInstance.isWhitelisted(addr1.address)).to.equals(true);
            expect(await deployedInstance.isWhitelisted(owner.address)).to.equals(false);
            expect(await deployedInstance.isWhitelisted(addr2.address)).to.equals(false);
            expect(await deployedInstance.isWhitelisted(addr3.address)).to.equals(false);
        })

        it("Should add whitelist correctly via single method", async function () {
            expect(await deployedInstance.isWhitelisted(addr2.address)).to.equals(false);
            await deployedInstance.addTransferWhitelist(addr2.address)
            expect(await deployedInstance.isWhitelisted(addr2.address)).to.equals(true);
        })

        it("Should add whitelist correctly via batch method", async function () {
            expect(await deployedInstance.isWhitelisted(addr3.address)).to.equals(false);
            expect(await deployedInstance.isWhitelisted(addr2.address)).to.equals(false);
            await deployedInstance.addTransferWhitelistBatch([addr2.address, addr3.address])
            expect(await deployedInstance.isWhitelisted(addr3.address)).to.equals(true);
            expect(await deployedInstance.isWhitelisted(addr2.address)).to.equals(true);
        })

        it("Should remove whitelist correctly via single method", async function () {
            expect(await deployedInstance.isWhitelisted(addr1.address)).to.equals(true);
            await deployedInstance.removeTransferWhiteList(addr1.address)
            expect(await deployedInstance.isWhitelisted(addr1.address)).to.equals(false);
        })

        it("Should remove whitelist correctly via batch method", async function () {
            expect(await deployedInstance.isWhitelisted(addr3.address)).to.equals(false);
            expect(await deployedInstance.isWhitelisted(addr2.address)).to.equals(false);
            await deployedInstance.addTransferWhitelistBatch([addr2.address, addr3.address]);
            expect(await deployedInstance.isWhitelisted(addr3.address)).to.equals(true);
            expect(await deployedInstance.isWhitelisted(addr2.address)).to.equals(true);

            await deployedInstance.removeTransferWhitelistBatch([addr2.address, addr3.address])
            expect(await deployedInstance.isWhitelisted(addr3.address)).to.equals(false);
            expect(await deployedInstance.isWhitelisted(addr2.address)).to.equals(false);
        })

        it("Should not add/remove whitelist if no specific role", async function () {
            await expect(deployedInstance.connect(addr1.address).addTransferWhitelist(addr2.address)).to.be.reverted;
            await expect(deployedInstance.connect(addr1.address).addTransferWhitelistBatch([addr2.address])).to.be.reverted;
            await expect(deployedInstance.connect(addr1.address).removeTransferWhiteList(addr2.address)).to.be.reverted;
            await expect(deployedInstance.connect(addr1.address).removeTransferWhitelistBatch([addr2.address])).to.be.reverted;
        })
    })

    describe("txns transfer", function () {
        it("Should be able to transfer to whitelisted address", async function () {
            await deployedInstance.mint(owner.address, 10000)
            expect(await deployedInstance.isWhitelisted(addr1.address)).to.equals(true);
            await deployedInstance.transfer(addr1.address, 5000);

            expect(await deployedInstance.balanceOf(owner.address)).to.equal(5000);
            expect(await deployedInstance.balanceOf(addr1.address)).to.equal(5000);
        })

        it("Should be able to transfer from whitelisted address", async function () {
            await deployedInstance.mint(addr1.address, 10000)
            expect(await deployedInstance.isWhitelisted(addr1.address)).to.equals(true);
            await deployedInstance.connect(addr1).transfer(owner.address, 5000);

            expect(await deployedInstance.balanceOf(owner.address)).to.equal(5000);
            expect(await deployedInstance.balanceOf(addr1.address)).to.equal(5000);
        })

        it("Should not be able to transfer from nonwhitelisted address to nonwhitelisted address", async function () {
            await deployedInstance.mint(owner.address, 10000)
            await expect(deployedInstance.transfer(addr2.address, 5000)).to.be.reverted;
        })

        it("Should not be able to transfer if below 0", async function () {
            await deployedInstance.mint(addr1.address, 10000)
            expect(await deployedInstance.isWhitelisted(addr1.address)).to.equals(true);
            await expect(deployedInstance.connect(addr1).transfer(owner.address, 50000)).to.be.reverted;
        })


    })

    describe("txns transferFrom", function () {
        it("Should be able to transfer to whitelisted address", async function () {
            await deployedInstance.approve(addr1.address, 5000)
            await deployedInstance.addTransferWhitelist(addr2.address)

            await deployedInstance.mint(owner.address, 10000)
            await deployedInstance.connect(addr1).transferFrom(owner.address, addr2.address, 5000);

            expect(await deployedInstance.balanceOf(owner.address)).to.equal(5000);
            expect(await deployedInstance.balanceOf(addr2.address)).to.equal(5000);
        })

        it("Should be able to transfer from whitelisted address", async function () {
            await deployedInstance.approve(addr1.address, 5000)
            await deployedInstance.addTransferWhitelist(owner.address)

            await deployedInstance.mint(owner.address, 10000)
            expect(await deployedInstance.isWhitelisted(addr1.address)).to.equals(true);
            await deployedInstance.connect(addr1).transferFrom(owner.address, addr2.address, 5000);

            expect(await deployedInstance.balanceOf(owner.address)).to.equal(5000);
            expect(await deployedInstance.balanceOf(addr2.address)).to.equal(5000);
        })

        it("Should not be able to transfer from nonwhitelisted address to nonwhitelisted address", async function () {
            await deployedInstance.approve(addr1.address, 5000)
            await deployedInstance.addTransferWhitelist(addr1.address)
            await deployedInstance.mint(owner.address, 10000)
            await expect(deployedInstance.connect(addr1).transferFrom(owner.address, addr2.address, 5000)).to.be.reverted;
        })
    })
})
