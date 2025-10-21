// require('dotenv').config({path:'./.env'})
import connectDB from "./db/index.js"
import dotenv from "dotenv"
import express from "express"
const app = express(); 

dotenv.config({
    path:'./.env'
})
console.log("Loaded MONGODB_URI:", process.env.MONGODB_URI);

connectDB()
.then(()=>{
    app.on("error",()=>{
        console.log("ERROR connected successfully but cannot be able to talk to DB",error);
            throw error
    })
    app.listen(process.env.PORT||8000,
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

