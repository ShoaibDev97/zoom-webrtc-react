import React, { Component } from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen";
import DisplayScreen from "./DisplayScreen";
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Route exact path="/" component={WelcomeScreen} />
        <Route exact path="/:roomId" component={DisplayScreen} />
      </BrowserRouter>
    );
  }
}

export default App;
