import React, { Component } from 'react'
// import ReactLoading from 'react-loading';
import {Link} from "react-router-dom"
 class Home extends Component {
    render() {
        return (
            <div className="home-page">
                <div className="home-page__container">
                    <div className="welcome-container">
                        <h4 className="welcome">Welcome to web RTC</h4>
                    </div>
                    <div className="room-container">
                        <Link to="join-room">
                         <button className="home-page__button">Join Room</button>
                        </Link>
                        <Link to="create-room">
                         <button className="home-page__button">Create Room</button>
                        </Link>
                        {/* <ReactLoading type="bubbles" height={'20%'} width={'20%'} className="margin-center"/> */}
                    </div>

                </div>
            </div>
        )
    }
}

export default Home
