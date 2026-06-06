import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose.Schema(
    {
        videoFile:{
            url:{
                type: String,
                required:true,
                unique: true
            },
            public_id:{
                type: String,
                required:true,
                unique: true
            }
        },
        thumbnail:{
            url:{
                type: String,
                required:true
            },
            public_id:{
                type: String,
                required:true
            }
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
        isListed:{
            type:Boolean,
            default: true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref: "User",
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