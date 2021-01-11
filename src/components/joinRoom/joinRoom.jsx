import React, { Component } from 'react'
import {Link} from "react-router-dom"
 class JoinRoom extends Component {
    render() {
        return (
            <div className="home-page">
            <div className="home-page__container">
                <div className="welcome-container">
                
                    <h4 className="welcome">Welcome to web RTC</h4>
                </div>
                <div className="room-container">
                    <input type="text" className="general-input" placeholder="Enter Your Name"/>
                    <br/>
                    <input type="text" className="general-input" placeholder="Enter Meeting Code"/>
                    <button className="home-page__button">Enter To Lobby</button>
                    <br/>
                    <Link to="/" className="want-to-container">
                    <h6 className="want-to">Want To Create Meeting ?</h6>
                    </Link>
                </div>     
            </div>
        </div>
      
      
      )
    }
}

export default JoinRoom
