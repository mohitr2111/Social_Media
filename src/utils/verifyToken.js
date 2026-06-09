import  jwt  from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { asyncHandler } from "./asyncHandler.js"

const verifyToken = async(token)=>{
    try {
    
        const decodedToken = await jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )
    
        const _user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!_user){
            throw new Error("Invalid access token or user does not exist");
        }
        
        return _user; 
    } catch (error) {
        console.log("User verification failed:", error.message)
        return null;
    }
}

export { verifyToken};
