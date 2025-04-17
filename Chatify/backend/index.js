import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userroute from "./routes/user.route.js";
import postroute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
dotenv.config({});
const app=express();
const PORT=process.env.PORT || 4000;
app.get("/",(_req,res)=>{
    return res.status(200).json({
        message:"Backend server",
        success:true
    })
})
//middlewares

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));
const corsOptions={
    origin:'http://localhost:5173/',
    credentials:true
}
app.use(cors(corsOptions));

// api's
app.use("/api/v2/user",userroute);
app.use("/api/v2/post",postroute);
app.use("/api/v2/message",messageRoute);
// "http://localhost:2222/api/v2/user/register"


app.listen(PORT,()=>{
connectDB();
    console.log(`Server running at port ${PORT}`);
})