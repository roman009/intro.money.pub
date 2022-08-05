import React, { useState, useEffect } from 'react'
import './RecipientLandingPage.css'
import Modal from 'react-modal'
import modalLogo from '../../assets/modalLogo.svg';
import { useHistory } from "react-router-dom";


function RecipientLandingPage() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  //mobile 
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

  var history = useHistory();

  const connectWallet = () => {
    history.push("/signup")
  }

  if (windowWidth < 750) {
    return (
      <div className="landingPage">
        <div className={windowWidth > 750 ? "headerBig" : "headerBigMobile"}>
          <div className={windowWidth > 750 ? "ellipseLanding" : "ellipseLandingMobile"}></div>
        </div>

        <div className="heading">
          Your time is valuable
          <div className="subHeading">
            Recieve<span className="bold" > 10 USD </span>in crypto for reading and replying to this message.
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
            <div className="connectHeading">Please download the Metamask app to use this service on mobile</div>
            <img className="mobileLogo" src={modalLogo} alt="Logo" />

            <div className="balanceSoleButtons">
              <div className="connectSingleButton" onClick={connectWallet}>
                connect
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div className="landingPageRecipient">
      <div className="ellipse">
      </div>

      <div className="headingRecipient" >
        Your time is valuable.
        <div className="subHeadingRecipient">
          Recieve<span className="bold" > 10 USD </span>in crypto for reading and replying to this message.
        </div>
      </div>



      <div className="walletHeadingRecipient" >
        connect wallet to get started
      </div>

      <div className="connectSectionRecipient" >
        <div onClick={() => setModalIsOpen(true)} className="connectButtonRecipient" >
          Connect
        </div>
      </div>


      <Modal className="ModalRecipient" isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} >
        <div className="headingModalRecipient" >Connect Metamask</div>
        <img src={modalLogo} />

        <div className="walletHeadingModalRecipient" >
          connect wallet to get started
        </div>
        <div className="connectSectionModalRecipient" >
          <div className="connectButtonModalRecipient" onClick={connectWallet} >
            Connect
          </div>
        </div>
      </Modal>

    </div>
  )
}

export default RecipientLandingPage
