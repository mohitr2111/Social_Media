import mongoose, { Schema } from "mongoose";

const playlistSchema = new mongoose.Schema(
    {
        owner:{
            type : Schema.Types.ObjectId,
            ref: "User",
            required : true
        },
        isPublic:{
            type : Boolean,
            default : true
        },
        videos:[
            {
                type : Schema.Types.ObjectId,
                ref: "Video"
            }
        ]
    },
    {
        timestamps:{
            createdAt:true,
            updatedAt:true
        }
    }
)

export const Playlist = mongoose.model("Playlist", playlistSchema);