import React from "react";
import { Route, Switch } from "react-router";
// import About from "./About";
// import Blog from "./Blog";
// import Contact from "./Contact";
import Conversation from "./Conversation";
import Home from "./Home";

export default function Body(props) {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route
        path="/conversation/:id"
        render={(p) => (
          <Conversation
            // {...props}
            connect={props.connect}
            state={props.state}
          />
        )}
      />
      {/* <Route path="/contact" component={Contact} /> */}
      {/* <Route path="/post/:slug" component={Post} /> */}
    </Switch>
  );
}
