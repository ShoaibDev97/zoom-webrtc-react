import React, { Component } from 'react'

 class Icons extends Component {
    render() {
        return (
         <i
            onClick={this.props.handler}
            style={{ cursor: "pointer", paddingLeft: 15, color: `${this.props.color}` }}
            class="material-icons"
          >
            {this.props.value}
          </i>
        )
    }
}

export default Icons
