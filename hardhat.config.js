require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 31337, // Default chainId for Hardhat network
      mining: {
        auto: true, // Auto mine transactions on the network
        // interval: 2000, // Milliseconds between mines
      },
    },
  },
};
