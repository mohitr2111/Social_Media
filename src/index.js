// require('dotenv').config({path:'./.env'})
import dotenv from "dotenv"

dotenv.config({
    path:'./.env'
})
import connectDB from "./db/index.js"
import "./models/comment.model.js"
import "./models/like.model.js"
import "./models/subscription.model.js"
import "./models/user.model.js"
import "./models/video.model.js"
import "./models/playlist.model.js"
import "./models/post.model.js"
import {app} from "./app.js" 
console.log("Loaded MONGODB_URI:", process.env.MONGODB_URI);

connectDB()
.then(()=>{
    app.on("error",()=>{
        console.log("ERROR connected successfully but cannot be able to talk to DB",error);
            throw error
    })
    app.listen(process.env.PORT,
        ()=>{
            console.log(`server is running at port: ${process.env.PORT}`)
        }
    )
})
.catch((err)=>{
    console.log(`MONGODB connection failed in the catch block !! ${err}`)
})


/*
//THIS IS CODE IN INDEX JS TO CONNECT DB AND ALSO HANDLING ALL THE ERRORS 

import express from "express"
const app = express();

;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("ERROR connected successfully but cannot be able to talk to DB",error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening to port ${process.env.PORT}`)
        })

    }catch(error){
        console.log("Error: ", error)
        throw err
    }
})()

*/

