import React, { Component } from 'react'
import {Link} from "react-router-dom"
import { v4 as uuidv4 } from 'uuid';


 class CreateRoom extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             user:"",
             roomId:"",
             fullRoomId:""
        }
    }
    

    componentDidMount() {
        let roomPass = uuidv4();
        this.setState({roomPass})
    }
    

    handlerName = (e) =>{
        this.setState({user:e.target.value})
    }

    handlerCreateRoom = () =>{
     if(this.state.user.length <= 3){
         alert("Kindly Enter Your Full Name...")
     }
     else{
         this.changeRoute();
        }
    }

    changeRoute = async () =>{
        await this.setState({fullRoomId: this.state.roomPass.concat("-",this.state.user)} )
         this.props.history.push(`/rooms/${this.state.fullRoomId}`)
    }
    render() {
        return (      
        <div className="home-page">
        <div className="home-page__container">
            <div className="welcome-container">
                <h4 className="welcome">Welcome to web RTC</h4>
            </div>
                <div className="room-container">
                    <input type="text" className="general-input" placeholder="Enter Your Name" onChange={this.handlerName}/>
                    <br/>
                    <input type="text" className="general-input" value={this.state.roomPass + `-` + this.state.user}/>
                    <button className="home-page__button" onClick={this.handlerCreateRoom}>Create Lobby</button>
                    <br/>
                    <Link to="/" className="want-to-container">
                    <h6 className="want-to">Want To Join Meeting ?</h6>
                    </Link>
                 </div>     
            </div>
        </div>
  
        )
    }
}

export default CreateRoom
