import React from "react";

const appContext = React.createContext({
  web3: null,
  contract: null,
  username: "",
});

export default appContext;
