import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiRes.js";



const subscribeChannel = asyncHandler(async(req, res)=>{
    // get the subscriber(who is subscribing) details
    // get the channel details
    // 

    const subscriber = req.user._id;
    const channel_from_params = req.params?.username;

    if(!subscriber){
        throw new ApiError(400, "Login from your account to Subscribe")
    }
    if(!channel_from_params){
        throw new ApiError(400, "username of channel is required")
    }

    const channel = await Video.findOne({
        username:channel_from_params
    })

    if(!channel){
        throw new ApiError(404, "Channel not found") 
    }

    const createdSubscription = await Subscription.create(
        subscriber,
        channel
    )

    // const createdSubscription = await Subscription.findById(newSubscription._id)

    if(!createdSubscription){
        throw new ApiError(500, "Something went wrong while Subscribing, Try Again!!")
    }

    res
    .status(201)
    .json(new ApiResponse(201, createdSubscription, "user has successfully subscribed to channel"))

}) 

export {
    subscribeChannel
};
