import {User} from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt,{hash} from "bcrypt";
import {Meeting} from "../models/meeting.model.js"
import crypto from "crypto";
const register=async(req,res)=>{
    const {name,username,password}=req.body;
    try{
        const userExisted=await User.findOne({username});
        if(userExisted){
            return res.status(httpStatus.CONFLICT).json({message:"User already exists"});
        }
        const hashedPass=await bcrypt.hash(password,10);
        const user=new User({
            name:name,
            username:username,
            password:hashedPass
        });
        await user.save();
        res.status(httpStatus.CREATED).json({message:"User Registered Successfully."});
    }
    catch(e){
        res.json({message:`Something went wrong ${e.message}`});
    }
    
}
const login=async(req,res)=>{
    const {username,password}=req.body;
    if(!username||!password){
        return res.status(400).json({message:"Please Provide data!"});
    }
    try{
        let user=await User.findOne({username});
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message:"User Not Found"});
        }
        let isPassCrct=await bcrypt.compare(password,user.password);
        if(isPassCrct){
            const token=crypto.randomBytes(20).toString("hex");
            user.token=token;
            console.log(token);
            await user.save();
            res.status(httpStatus.OK).json({message:`${token}`});
               }
               else{
                return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid Password"});
               }
    }
    catch(e){
       return res.json({message:`Something went wrong ${e.message}`});
    }
}
const getUserHistory=async(req,res)=>{
    const {token}=req.query;
    console.log("token is :",{token});
    // try{
        const user=await User.findOne({token:token});
        const meetings=await Meeting.find({user_id:user.username});
        res.json(meetings);
    // }catch(e){
    //     res.json({message:`something went wrong ${e}`});
    // }
}
const addToHistory=async(req,res)=>{
    const {token,meeting_code}=req.body;
    console.log(req.body);
    try{
        const user=await User.findOne({token:token});
        const newMeeting=new Meeting({
            user_id:user.username,
            meetingCode:meeting_code,
        })
        await newMeeting.save();
        res.status(httpStatus.CREATED).json({message:"Added code to History."});
    }catch(e){
        res.json({message:`something went wrong ${e}`});
    }
}
export{login,register,getUserHistory,addToHistory};