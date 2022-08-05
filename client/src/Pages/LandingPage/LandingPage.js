import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./LandingPage.css";
import modalLogo from "../../assets/modalLogo.svg";
import modalLogo2 from "../../assets/BSCLogo.svg";
import ExclamatoryIcon from "../../assets/exclamatoryLight.svg";
import { useHistory } from "react-router-dom";
import getWeb3 from "../../getWeb3";
import IntroMoney from "../../contracts/IntroMoney.json";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    background: "#00838F",
    borderRadius: "20px",
  },
};

function LandingPage() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [error, setError] = useState(false);

  let history = useHistory();

  const connectWallet = async () => {
    console.log("connectWallet");
    //hunnain_flow
    // history.push("/signup");
    const web3Instance = await getWeb3();
    const networkId = await web3Instance.eth.net.getId();
    const deployedNetwork = IntroMoney.networks[networkId];
    const contractInstance = new web3Instance.eth.Contract(
      IntroMoney.abi,
      deployedNetwork && deployedNetwork.address
    );

    const accounts = await web3Instance.eth.getAccounts();
    console.log(accounts);
    if (accounts.length) {
      let isRegistered = await contractInstance.methods
        .isRegistered(accounts[0])
        .call();
      if (isRegistered === true) {
        history.push("/mainpage");
      } else {
        history.push("/signup");
      }
    }
  };

  useEffect(() => {
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
        Make your message heard.
        <div className="subHeading">
          {/* reward your recipient for reading and replying */}
          reward replying
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
        className="balanceModal landingBalModal"
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
      >
        <div className="balance">
          <div className="connectHeading">
            Connect to Metamask to get started
          </div>
          <div className="balanceInner">
            <img className="mobileLogo" src={modalLogo} alt="Logo" />
            <img className="mobileLogo" src={modalLogo2} alt="biance-logo" />
          </div>
          <div className="balanceSoleButtons">
            <div className="needHelp">
              <a href="https://icebreakio.gitbook.io/icebreak/">
                Need help? Learn more <b>here!</b>
              </a>
            </div>
            <div className="connectSingleButton" onClick={connectWallet}>
              connect
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={error} style={customStyles}>
        <div className="errorModal">
          <h2>ERROR</h2>
          <h6>Switch to the Binance Smart Chain Network to use icebreak</h6>
          <img className="mobileLogo" src={modalLogo} alt="Logo" />
          <p>emojione infor...</p>
          <img
            className="errorExclamatory"
            src={ExclamatoryIcon}
            alt="ExclamatoryIcons"
            width="100px"
          />
        </div>
      </Modal>
    </div>
  );
}

export default LandingPage;

/*<div className="landingPage">
      <div className="ellipse"></div>

      <div className="heading">
        Make your message heard.
        <div className="subHeading">
          reward your recipient for reading and replying
        </div>
      </div>

      <div className="walletHeading">connect wallet to get started</div>

      <div className="connectSection">
        <div onClick={() => setModalIsOpen(true)} className="connectButton">
          Connect
        </div>
      </div>

      <Modal
        className="Modal"
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
      >
        <div className="headingModal">Connect Metamask</div>
        <img src={modalLogo} alt="Logo" />

        <div className="walletHeadingModal">connect wallet to get started</div>
        <div className="connectSectionModal">
          <div className="connectButtonModal" onClick={connectWallet}>
            Connect
          </div>
        </div>
      </Modal>
    </div>
  );*/
