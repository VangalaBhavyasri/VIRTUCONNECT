import express from "express";
import {createServer} from "node:http";
import mongoose from "mongoose";
import connectToServer from "./controllers/socketManager.js";
import cors from "cors";
const app=express();
const server=createServer(app);
const io=connectToServer(server);
import userRoutes from "./routes/users.routes.js";
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));
app.set("port",(process.env.PORT||8000));
app.use("/api/v1/users",userRoutes);
import 'dotenv/config'; 
app.get("/home",(req,res)=>{
    res.send("hello world");
})
let start=async()=>{
  console.log("MongoDB URI:", process.env.MONGODBURL);
    const mongoURI=process.env.MONGODBURL;
const start = async () => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`Database connected to ${conn.connection.host}`);
  } catch (err) {
    console.error(`Connection Error: ${err}`);
    process.exit(1); // Exit the process with failure
  }
};
start();
    // console.log(`database connected to ${conndatabase.connection.host}`);
    server.listen(app.get("port"),()=>{
    console.log("server is running on port 8000");
})}
start();
