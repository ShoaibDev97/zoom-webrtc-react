import React, { Component } from "react";
import io from "socket.io-client";
import Video from "./components/video";
import Videos from "./components/videos";
import Icons from "./components/icons/Icons";



class DisplayScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      localStream: null, // used to hold local stream object to avoid recreating the stream everytime a new offer comes
      remoteStream: null, // used to hold remote stream object that is displayed in the main screen

      remoteStreams: [], // holds all Video Streams (all remote streams)
      peerConnections: {}, // holds all Peer Connections
      selectedVideo: null,

      status: "Please wait...",

      // Google STUN Server 
      pc_config: {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      },

      // Default Vlaue of SDP Constraints 
      sdpConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true,
        },
      },

      messages: [],
      sendChannels: [],
      disconnected: false,
    };
    this.localScreenRef = React.createRef();
    this.URL = "http://localhost:4000/";
    this.socket = null;
  }

  getLocalStream = () => {
    // called when getUserMedia() successfully returns - see below
    const success = (stream) => {
      window.localStream = stream;
      this.setState({
        localStream: stream,
      });

      this.whoisOnline();
    };

    // called when getUserMedia() fails - see below
    const failure = (e) => {
      console.log("getUserMedia Error: ", e);
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // see the above link for more constraint options
    const constraints = {
      audio: true,
      video: true,
      options: {
        mirror: true,
      },
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    navigator.mediaDevices.getUserMedia(constraints).then(success).catch(failure);
  };

  whoisOnline = () => {
    // let all peers know I am joining
    this.sendToPeer("onlinePeers", null, { local: this.socket.id });
  };

  sendToPeer = (messageType, payload, socketID) => {
    this.socket.emit(messageType, {
      socketID,
      payload,
    });
  };

  createPeerConnection = (socketID, callback) => {
    try {
      let pc = new RTCPeerConnection(this.state.pc_config);

      // add pc to peerConnections object
      const peerConnections = { ...this.state.peerConnections, [socketID]: pc };
      this.setState({
        peerConnections,
      });

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          this.sendToPeer("candidate", e.candidate, {
            local: this.socket.id,
            remote: socketID,
          });
        }
      };

      pc.oniceconnectionstatechange = (e) => {
      };

      pc.ontrack = (e) => {
        let _remoteStream = null;
        let remoteStreams = this.state.remoteStreams;
        let remoteVideo = {};

        // 1. check if stream already exists in remoteStreams
        const rVideos = this.state.remoteStreams.filter((stream) => stream.id === socketID);

        // 2. if it does exist then add track
        if (rVideos.length) {
          _remoteStream = rVideos[0].stream;
          _remoteStream.addTrack(e.track, _remoteStream);

          remoteVideo = {
            ...rVideos[0],
            stream: _remoteStream,
          };
          remoteStreams = this.state.remoteStreams.map((_remoteVideo) => {
            return (_remoteVideo.id === remoteVideo.id && remoteVideo) || _remoteVideo;
          });
        } else {
          // 3. if not, then create new stream and add track
          _remoteStream = new MediaStream();
          _remoteStream.addTrack(e.track, _remoteStream);

          remoteVideo = {
            id: socketID,
            name: socketID,
            stream: _remoteStream,
          };
          remoteStreams = [...this.state.remoteStreams, remoteVideo];
        }


        this.setState((prevState) => {
          // If we already have a stream in display let it stay the same, otherwise use the latest stream
          // const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: e.streams[0] }
          const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: _remoteStream };

          // get currently selected video
          let selectedVideo = prevState.remoteStreams.filter((stream) => stream.id === prevState.selectedVideo.id);
          // if the video is still in the list, then do nothing, otherwise set to new video stream
          selectedVideo = selectedVideo.length ? {} : { selectedVideo: remoteVideo };

          return {
            // selectedVideo: remoteVideo,
            ...selectedVideo,
            // remoteStream: e.streams[0],
            ...remoteStream,
            remoteStreams, //: [...prevState.remoteStreams, remoteVideo]
          };
        });
      };

      pc.close = () => {
        // alert('GONE')
        console.log("pc closed");
      };

      if (this.state.localStream)
        // pc.addStream(this.state.localStream)

        this.state.localStream.getTracks().forEach((track) => {
          pc.addTrack(track, this.state.localStream);
        });

      // return pc
      callback(pc);
    } catch (e) {
      console.log("Something went wrong! pc not created!!", e);
      // return;
      callback(null);
    }
  };

  handleSuccess1 = (stream) =>{
      this.localScreenRef.current.srcObject = stream
      console.log("I Am Screen",stream)
  }

  handleError1 = (e) =>{
    console.log(e)
  }

  componentDidMount = () => {
    // creating socket instance with localhost url and room query
    this.socket = io.connect(this.URL, {
      path: "/io/webrtc",
      query: {
        room: window.location.pathname,
      },
    });

    // making success connection and sending to socket io server side
    this.socket.on("connection-success", (data) => {
      this.getLocalStream();
      const status = data.peerCount > 1 ? `Total Connected users are : ${data.peerCount}`: `Waiting for other user to connect... `;
      this.setState({status});
    });


    // navigator.mediaDevices.getDisplayMedia({video: true})
    // .then(this.handleSuccess1, this.handleError1);

    
    this.socket.on("joined-peers", (data) => {
      const status = data.peerCount > 1 ? `Total Connected users are : ${data.peerCount}`: `Waiting for other user to connect... `;
      this.setState({status});
    });

    this.socket.on("peer-disconnected", (data) => {
      // close peer-connection with this peer
      this.state.peerConnections[data.socketID].close();

      // get and stop remote audio and video tracks of the disconnected peer
      const rVideo = this.state.remoteStreams.filter((stream) => stream.id === data.socketID);
      rVideo && this.stopTracks(rVideo[0].stream);

      // filter out the disconnected peer stream
      const remoteStreams = this.state.remoteStreams.filter((stream) => stream.id !== data.socketID);

      this.setState((prevState) => {
        // check if disconnected peer is the selected video and if there still connected peers, then select the first
        const selectedVideo =
          prevState.selectedVideo.id === data.socketID && remoteStreams.length ? { selectedVideo: remoteStreams[0] } : null;

        return {
          // remoteStream: remoteStreams.length > 0 && remoteStreams[0].stream || null,
          remoteStreams,
          ...selectedVideo,
          status:
            data.peerCount > 1
              ? `Total Connected Peers to room ${window.location.pathname}: ${data.peerCount}`
              : "Waiting for other peers to connect",
        };
      });
    });

    // this.socket.on('offerOrAnswer', (sdp) => {

    //   this.textref.value = JSON.stringify(sdp)

    //   // set sdp as remote description
    //   this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
    // })

    this.socket.on("online-peer", (socketID) => {
      // console.log('connected peers ...', socketID)

      // create and send offer to the peer (data.socketID)
      // 1. Create new pc
      this.createPeerConnection(socketID, (pc) => {
        // 2. Create Offer
        if (pc) {
          // Send Channel
          const handleSendChannelStatusChange = (event) => {
            console.log("send channel status: " + this.state.sendChannels[0].readyState);
          };

          const sendChannel = pc.createDataChannel("sendChannel");
          sendChannel.onopen = handleSendChannelStatusChange;
          sendChannel.onclose = handleSendChannelStatusChange;

          this.setState((prevState) => {
            return {
              sendChannels: [...prevState.sendChannels, sendChannel],
            };
          });

          // Receive Channels
          const handleReceiveMessage = (event) => {
            const message = JSON.parse(event.data);
            // console.log(message)
            this.setState((prevState) => {
              return {
                messages: [...prevState.messages, message],
              };
            });
          };

          const handleReceiveChannelStatusChange = (event) => {
            if (this.receiveChannel) {
              console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
            }
          };

          const receiveChannelCallback = (event) => {
            const receiveChannel = event.channel;
            receiveChannel.onmessage = handleReceiveMessage;
            receiveChannel.onopen = handleReceiveChannelStatusChange;
            receiveChannel.onclose = handleReceiveChannelStatusChange;
          };

          pc.ondatachannel = receiveChannelCallback;

          pc.createOffer(this.state.sdpConstraints).then((sdp) => {
            pc.setLocalDescription(sdp);

            this.sendToPeer("offer", sdp, {
              local: this.socket.id,
              remote: socketID,
            });
          });
        }
      });
    });

    this.socket.on("offer", (data) => {
      this.createPeerConnection(data.socketID, (pc) => {
        pc.addStream(this.state.localStream);

        // Send Channel
        const handleSendChannelStatusChange = (event) => {
          console.log("send channel status: " + this.state.sendChannels[0].readyState);
        };

        const sendChannel = pc.createDataChannel("sendChannel");
        sendChannel.onopen = handleSendChannelStatusChange;
        sendChannel.onclose = handleSendChannelStatusChange;

        this.setState((prevState) => {
          return {
            sendChannels: [...prevState.sendChannels, sendChannel],
          };
        });

        // Receive Channels
        const handleReceiveMessage = (event) => {
          const message = JSON.parse(event.data);
          // console.log(message)
          this.setState((prevState) => {
            return {
              messages: [...prevState.messages, message],
            };
          });
        };

        const handleReceiveChannelStatusChange = (event) => {
          if (this.receiveChannel) {
            console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
          }
        };

        const receiveChannelCallback = (event) => {
          const receiveChannel = event.channel;
          receiveChannel.onmessage = handleReceiveMessage;
          receiveChannel.onopen = handleReceiveChannelStatusChange;
          receiveChannel.onclose = handleReceiveChannelStatusChange;
        };

        pc.ondatachannel = receiveChannelCallback;

        pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
          // 2. Create Answer
          pc.createAnswer(this.state.sdpConstraints).then((sdp) => {
            pc.setLocalDescription(sdp);

            this.sendToPeer("answer", sdp, {
              local: this.socket.id,
              remote: data.socketID,
            });
          });
        });
      });
    });

    this.socket.on("answer", (data) => {
      // get remote's peerConnection
      const pc = this.state.peerConnections[data.socketID];
      // console.log(data.sdp)
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {});
    });

    this.socket.on("candidate", (data) => {
      // get remote's peerConnection
      const pc = this.state.peerConnections[data.socketID];

      if (pc) pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });
  };

  
  disconnectSocket = (socketToDisconnect) => {
    this.sendToPeer("socket-to-disconnect", null, {
      local: this.socket.id,
      remote: socketToDisconnect,
    });
  };

  switchVideo = (_video) => {
    
    this.setState({
      selectedVideo: _video,
    });
  };
  stopTracks = (stream) => {
    stream.getTracks().forEach((track) => track.stop());
  };

  handlerDisconnect = () =>{
    this.setState({disconnected:true});
  }

  handlerClipboard = () =>{
    let pathname = window.location.pathname.slice(7)
    navigator.clipboard.writeText(pathname)
    alert("Your Room is copied share with your freinds")
  }

  render() {
    const { status, messages, disconnected, localStream, peerConnections, remoteStreams } = this.state;
    if (disconnected) {
      // disconnect socket
      this.socket.close();
      // stop local audio & video tracks
      this.stopTracks(localStream);
      // stop all remote audio & video tracks
      remoteStreams.forEach((rVideo) => this.stopTracks(rVideo.stream));
      // stop all remote peerconnections
      peerConnections && Object.values(peerConnections).forEach((pc) => pc.close());
      return <div>You have successfully Disconnected</div>;
    }

    const statusText = <div style={{ color: "yellow", padding: 5 }}>{status}</div>;



    return (
      <div>
        <Video
          videoType="localVideo"
          appliedClass="local-video"
          videoStyles={{
            width: 200,
          }}
          frameStyle={{
            width: 200,
            margin: 5,
            borderRadius: 5,
            backgroundColor: "black",
          }}
          showMuteControls={true}
          videoStream={localStream}
          autoPlay
          muted
        ></Video>

        <br />

          {/* <video ref={this.localScreenRef} style={{width:"200px",height:"200px",position:"absolute",zIndex:"500"}} autoPlay/> */}

        <div
          style={{
            zIndex: 3,
            position: "absolute",
          }}
        >
    
          <Icons handler={this.handlerDisconnect} value="highlight_off" color="#7c0A02" />
          <Icons handler={this.handlerClipboard} value="content_copy" color="#33A1C9"/>
          <div
            style={{
              margin: 10,
              backgroundColor: "#cdc4ff4f",
              padding: 10,
              borderRadius: 5,
            }}
          >
            
            {statusText}
          </div>
        </div>
        <div>
          <Videos switchVideo={this.switchVideo} remoteStreams={remoteStreams}></Videos>
        </div>
        <br />
      </div>
    );
  }
}

export default DisplayScreen;
