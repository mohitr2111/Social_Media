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
    const channel_from_params = req.params?.channel_username;

    if(!subscriber){
        throw new ApiError(400, "login from your account to Subscribe")
    }
    if(!channel_from_params){
        throw new ApiError(400, "username of channel is required")
    }

    const channel = await User.findOne({
        username:channel_from_params
    })

    if(!channel){
        throw new ApiError(404, "Channel not found") 
    }

    const alreadyExisting  = await Subscription.findOne({
        subscriber: subscriber._id,
        channel: channel._id
    })

    if(alreadyExisting){
        throw new ApiError(400, "subscription object already exist")
    }

    const createdSubscription = await Subscription.create({
        subscriber,
        channel
    })

    // const createdSubscription = await Subscription.findById(newSubscription._id)

    if(!createdSubscription){
        throw new ApiError(500, "Something went wrong while Subscribing, Try Again!!")
    }

    res
    .status(201)
    .json(new ApiResponse(201, createdSubscription, "user has successfully subscribed to channel"))

}); 


const checkSubscriptionStatus = asyncHandler(async(req,res)=>{
    // 
    const user = req.user;
    const channel_from_params = req.params?.channel_username;
    if(!user){
        throw new ApiError(400, "you need to be logged in")
    }
    if(!channel_from_params){
        throw new ApiError(400, "channel username is required")
    }

    const channel = await User.findOne({
        username:channel_from_params
    })

    if(!channel){
        throw new ApiError(404, "Channel not found") 
    }

    const isSubscribed = await Subscription.findOne({
        subscriber : user._id,
        channel : channel._id
    })

    // let val = true;

    // if(!isSubscribed){
    //     val = false;
    // }

    const val = !! isSubscribed
    
    res.status(200).json(new ApiResponse(200, {isSubscribed:val}, "data fetched successfully"))
});

const getChannelSubscribers = asyncHandler(async(req, res)=>{

    const channel_id  = req.params?.channel_id;
    
    if(!channel_id){
        throw new ApiError(400, "channel id is required")
    }

    const stats = await Subscription.find({
        channel : channel_id
    }).populate("subscriber", "_id username fullname avatar")


    const ans = {
        subscriberCount : stats.length ?? 0,
        subscribers : stats.map(ele => ele.subscriber)
    }

    res
    .status(200)
    .json(new ApiResponse(200, ans, "subscriber data fetched"))
    
});

const getUserSubscriptions = asyncHandler(async(req, res)=>{
    const user_id = req.params?.user_id

    if(!user_id){
        throw new ApiError(400, "user id is required")
    }
    
    const stats = await Subscription.find({
        subscriber:user_id
    }).populate("channel", "username fullname avatar")
    
    const ans = {
        subscriptionCount : stats.length ?? 0,
        channels : stats.map(ele => ele.channel)
    }
    
    res
    .status(200)
    .json(new ApiResponse(200, ans, "subscription data fetched"))
});



export {
    subscribeChannel,
    checkSubscriptionStatus,
    getChannelSubscribers,
    getUserSubscriptions

};
