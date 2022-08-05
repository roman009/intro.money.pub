const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");
require("dotenv").config();

module.exports = {
  // Uncommenting the defaults below
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777",
    },
    developmentTest: {
      provider: function () {
        var privateKeys = [
          "",
        ];
        return new HDWalletProvider(privateKeys, "http://127.0.0.1:7545/");
      },
      network_id: "5777",
    },
    testnet: {
      provider: () => {
        return new HDWalletProvider(
          [process.env.CONTRACT_OWNER_PRIVATE_KEY],
          process.env.WALLET_PROVIDER_URL
        );
      },
      network_id: process.env.NETWORK_ID,
      confirmations: 1,
      timeoutBlocks: 200,
      gas: 5000000,
      networkCheckTimeout: 999,
    },
    test: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777",
    },
    testnetFTM: {
      provider: () => {
        return new HDWalletProvider(
          [process.env.CONTRACT_OWNER_PRIVATE_KEY_FANTOM],
          process.env.WALLET_PROVIDER_URL_FANTOM_TESTNET
        );
      },
      network_id: process.env.NETWORK_ID_FANTOM_TESTNET,
      // confirmations: 1,
      // timeoutBlocks: 200,
      // gas: 50000000,
      // networkCheckTimeout: 999,
      gasPrice: 470000000000,
    },
  },
  compilers: {
    solc: {
      version: ">=0.8.0", // A version or constraint - Ex. "^0.5.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200, // Optimize for how many times you intend to run the code
        },
      },
    },
  },
};
