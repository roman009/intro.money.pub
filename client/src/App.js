import "./App.css";
import DepositFundsPage from "./Pages/DepositFundsPage/DepositFundsPage";
import LandingPage from "./Pages/LandingPage/LandingPage";
import MainPage from "./Pages/MainPage/MainPage";
import RecipientLandingPage from "./Pages/RecipientLandingPage/RecipientLandingPage";
import ConversationPage from "./Pages/ConversationPage/ConversationPage";
import SignupPage from "./Pages/SignupPage/SignupPage";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Modal from "react-modal";
import React, { useState, useEffect, useContext } from "react";
import appContext from "./Contexts/AppContext";

const AppContext = React.createContext(appContext);

Modal.setAppElement("#root");
function App() {
  return (
    <AppContext.Provider value={AppContext}>
      <Router>
        <div className="App">
          <Switch>
            <Route path="/" exact component={LandingPage} />

            <Route path="/signup/:conversationHash" component={SignupPage} />
            <Route path="/signup" exact component={SignupPage} />

            <Route
              path="/depositfunds/:conversationHash"
              component={DepositFundsPage}
            />
            <Route path="/depositfunds" exact component={DepositFundsPage} />

            <Route
              path="/recipientlanding"
              exact
              component={RecipientLandingPage}
            />
            <Route path="/mainpage/:conversationHash" component={MainPage} />
            <Route path="/mainpage" exact component={MainPage} />

            <Route
              path="/conversation/:conversationHash"
              component={ConversationPage}
            />
          </Switch>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
