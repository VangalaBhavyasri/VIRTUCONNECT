import React from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
export default function LandingPage(){
    const router=useNavigate();
    return(<>
    <div className="landingPageContainer">
        <nav>
            <div className="navHeader">
                <h2>VIRTUCONNECT</h2>
            </div>
            <div className="navlist">
                <p onClick={()=>{
                    router("/withoutauthentication");
                }}>Join as a Guest</p>
                <p onClick={()=>{
                    router("/auth");
                }}>Register</p>
                <div role="button">
                    <p  onClick={()=>{
                    router("/auth");
                }}>Login</p>
                </div>
            </div>
        </nav>
        <div className="landingMainContent">
            <div className="contdiv">
                <h1 style={{color:"white"}}><span style={{color:"#FF9839"}}>Connect  </span>with your loved Ones</h1>
                <p style={{color:"white"}}>Cover a distance one by VirtueConnect</p>
                <div role="button" className="anc_div">
                    <a href="/auth"  className="anc_link">Get Started</a>
                </div>
                </div>
            <div className="photodiv">
                <img src="/photoimg4.png" alt=" " style={{ width: "auto", height: "85vh" }}/>
            </div>
        </div>
    </div>
    </>)
}