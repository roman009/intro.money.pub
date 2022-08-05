import React, { Component } from "react";
import IntroMoney from "./contracts/IntroMoney.json";
import getWeb3 from "./getWeb3";

class Conversation extends Component {
  componentDidMount23 = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = IntroMoney.networks[networkId];
      const instance = new web3.eth.Contract(
        IntroMoney.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState(
        { accounts: accounts, web3: web3, contract: instance },
        this.connect
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  componentDidMount23 = async () => {
    try {
      await this.props.connect();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  connect232 = async () => {
    let {
      web3,
      contract,
      isLoggedIn,
      isRegistered,
      username,
      messages,
      conversations,
      decryptedMessage,
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

    // messages = await contract.methods.getMessages().call({ from: accounts[0] });
    // conversations = await contract.methods
    //   .getConversations()
    //   .call({ from: accounts[0] });
    // console.log(conversations);

    let conversationId = this.props.match.params.id;
    console.log(conversationId);
    try {
      let conversation = await contract.methods
        .getConversation(web3.utils.numberToHex(conversationId))
        .call({
          from: accounts[0],
        });
      console.log(conversation);
      decryptedMessage = web3.utils.hexToUtf8(conversation.messages[0].text);

      // Update state with the result.
      this.setState({
        balance: balance,
        isRegistered: isRegistered,
        accounts: accounts,
        isLoggedIn: isLoggedIn,
        username: username,
        messages: messages,
        decryptedMessage: decryptedMessage,
      });
    } catch (error) {
      console.log(error);
    }
  };

  handleConversationPasswordChange = async (event) => {
    this.setState({ conversationPassword: event.target.value });
  };

  decryptMessage = async (event) => {
    event.preventDefault();
    let {
      web3,
      contract,
      messageDecrypt,
      conversationPassword,
      decryptedMessage,
    } = this.state;
    fetch("http://localhost:3001/decrypt", {
      method: "POST",
      body: JSON.stringify({
        message: decryptedMessage,
        password: conversationPassword,
      }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.decodedMessage);
        if (data.decodedMessage != null && data.decodedMessage.length) {
          this.setState({ decryptedMessage: data.decodedMessage });
        }
      })
      .catch(console.log);
  };

  handleUsernameChange = async (event) => {
    this.setState({ username: event.target.value });
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
    this.setState(
      { isRegistered: isRegistered, isLoggedIn: isLoggedIn },
      this.connect
    );
  };

  showRegister = () => {
    if (!this.props.state.isRegistered) {
      return (
        <form id="register">
          <input
            type="text"
            name="username"
            value={this.props.state.username}
            onChange={this.handleUsernameChange}
          ></input>
          <button onClick={this.register}>Register</button>
        </form>
      );
    }
    return "";
  };

  render() {
    console.log(this.props);
    console.log(this.props.state);
    if (!this.props.state.web3) {
      return <div>Loading...</div>;
    }

    return (
      <div className="Conversation">
        <div>
          <label>Logged in: </label>
          {this.props.state.isLoggedIn ? "yes" : "no"}
        </div>
        <div>Username: {this.props.state.username}</div>
        <div>
          <label>Registered: </label>
          {this.props.state.isRegistered ? "yes" : "no"}
        </div>
        {this.showRegister()}
        <div>
          <label>Account: </label>
          {this.props.state.accounts[0]}
        </div>
        <div>
          <label>Balance: </label>
          {this.props.state.balance}
        </div>
        <div>
          <label>Conversation</label>
          <br></br>
          <label>password: </label>
          <input
            type="text"
            name="conversation-password"
            onChange={this.handleConversationPasswordChange}
          ></input>
          <button onClick={this.decryptMessage}>Decrypt Message</button>
          <br></br>
          <textarea id="message-contents" value={this.state.decryptedMessage} />
        </div>
      </div>
    );
  }
}

export default Conversation;
