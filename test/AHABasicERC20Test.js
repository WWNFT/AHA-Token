// We import Chai to use its asserting functions here.
const { expect } = require("chai");

describe("Basic ERC operations", function () {
    let TVEContract;
    let owner, addr1, addr2;
    let deployedInstance;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        TVEContract = await ethers.getContractFactory("AHAPolygon");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        deployedInstance = await TVEContract.deploy([], owner.address, addr1.address);
    })

    // You can nest describe calls to create subsections.
    describe("Deployment", function () {
        it("Should set the right role", async function () {
            expect(await deployedInstance.hasRole(deployedInstance.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
            expect(await deployedInstance.hasRole(deployedInstance.SNAPSHOT_ROLE(), owner.address)).to.equal(true);
            expect(await deployedInstance.hasRole(deployedInstance.PAUSER_ROLE(), owner.address)).to.equal(true);
            expect(await deployedInstance.hasRole(deployedInstance.WHITELIST_EDITOR_ROLE(), owner.address)).to.equal(true);
            expect(await deployedInstance.hasRole(deployedInstance.MINTER_ROLE(), owner.address)).to.equal(true);
            expect(await deployedInstance.hasRole(deployedInstance.DEPOSITOR_ROLE(), owner.address)).to.equal(false);
            expect(await deployedInstance.hasRole(deployedInstance.DEPOSITOR_ROLE(), addr1.address)).to.equal(true);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await deployedInstance.balanceOf(owner.address);
            expect(await deployedInstance.totalSupply()).to.equal(ownerBalance);
            expect(await deployedInstance.totalSupply()).to.equal(0);
        });
    })

    describe("txn", function () {
        it("Should mint the correct amount of token", async function () {
            await deployedInstance.mint(addr1.address, 10000)
            expect(await deployedInstance.balanceOf(addr1.address)).to.equal(10000);
            expect(await deployedInstance.totalSupply()).to.equal(10000);
        });

        it("non minter should not be able to mint", async function () {
            await expect(deployedInstance.connect(addr1).mint(addr1.address, 10000)).to.be.reverted;
        });

    })

    describe("pause", function () {
        it("Pauser should be able to pause and unpause", async function () {
            await deployedInstance.pause()
            await expect(deployedInstance.mint(addr1.address, 10000)).to.be.reverted;
            await deployedInstance.unpause()
            await deployedInstance.mint(addr1.address, 10000)
            expect(await deployedInstance.balanceOf(addr1.address)).to.equal(10000);
            expect(await deployedInstance.totalSupply()).to.equal(10000);
        });

        it("non-Pauser should not be able to pause and unpause", async function () {
            await expect(deployedInstance.connect(addr1).pause()).to.be.reverted;
        });
    })

    describe("snapshot", function () {
        it("Should properly record snapshot value for mint", async function () {
            await deployedInstance.mint(addr1.address, 10000)
            await deployedInstance.mint(addr2.address, 20000)
            await deployedInstance.snapshot();
            const snapshotid = await deployedInstance.getCurrentSnapshotId();
            await deployedInstance.mint(addr1.address, 30000)
            await deployedInstance.mint(addr2.address, 40000)


            expect(await deployedInstance.totalSupply()).to.equal(100000);

            // Validate current balance
            expect(await deployedInstance.balanceOf(addr1.address)).to.equal(40000);
            expect(await deployedInstance.balanceOf(addr2.address)).to.equal(60000);

            // Validate snapshots
            expect(await deployedInstance.totalSupplyAt(snapshotid)).to.equal(30000);
            expect(await deployedInstance.balanceOfAt(addr1.address, snapshotid)).to.equal(10000);
            expect(await deployedInstance.balanceOfAt(addr2.address, snapshotid)).to.equal(20000);

        });

        it("non snapshoter should not be able to create snapshot", async function () {
            await expect(deployedInstance.connect(addr1.address).snapshot()).to.be.reverted;
        })
    })
})
