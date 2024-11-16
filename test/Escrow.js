const { expect } = require('chai');
const { ethers } = require('hardhat');
const fs = require("fs");
const { inspect } = require('util');
const { wait } = require('@testing-library/user-event/dist/utils');

const metadata1 = fs.readFileSync("./metadata/1.json", "utf-8")
const metadata2 = fs.readFileSync("./metadata/2.json", "utf-8")
const metadata3 = fs.readFileSync("./metadata/3.json", "utf-8")

const token = (n) => {
    return ethers.utils.parseEther(n.toString())
}

describe("Escrow", () => {
    let buyer, seller, inspector, lender, realEstate, escrow, nftId

    before(async () => {
        console.log("Running Before Each.................");
        [buyer, seller, inspector, lender] = await ethers.getSigners()

        const RealEstate = await ethers.getContractFactory("RealEstate");
        realEstate = await RealEstate.deploy();
        console.log("RealEstae Contract address:", realEstate.address);

        nftId = await realEstate.connect(seller).mint(metadata1);
        await nftId.wait();
        nftId = (nftId.value).toString()


        const Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )

        let transaction = await realEstate.connect(seller).approve(escrow.address, nftId)
        await transaction.wait()

        transaction = await escrow.connect(seller).list(nftId, seller.address, buyer.address, token(10), token(5));
        await transaction.wait()

        transaction = await escrow.connect(buyer).depositEarnest(nftId, { value: token(5) })
        await transaction.wait()

    })

    describe("Deployment", () => {

        it("Returns NFT Address", async () => {
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(realEstate.address)
        })
        it("Returns Seller Address", async () => {
            const result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })
        it("Returns Inspector Address", async () => {
            const result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
        })
        it("Returns lender Address", async () => {
            const result = await escrow.lender()
            expect(result).to.be.equal(lender.address)
        })
    })

    describe("List", () => {

        it("Changes Token Ownership", async () => {
            expect(await realEstate.ownerOf(nftId)).to.be.equal(escrow.address)
        })

        it("Updates as listed", async () => {
            expect(await escrow.isListed(nftId)).to.be.equal(true);
        })

        it("Updates buyer", async () => {
            expect(await escrow.buyer(nftId)).to.be.equal(buyer.address);
        })

        it("Updates Purchase Price", async () => {
            expect(await escrow.purchasePrice(nftId)).to.be.equal(token(10));
        })
        it("Updates Escrow Amount", async () => {
            expect(await escrow.escrowAmount(nftId)).to.be.equal(token(5));
        })

    })

    describe("Deposit", () => {
        console.log("Inside Updates Escore Balance.")
        it("Updates Escrow Balance", async () => {
            const result = await escrow.getBalance();
            expect(result).to.be.equal(token(5));
        })
    })



    let inspectionStatus = true;
    describe("Inspection", () => {
        before(async () => {
            let transaction = await escrow.connect(inspector).updateInspectionStatus(nftId, inspectionStatus);
            await transaction.wait();
        })
        it("Updates Inspection Status", async () => {
            expect(await escrow.inspectionStatus(nftId)).to.be.equal(inspectionStatus);

        })
    })



    describe("Approval", () => {
        before(async () => {

            let transaction = await escrow.connect(lender).approveSale(nftId);
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(nftId);
            await transaction.wait()

        })

        it("Updates Lender Approval", async () => {
            inspectionStatus ? expect(await escrow.approval(nftId, lender.address)).to.be.equal(true)
                : expect(await escrow.approval(nftId, lender.address)).to.be.equal(false);
        })

        it("Updates Seller Approval", async () => {
            inspectionStatus ? expect(await escrow.approval(nftId, seller.address)).to.be.equal(true)
                : expect(await escrow.approval(nftId, seller.address)).to.be.equal(false);

        })

    })


    describe("Finalize Sale", () => {
        before(async () => {
            console.log("before Finalize Sale")
            let transaction = await lender.sendTransaction({ to: escrow.address, value: token(5) })
            await transaction.wait()

            transaction = await escrow.connect(seller).finalizeSale(nftId);
            await transaction.wait()
        })
        it("Unlists the property", async () => {
            expect(await escrow.isListed(nftId)).to.be.equal(false);
        })

        it("Changes Token Ownership", async () => {
            expect(await realEstate.ownerOf(nftId)).to.be.equal(buyer.address)
        })
        it("Updates Balance", async () => {
            expect(await escrow.getBalance()).to.be.equal(0)
        })



    })

})
