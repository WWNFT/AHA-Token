const { expect } = require("chai");


describe("Polygon", function () {
    let TVEContract;
    let owner, addr1, addr2;
    let deployedInstance;
    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        TVEContract = await ethers.getContractFactory("AHAPolygon");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        deployedInstance = await TVEContract.deploy([], addr1.address);
    })

    it("Only DEPOSITOR_ROLE can deposite", async function () {

        var abiCoder = ethers.utils.defaultAbiCoder;
        let encoded = abiCoder.encode(["uint256"], [100])
        await expect(deployedInstance.deposit(owner.address, encoded)).to.be.reverted;
        await deployedInstance.connect(addr1).deposit(owner.address, encoded);

        expect(await deployedInstance.balanceOf(owner.address)).to.equal(100);
        expect(await deployedInstance.totalSupply()).to.equal(100);
    })

    it("Owner can burn", async function () {
        var abiCoder = ethers.utils.defaultAbiCoder;
        let encoded = abiCoder.encode(["uint256"], [100])
        await deployedInstance.connect(addr1).deposit(owner.address, encoded);
        expect(await deployedInstance.balanceOf(owner.address)).to.equal(100);
        expect(await deployedInstance.totalSupply()).to.equal(100);

        await deployedInstance.withdraw(90);
        expect(await deployedInstance.balanceOf(owner.address)).to.equal(10);
        expect(await deployedInstance.totalSupply()).to.equal(10);
    })
})


describe("Eth", function () {
    let TVEContract;
    let owner, addr1, addr2;
    let deployedInstance;
    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        TVEContract = await ethers.getContractFactory("AHAEth");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        deployedInstance = await TVEContract.deploy([], addr1.address);
    })

    it("Only PREDICATE_ROLE can mint", async function () {
        await deployedInstance.connect(addr1).mint(addr1.address, 10000)
        expect(await deployedInstance.balanceOf(addr1.address)).to.equal(10000);
        expect(await deployedInstance.totalSupply()).to.equal(10000);

        await expect(deployedInstance.mint(addr1.address, 1000)).to.be.reverted;
    })
})