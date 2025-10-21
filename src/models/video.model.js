import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose.Schema(
    {
        videoFile:{
            type:String,//cloudinary
            required: true
        },
        thumbnail:{
            type:String,
            required: true
        },
        description:{
            type:String,
            required: true
        },
        title:{
            type:String,
            required: true
        },
        duration:{
            type:Number,//cloudinary
            required: true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default: true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref: "user",
            required: true
        }
    },
    {
        timestamps:{
            createdAt: "Created",
            updatedAt: "Updated"
        }
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)