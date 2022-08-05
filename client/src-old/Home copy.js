import { Link } from "react-router-dom";
import React, { Component } from "react";
import IntroMoney from "./contracts/IntroMoney.json";
import getWeb3 from "./getWeb3";

/**
 * This page includes navigation (nested Routers)
 */
// export default function Home() {
//   //   const posts = postsData.map((post) => {
//   //     return (
//   //       <Link to={"/post/" + post.slug} key={post.slug}>
//   //         <div className="post-listing">
//   //           <h1>{post.title}</h1>
//   //         </div>
//   //       </Link>
//   //     );
//   //   });
//   const posts = "posts";

//   return <div className="blog">{posts}</div>;
// }

class Home extends Component {
  state = {
    balance: 0,
    web3: null,
    accounts: [],
    contract: null,
    isRegistered: false,
    isLoggedIn: false,
    username: "",
    depositAmount: 0,

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
      this.setState({ web3: web3, contract: instance }, this.connect);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  constructor(props) {
    super(props);
  }

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
      accounts: accounts,
      isLoggedIn: isLoggedIn,
      username: username,
      messages: messages,
      conversations: conversations,
    });
  };

  handleDepositChange = async (event) => {
    this.setState({ depositAmount: event.target.value });
  };
  deposit = async (event) => {
    event.preventDefault();
    let { web3, contract, depositAmount } = this.state;
    const accounts = await web3.eth.getAccounts();
    const wei = web3.utils.toWei(depositAmount);

    await contract.methods.deposit().send({ from: accounts[0], value: wei });
    await this.connect();
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

    await this.connect();
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading...</div>;
    }
    // const posts = "posts";
    //
    // return <div className="blog">{posts}</div>;
    return (
      <div className="App">
        <div>
          <label>Logged in: </label>
          {this.state.isLoggedIn ? "yes" : "no"}
        </div>
        <div>
          <label>Account: </label>
          {this.state.accounts[0]}
        </div>
        <div>
          <label>Balance: </label>
          {this.state.balance}
        </div>
        <div>
          <label>Deposit: </label>
          <form id="deposit">
            <input
              type="text"
              name="amount"
              value={this.state.amount}
              onChange={this.handleDepositChange}
            ></input>
            <button onClick={this.deposit}>Deposit</button>
          </form>
        </div>
        <div>
          <label>Conversations: </label>
          <ul>
            {this.state.conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link to={`/conversation/${conversation.id}`}>
                  {conversation.id}.
                </Link>
                {/* {this.state.web3.utils.hexToUtf8(conversation.messages[0].text)} */}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <br></br>
          <br></br>
          <form id="create-conversation">
            <h2>create conversation</h2>
            <label>
              message:
              <textarea
                type="text"
                name="conversation-message"
                onChange={this.handleConversationMessageChange}
              />
            </label>
            <br></br>
            <label>
              password:
              <input
                type="text"
                name="conversation-password"
                onChange={this.handleConversationPasswordChange}
              ></input>
            </label>
            <br></br>
            <label>
              read reward:
              <input
                type="text"
                name="conversation-read-reward"
                onChange={this.handleConversationReadRewardChange}
              ></input>
            </label>
            <br></br>
            <label>
              reply reward:
              <input
                type="text"
                name="conversation-reply-reward"
                onChange={this.handleConversationReplyRewardChange}
              ></input>
            </label>
            <br></br>
            <button onClick={this.createConversation}>
              Create Conversation
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Home;
