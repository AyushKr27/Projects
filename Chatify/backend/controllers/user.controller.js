import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getdatauri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
export const register=async(req,res)=>{
    try {
       const{username,email,password}=req.body;
       if(!username||!email||!password){
        return res.status(401).json({
            message:"Wrong Credentials, Please Enter Correct Details!",
            success:false,
        });
       } 
       const user = await User.findOne({email});
       if(user){
        return res.status(401).json({
            message:"User already exists,Try different email",
            success:false,
        });
       };
       const hashedpassword=await bcrypt.hash(password,12);
       await User.create({
        username,
        email,
        password:hashedpassword
       });
       return res.status(201).json({
        message:"Account Created Successfully!",
        success:true,
    });
    } catch (error) {
        console.log(error);
    }
}
export const login=async (req,res)=>{
    try {
        const{email,password}=req.body;
        if(!username||!email||!password){
            return res.status(401).json({
                message:"Wrong Credentials, Please Enter Correct Details!",
                success:false,
            });
           } 
           let user=await User.findOne({email});
           if (!user) {
                return res.status(401).json({
                    message:"User does not exits,Please register first!",
                    success:false,
                });
               } 
               const ispasswordmatch=await bcrypt.compare(password,user.password);
               if(!ispasswordmatch){
                    return res.status(401).json({
                        message:"Incorrect Password! Please Check The Password and Try Again",
                        success:false,
                    });
                   };
                   user={
                    _id:user._id,
                    username:user.username,
                    email:user.email,
                    profilepic:user.profilepic,
                    bio:user.bio,
                    followers:user.followers,
                    following:user.following,
                    post:user.post
                   }
                   const token= await jwt.sign({userId:user._id},process.env.SecretKey,{expiresIn:'1d'});
                   return res.cookie('token',token,{httpOnly:true,sameSite:'strict',maxAge:1*24*60*60*1000}).json({
                    message:`Welcome Back ${user.username}`,
                    success:true,
                    user
                   });
    } catch (error) {
        console.log(error);
    }
};
export const logout=async(_,res)=>{
    try {
        return res.cookie("token","",{maxAge:0}).json({
            message:'Logged Out Successfully!',
            success:true
        });
    } catch (error) {
        console.log(error);
    }
};
export const getprofile=async(req,res)=>{
    try {
        const userId=req.params.id;
        let user=await User.findById(userId).select('-password');
        if(!user){
            return res.status(404).json({
                message:"User Not Found!",
                success:false
            });
        }
        return res.status(200).json({
            message:"User Found!",
            success:true,
            user
        });
    } catch (error) {
        console.log(error);
    }
};
export const editprofile=async(req,res)=>{
    try {
        const userId=req.id;
         const{bio,gender}=req.body;
         const profilepic=req.file;
         let cloudResponse;
         if(profilepic){
            const fileuri=getdatauri(profilepic);
            cloudResponse=await cloudinary.uploader.upload(fileuri);
         }
         const user=await User.findById(userId);
         if (!user) {
            return res.status(404).json({
                message:"User Not Found!",
                success:false
            });
            
         };
         if(bio) user.bio=bio;
         if (gender) user.gender=gender;
         if (profilepic) user.profilepic=cloudResponse.secure_url;
         await user.save();
         return res.status(200).json({
            message:"Profile Updated Successfully!",
            success:true,
            user 
            
         });    
}
catch (error) {
    console.log(error);
}
};
export const getsuggestedusers=async(req,res)=>{
    try {
        const suggestedusers=await User.find({_id:{$ne:req.id}}).select('-password').limit(5);
        if (!suggestedusers) {
            return res.status(400).json({
                message:"No User Found!",
            }); 
        };
        return res.status(200).json({
            success:true,
            suggestedusers
        });
    } catch (error) {
        console.log(error);
        
    }
};
export const followorUnfollow=async(req,res)=>{ 
    try {
        const followkarnevala=req.id;
        const jiskoFollowKarnaHai=req.params.id;
        if (followkarnevala===jiskoFollowKarnaHai) {
            return res.status(400).json({
                message:"You cannot follow yourself!",
                success:false
            });
            
        }
    } catch (error) {
        console.log(error);
    }
}
