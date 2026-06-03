import mongoose, { schemma } from 'mongoose';

const commentSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: "Video",
        required:true
    },
    Owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },

    // replied to directly video or to a comment on that video 
    
    parentComment:{
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    commentLevel:{
        type:Number,
        default:1
    }
},{
    timestamps:{
        createdAt: "Created",
        updatedAt: "Updated"
    }
})

export const Comment = mongoose.model("Comment",commentSchema)