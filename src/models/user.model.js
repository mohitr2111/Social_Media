import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    fullname:{
        type:String,
        required:true,
        index:true,
        trim:true,
        // lowercase:true
    },
    avtar:{
        type:String,//cloudinary
        required:true,
        // unique:true,
        // trim:true,
        // lowercase:true
    },
    coverImage:{
        type:String,
        required:true,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type:String,
        required:[true, "Password is required"]
    },
    refreshToken:{
        type: String
    }
},{
     timestamps:{
        createdAt: "Cretaed",
        updatedAt: "Updated"
     }
}
)

export const user = mongoose.model("user",userSchema)