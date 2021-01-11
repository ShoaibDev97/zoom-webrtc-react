import React, { Component } from 'react'
import {Link} from "react-router-dom"
 class JoinRoom extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             userName:"",
             meetingCode:""
        }

    }
    
    handlerChange = (e) =>{
        this.setState({[e.target.name]:e.target.value})
    }
    
    handlerLobby = () =>{
        let {userName,meetingCode} = this.state;
        if(userName.length < 3 || meetingCode.length < 10){
            alert("Kindly Enter the username and Enter The valid Meeting Code")
        }
        else{
            this.props.history.push(`/rooms/${meetingCode}`)
        }
    }

    render() {
        return (
            <div className="home-page">
            <div className="home-page__container">
                <div className="welcome-container">
                
                    <h4 className="welcome">Welcome to web RTC</h4>
                </div>
                <div className="room-container">
                    <input type="text" className="general-input" placeholder="Enter Your Name" name="userName" onChange={this.handlerChange} value={this.state.userName}/>
                    <br/>
                    <input type="text" className="general-input" placeholder="Enter Meeting Code" name="meetingCode" onChange={this.handlerChange} value={this.state.meetingCode}/>
                    <button className="home-page__button" onClick={this.handlerLobby}>Enter To Lobby</button>
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
