import React, { useEffect, useState,useRef} from "react";
import { io } from "socket.io-client";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import style from "../style/VideoComponent.module.css";
const server_url="http://localhost:8000";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Badge, IconButton } from "@mui/material";
import CallEndIcon from '@mui/icons-material/CallEnd' 
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import { useNavigate } from "react-router-dom";
var connections={};
const peerConfigConnections = {
    "iceServers": [
        {
            "urls": "stun:stun.l.google.com:19302"
        },
    ]
};
// peerConfigConnections.onicecandidate = function(event) {
//     if (event.candidate) {
//         signalingChannel.send({ type: 'candidate', candidate: event.candidate });
//     }
// };
export default function VideoMeet(){
    var socketRef=useRef();
    let socketIdRef=useRef();
    let localVideoRef=useRef();
    let [videoAvailable,setVideoAvailable]=useState(true);
    let [audioAvailable,setAudioAvailable]=useState(true);
    let [video,setVideo]=useState([]);
    let [audio,setAudio]=useState();
    let [screen,setScreen]=useState();
    let [showModal,setModal]=useState(true);
    let [screenAvailable,setScreenAvailable]=useState();
    let [messages,setMessages]=useState([]);
    let [message,setMessage]=useState("");
    let [newMessages,setNewMessages]=useState(3);
    let[askForUsername,setAskForUsername]=useState(true);
    let [username,setUsername]=useState("");
    const videoRef=useRef([]);
    let [videos,setVideos]=useState([]);
    const getPermissions=async()=>{
        try{
            const videoPermission=await navigator.mediaDevices.getUserMedia({video:true});
            if(videoPermission){
                setVideoAvailable(true);
            }
            else{
                setVideoAvailable(false);
            }
            const audioPermission=await navigator.mediaDevices.getUserMedia({audio:true});
            if(audioPermission){
                setAudioAvailable(true);
            }
            else{
                setAudioAvailable(false);
            }
            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            }
            else{
                setScreenAvailable(false);
            }
            if(videoAvailable||audioAvailable){
                const userMediaStream=await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable});
                window.localStream=userMediaStream;
                if(localVideoRef.current){
                    localVideoRef.current.srcObject=userMediaStream;
                }
            }
        }
        catch(err){
            console.log(err);
        }
    }
    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }
        window.localStream = stream
        localVideoRef.current.srcObject = stream
        for (let id in connections) {
            if (id === socketIdRef.current) continue
            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);  // Video is turned off
            setAudio(false);  // Audio is turned off
        
            try {
                // Stop all tracks in the current local video stream
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e); }
        
            // Create a new MediaStream with black video and silent audio
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
        
            // Set the new blackSilence stream to the local video element
            localVideoref.current.srcObject = window.localStream;
            // Loop through all connections and update the stream
            for (let id in connections) {
                // Remove previous tracks from the connection
                let senders = connections[id].getSenders();
                senders.forEach(sender => {
                    if (sender.track.kind === 'video') {
                        connections[id].removeTrack(sender);  // Remove old video track
                    }
                    if (sender.track.kind === 'audio') {
                        connections[id].removeTrack(sender);  // Remove old audio track
                    }
                });
        
                // Add the new black video and silent audio tracks to the connection
                window.localStream.getTracks().forEach(track => {
                    connections[id].addTrack(track);  // Add the new tracks
                });
        
                // Recreate the offer and set local description again
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            // Send the updated SDP to the remote peer
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            }
        
            // Emit to other participants about the new stream
            socketRef.current.emit('new-user-video', window.localStream);
        });
        
    }
    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }
    let getUserMedia=()=>{
        if((video&&videoAvailable)||(audio&&audioAvailable)){
            navigator.mediaDevices.getUserMedia({video:video,audio:audio})
            .then(getUserMediaSuccess) //TODO getUserMediaSuccess.
            .then((stream)=>{})
            .catch((err)=>{
                console.log(err);
            })
        }else{
            try{
                let tracks=localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track=>track.stop());
            }catch(err){
                console.log(err);
            }
        }
    }
    useEffect(()=>{
        getPermissions();
    },[]);
    useEffect(()=>{
        if(video!==undefined &&audio!==undefined){
            getUserMedia();
        }
    },[video,audio]);
    useEffect(() => {
        console.log("Updated videos:", videos);
    }, [videos]);
    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            connections[fromId].createAnswer()
                                .then((description) => {
                                    connections[fromId].setLocalDescription(description)
                                        .then(() => {
                                            console.log("socketIdRef.current:", socketIdRef.current);
                                            socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                                        })
                                        .catch(e => console.log(e));
                                })
                                .catch(e => console.log(e));
                        }
                    })
                    .catch(e => console.log(e));
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    };
    
    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };
    let connectToSocketServer=()=>{
        socketRef.current=io.connect(server_url,{secure:false});
        socketRef.current.on('signal',gotMessageFromServer);
        socketRef.current.on("connect",()=>{
            socketRef.current.emit("join-call",window.location.href);
            socketIdRef.current=socketRef.current.id;
            socketRef.current.on("chat-message", addMessage);
            socketRef.current.on('user-left', (id) => {
                console.log("user left...");
                setVideos((videos) => {
                    const updatedVideos = videos.filter((video) => video.socketId !== id);
                    console.log('Updated videos:', updatedVideos);
                    return [...updatedVideos]; // Ensure a new array reference is returned
                });
                
            })
            socketRef.current.on('user-joined', (id, clients) => {
                console.log("user joined ");
                clients.forEach((socketListId) => {                              
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                            console.log(event.candidate);
                        }
                    }
                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);
                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                console.log(updatedVideos);
                                return updatedVideos;
                            });

                           
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                console.log(updatedVideos);
                                return updatedVideos;
                            });
                        }
                    };
                    if(window.localStream!==undefined&&window.localStream!==null){
                        connections[socketListId].addStream(window.localStream);
                    }else{
                        let blackSilence=(...args)=>new MediaStream([black(...args),silence()]);
                        window.localStream=blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                })
                if(id==socketIdRef.current){
                    for(let id2 in connections){
                        if(id2===socketIdRef.current) continue
                        try{
                            connections[id2].addStream(window.localStream);
                        }catch(err){
                            console.log(err);
                        }
                            connections[id2].createOffer().then((description)=>{
                                connections[id2].setLocalDescription(description)
                                .then(()=>{
                                    socketRef.current.emit("signal",id2,JSON.stringify({'sdp':connections[id2].localDescription}))
                                })
                                .catch(err=>
                                    console.log(err)
                                )
                            })
                        }
                    }
                }
            )
        })
    }
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };
    let routeTo=useNavigate();
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    };
    let handleVideo=()=>{
        setVideo(!video);
    }
    let handleAudio=()=>{
        setAudio(!audio);
    }
    let getDisplayMediaSuccess=(stream)=>{
        try{
            window.localStream.getTracks.forEach(track=>track.stop())
        }catch(e){
            console.log(e);
        }
        window.localStream=stream;
        localVideoRef.current.srcObject=stream;
        for(let id in connections){
            if(id===socketIdRef.current) continue;
            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description)=>(
            connections[id].setLocalDescription(description)
            .then(()=>{
                socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
            })
            .catch(e=>console.log(e))
            ))
        }
        stream.getTracks().forEach(track => track.onended = () => {
           setScreen(false);
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence();
            // connections[socketListId].addStream(window.localStream);
            localVideoref.current.srcObject = window.localStream
            getUserMedia();
        })
    }
    let getDisplayMedia=()=>{
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
                .then(getDisplayMediaSuccess)
                .then((stream)=>{})
                .catch((e)=>console.log(e))
            }
        }
    }
    useEffect(()=>{
        if(screen!==undefined){
            getDisplayMedia();
        }
    },[screen])
    let handleScreen = () => {
        setScreen(!screen);
    }
    let sendMessage=()=>{
        socketRef.current.emit("chat-message",message,username);
        setMessage("");
    }
    let handleEndCall=()=>{
        try{
            let tracks=localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track=>track.stop())
        }catch(e){
            console.log(e);
        }
        setVideos((videos) => {
            const updatedVideos = videos.filter((video) => video.socketId !== id);
            console.log('Updated videos:', updatedVideos);
            return [...updatedVideos]; // Ensure a new array reference is returned
        });        
        routeTo("/home");
    }
    useEffect(() => {
        console.log('Videos state changed:', videos);
    }, [videos]);
    return(
    < div>
        {askForUsername==true ?
        <div className={style.userData}>
            <div className={style.vidPrev}>
                <video ref={localVideoRef} autoPlay muted></video>
            </div>
            <div>
            <h2>Enter into Lobby</h2>
            <br></br>
            <TextField  id="outlined-basic" label="Username" value={username} variant="outlined" onChange={(e)=>{setUsername(e.target.value)}} />
           <br></br>
           <br></br>
            <Button variant="outlined" onClick={connect}>Connect</Button>
            </div>
        </div>
        :
        <div className={style.meetVideoContainer}>
                {showModal?<div className={style.chatRoom}>

            <div className={style.chatContainer}>
                <h1>Chat</h1>

                <div className={style.chattingDisplay}>

                    {messages.length !== 0 ? messages.map((item, index) => {

                        console.log(messages)
                        return (
                            <div style={{ marginBottom: "20px" }} key={index}>
                                <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                <p>{item.data}</p>
                            </div>
            )
        }) 
                : <>No Messages Yet</>}
        </div>
        <div className={style.chattingArea}>
            <TextField
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                id="outlined-basic"
                label="Enter your chat"
                variant="outlined"
                className={style.chatInput}
            />
            <Button
                variant="contained"
                onClick={sendMessage}
                className={style.sendButton}
            >
                Send
            </Button>
        </div>
    </div>
</div>
:
<></>}
        <div className={style.buttonContainer}>
            <IconButton onClick={handleVideo}>
                {(video==true)?<VideocamIcon/>:<VideocamOffIcon/>}
            </IconButton>
            <IconButton onClick={handleAudio}>
                {(audio==true)?<MicIcon />:<MicOffIcon/>}
            </IconButton>
            {screenAvailable==true ? <IconButton onClick={handleScreen}>
                {screen==true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
            </IconButton>:<></>}
                <Badge badgeContent={newMessages} max={999} color="secondary">
                <IconButton onClick={()=>setModal(!showModal)}>
                    <ChatIcon/>
                </IconButton>
            </Badge>
            <IconButton style={{color:"red"}} onClick={handleEndCall}>
                <CallEndIcon/>
            </IconButton>
        </div>
            <video ref={localVideoRef} autoPlay muted className={style.meetUserVideo}></video>
            <div className={style.ConferenceView}>
                {(videos.length!=0)?videos.map((video)=>(
                    <div className={style.VideoWrapper}  key={video.socketId} >
                        <video
                        data-socket={video.socketId}
                        ref={ref=>{
                            if(ref &&video.stream){
                                ref.srcObject=video.stream;
                            }
                        }}autoPlay
                        ></video>
                    </div>
            )):<></>}
        </div>
        </div>
    }
    </div>
    )
}