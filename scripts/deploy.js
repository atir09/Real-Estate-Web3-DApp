// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { ethers } = hre
const fs = require("fs")
const metadata1 = fs.readFileSync("./metadata/1.json", "utf-8")
const metadata2 = fs.readFileSync("./metadata/2.json", "utf-8")
const metadata3 = fs.readFileSync("./metadata/3.json", "utf-8")
const metaDatas = [metadata1, metadata2, metadata3]

const token = (n) => {
  return ethers.utils.parseEther(n.toString())
}

async function main() {
  let realEstate, escrow;
  let nftId = []
  let [buyer, seller, inspector, lender] = await ethers.getSigners()

  console.log("Buyer Address:", buyer.address);
  console.log("Seller Address:", seller.address);
  console.log("Inspector Address:", inspector.address);
  console.log("Lender Address:", lender.address);

  const RealEstate = await ethers.getContractFactory("RealEstate");
  realEstate = await RealEstate.deploy();
  await realEstate.deployed()
  console.log("RealEstata Contract address:", realEstate.address);

  const Escrow = await ethers.getContractFactory("Escrow");
  escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  );
  await escrow.deployed();
  console.log("Escrow Contract address:", escrow.address);


  for (let i = 0; i < metaDatas.length; i++) {
    console.log("i", i)
    console.log(metaDatas[i])
    let transaction = await realEstate.connect(seller).mint(metaDatas[i]);
    const receipt = await transaction.wait();
    // console.log(receipt.events[0])
    // Find the Transfer event (standard ERC721 event)
    const transferEvent = receipt.events.find(
      (event) => event.event === 'Transfer'
    );

    if (transferEvent) {
      // The Transfer event has the format:
      // Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
      const tokenId = transferEvent.args[2]; // The tokenId is at index 2
      nftId[i] = tokenId.toString();
    } else {
      console.error("No Transfer event found in the receipt");
    }
    console.log(nftId[i])
    transaction = await realEstate.connect(seller).approve(escrow.address, nftId[i]);
    await transaction.wait();

    const owner = await realEstate.ownerOf(nftId[i]);
    console.log("Minted NFT owner:", owner); // This should log the seller's address
  }

  transaction = await escrow.connect(seller).list(nftId[0], seller.address, buyer.address, token(20), token(10));
  await transaction.wait();

  transaction = await escrow.connect(seller).list(nftId[1], seller.address, buyer.address, token(15), token(5));
  await transaction.wait();

  transaction = await escrow.connect(seller).list(nftId[2], seller.address, buyer.address, token(10), token(5));
  await transaction.wait();

  const escrowAmount = await escrow.escrowAmount(nftId[2]);
  console.log("Prop-Id", nftId, "escrowAmount", escrowAmount); // This should log the seller's address

  console.log("Finished")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
