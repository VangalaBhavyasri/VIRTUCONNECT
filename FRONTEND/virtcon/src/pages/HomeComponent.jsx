import React, { useContext } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import Box from '@mui/material/Box';
import { AuthContext } from '../contexts/AuthContext';
function HomeComponent(){
    let navigate=useNavigate();
    const [meetingCode,setMeetingCode]=useState("");
    const {addToUserHistory} =useContext(AuthContext);
    let handleJoinVideoCall=async()=>{
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    }
    return(<>
        <div className="navBar">
            <div style={{display:"flex",alignItems:"center"}}>
                <h2>VirtuConnect</h2>
            </div>
            <div style={{display:"flex",alignItems:"center"}}>
                <IconButton onClick={()=>{navigate("/history")}}>
                    <RestoreIcon/>
                </IconButton>
                <p>HISTORY</p>
                <Button onClick={()=>{
                    localStorage.removeItem("token")
                    navigate("/auth")
                }}>
                        Log out
                </Button>
            </div>
        </div>
        <div className="meetContainer">
                <div className="leftPanel">
                    <h2 style={{marginBottom:"40px"}}>Step into your connection: Your virtual meeting awaits!</h2>
                    <div style={{display:"flex",gap:"20px"}}>
                             <Box sx={{ width: 300, maxWidth: '100%' }}>
                            <TextField fullWidth label="Meeting Code" id="fullWidth" onChange={e => setMeetingCode(e.target.value)} />
                             </Box>
                            {/* <TextField fullWidth  onChange={e => setMeetingCode(e.target.value)} id="fullWidth" label="Meeting Code" variant="outlined" /> */}
                            <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>
                    </div>
                </div>
        
            <div className="rightPanel">
                    <img srcSet="photoimg6.png" alt=""/>
            </div>
        </div>
    </>)
}
export default withAuth(HomeComponent);