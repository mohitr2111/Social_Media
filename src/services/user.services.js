import { asyncHandler } from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import { channel, hasSubscribers, subscribe } from "diagnostics_channel"
import { Video } from "../models/video.model.js"
import { title } from "process"


// get user details
const userDetailsServices = async(username)=>{
    const channelOwner = await User.aggregate([
        {
            $match :{
                username : username?.toLowerCase()
            }
        },
        {
            $project:{
                username : 1,
                fullname : 1,
                "avatar.url" : 1,
                "coverImage.url" : 1
            }
        }
    ])

    return channelOwner;
}
// get user details and stats
const userDetailsAndStatsServices = async(username, user)=>{
    if(!username)return null;

    const loggedInUserId = user?._id? new mongoose.Types.ObjectId(user._id) : null;

    const channelStats = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup :{
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
            }
        },
        {
            $lookup :{
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $lookup : {
                from : "videos",
                let : {userId : "$_id"},
                pipeline:[
                    {
                        $match : {
                            $expr : {$eq : ["$owner", "$$userId"]},
                            isListed : true
                        }
                    }
                ],
                as : "videos",
            }
        },
        {
            $lookup : {
                from : "posts",
                localField : "_id",
                foreignField : "owner",
                as : "posts"
            }
        },
        {
            $lookup : {
                from : "playlists",
                let : {userId : "$_id"},
                pipeline : [
                    {
                        $match :{
                            $expr : {$eq : ["$owner", "$$userId"]},
                            isPublic : true
                        }
                    }
                ],
                as : "playlists",
            }
        },
        {
            $addFields :{
                subscribersCount :{
                    $size :"$subscribers"
                },
                subscribedToCount :{
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond : {    
                        if :{$in : [loggedInUserId, "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                },
                videosCount : {
                    $size : "$videos"
                },
                postsCount : {
                    $size : "$posts"
                },
                playlistsCount : {
                    $size : "$playlists"
                }
            }
        },
        {
            $project :{
                username : 1,
                fullname : 1,
                "avatar.url" : 1,
                "coverImage.url" : 1,
                subscribersCount : 1,
                subscribedToCount : 1,
                isSubscribed : 1,
                videosCount : 1,
                postsCount : 1,
                playlistsCount : 1,
            }

        }
    ])
    const returnObj = channelStats[0] || null;
    return returnObj;
}

// star video top 10 most watched videos of the channel
const starVideosServices = async(username)=>{
    
    const channelStarVideos = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "videos",
                let : {userId : "$_id"},
                pipeline:[
                    {
                        $match : {
                            $expr : { $eq : ["$owner", "$$userId"]},
                            isListed : true
                        }
                    },
                    {
                        $sort : {views : -1}
                    },
                    {
                        $limit : 10
                    },
                    {
                        $project : {
                            _id : 1,
                            "thumbnail.url": 1,
                            views: 1,
                            title: 1,
                            createdAt: 1
                        }
                    }
                ],
                as : "videos"
            }
        },
        {
            $project : {
                owner: {
                    channelName: "$fullname",
                    channelUsername: "$username"
                },
                videos: 1
            }
        }
    ]) 

    const returnObj = channelStarVideos[0] || null;

    return returnObj;
}

const starPostsServices = async(username, user)=>{
    if(!username)return null;

    const loggedInUserId = user?._id 
        ? new mongoose.Types.ObjectId(user._id) 
        : null;

    const channelStarPosts = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "posts",
                let : {userId : "$_id"},
                pipeline : [
                    {
                        $match : {
                            $expr : {$eq : ["$owner", "$$userId"]},
                        }
                    },
                    {
                        $lookup : {
                            from : "likes",
                            localField : "_id",
                            foreignField : "onPost",
                            as : "reactions",
                            pipeline : [
                                {
                                    $project :{
                                        _id : 0,
                                        owner : 1,
                                        // value =1 like, value = -1 dislike, value = 0 nothing
                                        value : 1
                                    }
                                }
                            ]

                        }
                    },
                    {
                        $lookup : {
                            from : "comments",
                            localField : "_id",
                            foreignField : "post",
                            as : "comments",
                        },
                    },
                    {
                        $addFields : {
                            commentsCount : {
                                $size : "$comments"
                            },
                            likesCount : {
                                $size : {
                                    $filter : {
                                        input : "$reactions",
                                        as : "react",
                                        cond :{
                                            $eq : ["$$react.value", 1]
                                        }
                                    }
                                }
                            },
                            dislikesCount : {
                                $size : {
                                    $filter : {
                                        input : "$reactions",
                                        as : "react",
                                        cond : {$eq : ["$$react.value", -1]}
                                    }
                                }
                            },
                            userReaction : {
                                $arrayElemAt : [
                                    {
                                        $filter : {
                                            input : "$reactions",
                                            as : "react",
                                            cond : { $eq : ["$$react.owner", loggedInUserId]}
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    },
                    {
                        $addFields : {
                            currUserReaction : {
                                $ifNull : ["$userReaction.value", 0]
                            },
                            firstImage : {
                                $arrayElemAt : ["$images", 0]
                            }
                        }
                    },
                    {
                        $sort : {likesCount : -1}
                    },
                    {
                        $limit : 10
                    },
                    {
                        $project : {
                            _id : 1,
                            content : 1,
                            image :"$firstImage.url",
                            likesCount : 1,
                            dislikesCount : 1,
                            commentsCount : 1,
                            currUserReaction : 1,
                            createdAt : 1
                        }
                    }
                ],
                as: "posts",
            }
        },
        {
            $project : {
                _id : 0,
                owner : {
                    channelName : "$fullname",
                    avatar : "$avatar.url"
                },
                posts : 1
            }
        }
    ])

    return channelStarPosts[0] || null;
}

const starPlaylistsServices = async(username)=>{
    if(!username)return null;

    const channelStarPlaylist = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "playlists",
                let : {userId : "$_id"},
                pipeline : [
                    {
                        $match : {
                            $expr : { $eq : ["$owner", "$$userId"]},
                            isPublic : true
                        }
                    },
                    {
                        $lookup : {
                            from : "likes",
                            localField : "_id",
                            foreignField : "onPlaylist",
                            pipeline : [
                                {
                                    $project : {
                                        _id : 0,
                                        owner : 1,
                                        value : 1
                                    }
                                }
                            ],
                            as : "reactions"
                        }
                    },
                    {
                        $addFields : {
                            likesCount : {
                                $size : {
                                    $filter : {
                                        input : "$reactions",
                                        as : "react",
                                        cond : {
                                            $eq : ["$$react.value" , 1]
                                        }
                                    }
                                }
                            },
                            dislikesCount : {
                                $size : {
                                    $filter : {
                                        input : "$reactions",
                                        as : "react",
                                        cond : {
                                            $eq : ["$$react.value" , -1]
                                        }
                                    }
                                }
                            },
                        }
                    },
                    {
                        $sort : {likesCount : -1}
                    },
                    {
                        $limit : 6
                    },
                    {
                        $lookup : {
                            from : "videos",
                            localField : "videos",
                            foreignField : "_id",
                            pipeline : [
                                {
                                    $project : {
                                        _id : 1,
                                        "thumbnail.url" : 1,
                                        title : 1,
                                        duration : 1,
                                        views : 1,
                                        createdAt : 1
                                    }
                                }
                            ],
                            as : "videos"
                        }
                    },
                    {
                        $addFields :{
                            firstVideo : {
                                $arrayElemAt : ["$videos", 0]
                            }
                        }
                    },
                    {
                        $project : {
                            _id : 1,
                            title : 1,
                            description : 1,
                            playlistThumbnailURL : "$firstVideo.thumbnail.url",
                            likesCount : 1,
                            videos : 1
                        }
                    }
                ],
                as : "playlists"
            }
        },
        {
            $project : {
                owner : {
                    channelName : "$fullname",
                    channelUsername : "$username"
                },
                playlists : 1
            }
        }
    ]);

    return channelStarPlaylist[0] || null;
}
export {
    userDetailsServices,
    userDetailsAndStatsServices,
    starVideosServices,
    starPostsServices,
    starPlaylistsServices
}