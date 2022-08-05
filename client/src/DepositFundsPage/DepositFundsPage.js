import React, { useState, useContext } from "react";
import "./DepositFundsPage.css";
import Modal from "react-modal";
import exclamatoryLogo from "../../assets/exclamatory.svg";
import { useHistory, useParams } from "react-router-dom";
import appContext from "../../Contexts/AppContext";
import getWeb3 from "../../getWeb3";
import IntroMoney from "../../contracts/IntroMoney.json";

function DepositFundsPage() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [bnbInput, setBnbInput] = useState("");
  var history = useHistory();
  const AppContext = useContext(appContext);
  console.log(AppContext.username);
  let { conversationHash } = useParams();
  console.log(conversationHash);
  const [loadingPopUp, setLoadingPopUp] = useState(false);

  const handleBnbInput = (e) => {
    setBnbInput(e.target.value);
  };

  const handleDeposit = async () => {
    if (bnbInput < 0.01) {
      setModalIsOpen(true);
    } else {
      setLoadingPopUp(true);

      const web3Instance = await getWeb3();
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = IntroMoney.networks[networkId];
      const contractInstance = new web3Instance.eth.Contract(
        IntroMoney.abi,
        deployedNetwork && deployedNetwork.address
      );
      const accounts = await web3Instance.eth.getAccounts();
      console.log(accounts);

      await contractInstance.methods
        //.register(web3Instance.utils.utf8ToHex(AppContext.username))
        //.send({ from: accounts[0], value: web3Instance.utils.toWei(bnbInput) });
        .register(web3Instance.utils.utf8ToHex(AppContext.username))
          .send({ from: accounts[0]});
      setLoadingPopUp(false);
      if (conversationHash !== undefined) {
        history.push("/mainpage/" + conversationHash);
      } else {
        history.push("/mainpage");
      }
    }
  };

  return (
    <div className="DepositFundsPage">
      <div className="ellipse"></div>

      <div className="contentDeposit">
        <div className="content__headingDeposit">
          Deposit <span>BNB</span>
        </div>
        <div className="content__subHeading">
          0.01 BNB minimum to prevent spam
        </div>
        <div className="content__inputDeposit">
          <input
            type="number"
            placeholder="0.01"
            value="0.01"
            onChange={handleBnbInput}
            value={bnbInput}
          />
        </div>
        <div onClick={handleDeposit} className="content__button">
          Deposit
        </div>
      </div>

      <Modal
        className="ModalDeposit"
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
      >
        <div className="startModalDeposit">
          <div className="headingModalsDeposit">
            <img src={exclamatoryLogo} alt="" />
            <div className="headingModalDeposit">Minimum Amount</div>
          </div>
          <div className="headingModalDeposit h2">0.01 BNB</div>
        </div>

        <div className="connectSectionModalDeposit">
          <div
            onClick={() => setModalIsOpen(false)}
            className="connectButtonModalDeposit"
          >
            try again
          </div>
        </div>
      </Modal>

      <Modal
        className="depositModal"
        isOpen={loadingPopUp}
        onRequestClose={() => setLoadingPopUp(false)}
      >
        <div className="contentDeposit">
          <div className="content__headingDeposit"></div>
          <div className="content__inputDeposit">
            <div className="content__button">
              <span>Communicating with the blockchain...</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DepositFundsPage;
