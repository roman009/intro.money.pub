import React, { useState, useEffect } from "react";
import "./CurrencyComponent.css";
import currencyLogo from "../../assets/currencyLogo.svg";
import getWeb3 from "../../getWeb3";
import IntroMoney from "../../contracts/IntroMoney.json";

function CurrencyComponent() {
  const [bnb, setBnb] = useState(0);
  const [usd, setUsd] = useState(0);

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
  useEffect(() => {
    let contractInstance;
    let web3Instance;
    const init = async () => {
      web3Instance = await web3();
      contractInstance = await contract();
      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length) {
        let balance = await contractInstance.methods
          .balance()
          .call({ from: accounts[0] });
        balance = web3Instance.utils.fromWei(balance);
        setBnb(balance);
      }
    };
    init();
  });

  const loadRate = async () => {
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
    // setUsd((bnb * rate.rate).toString());
    console.log(
      new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 }).format(
        bnb * rate.rate
      )
    );
    setUsd(
      new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 }).format(
        bnb * rate.rate
      )
    );
  };
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log("CurrencyComponent Tick");
      setTime(Date.now());
    }, 60 * 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  /*useEffect(() => {
    const loadRateC = async () => {
      await loadRate();
    };
    loadRateC();
  });*/

  return (
    <div className="currencyComponent">
      <div className="currencyData">
        <div className="currencyData1">{bnb} BNB</div>
        <div className="currencyData2">{usd} USD</div>
      </div>
      <div className="currencyLogo">
        <img src={currencyLogo} />
      </div>
    </div>
  );
}

export default CurrencyComponent;
