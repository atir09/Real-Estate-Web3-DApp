# Real Estate DApp - Blockchain-Powered Real Estate Transactions

This project is a decentralized application (DApp) that facilitates real estate transactions through the use of NFTs (ERC721 tokens) and an escrow contract on the Ethereum blockchain. The DApp allows for secure buying, selling, and inspection of properties, with a built-in escrow mechanism to ensure the fairness of transactions.

## Features

- **Real Estate NFTs**: Real estate properties are represented as unique NFTs (ERC721), allowing for easy tracking, transfer, and ownership verification.
- **Escrow System**: A smart contract to hold funds and NFTs during the transaction process, ensuring both buyer and seller are protected.
- **Inspection Process**: An inspection status can be set and verified before proceeding with the transaction.
- **Approval Mechanism**: The contract ensures both the seller and lender must approve the sale before finalizing it.
- **Earnest Deposit**: Buyers must deposit earnest money into escrow before proceeding with the transaction.

## Smart Contracts

The project includes two key smart contracts:

1. **RealEstate Contract**: An ERC721 contract for minting unique NFTs representing real estate properties.  
2. **Escrow Contract**: A contract for holding the NFT and funds in escrow until certain conditions (inspection passed, approvals, etc.) are met.

### RealEstate Contract

This contract mints ERC721 NFTs that represent real estate properties. Each property can be uniquely identified by a token ID, and the metadata (e.g., property details) can be stored via the `tokenURI`.

#### Key Functions:
- `mint(string memory tokenURI)`: Mint a new real estate NFT with associated metadata.
- `totalSupply()`: Returns the total number of NFTs minted.

### Escrow Contract

The Escrow contract manages the buying and selling process by ensuring funds and NFTs are held in a secure escrow account until the transaction conditions are met.

#### Key Functions:
- `list(uint256 _nftId, address _seller, address _buyer, uint256 _purchasePrice, uint256 _escrowAmount)`: Lists a property for sale in escrow.
- `depositEarnest(uint256 _nftId)`: Allows the buyer to deposit earnest money into escrow.
- `updateInspectionStatus(uint256 _nftId, bool _status)`: Updates the inspection status of the property.
- `approveSale(uint256 _nftId)`: Allows the seller and lender to approve the sale.
- `finalizeSale(uint256 _nftId)`: Finalizes the sale once all conditions are met and transfers the property to the buyer.

## Technology Stack

- **Solidity**: Used for writing the smart contracts that power the DApp.
- **Hardhat**: A development framework for Ethereum that allows for compiling, deploying, testing, and debugging the smart contracts.
- **Ethers.js**: A library for interacting with the Ethereum blockchain from the frontend (React).
- **React.js**: A JavaScript library for building the frontend interface of the DApp.
- **OpenZeppelin Contracts**: A library of secure, community-vetted smart contracts, including the ERC721 implementation.

## Technology Stack & Tools

- Solidity (Writing Smart Contracts & Tests)
- Javascript (React & Testing)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [Ethers.js](https://docs.ethers.io/v5/) (Blockchain Interaction)
- [React.js](https://reactjs.org/) (Frontend Framework)

## Getting Started

To run this project locally, follow the steps below.

### Prerequisites

Ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- MetaMask (or any other Ethereum wallet) for interacting with the DApp
- Hardhat

## Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/en/)

## Setting Up
### 1. Clone/Download the Repository

### 2. Install Dependencies:
`$ npm install`

### 3. Run tests
`$ npx hardhat test`

### 4. Start Hardhat node
`$ npx hardhat node`

### 5. Run deployment script
In a separate terminal execute:
`$ npx hardhat run ./scripts/deploy.js --network localhost`

### 7. Start frontend
`$ npm run start`
