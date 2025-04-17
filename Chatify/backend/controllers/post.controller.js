import sharp from 'sharp';
import {Post} from '../models/post.model.js';
import cloudinary from '../utils/cloudinary.js';
import {User} from '../models/user.model.js';
import {Comment} from '../models/comment.model.js';
export const addnewpost=async(req,res)=>{
    try{
        const {caption}=req.body;
        const authorId=req.id;
        const image=req.file;
        if(!image){
            return res.status(400).json({
                message:"Image is Required!",
                success:false
            });
        }
        const optimizedimage=await sharp(image.buffer).resize({width:500,height:500, fit:'inside'}).toFormat('jpeg',{quality:80}).toBuffer();
        const fileuri=`data:image/jpeg;base64,${optimizedimage.toString('base64')}`;
        const cloudresponse=await cloudinary.uploader.upload(fileuri);
        const post =await Post.create({
            caption,
            image:cloudresponse.secure_url,
            author:authorId            
        });
        const user = await User.findById(authorId);
        if(user){
            user.posts.push(post._id);
            await user.save();
        }
        await post.populate({path:'author',select:'-password'});
        return res.status(200).json({
            message:"Post Created Successfully!",
            success:true,
            post
        })
    }
    catch(error){
        console.log(error);
    }
}
export const getallpost=async(req,res)=>{
    try{
        const posts=await Post.find().sort({createdAt:-1})
        .populate({path:'author',select:'username,profilepic'})
        .populate({path:'comments',sort:{createdAt:-1},populate:{path:'author',select:'username,profilepic'}});
        return res.status(200).json({
            message:"All Posts!",
            success:true,
            posts
        })
    }
    catch(error){
        console.log(error);
    }
};
export const getuserpost=async(req,res)=>{
try {
    const authorId=req.id;
    const posts=await Post.find({author:authorId}).sort({createdAt:-1})
    .populate({path:'author',select:'username,profilepic'})
    .populate({path:'comments',sort:{createdAt:-1},populate:{path:'author',select:'username,profilepic'}});
return res.status(200).json({
    message:"User Posts!",
    success:true,
    posts
})
} catch (error) {
  console.log(error);  
}
}
export const likepost=async(req,res)=>{
    try {
        const likekarnevalaId=req.id;
        const postId=req.params.id;
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                message:"Post Not Found!",
                success:false
            });
        }
        await post.updateOne({$addToSet:{likes:likekarnevalaId}});
        await post.save();


        // socketio
        return res.status(200).json({
            message:"Post Liked!",
            success:true
        });
    } catch (error) {
        
    }
}
export const dislikepost=async(req,res)=>{
    try {
        const likekarnevalaId=req.id;
        const postId=req.params.id;
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                message:"Post Not Found!",
                success:false
            });
        }
        await post.updateOne({$pull:{likes:likekarnevalaId}});
        await post.save();


        // socketio
        return res.status(200).json({
            message:"Post DisLiked!",
            success:true
        });
    } catch (error) {
        
    }
}
export const addcomment=async(req,res)=>{
    try {
        const postId=req.params.id;
        const {text}=req.body;
        const commentkarnevalaId=req.id;
        const post=await Post.findById(postId);  
        
        if(!text){
            return res.status(400).json({
                message:"Text is Required!",
                success:false
            });
        }
        const comment=await Comment.create({
        text,
        post:postId,
        author:commentkarnevalaId    
        }).populate({
            path:'author',
            select:"username, profilepic"
        });     
        post.comments.push(comment._id);
        await post.save();
        return res.status(200).json({
            message:"Comment Added!",
            success:true,
            comment
        });
    } catch (error) {
        console.log(error);
    }
}
export const getcommentofpost=async(req,res)=>{
    try {
        const postId=req.params.id;
        const comments=await Comment.find({post:postId}).sort({createdAt:-1})
        .populate({path:'author',select:'username,profilepic'});
        if(!comments){
            return res.status(404).json({
                message:"No Comments Found!",
                success:false
            });
        }
        return res.status(200).json({
            message:"Comments Found!",
            success:true,
            comments
        });
    } catch (error) {
        console.log(error);
    }
}
export const deletepost=async(req,res)=>{
    try {
        const postId=req.params.id;
        const authorId=req.id;
        const post =await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                message:"Post Not Found!",
                success:false
            });
        }
        if(post.author.toString()!== authorId.toString()){
            return res.status(403).json({
                message:"You are not authorized to delete this post!",
                success:false
            });
        }
        await Post.findByIdAndDelete(postId);
        let user=await User.findById(authorId);
        user.posts=user.posts.filter(id=> id.toString()!==postId);
        await user.save();

        await Comment.deleteMany({post:postId});
        return res.status(200).json({
            message:"Post Deleted!",
            success:true
        });

    } catch (error) {
        console.log(error);
    }
}
export const bookmarkpost=async(req,res)=>{
    try {
        const postId=req.params.id;
        const authorId=req.id;
        const post =await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                message:"Post Not Found!",
                success:false
            });
        }
        const user=await User.findById(authorId);
        if(user.bookmarks.includes(postId)){
            await user.updateOne({$pull:{bookmarks:postId}});
            await user.save();
            return res.status(200).json({
                type:"unbookmark",
                message:"Post Unbookmarked!",
                success:true
            });
        }
        else{
            await user.updateOne({$addToSet:{bookmarks:postId}});
            await user.save();
            return res.status(200).json({
                type:"bookmark",
                message:"Post Bookmarked!",
                success:true
            });
        }
    } catch (error) {
        console.log(error);
    }
}
