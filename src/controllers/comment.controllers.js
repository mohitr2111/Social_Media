import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { app } from "../app.js";
import mongoose from "mongoose";

// todo
// addCommentsOnPlaylist

const addCommentsOnVideo = asyncHandler(async(req, res)=>{
    // get video id
    // get user id
    // get the content
    // validate
    // 

    const {content} = req.body;
    const user = req.user;
    const video_Id = req.params?.video_id || "";

    if(!content?.trim()){
        throw new ApiError(400, "content is required")
    }
    if(!video_Id){
        throw new ApiError(400, "video_id is required")
    }
    if(!user){
        throw new ApiError(400, "You need a Account to comment on video, SignUp or LogIn")
    }

    const video = await Video.findById(video_Id);
    if(!video){
        throw new ApiError(404, "video doesn't exist")
    }

    const createdComment = await Comment.create({
        content,
        video: video._id,
        owner: user._id,
    })

    // const createdComment = await Comment.findById(newComment._id);
    if(!createdComment){
        throw new ApiError(500, "Something went wrong while creating comment object")
    }

    res
    .status(201)
    .json(new ApiResponse(201,createdComment,"Comment is successfully created"))
});

const addCommentsOnPost = asyncHandler(async(req, res)=>{
    // get video id
    // get user id
    // get the content
    // validate
    // 

    const {content} = req.body;
    const user = req.user;
    const post_Id = req.params?.post_id || "";

    if(!content?.trim()){
        throw new ApiError(400, "content is required")
    }
    if(!post_Id){
        throw new ApiError(400, "post_id is required")
    }
    if(!user){
        throw new ApiError(400, "You need a Account to comment on Post, SignUp or LogIn")
    }

    const post = await Post.findById(post_Id);
    if(!post){
        throw new ApiError(404, "post doesn't exist")
    }

    const createdComment = await Comment.create({
        content,
        post: post._id,
        owner: user._id,
    })

    // const createdComment = await Comment.findById(newComment._id);
    if(!createdComment){
        throw new ApiError(500, "Something went wrong while creating comment object")
    }

    res
    .status(201)
    .json(new ApiResponse(201,createdComment,"Comment is successfully created"))
});

const addCommentsOnPlaylist = asyncHandler(async(req, res)=>{
    // get video id
    // get user id
    // get the content
    // validate
    // 

    const {content} = req.body;
    const user = req.user;
    const playlist_Id = req.params?.playlist_id || "";

    if(!content?.trim()){
        throw new ApiError(400, "content is required")
    }
    if(!playlist_Id){
        throw new ApiError(400, "playlist_id is required")
    }
    if(!user){
        throw new ApiError(400, "You need a Account to comment on playlist, SignUp or LogIn")
    }

    const playlist = await Playlist.findById(playlist_Id);
    if(!playlist){
        throw new ApiError(404, "playlist doesn't exist")
    }

    const createdComment = await Comment.create({
        content,
        playlist: playlist._id,
        owner: user._id,
    })

    // const createdComment = await Comment.findById(newComment._id);
    if(!createdComment){
        throw new ApiError(500, "Something went wrong while creating comment object")
    }

    res
    .status(201)
    .json(new ApiResponse(201,createdComment,"Comment is successfully created"))
});

const addCommentOnComment = asyncHandler(async (req, res)=>{
    // get comment id
    // user
    //content
    //validate
    // get comment level
    // create
    // check whether created or not
    //res

    const {content} = req.body;
    const comment_Id = req.params?.comment_id;
    const user = req.user;

    if(!content?.trim()){
        throw new ApiError(400, "content is required")
    }
    if(!comment_Id){
        throw new ApiError(400, "comment id is required")
    }
    if(!user){
        throw new ApiError(400, "You need a Account to reply on commment, SignUp or LogIn")
    }

    const parentComment = await Comment.findById(comment_Id);
    if(!parentComment){
        throw new ApiError(404, "Parent Comment not found")
    }

    const createdComment = await Comment.create({
        content,
        owner: user._id,
        parentComment: parentComment._id,
        commentLevel: parentComment.commentLevel + 1,
        video: parentComment.video,
        post: parentComment.post,
        playlist:parentComment.playlist
    })

    // const createdComment = await Comment.findById(newComment._id)

    if(!createdComment){
        throw new ApiError(500, "something went wrong while creating comment")
    }

    res
    .status(201)
    .json(new ApiResponse(201, createdComment, "comment is successfully created"))
});

// update comment

const updateComment = asyncHandler(async(req, res)=>{
    // get user
    // get comment_id
    // get new content
    // validate
    // does this comment even exist
    // is user authorized to edit comment
    // update the comment
    // use save to call pre hook validate 
    // res
    
    const {newContent} = req.body;
    const user = req.user;
    const comment_Id = req.params?.comment_id;
    
    if(!newContent?.trim()){
        throw new ApiError(400, "Content is required")
    }
    if(!comment_Id){
        throw new ApiError(400, "Comment Id is required")
    }
    if(!user){
        throw new ApiError(400, "You need to be Loggined,  LogIn")
    }
    
    const comment = await Comment.findById(comment_Id);
    if(!comment){
        throw new ApiError(404, "Comment not found ")
    }
    
    if(user._id.toString() !== comment.owner.toString()){
        throw new ApiError(403, "User is not Authorized to edit this comment")
    }
    
    comment.content = newContent;
    
    await comment.save();
    
    res
    .status(200)
    .json(new ApiResponse(200, comment, "content of comment updated successfully"))
});

// get all reply of comment 

const getCommentReplies = asyncHandler(async(req, res)=>{
    // get comment_id
    // validate
    // apply aggregate pipelines
    // return the response

    const comment_Id = req.params?.comment_id;
    if(!comment_Id){
        throw new ApiError(400, "Comment Id is required")
    }
    const comment = await Comment.findById(comment_Id);
    if(!comment){
        throw new ApiError(404, "comment not found")
    }

    const replies = await Comment.find({parentComment:comment._id})
    .populate("owner", "avatar username")
    .sort({Created : -1})

    res
    .status(200)
    .json(new ApiResponse(200, replies, "comment replies are fetched"))
});

export {
    addCommentsOnVideo,
    addCommentsOnPost,
    addCommentsOnPlaylist,
    addCommentOnComment,
    updateComment,
    getCommentReplies
};

