import mongoose, {Schema} from "mongoose";

const postSchema  = new mongoose.Schema(
    {
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required : true
        },
        content:{
            type: String,
            required: true
        },

        // wrong syntax for custom validate 
        // you have to use type in case of custom validate
        // images:[{
        //     url:String,
        //     publicId:String,
        //     validate:{
        //         validator: function(){

        //         },
        //         message:""
        //     }
        // }]

        
        images:{
            type:[{
                url : String,
                public_id : String
            }],
            validate : {
                validator : function(arr){
                    return arr.length <=12;
                },
                message : "You can only post maximumm of 12 images"
            }
        }
    },
    {
        timestamps:{
            createdAt:true,
            updatedAt:true
        }
    }
)

export const Post = mongoose.model("Post", postSchema);