import React, { useEffect, useState } from "react";
import CurrencyComponent from "../../Components/Currency/CurrencyComponent";
import Message from "../../Components/Message/Message";
import SidebarChat from "../../Components/SidebarChat/SidebarChat";
import Modal from "react-modal";
import modalLogo from "../../assets/modalLogo.svg";
import copySvg from "../../assets/copy.svg";
import "./ConversationPage.css";
import getWeb3 from "../../getWeb3";
import Web3 from "web3";
import IntroMoney from "../../contracts/IntroMoney.json";
import { useHistory, useParams } from "react-router-dom";

const provider = new Web3.providers.HttpProvider(
  process.env.REACT_APP_WALLET_PROVIDER_URL_FANTOM_TESTNET
);
const web3Instance = new Web3(provider);
console.log(process.env.REACT_APP_WALLET_PROVIDER_URL_FANTOM_TESTNET);
console.log(provider);

let networkId = process.env.REACT_APP_NETWORK_ID_FANTOM_TESTNET;
const deployedNetwork = IntroMoney.networks[networkId];
const contractInstance = new web3Instance.eth.Contract(
  IntroMoney.abi,
  deployedNetwork && deployedNetwork.address
);

function ConversationPage() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [replyReward, setReplyReward] = useState(0);
  var history = useHistory();
  let { conversationHash } = useParams();

  useEffect(() => {
    const init = async () => {
      let conversation = await contractInstance.methods
        .getConversationByHash(conversationHash)
        .call();
      await loadRate(web3Instance.utils.fromWei(conversation.replyReward));
    };
    init();

    handleResize();

    function handleResize() {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  //mobile
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const connectWallet = () => {
    let contractInstance;
    let web3Instance;
    const init = async () => {
      web3Instance = await getWeb3();
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = IntroMoney.networks[networkId];
      contractInstance = new web3Instance.eth.Contract(
        IntroMoney.abi,
        deployedNetwork && deployedNetwork.address
      );
      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length) {
        let isRegistered = await contractInstance.methods
          .isRegistered(accounts[0])
          .call();
        if (isRegistered !== true) {
          history.push("/signup/" + conversationHash);
        } else {
          history.push("/mainpage/" + conversationHash);
        }
      }
    };
    init();
  };

  const loadRate = async (valueBNB) => {
    let rate;
    await fetch(process.env.REACT_APP_API_URL + "/rate", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        rate = data;
      })
      .catch(console.log);

    let reward = new Intl.NumberFormat("en-US", {
      maximumSignificantDigits: 3,
    }).format(valueBNB * rate.rate);

    if (reward !== replyReward) {
      setReplyReward(reward);
    }

    console.log(rate);
    console.log(replyReward);
    console.log(reward);
    console.log(valueBNB);
  };

  if (windowWidth < 750) {
    return (
      <div className="landingPage">
        <div className={windowWidth > 750 ? "headerBig" : "headerBigMobile"}>
          <div
            className={
              windowWidth > 750 ? "ellipseLanding" : "ellipseLandingMobile"
            }
          ></div>
        </div>

        <div className="heading">
          Your time is valuable
          <div className="subHeading">
            Receive<span className="bold"> {replyReward} USD </span>in crypto
            for reading and replying to this message.
          </div>
          {/* {window.innerWidth <= 600 ?
    
              <>
                <div className="learnMore">
                  New to icebreak? &nbsp;
                </div>
                <div className="learnMore">
                  <a href="https://icebreakio.gitbook.io/icebreak/" target="_blank">
                    <b>Learn more</b>
                  </a>
                </div>
    
              </>
              : */}
          <div className="learnMore">
            New to icebreak? &nbsp;
            <a href="https://icebreakio.gitbook.io/icebreak/" target="_blank">
              <b>Learn more</b>
            </a>
          </div>
          {/* } */}
        </div>

        <div onClick={() => setModalIsOpen(true)} className="connectButton">
          <div className="connectButtonText">Connect</div>
        </div>

        <Modal
          className="balanceModal"
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
        >
          <div className="balance">
            <div className="connectHeading">
              Please download the Metamask app to use this service on mobile
            </div>
            <img className="mobileLogo" src={modalLogo} alt="Logo" />

            <div className="balanceSoleButtons">
              <div className="connectSingleButton" onClick={connectWallet}>
                connect
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="landingPage">
      <div className={windowWidth > 750 ? "headerBig" : "headerBigMobile"}>
        <div
          className={
            windowWidth > 750 ? "ellipseLanding" : "ellipseLandingMobile"
          }
        ></div>
      </div>

      <div className="heading">
        Your time is valuable.
        <div className="subHeadingConversation">
          <b>Break the ice</b> and receive{" "}
          <span className="bold"> {replyReward} USD </span>in crypto for
          replying to this message.
        </div>
        <div className="learnMore">
          New to icebreak? &nbsp;
          <a
            href="https://icebreakio.gitbook.io/icebreak/how-it-works-recipients"
            target="_blank"
          >
            <b>Learn more</b>
          </a>
        </div>
      </div>

      <div onClick={() => setModalIsOpen(true)} className="connectButton">
        <div className="connectButtonText">Connect</div>
      </div>

      <Modal
        className="balanceModal"
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
      >
        <div className="balance">
          <div className="connectHeading">
            Connect to Metamask to get started
          </div>
          <img className="mobileLogo" src={modalLogo} alt="Logo" />

          <div className="balanceSoleButtons">
            <div className="connectSingleButton" onClick={connectWallet}>
              connect
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ConversationPage;
