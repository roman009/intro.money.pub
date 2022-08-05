import React, { useState, useContext, useEffect } from "react";
import "./SignupPage.css";
import Modal from "react-modal";
import exclamatoryLogo from "../../assets/exclamatory.svg";
import { useHistory, useParams } from "react-router-dom";
import appContext from "../../Contexts/AppContext";
import getWeb3 from "../../getWeb3";
import IntroMoney from "../../contracts/IntroMoney.json";

function SignupPage() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [username, setUsername] = useState("");
  const [loadingPopUp, setLoadingPopUp] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const AppContext = useContext(appContext);
  let { conversationHash } = useParams();
  console.log(conversationHash);

  let history = useHistory();
  const handleUsername = (e) => {
    setUsername(e.target.value);
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

  const handleSignup = async () => {
    //hunnain_flow
    // history.push("/mainpage");
    setLoadingPopUp(true);
    var letters = /^[0-9a-zA-Z-@]+$/;
    if (
      username.match(letters) &&
      //   username.charAt(0) == "@" &&
      username.charAt(3)
    ) {
      setUsername(username);
      AppContext.username = username;

      const web3Instance = await getWeb3();
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = IntroMoney.networks[networkId];
      const contractInstance = new web3Instance.eth.Contract(
        IntroMoney.abi,
        deployedNetwork && deployedNetwork.address
      );

      const accounts = await web3Instance.eth.getAccounts();

      try {
        let gas;
        await contractInstance.methods
          .register(web3Instance.utils.utf8ToHex(AppContext.username))
          .estimateGas({ from: accounts[0] })
          .then((g) => {
            gas = g;
          });
        console.log("gas cost signup2: " + gas);
        await contractInstance.methods
          //.register(web3Instance.utils.utf8ToHex(AppContext.username))
          //.send({ from: accounts[0], value: web3Instance.utils.toWei(bnbInput) });
          .register(web3Instance.utils.utf8ToHex(AppContext.username))
          .send({ from: accounts[0], gas: gas * 2 });
      } catch (e) {
        console.log("Error during signup: " + e);
        setLoadingPopUp(false);
        return;
      }

      if (conversationHash !== undefined) {
        history.push("/mainpage/" + conversationHash);
      } else {
        history.push("/mainpage");
      }
    } else {
      setLoadingPopUp(false);
      setModalIsOpen(true);
    }
  };
  return (
    <div className="signupPage">
      <div className={windowWidth > 750 ? "headerBig" : "headerBigMobile"}>
        <div
          className={
            windowWidth > 750 ? "ellipseLanding" : "ellipseLandingMobile"
          }
        ></div>
      </div>

      <div className="signUp">
        <div className="contentSignup">
          <div className="signUpHeading">
            Choose a <b>username</b>
          </div>
          <div className={"contentSignup__input"}>
            <input
              placeholder="@username"
              onChange={handleUsername}
              value={username}
            />
          </div>
        </div>
        <div className="connectButton" onClick={handleSignup}>
          <div className="connectButtonText">connect</div>
        </div>
      </div>

      <Modal
        className="ModalSignup"
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
      >
        <div className="startModalSignup">
          <img className={"information"} src={exclamatoryLogo} />
          <div className="headingModalSignup">Invalid Username</div>
        </div>
        <div className="connectSectionModalSignup">
          <div
            onClick={() => setModalIsOpen(false)}
            className="connectButtonModalSignup"
          >
            try again
          </div>
        </div>
      </Modal>

      <Modal
        className="loadingScreenModal"
        isOpen={loadingPopUp} //isOpen={loadingPopUp}
        onRequestClose={() => setLoadingPopUp(false)}
      >
        <div className="loadingScreen">
          <span>Connecting to the blockchain...</span>
        </div>
      </Modal>
    </div>
  );
}

export default SignupPage;
