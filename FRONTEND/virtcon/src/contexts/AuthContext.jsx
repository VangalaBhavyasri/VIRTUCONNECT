import axios from 'axios';
import { createContext,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { StatusCodes } from 'http-status-codes';
// import { console } from 'node:inspector';
export const AuthContext=createContext({});
const client=axios.create({
    baseURL:"http://localhost:8000/api/v1/users" 
})
export const AuthProvider=({children})=>{
    // const authContext=useContext(AuthContext);
    const [userData,setUserData]=useState(null);
    const router=useNavigate();
    const handleRegister=async(name,username,password)=>{
        try{
            let request=await client.post("/register",{
                name:name,
                username:username,
                password:password
            })
            if(request.status==StatusCodes.CREATED){
                console.log("User created successfully");
                return request.data.message;
            }
        }
        catch(err){
            console.error("Error during registration:", err);
            throw err;
        }
    }
    const handleLogin=async(username,password)=>{
        try{
            let request=await client.post("/login",{
                username:username,
                password:password
            })
            if(request.status==StatusCodes.OK){
                console.log("User logged Successfully.");
                console.log(request.data.message);
                console.log(request);
               localStorage.setItem("token",request.data.message);
               router("/home");
            }
        }
        catch(err){
            throw err;
        }
    }
    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            console.log(request.data);
            return Array.isArray(request.data) ? request.data : [];
        } catch
         (err) {
            throw err;
        }
    }
    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            console.log(request);
            return request
        } catch (e) {
            throw e;
        }
    }
    const data={
        userData,setUserData,handleRegister,handleLogin,getHistoryOfUser,addToUserHistory
    }
    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}