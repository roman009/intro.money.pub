import React, { Component } from "react";
import ReactDOM from "react-dom";
import IntroMoney from "./contracts/IntroMoney.json";
import getWeb3 from "./getWeb3";
import CryptoJS from "crypto-js";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import Conversation from "./Conversation";
import Header from "./Header";
import Body from "./Body";

import "./App.css";

class App extends Component {
  state = {
    balance: 0,
    web3: null,
    accounts: null,
    contract: null,
    isRegistered: false,
    isLoggedIn: false,
    username: "",
    depositAmount: 0,

    message: "",
    password1: "",
    password2: "",
    password3: "",
    readReward: 0,
    replyReward: 0,
    messages: [],
    messageDecrypt: "",
    passwordDecrypt: "",
    decryptedMessage: "",

    conversationMessage: "",
    conversationPassword: "",
    conversationReadReward: 0,
    conversationReplyReward: 0,
    conversations: [],
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = IntroMoney.networks[networkId];
      const instance = new web3.eth.Contract(
        IntroMoney.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, contract: instance }, this.connect);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // await contract.methods.set(5).send({ from: accounts[0] });

    // const balance = await contract.methods.balance().call({ from: accounts[0] });
    const balance = null;

    // const isRegistered = await contract.methods.isRegistered(accounts[0]);
    const isRegistered = null;

    // Update state with the result.
    this.setState({ balance: balance, isRegistered: isRegistered });
  };

  connect = async () => {
    let {
      web3,
      contract,
      isLoggedIn,
      isRegistered,
      username,
      messages,
      conversations,
    } = this.state;
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    isRegistered = await contract.methods.isRegistered(accounts[0]).call();
    console.log(isRegistered);

    let balance;
    if (isRegistered === true) {
      balance = await contract.methods.balance().call({ from: accounts[0] });
      balance = web3.utils.fromWei(balance);
      username = await contract.methods.username().call({ from: accounts[0] });
      username = web3.utils.toUtf8(username);
      isLoggedIn = true;
    } else {
      balance = 0;
    }
    console.log(username);
    console.log(balance);

    messages = await contract.methods.getMessages().call({ from: accounts[0] });
    conversations = await contract.methods
      .getConversations()
      .call({ from: accounts[0] });
    console.log(conversations);

    // Update state with the result.
    this.setState({
      balance: balance,
      isRegistered: isRegistered,
      accounts,
      isLoggedIn: isLoggedIn,
      username: username,
      messages: messages,
      conversations: conversations,
    });
  };

  register = async (event) => {
    event.preventDefault();
    let { web3, contract, username, isRegistered, isLoggedIn } = this.state;
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    await contract.methods
      .register(web3.utils.utf8ToHex(username))
      .send({ from: accounts[0] });
    isRegistered = await contract.methods.isRegistered(accounts[0]).call();
    isLoggedIn = true;
    this.setState({ isRegistered: isRegistered, isLoggedIn: isLoggedIn });
  };

  handleUsernameChange = async (event) => {
    this.setState({ username: event.target.value });
  };

  handleDepositChange = async (event) => {
    this.setState({ depositAmount: event.target.value });
  };

  handleMessageChange = async (event) => {
    this.setState({ message: event.target.value });
  };
  handlePassword1Change = async (event) => {
    this.setState({ password1: event.target.value });
  };
  handlePassword2Change = async (event) => {
    this.setState({ password2: event.target.value });
  };
  handlePassword3Change = async (event) => {
    this.setState({ password3: event.target.value });
  };
  handleReadRewardChange = async (event) => {
    this.setState({ readReward: event.target.value });
  };
  handleReplyRewardChange = async (event) => {
    this.setState({ replyReward: event.target.value });
  };
  handleMessageDecryptChange = async (event) => {
    this.setState({ messageDecrypt: event.target.value });
  };
  handlePasswordDecryptChange = async (event) => {
    this.setState({ passwordDecrypt: event.target.value });
  };
  handleConversationPasswordChange = async (event) => {
    this.setState({ conversationPassword: event.target.value });
  };
  handleConversationMessageChange = async (event) => {
    this.setState({ conversationMessage: event.target.value });
  };
  handleConversationReadRewardChange = async (event) => {
    this.setState({ conversationReadReward: event.target.value });
  };
  handleConversationReplyRewardChange = async (event) => {
    this.setState({ conversationReplyReward: event.target.value });
  };

  createConversation = async (event) => {
    event.preventDefault();
    let {
      web3,
      contract,
      conversationMessage,
      conversationPassword,
      conversationReadReward,
      conversationReplyReward,
      messages,
    } = this.state;
    const accounts = await web3.eth.getAccounts();
    let encryptedMessage;
    await fetch("http://localhost:3001/encrypt", {
      method: "POST",
      body: JSON.stringify({
        message: conversationMessage,
        password: conversationPassword,
      }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        encryptedMessage = data.encodedMessage;
      })
      .catch(console.log);
    console.log(encryptedMessage);

    await contract.methods
      .createConversation(
        web3.utils.utf8ToHex(encryptedMessage),
        web3.utils.toWei(conversationReadReward),
        web3.utils.toWei(conversationReplyReward)
      )
      .send({ from: accounts[0] });
    let conversations = await contract.methods
      .getConversations()
      .call({ from: accounts[0] });
    console.log(conversations);
  };

  createMessage = async (event) => {
    event.preventDefault();
    let {
      web3,
      contract,
      message,
      password1,
      password2,
      password3,
      readReward,
      replyReward,
      messages,
    } = this.state;
    // let encryptedMessage1 = CryptoJS.AES.encrypt(message, password1).toString();
    let encryptedMessage1;
    await fetch("http://localhost:3001/encrypt", {
      method: "POST",
      body: JSON.stringify({ message: message, password: password1 }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        encryptedMessage1 = data.encodedMessage;
      })
      .catch(console.log);

    let encryptedMessage2 = CryptoJS.AES.encrypt(message, password2).toString();
    let encryptedMessage3 = CryptoJS.AES.encrypt(message, password3).toString();

    console.log(encryptedMessage1);
    console.log(encryptedMessage2);
    console.log(encryptedMessage3);

    let decryptedMessage1 = CryptoJS.AES.decrypt(encryptedMessage1, password1);
    decryptedMessage1 = decryptedMessage1.toString(CryptoJS.enc.Utf8);
    console.log(decryptedMessage1);

    let decryptedMessage2 = CryptoJS.AES.decrypt(encryptedMessage2, password2);
    decryptedMessage2 = decryptedMessage2.toString(CryptoJS.enc.Utf8);
    console.log(decryptedMessage2);

    let decryptedMessage3 = CryptoJS.AES.decrypt(encryptedMessage3, password3);
    decryptedMessage3 = decryptedMessage3.toString(CryptoJS.enc.Utf8);
    console.log(decryptedMessage3);

    let decryptedMessage4 = CryptoJS.AES.decrypt(
      encryptedMessage3,
      "wrong pass"
    );
    decryptedMessage4 = decryptedMessage4.toString(CryptoJS.enc.Utf8);
    console.log(decryptedMessage4 === "");

    // send the encrypted messages + password to the API for decryption and payment decision/triggering
    const accounts = await web3.eth.getAccounts();
    const encryptedMessages = [
      web3.utils.utf8ToHex(encryptedMessage1),
      web3.utils.utf8ToHex(encryptedMessage2),
      web3.utils.utf8ToHex(encryptedMessage3),
    ];
    // await contract.methods.createMessage(encryptedMessages, readReward, replyReward).send({ from: accounts[0]});
    await contract.methods
      .createMessage(
        web3.utils.utf8ToHex(encryptedMessage1),
        readReward,
        replyReward
      )
      .send({ from: accounts[0] });
    messages = await contract.methods.getMessages().call({ from: accounts[0] });
    console.log(messages);
    this.setState({ messages: messages });
  };

  readMessage = async (event) => {
    // start transaction on the contract with the info of the user that tries to read
    // try to decode the message
    //
  };

  deposit = async (event) => {
    event.preventDefault();
    let { web3, contract, depositAmount } = this.state;
    const accounts = await web3.eth.getAccounts();
    const wei = web3.utils.toWei(depositAmount);

    await contract.methods.deposit().send({ from: accounts[0], value: wei });
  };

  decryptMessage = async (event) => {
    event.preventDefault();
    let {
      web3,
      contract,
      messageDecrypt,
      passwordDecrypt,
      decryptedMessage,
    } = this.state;
    fetch("http://localhost:3001/decrypt", {
      method: "POST",
      body: JSON.stringify({
        message: messageDecrypt,
        password: passwordDecrypt,
      }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ decryptedMessage: data.decodedMessage });
      })
      .catch(console.log);
  };

  render() {
    return (
      <Router>
        <div className="App">
          <Header />
          <Body connect={this.connect} state={this.state} />
        </div>
      </Router>
    );
  }
}

export default App;
