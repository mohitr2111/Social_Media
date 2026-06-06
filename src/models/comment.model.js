import mongoose, { Schema } from 'mongoose';

const commentSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
    post:{
        type: Schema.Types.ObjectId,
        ref:"Post"
    },
    owner:{
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

commentSchema.pre("validate", async function(next){
    if(!this.isModified("video") && !this.isModified("post")) return next();
    const hasPost = !!this.post;
    const hasVideo = !!this.video;
    if(hasPost === hasVideo){
        return next(
            new Error(
                "Comment must belong to either a video or a post"
            )
        )
    }

    next();
})

export const Comment = mongoose.model("Comment",commentSchema)

