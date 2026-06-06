import mongoose, { Schema } from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        user:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true            
        },
        onVideo: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        onComment:{
            type : Schema.Types.ObjectId,
            ref: "Comment"
        },
        onPost:{
            type : Schema.Types.ObjectId,
            ref: "Post"
        }
    },
    {
        timestamps:{
            createdAt:true
        }
    }
)

export const Likes = mongoose.model("Likes", likeSchema);