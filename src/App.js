import React, { Component } from "react";
import { BrowserRouter, Route, Link, Switch } from "react-router-dom";
import "./App.css"
import Home from "./components/home/Home.jsx"
import DisplayScreen from "./DisplayScreen";
import JoinRoom from "./components/joinRoom/joinRoom"
import CreateRoom from "./components/createRoom/CreateRoom"
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/join-room" component={JoinRoom} />
        <Route exact path="/create-room" component={CreateRoom} />
        <Route exact path="/:roomId" component={DisplayScreen} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
