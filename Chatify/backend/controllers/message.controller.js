import {Conversation} from "../models/conversation.model.js";
export const sendmessage=async(req,res)=>{
    try {
        const senderId=req.id;
        const recieverId=req.params.id;
        const {message}=req.body;
        let conversation=await Conversation.findOne({
            participants:{$all:[senderId,recieverId]}
        });
        if(!conversation){
            conversation=await Conversation.create({
                participants:[senderId,recieverId]
            })
        };
        const newMessage=await Message.create({
            senderId,
            receiverId:recieverId,
            message
        });
        if(newMessage){
            conversation.messages.push(newMessage._id);
        }
        await Promise.all([conversation.save(),newMessage.save()]);
        // Socketio

        return res.status(200).json({
            message:"Message Sent!",
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
export const getmessage=async(req,res)=>{
    try {
        const senderId=req.id;
        const recieverId=req.params.id;
        const conversation=await Conversation.find({
            participants:{$all:[senderId,recieverId]}
        });
        if(!conversation){
            return res.status(200).json({
                success:true,messages:[]
            });
        }
        return res.status(200).json({
            success:true,
            messages:conversation?.messages
        });
        

    } catch (error) {
        console.log(error);
    }
}