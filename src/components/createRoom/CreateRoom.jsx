import React, { Component } from 'react'
import {Link} from "react-router-dom"


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
        let roomPass = Array(20)
        .fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$')
        .map(x => x[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1) * x.length)])
        .join('');
        this.setState({roomPass})
    }
    

    handlerName = (e) =>{
        this.setState({user:e.target.value})
    }

    handlerCreateRoom =async () =>{
       await  this.setState({fullRoomId: this.state.roomPass.concat("-",this.state.user)} )
        this.props.history.push(`/${this.state.fullRoomId}`)
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
