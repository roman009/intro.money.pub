import React, { useEffect, useState, useRef } from "react";
import CurrencyComponent from "../../Components/Currency/CurrencyComponent";
import Message from "../../Components/Message/Message";
import SidebarChat from "../../Components/SidebarChat/SidebarChat";
import Modal from "react-modal";
import modalLogo from "../../assets/balanceLogo.svg";
// import copySvg from "../../assets/copy.svg";
import copySvg from "../../assets/copyNew.svg";
import sendSvg from "../../assets/send.svg";
import msgSvg from "../../assets/shareMsgIcon.svg";
import dots from "../../assets/dots.svg";
import Staticdots from "../../assets/Staticdots.svg";
import "./MainPage.css";
import getWeb3 from "../../getWeb3";
import IntroMoney from "../../contracts/IntroMoney.json";
import { useHistory, useParams } from "react-router-dom";

function MainPage() {
  const [messages, setMessages] = useState([]);

  //mobile
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [linkInHeader, setLinkInHeader] = useState(false);
  const [index, setIndex] = useState(0);
  const [mobileRightContainer, setMobileRightContainer] = useState(false);
  const [screen, setScreen] = useState(1);

  let { conversationHash } = useParams();

  const [bnbUsdRate, setBnbUsdRate] = useState(0);
  let [conversationCounter] = useState(1);
  let { helpBNB } = useState(0);

  const [chatName, setChatName] = useState("");
  const [readReward, setReadReward] = useState("");
  const [replyReward, setReplyReward] = useState("");
  const [icebreaker, setIcebreaker] = useState("");
  const [userBnb, setUserBnb] = useState(0);
  const [userUsd, setUserUsd] = useState(0);
  const [cutBNB, setCutBNB] = useState("");
  const [link, setLink] = useState("http://icebreaker.money/1derw32d");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [linkPopUp, setLinkPopUp] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [displayLink, setDisplayLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState("");

  const [newConversationMessage, setNewConversationMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [account, setAccount] = useState("");
  const [showMessageSettings, setShowMessageSettings] = useState(true);
  const [currentDisplayedConversation, setCurrentDisplayedConversation] =
    useState(null);

  const handleReadRewardInput = (e) => {
    setReadReward(e.target.value);
  };

  const handleReplyRewardInput = (e) => {
    setReplyReward(e.target.value);
  };

  const handleIceBreakerInput = (e) => {
    setIcebreaker(e.target.value);
  };

  const handleConversationMessage = (e) => {
    setNewConversationMessage(e.target.value);
  };

  const handleNewChat = () => {
    history.push("/mainpage");
    setCurrentDisplayedConversation(null);
    setMessages([]);
    setShowMessageSettings(true);
    setChatName("");
    setScreen(2);
  };

  const web3 = async () => {
    return await getWeb3();
  };
  const contract = async () => {
    let web3Instance = await web3();
    const networkId = await web3Instance.eth.net.getId();
    const deployedNetwork = IntroMoney.networks[networkId];
    return new web3Instance.eth.Contract(
      IntroMoney.abi,
      deployedNetwork && deployedNetwork.address
    );
  };

  let history = useHistory();
  useEffect(() => {
    handleResize();

    function handleResize() {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);

    let contractInstance;
    let web3Instance;
    const init = async () => {
      web3Instance = await web3();
      contractInstance = await contract();
      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length) {
        let isRegistered = await contractInstance.methods
          .isRegistered(accounts[0])
          .call();
        if (isRegistered !== true) {
          history.push("/signup");
        }
        let balance = await contractInstance.methods
          .balance()
          .call({ from: accounts[0] });
        balance = web3Instance.utils.fromWei(balance);
        setUserBnb(balance);
        helpBNB = parseFloat(balance).toFixed(3);
        setCutBNB(helpBNB);
        setAccount(accounts[0]);
        let conversations = await contractInstance.methods
          .getConversations()
          .call({ from: accounts[0] });

        if (conversationHash !== undefined) {
          setScreen(2);
          let activeConversation = conversations.find(
            (c) => c.conversationHash === conversationHash
          );
          if (activeConversation === undefined) {
            activeConversation = await contractInstance.methods
              .getConversationByHash(conversationHash)
              .call({ from: accounts[0] });
            conversations.push(activeConversation);
          }
        }

        conversations = conversations.map((conversation) => {
          conversation.decrypted = false;
          conversation.messages.map((message) => {
            if (message.owner === account) {
              message.messageSide = "sender";
            } else {
              message.messageSide = "receiver";
            }
            return message;
          });

          conversation.recipientUsername = web3Instance.utils.toUtf8(
            conversation.recipientUsername
          );
          conversation.ownerUsername = web3Instance.utils.toUtf8(
            conversation.ownerUsername
          );
          /*
          conversation.link = web3Instance.utils.toUtf8(
            conversation.link
          );*/
          if (
            conversation.recipientUsername ===
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          ) {
            conversation.recipientUsername = "";
          }
          if (
            conversation.ownerUsername ===
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          ) {
            conversation.ownerUsername = "";
          }
          /*
          if (
            conversation.link === undefined
          ) {
            conversation.link = "";
          }*/

          return conversation;
        });

        for (let i = 0; i < conversations.length; i++) {
          if (
            localStorage.getItem("conversation-p-" + conversations[i].id) !==
            null
          ) {
            conversations[i] = await decryptConversationActual(
              conversations[i],
              localStorage.getItem("conversation-p-" + conversations[i].id)
            );
          } else {
            conversations[i] = await decryptConversationActual(
              conversations[i],
              ""
            );
          }
        }

        conversations.map((conversation) => {
          conversation.decrypted = false;
          conversation.messages.map((message) => {
            if (message.owner === accounts[0]) {
              message.messageSide = "sender";
            } else {
              message.messageSide = "receiver";
            }
            return message;
          });
          return conversation;
        });

        if (conversationHash !== undefined) {
          let activeConversation = conversations.find(
            (c) => c.conversationHash === conversationHash
          );
          setChatName(getChatConversationName(activeConversation));
          setMessages(activeConversation.messages);
          setShowMessageSettings(false);
          setCurrentDisplayedConversation(activeConversation.id);
        }
        setConversations(conversations);
      }
    };
    init();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [conversations.length]);

  const loadConversations = async () => {
    let contractInstance = await contract();
    let web3Instance = await web3();
    let conversations = await contractInstance.methods
      .getConversations()
      .call({ from: account });

    console.log("Load conversations. Count " + conversations.length);
    console.log(conversations);

    conversations = conversations.map((conversation) => {
      conversation.decrypted = false;
      conversation.messages = conversation.messages.map((message) => {
        if (message.owner === account) {
          message.messageSide = "sender";
        } else {
          message.messageSide = "receiver";
        }
        return message;
      });

      conversation.recipientUsername = web3Instance.utils.toUtf8(
        conversation.recipientUsername
      );
      conversation.ownerUsername = web3Instance.utils.toUtf8(
        conversation.ownerUsername
      );
      /*
      conversation.link = web3Instance.utils.toUtf8(
        conversation.link
      );*/
      if (
        conversation.recipientUsername ===
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        conversation.recipientUsername = "";
      }
      if (
        conversation.ownerUsername ===
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        conversation.ownerUsername = "";
      }
      /*
      if (
        conversation.link === undefined
      ) {
        conversation.link = "";
      }*/
      return conversation;
    });

    return conversations;
  };

  const createConversation = async () => {
    let encryptedMessage;
    setLoadingPopUp(true);
    await fetch(process.env.REACT_APP_API_URL + "/encrypt", {
      method: "POST",
      body: JSON.stringify({
        message: newConversationMessage,
        password: icebreaker,
        /*link: copiedLink*/
      }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        encryptedMessage = data.encryptedMessage;
      })
      .catch(console.log);

    try {
      let web3Instance = await web3();
      let contractInstance = await contract();
      await contractInstance.methods
        .createConversation(
          web3Instance.utils.utf8ToHex(encryptedMessage),
          //web3Instance.utils.toWei(0)
          web3Instance.utils.toWei("0"),
          web3Instance.utils.toWei(replyReward / bnbUsdRate + "")
        )
        .send({ from: account });
      let conversations = await loadConversations();

      let conversationLink =
        process.env.REACT_APP_MAIN_URL +
        "/conversation/" +
        conversations[conversations.length - 1].conversationHash;

      localStorage.setItem(
        "conversation-p-" + conversations[conversations.length - 1].id,
        icebreaker
      );
      setConversations(conversations);
      setLink(conversationLink);
      setCopiedLink(conversationLink.toString());
      setLinkPopUp(true);

      //Close mobile container
      setMobileRightContainer(false);

      setRefresh(true);
      await displayConversation(conversations[conversations.length - 1]);
    } catch (e) {
      console.log(e);
    }
    setLoadingPopUp(false);
    setRefresh(true);
  };

  const handleKeyDown = async (e) => {
    // var currentMessages = {};
    // if (e.key === "Enter") {
    //   //   currentMessages = {
    //   //     message: document.getElementById("sendMessageInput").value,
    //   //     messageDetails: "sender",
    //   //   };
    //   //   setMessages((prev) => {
    //   //     return [...prev, currentMessages];
    //   //   });
    //   setNewConversationMessage(
    //     document.getElementById("sendMessageInput").value
    //   );
    //   document.getElementById("sendMessageInput").value = "";
    // } else {
    //   setNewConversationMessage(
    //     document.getElementById("sendMessageInput").value
    //   );
    // }
    // setNewConversationMessage(e.target.value);
    if (e.key === "Enter") {
      await replyToConversation();
    }
  };

  function calcHeight(value) {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length;
    console.log(numberOfLineBreaks);
    // min-height + lines x line-height + padding + border
    let newHeight;
    if (numberOfLineBreaks > 3) {
      newHeight = 20 + 3 * 20 + 12 + 2;
    } else {
      newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
    }
    return newHeight;
  }

  const replyToConversation = async () => {
    setLoadingPopUp(true);
    let encryptedMessage;
    let web3Instance = await web3();
    let contractInstance = await contract();
    let ice = icebreaker;
    if (
      localStorage.getItem("conversation-p-" + currentDisplayedConversation) !==
        null &&
      ice === ""
    ) {
      ice = localStorage.getItem(
        "conversation-p-" + currentDisplayedConversation
      );
    } else {
      ice = "";
    }
    await fetch(process.env.REACT_APP_API_URL + "/encrypt", {
      method: "POST",
      body: JSON.stringify({
        message: newConversationMessage,
        password: ice,
      }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        encryptedMessage = data.encryptedMessage;
      })
      .catch(console.log);

    let gas;
    await contractInstance.methods
      .addMessageToConversation(
        web3Instance.utils.numberToHex(currentDisplayedConversation),
        web3Instance.utils.utf8ToHex(encryptedMessage)
      )
      .estimateGas({ from: account })
      .then((g) => {
        gas = g;
      });
    console.log("gas cost addMessageToConversation: " + gas);
    try {
      await contractInstance.methods
        .addMessageToConversation(
          web3Instance.utils.numberToHex(currentDisplayedConversation),
          web3Instance.utils.utf8ToHex(encryptedMessage)
        )
        .send({ from: account, gas: gas * 2 });
    } catch (e) {
      console.log(e);
      setLoadingPopUp(false);
      return;
    }
    let conversation = conversations.find(
      (c) => c.id === currentDisplayedConversation
    );
    conversation.messages.push({
      text: newConversationMessage,
      messageSide: "sender",
      decrypted: true,
    });

    await displayConversation(conversation);
    setLoadingPopUp(false);
    setRefresh(true);
  };

  const displayConversation = async (conversation, index) => {
    if (localStorage.getItem("conversation-p-" + conversation.id) !== null) {
      conversation = await decryptConversationActual(
        conversation,
        localStorage.getItem("conversation-p-" + conversation.id)
      );
    } else {
      conversation = await decryptConversationActual(conversation, "");
    }
    document.getElementById("sendMessageInput") &&
      (document.getElementById("sendMessageInput").value = "");

    setIndex(index);
    setChatName(getChatConversationName(conversation));
    setMessages(conversation.messages);
    setShowMessageSettings(false);
    setCurrentDisplayedConversation(conversation.id);

    history.push("/mainpage/" + conversation.conversationHash);
    scrollToBottom();
    setRefresh(true);
    if (conversation.owner === account && conversation.messages.length === 1) {
      setDisplayLink(true);
    } else {
      setDisplayLink(false);
    }

    console.log(conversation);
  };

  const decryptConversation = async () => {
    setLoadingPopUp(true);
    console.log("Decrypting");
    let conversation = conversations.find(
      (c) => c.id === currentDisplayedConversation
    );
    conversation = await decryptConversationActual(conversation, icebreaker);
    await displayConversation(conversation);
    setLoadingPopUp(false);
    //Close Mobile Container

    // setMobileRightContainer(false);
  };

  const decryptConversationActual = async (conversation, password) => {
    let web3Instance = await web3();
    for (let i = 0; i < conversation.messages.length; i++) {
      let msg = conversation.messages[i];
      if ("decrypted" in msg && msg.decrypted === true) {
        continue;
      }
      let decryptedMessage;
      await decryptMessage(
        web3Instance.utils.toUtf8(msg.text),
        password,
        conversation.id
      )
        .then((res) => res.json())
        .then((data) => {
          decryptedMessage = data.decodedMessage;
        })
        .catch(console.log);
      if (decryptedMessage != null) {
        conversation.messages[i].text = decryptedMessage;
        conversation.messages[i].decrypted = true;
      } else {
        console.log("error decrypting");
      }
    }

    return conversation;
  };

  const decryptMessage = async (message, password, conversationId) => {
    let web3Instance = await web3();
    const accounts = await web3Instance.eth.getAccounts();
    return fetch(process.env.REACT_APP_API_URL + "/decrypt", {
      method: "POST",
      body: JSON.stringify({
        message: message,
        password: password,
        reader: accounts[0],
        conversationId: conversationId,
      }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
    });
  };

  const textAreaAdjust = (e) => {
    console.log(e);
    // element.style.height = "1px";
    // element.style.height = (25+element.scrollHeight)+"px";
  };

  const decrypt_reply = () => {
    if (refresh) {
      handleRefresh();
    }
    if (!showMessageSettings) {
      if (!displayLink) {
        return (
          <div className="fixedContainer">
            {windowWidth > 750 && (
              <div className="deposit_balance">
                {userBnb == "0" ? (
                  <div
                    className="depositButton"
                    onClick={() => setModalIsOpen(true)}
                  >
                    <b className="depositText">Deposit now</b>
                  </div>
                ) : (
                  <div
                    className="depositButton"
                    onClick={() => setModalIsOpen(true)}
                  >
                    <b>{userUsd} USD</b>
                    <a>{cutBNB} FTM</a>
                  </div>
                )}
              </div>
            )}

            <div className="decrypt_send">
              <div className="rightContainer__send">
                {/* <div className="decryptText">Enter the icebreaker</div> */}
                {/* <input
                  placeholder="icebreaker"
                  onChange={handleIceBreakerInput}
                  value={icebreaker}
                /> */}
                {/* 
                <div
                  className="rightContainer__send__button"
                  onClick={async () => await decryptConversation()}
                >
                  decrypt
                </div> */}

                {windowWidth < 750 && (
                  <div
                    className="rightContainer__send__button"
                    onClick={() => {
                      setScreen(1);
                    }}
                  >
                    go back
                  </div>
                )}
              </div>
            </div>

            {windowWidth > 750 && (
              <div className="buttonWindow">
                <div
                  className="button"
                  onClick={async () => await replyToConversation()}
                >
                  send
                </div>
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div className="fixedContainer">
            {windowWidth > 750 && (
              <div className="deposit_balance">
                {userBnb == "0" ? (
                  <div
                    className="depositButton"
                    onClick={() => setModalIsOpen(true)}
                  >
                    <b className="depositText">Deposit now</b>
                  </div>
                ) : (
                  <div
                    className="depositButton"
                    onClick={() => setModalIsOpen(true)}
                  >
                    <b>{userUsd} USD</b>
                    <a>{cutBNB} FTM</a>
                  </div>
                )}
              </div>
            )}
            <div className="decrypt_send">
              <div className="rightContainer__send">
                {/* <div className="decryptText">Enter the icebreaker</div> */}
                {/* <input
                  placeholder="icebreaker"
                  onChange={handleIceBreakerInput}
                  value={icebreaker}
                /> */}
                {/* 
                <div
                  className="rightContainer__send__button"
                  onClick={async () => await decryptConversation()}
                >
                  decrypt
                </div> */}

                {windowWidth < 750 && (
                  <div
                    className="rightContainer__send__button"
                    onClick={async () =>
                      setScreen(1) && setMobileRightContainer(false)
                    }
                  >
                    go back
                  </div>
                )}

                <div
                  className="displayLinkSection"
                  onClick={() => {
                    navigator.clipboard.writeText(copiedLink);
                  }}
                >
                  <span className="displayLinkText">
                    copy conversation link
                  </span>
                  <img className="displayLinkCopy" src={copySvg} alt="" />
                </div>
              </div>
            </div>
            <div className="buttonWindow1">
              <div
                className="button"
                onClick={async () => await replyToConversation()}
              >
                send
              </div>
            </div>
          </div>
        );
      }
    }
    return (
      <div className="fixedContainer">
        {windowWidth > 750 && (
          <div className="deposit_balance">
            {userBnb == "0" ? (
              <div
                className="depositButton"
                onClick={() => setModalIsOpen(true)}
              >
                <b className="depositText">Deposit now</b>
              </div>
            ) : (
              <div
                className="depositButton"
                onClick={() => setModalIsOpen(true)}
              >
                <b>{userUsd} USD</b>
                <a>{cutBNB} FTM</a>
              </div>
            )}
          </div>
        )}

        <div className="reward_password">
          <div className="replyReward">
            icebreaker
            <div className="inputContainer">
              <input
                className="reward_ice_input"
                placeholder={"set reward"}
                onChange={handleReplyRewardInput}
                value={replyReward}
                id="reward_input"
              ></input>

              <div className={"USD"}>USD</div>
            </div>
          </div>
          {/* <div className="replyReward">
            reply reward
            <div className="inputContainer">
              <input
                className="reward_ice_input"
                placeholder={"set reward"}
                onChange={handleReplyRewardInput}
                value={replyReward}
                id="reward_input"
              ></input>
              <div className={"USD"}>USD</div>
            </div>
          </div> */}
          {/* <div className="replyReward">
            icebreaker
            <input
              className="reward_ice_input"
              placeholder="your password"
              onChange={handleIceBreakerInput}
              id="icebreaker_input"
              value={icebreaker}
            />
          </div> */}
        </div>
        <div className="buttonWindow1">
          <div
            className="button"
            onClick={async () => {
              await createConversation();
            }}
          >
            send
          </div>
        </div>
      </div>
    );
  };

  const messageSettings = () => {
    if (!showMessageSettings) {
      return (
        <div className="rightContainer" id="rightContainer_configureMsgWrapper">
          <div className="rightContainer__configureMsg">
            <div className="rightContainer__configureMsg__heading">Decrypt</div>
            <div className="rightContainer__unlockReward">
              <div className="rightContainer__unlockReward__heading">
                icebreaker
              </div>
              <div className="rightContainer__unlockReward__input">
                {/* <input
                  placeholder="set password"
                  onChange={handleIceBreakerInput}
                  value={icebreaker}
                  style="display: none"
                /> */}
              </div>
            </div>
          </div>
          <div className="rightContainer__send">
            <div
              className="rightContainer__send__button"
              onClick={async () => await decryptConversation()}
            >
              Decrypt
            </div>
          </div>

          <div className="rightContainer__configureMsg">
            <div className="rightContainer__configureMsg__heading">Reply</div>
          </div>
          <div className="rightContainer__send">
            <div
              className="rightContainer__send__button"
              onClick={async () => await replyToConversation()}
            >
              Send
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="rightContainer" id="rightContainer_configureMsgWrapper">
        <div className="rightContainer__configureMsg">
          <div className="rightContainer__configureMsg__heading">
            Configure Message
          </div>

          <div className="rightContainer__readReward">
            <div className="rightContainer__readReward__heading">
              read reward
            </div>
            <div className="rightContainer__readReward__input">
              <input onChange={handleReadRewardInput} value={readReward} />
            </div>
          </div>

          <div className="rightContainer__readReward">
            <div className="rightContainer__readReward__heading">
              reply reward
            </div>
            <div className="rightContainer__readReward__input">
              <input onChange={handleReplyRewardInput} value={replyReward} />
            </div>
          </div>

          <div className="rightContainer__unlockReward">
            <div className="rightContainer__unlockReward__heading">
              icebreaker
            </div>
            <div className="rightContainer__unlockReward__input">
              {/* <input
                placeholder="set password"
                onChange={handleIceBreakerInput}
                value={icebreaker}
                style="display: none"
              /> */}
            </div>
          </div>
        </div>

        <div className="rightContainer__send">
          <div
            className="rightContainer__send__button"
            onClick={async () => await createConversation()}
          >
            Send
          </div>
        </div>
      </div>
    );
  };

  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    // const interval = setInterval(async () => {
    //   console.log("MainPage Tick");
    //   setTime(Date.now());
    // }, 30 * 1000);
    // return () => {
    //   clearInterval(interval);
    // };
  }, []);

  const loadRate = async () => {
    let rate = { rate: 10 };
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
    setBnbUsdRate(rate.rate);

    setUserUsd(
      new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 }).format(
        userBnb * rate.rate
      )
    );
  };

  useEffect(() => {
    const loadRateC = async () => {
      await loadRate();
    };
    loadRateC();
  });

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [depositPopUp, setDepositPopUp] = useState(false);
  const [withdrawalPopUp, setWithdrawalPopUp] = useState(false);
  const [bnbInput, setBnbInput] = useState("");
  const handleBnbInput = (e) => {
    setBnbInput(e.target.value);
  };
  const handleDeposit = async () => {
    setLoadingPopUp(true);
    setDepositPopUp(false);
    const web3Instance = await getWeb3();
    const networkId = await web3Instance.eth.net.getId();
    const deployedNetwork = IntroMoney.networks[networkId];
    const contractInstance = new web3Instance.eth.Contract(
      IntroMoney.abi,
      deployedNetwork && deployedNetwork.address
    );
    const accounts = await web3Instance.eth.getAccounts();

    await contractInstance.methods
      .deposit()
      .send({ from: accounts[0], value: web3Instance.utils.toWei(bnbInput) });

    setModalIsOpen(false);
    setDepositPopUp(false);
    setLoadingPopUp(false);
    setRefresh(true);
  };
  const handleWithdrawal = async () => {
    setLoadingPopUp(true);
    setWithdrawalPopUp(false);
    const web3Instance = await getWeb3();
    const networkId = await web3Instance.eth.net.getId();
    const deployedNetwork = IntroMoney.networks[networkId];
    const contractInstance = new web3Instance.eth.Contract(
      IntroMoney.abi,
      deployedNetwork && deployedNetwork.address
    );
    const accounts = await web3Instance.eth.getAccounts();

    await contractInstance.methods
      .withdraw(web3Instance.utils.toWei((bnbInput / bnbUsdRate).toString()))
      .send({ from: accounts[0] });

    setModalIsOpen(false);
    setWithdrawalPopUp(false);
    setLoadingPopUp(false);
    setRefresh(true);
  };

  const handleRefresh = async () => {
    let contractInstance;
    let web3Instance;
    web3Instance = await web3();
    contractInstance = await contract();
    const accounts = await web3Instance.eth.getAccounts();
    let balance = await contractInstance.methods
      .balance()
      .call({ from: accounts[0] });
    balance = web3Instance.utils.fromWei(balance);
    setUserBnb(balance);
    helpBNB = parseFloat(balance).toFixed(3);
    setCutBNB(helpBNB);
    setRefresh(false);
  };

  const showDepositModal = () => {
    setModalIsOpen(false);
    setDepositPopUp(true);
  };

  const showWithdrawalModal = () => {
    setModalIsOpen(false);
    setWithdrawalPopUp(true);
  };

  const [loadingPopUp, setLoadingPopUp] = useState(false);

  const getChatConversationName = (conversation) => {
    if (conversation.owner === account) {
      return conversation.recipientUsername !== ""
        ? "@" + conversation.recipientUsername
        : conversation.recipient;
    }

    return conversation.ownerUsername !== ""
      ? "@" + conversation.ownerUsername
      : conversation.owner;
  };

  const checkUserName = (username) => {
    if (username.toString().startsWith("0x0000")) {
      !linkInHeader && setLinkInHeader(true);
      return windowWidth > 750 || !index
        ? "New Conversation"
        : "Conversation " + (index + 1);
    } else {
      linkInHeader && setLinkInHeader(false);

      return username;
    }
  };

  if (windowWidth < 750) {
    return (
      <div className="mainPage">
        <div className="container">
          {/* left Container */}

          {screen == 1 ? (
            <div className="basicContainer">
              <div className="headerBig">
                <div className="ellipseLandingMainPage"></div>
                <div className="depositNow">
                  <div className="deposit_balance">
                    {userBnb !== "0" ? (
                      <div
                        className="depositButton"
                        onClick={() => setModalIsOpen(true)}
                      >
                        <b className="depositText">Deposit now</b>
                      </div>
                    ) : (
                      <div
                        className="depositButton"
                        onClick={() => setModalIsOpen(true)}
                      >
                        <b className="depositText">{userUsd} USD</b>
                        <a className="depositText">{cutBNB} FTM</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="conversations">
                {conversations.length === 0 ? (
                  <div className="noChatsMobile">
                    <b>No messages yet.</b>
                    <a>Start a new conversation today</a>
                  </div>
                ) : (
                  conversations.map((conversation, index) => {
                    return (
                      <div
                        className="singleChat"
                        onClick={async () => {
                          windowWidth < 750 && setScreen(2);
                          setTimeout(
                            async () =>
                              await displayConversation(conversation, index),
                            3000
                          );
                        }}
                        id={"conversation-" + conversation.id}
                        key={"conversation-" + conversation.id}
                      >
                        <SidebarChat
                          id={conversation.id}
                          name={
                            getChatConversationName(conversation)
                              .toString()
                              .startsWith("0x000000")
                              ? "Conversation " + conversationCounter++
                              : getChatConversationName(conversation)
                          }
                          chatDetails={
                            conversation.owner === account
                              ? "senderChat"
                              : "recipientChat"
                          }
                          conversationText={
                            conversation.messages[
                              conversation.messages.length - 1
                            ].text
                          }
                        />
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="buttonWindow">
                <div className="button" onClick={handleNewChat}>
                  new message
                </div>
              </div>
            </div>
          ) : (
            <div className="basicContainer">
              <div className="headerBig">
                <div onClick={() => setScreen(1)} className="backIcon"></div>
                <div className="ellipseLandingMainPage"></div>
                <div className="depositNow">
                  <div className="deposit_balance">
                    {userBnb == "0" ? (
                      <div
                        className="depositButton"
                        onClick={() => setModalIsOpen(true)}
                      >
                        <b className="depositText">Deposit now</b>
                      </div>
                    ) : (
                      <div
                        className="depositButton"
                        onClick={() => setModalIsOpen(true)}
                      >
                        <b className="depositText">{userUsd} USD</b>
                        <a className="depositText">{cutBNB} FTM</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="midContainer__heading">
                {/* <div className="midContainer__headingElipse"> </div> */}
                <div className="midContainer__heading__chatName">
                  {checkUserName(chatName)}
                </div>
                {linkInHeader && (
                  <div
                    className="linkModal__copyLink"
                    onClick={() => {
                      setCopiedLink(link.toString());
                      navigator.clipboard.writeText(copiedLink);
                      setLinkPopUp(false);
                      setRefresh(true);
                      setDisplayLink(true);
                    }}
                  >
                    <img
                      className="linkModal__copyLink__image"
                      src={copySvg}
                      alt=""
                    />

                    <div className="linkModal__copyLink__copy">copy link</div>
                  </div>
                )}

                <div
                  className="linkModal__copyLink linkModal_dots_copyLink"
                  onClick={() => {
                    setMobileRightContainer(true);
                  }}
                >
                  <img
                    className="linkModal__copyLink__image linkModal__dots_image"
                    src={Staticdots}
                    alt=""
                  />
                  <div className="linkModal__copyLink__copy">details</div>
                </div>
              </div>
              <div className="midContainer__body">
                {messages.map((message, index) => {
                  // if (message.text.startsWith("0x55324673644")) {
                  //   !mobileRightContainer &&
                  //     !linkInHeader &&
                  //     setMobileRightContainer(true);

                  //   return (
                  //     <div
                  //       // onClick={() =>
                  //       //   setMobileRightContainer(true)
                  //       // }

                  //       className="firstMessage"
                  //     >
                  //       <Message
                  //         message="Enter icebreaker to read the message"
                  //         messageSide={message.messageSide}
                  //         key={message.id}
                  //       />
                  //     </div>
                  //   );
                  // }
                  mobileRightContainer && setMobileRightContainer(false);
                  return (
                    <Message
                      message={message.text}
                      messageSide={message.messageSide}
                      key={message.id}
                    />
                  );
                })}
              </div>
              <div className="midContainer__footer">
                <div className="midContainer__footerInput">
                  <input
                    placeholder="write something..."
                    // onKeyDown={handleKeyDown}
                    onChange={handleConversationMessage}
                    id="sendMessageInput"
                    onKeyUp={textAreaAdjust}
                  />
                  {
                    <div
                      onClick={() =>
                        showMessageSettings
                          ? setMobileRightContainer(true)
                          : replyToConversation()
                      }
                      className="sendIcon"
                    ></div>
                  }
                </div>
              </div>
            </div>
          )}
          {/* Container ends */}

          <Modal
            className="mobileModal"
            isOpen={screen == 2 && mobileRightContainer}
            onRequestClose={() => setMobileRightContainer(false)}
          >
            <div>{decrypt_reply()}</div>
          </Modal>

          <Modal
            className="balanceModal"
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
          >
            <div className="balance">
              <div className="balanceHeading">Balance</div>
              <div className="balanceFunds">
                <div className="balanceFundsUSD">
                  {userUsd} <span>USD</span>
                </div>
                <div className="balanceFundsBNB">
                  {cutBNB} <span>FTM</span>
                </div>
              </div>
              <div className="balanceButtons">
                <div className="balanceSingleButton" onClick={showDepositModal}>
                  deposit
                </div>

                <div
                  className="balanceSingleButton"
                  onClick={showWithdrawalModal}
                >
                  withdraw
                </div>
              </div>
            </div>
          </Modal>

          {/* link pop up Mobile */}
          <Modal
            className="linkBackground"
            isOpen={linkPopUp}
            // isOpen={true}
            onRequestClose={() => setLinkPopUp(false)}
          >
            <div className="linkModal">
              {/* <span className="linkHeadingBold">
                Use this link to reach out to your recipient
              </span> */}
              <div className="linkSection">
                {/* <span className="linkHeading">
                  Share your message: "{icebreaker}"
                </span> */}
                <span className="linkHeading">Share your message!</span>
              </div>

              <div
                className="linkModal__copyLink"
                onClick={() => {
                  setCopiedLink(
                    // "Share your message: " +
                    // JSON.stringify(icebreaker) + " " +
                    link.toString()
                  );
                  navigator.clipboard.writeText(copiedLink);
                  setLinkPopUp(false);
                  setRefresh(true);
                  setDisplayLink(true);
                }}
              >
                <div>
                  <img
                    className="linkModal__copyLink__image2"
                    src={msgSvg}
                    alt=""
                  />
                </div>
                <div className="linkIconLink">
                  <div className="linkIconLinkSVG">
                    <img
                      className="linkModal__copyLink__image"
                      src={sendSvg}
                      alt=""
                    />
                    <img
                      className="linkModal__copyLink__image"
                      src={copySvg}
                      alt=""
                    />
                  </div>
                  {/* <div className="linkModal__copyLink__copy">copy link</div> */}
                  <div className="linkLink">{link}</div>
                </div>
              </div>
            </div>
          </Modal>

          <Modal
            className="balanceModal"
            isOpen={depositPopUp}
            onRequestClose={() => {
              setDepositPopUp(false);
            }}
          >
            <div className="balance">
              <div className="balanceHeading">Deposit FTM</div>
              <div className="balAmount">
                <p>Amount</p>
                <div className="inputContainerModal">
                  <input
                    className="balanceDepositInput"
                    placeholder="0.01"
                    onChange={handleBnbInput}
                    value={bnbInput}
                  />
                  <div className={"USD"}>USD</div>
                </div>
              </div>
              <div className="balanceSoleButtons">
                <div className="balanceSingleButton" onClick={handleDeposit}>
                  deposit
                </div>
              </div>
            </div>
          </Modal>

          <Modal
            className="balanceModal"
            isOpen={withdrawalPopUp}
            onRequestClose={() => setWithdrawalPopUp(false)}
          >
            <div className="balance">
              <div className="balanceHeading">Withdraw FTM</div>
              <div className="balAmount">
                <p>Amount</p>
                <div className="inputContainerModal">
                  <input
                    className="balanceDepositInput"
                    placeholder="0.01"
                    onChange={handleBnbInput}
                    value={bnbInput}
                  />
                  <div className={"USD"}>USD</div>
                </div>
              </div>

              <div className="balanceSoleButtons">
                <div className="balanceSingleButton" onClick={handleWithdrawal}>
                  withdraw
                </div>
              </div>
            </div>
          </Modal>
          {/* Mobile Loader */}
          <Modal
            className="loadingScreenModal"
            isOpen={loadingPopUp} //isOpen={loadingPopUp}
            onRequestClose={() => setLoadingPopUp(false)}
          >
            <div className="progress progress--indeterminate">
              <div className="bar"></div>
              <p>Loading...</p>
            </div>
            {/* <div className="loadingScreen">
              <span>Connecting to the blockchain...</span>
            </div> */}
          </Modal>
          {/* MainPage ends */}
        </div>
      </div>
    );
  } else {
    let con = [
      {
        id: 1,
        owner: "0x52d68bd7Ed93DcBB7A163bC1AcF8db555Ab2586d",
        messages: [{ text: "hsgdfjhd" }],
      },
    ];

    return (
      <div className="mainPage">
        <div className="container">
          {/* left Container */}

          <div className="basicContainer">
            {windowWidth > 750 ? (
              <div className="conversationsText">
                {conversations.length === 0 ? (
                  <div>Conversations</div>
                ) : (
                  <h2>
                    <b>Conversations</b>
                  </h2>
                )}
              </div>
            ) : (
              <div className="headerBig">
                <div className="ellipseLandingMainPage"></div>
                <div className="depositNow">
                  <div className="headingDeposit">
                    <b>Deposit Now</b>
                  </div>
                </div>
              </div>
            )}
            <div className="conversations">
              {conversations.length === 0 ? (
                <div className="noChats">
                  <b>No messages yet.</b>
                  <a>Start a new conversation today</a>
                </div>
              ) : (
                conversations.map((conversation, index) => {
                  console.log(account);
                  return (
                    <div
                      className="singleChat"
                      onClick={async () =>
                        await displayConversation(conversation)
                      }
                      id={"conversation-" + conversation.id}
                      key={"conversation-" + conversation.id}
                    >
                      <SidebarChat
                        id={conversation.id}
                        name={
                          getChatConversationName(conversation)
                            .toString()
                            .startsWith("0x000000")
                            ? "Conversation " + conversationCounter++
                            : getChatConversationName(conversation)
                        }
                        chatDetails={
                          conversation.owner === account
                            ? "senderChat"
                            : "recipientChat"
                        }
                        conversationText={
                          conversation.messages[
                            conversation.messages.length - 1
                          ].text
                        }
                      />
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="buttonWindow">
              <div className="button" onClick={handleNewChat}>
                new message
              </div>
            </div>
          </div>

          {/*Mid Container  */}

          <div className="midContainer">
            <div className="midContainer__heading">
              {/* <div className="midContainer__headingElipse"> </div> */}
              <div className="midContainer__heading__chatName">
                {checkUserName(chatName, index)}
              </div>
            </div>
            <div className="midContainer__body">
              {messages.map((message) => {
                // if (message.text.startsWith("0x55324673644")) {
                //   return (
                //     <div className="firstMessage">
                //       <Message
                //         message="Enter icebreaker to read the message"
                //         messageSide={message.messageSide}
                //         key={message.id}
                //       />
                //     </div>
                //   );
                // }
                return (
                  <Message
                    message={message.text}
                    messageSide={message.messageSide}
                    key={message.id}
                  />
                );
              })}
            </div>
            <div className="midContainer__footer">
              <div className="midContainer__footerInput">
                <textarea
                  placeholder="write something..."
                  // onKeyDown={handleKeyDown}
                  onChange={handleConversationMessage}
                  id="sendMessageInput"
                  rows="1"
                  onKeyUp={(e) => {
                    console.log(
                      (e.target.style.height = `${calcHeight(
                        e.target.value
                      )}px`)
                    );
                  }}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Container */}

          <div className="basicContainer">{decrypt_reply()}</div>

          {/* Container ends */}

          <Modal
            className="balanceModal"
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
          >
            <div className="balance">
              <div className="balanceHeading">Balance</div>
              <div className="balanceFunds">
                <div className="balanceFundsUSD">
                  {userUsd} <span>USD</span>
                </div>
                <div className="balanceFundsBNB">
                  {cutBNB} <span>FTM</span>
                </div>
              </div>
              <div className="balanceButtons">
                <div className="balanceSingleButton" onClick={showDepositModal}>
                  deposit
                </div>

                <div
                  className="balanceSingleButton"
                  onClick={showWithdrawalModal}
                >
                  withdraw
                </div>
              </div>
            </div>
          </Modal>

          {/* link pop up Desktop */}
          <Modal
            className="linkBackground"
            isOpen={linkPopUp}
            // isOpen={true}
            onRequestClose={() => setLinkPopUp(false)}
          >
            <div className="linkModal">
              <div className="linkSection">
                <span className="linkHeading">
                  Share your message!
                  {/* Share your message: "{icebreaker}" */}
                </span>
              </div>

              <div
                className="linkModal__copyLink"
                onClick={() => {
                  setCopiedLink(
                    // "Share your message: " +
                    // JSON.stringify(icebreaker) + " " +
                    link.toString()
                  );
                  navigator.clipboard.writeText(copiedLink);
                  setLinkPopUp(false);
                  setRefresh(true);
                  setDisplayLink(true);
                }}
              >
                <div>
                  <img
                    className="linkModal__copyLink__image2"
                    src={msgSvg}
                    alt=""
                  />
                </div>
                <div className="linkIconLink">
                  <div className="linkIconLinkSVG">
                    <img
                      className="linkModal__copyLink__image"
                      src={sendSvg}
                      alt=""
                    />
                    <img
                      className="linkModal__copyLink__image"
                      src={copySvg}
                      alt=""
                    />
                  </div>
                  <div className="linkLink">{link}</div>
                </div>
                {/* <div className="linkModal__copyLink__copy">copy link</div> */}
              </div>
            </div>
          </Modal>

          <Modal
            className="balanceModal"
            isOpen={depositPopUp}
            onRequestClose={() => {
              setDepositPopUp(false);
            }}
          >
            <div className="balance">
              <div className="balanceHeading">Deposit FTM</div>
              <div className="balAmount">
                <p>Amount</p>
                <div className="inputContainerModal">
                  <input
                    className="balanceDepositInput"
                    placeholder="0.01"
                    onChange={handleBnbInput}
                    value={bnbInput}
                  />
                  <div className={"USD"}>USD</div>
                </div>
              </div>

              <div className="balanceSoleButtons">
                <div className="balanceSingleButton" onClick={handleDeposit}>
                  deposit
                </div>
              </div>
            </div>
          </Modal>

          <Modal
            className="balanceModal"
            isOpen={withdrawalPopUp}
            onRequestClose={() => setWithdrawalPopUp(false)}
          >
            <div className="balance">
              <div className="balanceHeading">Withdraw FTM</div>
              <div className="balAmount">
                <p>Amount</p>
                <div className="inputContainerModal">
                  <input
                    className="balanceDepositInput"
                    placeholder="0.01"
                    onChange={handleBnbInput}
                    value={bnbInput}
                  />
                  <div className={"USD"}>USD</div>
                </div>
              </div>
              <div className="balanceSoleButtons">
                <div className="balanceSingleButton" onClick={handleWithdrawal}>
                  withdraw
                </div>
              </div>
            </div>
          </Modal>
          {/*Desktop Loader  */}
          <Modal
            className="loadingScreenModal"
            isOpen={loadingPopUp}
            onRequestClose={() => setLoadingPopUp(false)}
          >
            <div className="loadingScreen">
              <div className="progress progress--indeterminate">
                <div className="bar"></div>
                <p>Loading...</p>
              </div>
              {/* <div class="load-wrapp">
                <div class="load-10">
                  <div class="bar"></div>
                  <p>Loading 10</p>
                </div>
              </div> */}
              {/* <span>Connecting to the blockchain...</span> */}
            </div>
          </Modal>
          {/* MainPage ends */}
        </div>
      </div>
    );
  }
}

export default MainPage;

/*return (
    <div className="mainPage">
      <div className="container">

        {/* left Container }

<div className="leftContainer">
  <div className="ellipseMainContainer">
    <div className="ellipseMain"></div>
  </div>
  <div className="chats">
    {conversations.map((conversation) => {
      return (
        <div
          onClick={async () => await displayConversation(conversation)}
          id={"conversation-" + conversation.id}
          key={"conversation-" + conversation.id}
        >
          <SidebarChat
            id={conversation.id}
            name={getChatConversationName(conversation)}
            chatDetails={
              conversation.owner === account
                ? "senderChat"
                : "recipientChat"
            }
            conversationText={
              conversation.messages[conversation.messages.length - 1]
                .text
            }
          />
        </div>
      );
    })}
    <div ref={messagesEndRef} />
  </div>

  <div className="newChat">
    <div className="newChatButton" onClick={handleNewChat}>
      new chat
    </div>
  </div>
</div>

{/*Mid Container  }
<div className="midContainer">
  <div className="midContainer__heading">
    <div className="midContainer__headingElipse"> </div>{" "}
    <div className="midContainer__heading__chatName">{chatName}</div>
  </div>
  <div className="midContainer__body">
    {messages.map((message) => {
      return (
        <Message
          message={message.text}
          messageSide={message.messageSide}
          key={message.id}
        />
      );
    })}
  </div>
  <div className="midContainer__footer">
    <div className="midContainer__footerInput">
      <input
        placeholder="write something..."
        // onKeyDown={handleKeyDown}
        onChange={handleConversationMessage}
        id="sendMessageInput"
      />
    </div>
  </div>
</div>

{/* Right Container }
<div className="rightContainerWrapper">
  <div className="currencies" onClick={() => setModalIsOpen(true)}>
    <CurrencyComponent />
  </div>
  {messageSettings()}
</div>

{/* Container ends }
</div>

<Modal
className="ModalWithdraw"
isOpen={modalIsOpen}
onRequestClose={() => setModalIsOpen(false)}
>
<div className="headingModalWithdraw">Balance</div>

<div className="modalWithdraw__details">
  <img src={modalLogo} alt="" />
  <div className="modalWithdraw__details__info">
    <div className="modalWithdraw__details__info__bnb">
      {userBnb} <span className="info__bnb">BNB</span>
    </div>
    <div className="modalWithdraw__details__info__usd">
      ~{userUsd} <span className="info__usd">USD</span>
    </div>
  </div>
</div>

<div className="ModalWithdraw__buttons">
  <div
    className="ModalWithdraw__buttons__deposit"
    onClick={showDepositModal}
  >
    deposit
  </div>

  <div
    className="ModalWithdraw__buttons__withdraw"
    onClick={showWithdrawalModal}
  >
    withdraw
  </div>
</div>
</Modal>

{/* link pop up }
<Modal
  className="linkModal"
  isOpen={linkPopUp}
  onRequestClose={() => setLinkPopUp(false)}
>
  <div className="linkModal__link">{link}</div>

  <div
    className="linkModal__copyLink"
    onClick={() => {
      navigator.clipboard.writeText(link);
    }}
  >
    <img className="linkModal__copyLink__image" src={copySvg} alt="" />
    <div className="linkModal__copyLink__copy">copy</div>
  </div>
</Modal>

<Modal
  className="depositModal"
  isOpen={depositPopUp}
  onRequestClose={() => setDepositPopUp(false)}
>
  <div className="contentDeposit">
    <div className="content__headingDeposit">
      Deposit <span>BNB</span>
    </div>
    <div className="content__subHeading">0.01 BNB minimum</div>
    <div className="content__inputDeposit">
      <input
        type="number"
        placeholder="0.01"
        onChange={handleBnbInput}
        value={bnbInput}
      />
    </div>
    <div onClick={handleDeposit} className="content__button">
      Deposit
    </div>
  </div>
</Modal>

<Modal
  className="depositModal"
  isOpen={withdrawalPopUp}
  onRequestClose={() => setWithdrawalPopUp(false)}
>
  <div className="contentDeposit">
    <div className="content__headingDeposit">
      Withdraw <span>BNB</span>
    </div>
    <div className="content__inputDeposit">
      <input
        type="number"
        placeholder="0.01"
        onChange={handleBnbInput}
        value={bnbInput}
      />
    </div>
    <div onClick={handleWithdrawal} className="content__button">
      Withdraw
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

{/* MainPage ends }
</div>
);*/
