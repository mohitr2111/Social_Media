import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { Playlist } from "../models/playlist.model.js";

const toggledValue = (existingVal, newVal) => {
    if (existingVal === newVal) {
        return 0;
    }

    return newVal;
};

const reactToVideo = asyncHandler(async (req, res) => {
    // mandatory user
    // video from params
    // get value 1(like button pressed) || -1(dislike button pressed)
    // search for unique combo of user and video by indexing
    //toggle the value

    const user = req.user;
    const video_id = req.params?.video_id;
    const { value } = req.body;

    if (!user) {
        throw new ApiError(400, "You need to be loggedin first ");
    }
    if (!video_id) {
        throw new ApiError(400, "Video id is required");
    }
    if (value != 1 && value != -1) {
        throw new ApiError(400, "value is required with correct logic");
    }

    const video = await Video.findById(video_id);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    // search for existing user and video combo in like collection
    let existingLike = await Like.findOne({
        owner: user._id,
        onVideo: video._id,
    });

    // exsisting :  0   0   1   1   -1  -1
    // value     :  1  -1   1  -1    1  -1
    // reult     :  1   -1  0  -1    1   0

    if (existingLike) {
        existingLike.value = toggledValue(existingLike.value, value);
        await existingLike.save();

        res.status(200).json(
            new ApiResponse(
                200,
                existingLike,
                "New value is changed successfully"
            )
        );

        return;
    }

    const newLike = await Like.create({
        owner: user._id,
        onVideo: video._id,
        value,
    });

    if (!newLike) {
        throw new ApiError(
            500,
            "Something went wrong while creating like object, try again"
        );
    }

    res.status(201).json(
        new ApiResponse(
            201,
            newLike,
            "Like object is create successfully for this user and video pair"
        )
    );
});

const reactToPost = asyncHandler(async (req, res) => {
    // mandatory user
    // Post from params
    // get value 1(like button pressed) || -1(dislike button pressed)
    // search for unique combo of user and post by indexing
    //toggle the value

    const user = req.user;
    const post_id = req.params?.post_id;
    const { value } = req.body;

    if (!user) {
        throw new ApiError(400, "You need to be loggedin first ");
    }
    if (!post_id) {
        throw new ApiError(400, "Post id is required");
    }
    if (value != 1 && value != -1) {
        throw new ApiError(400, "value is required with correct logic");
    }

    const post = await Post.findById(post_id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }
    // search for existing user and post combo in like collection
    let existingLike = await Like.findOne({
        owner: user._id,
        onPost: post._id,
    });

    // exsisting :  0   0   1   1   -1  -1
    // value     :  1  -1   1  -1    1  -1
    // reult     :  1   -1  0  -1    1   0

    if (existingLike) {
        existingLike.value = toggledValue(existingLike.value, value);
        await existingLike.save();

        res.status(200).json(
            new ApiResponse(
                200,
                existingLike,
                "New value is changed successfully"
            )
        );

        return;
    }

    const newLike = await Like.create({
        owner: user._id,
        onPost: post._id,
        value,
    });

    if (!newLike) {
        throw new ApiError(
            500,
            "Something went wrong while creating like object, try again"
        );
    }

    res.status(201).json(
        new ApiResponse(
            201,
            newLike,
            "Like object is create successfully for this user and post pair"
        )
    );
});

const reactToComment = asyncHandler(async (req, res) => {
    // mandatory user
    // comment from params
    // get value 1(like button pressed) || -1(dislike button pressed)
    // search for unique combo of user and comment by indexing
    //toggle the value

    const user = req.user;
    const comment_id = req.params?.comment_id;
    const { value } = req.body;

    if (!user) {
        throw new ApiError(400, "You need to be loggedin first ");
    }
    if (!comment_id) {
        throw new ApiError(400, "comment id is required");
    }
    if (value != 1 && value != -1) {
        throw new ApiError(400, "value is required with correct logic");
    }

    const comment = await Comment.findById(comment_id);

    if (!comment) {
        throw new ApiError(404, "comment not found");
    }
    // search for existing user and comment combo in like collection
    let existingLike = await Like.findOne({
        owner: user._id,
        onComment: comment._id,
    });

    // exsisting :  0   0   1   1   -1  -1
    // value     :  1  -1   1  -1    1  -1
    // reult     :  1   -1  0  -1    1   0

    if (existingLike) {
        existingLike.value = toggledValue(existingLike.value, value);
        await existingLike.save();

        res.status(200).json(
            new ApiResponse(
                200,
                existingLike,
                "New value is changed successfully"
            )
        );

        return;
    }

    const newLike = await Like.create({
        owner: user._id,
        onComment: comment._id,
        value,
    });

    if (!newLike) {
        throw new ApiError(
            500,
            "Something went wrong while creating like object, try again"
        );
    }

    res.status(201).json(
        new ApiResponse(
            201,
            newLike,
            "Like object is create successfully for this user and comment pair"
        )
    );
});

const reactToPlaylist = asyncHandler(async (req, res) => {
    // mandatory user
    // playlist from params
    // get value 1(like button pressed) || -1(dislike button pressed)
    // search for unique combo of user and playlist by indexing
    //toggle the value

    const user = req.user;
    const playlist_id = req.params?.playlist_id;
    const { value } = req.body;

    if (!user) {
        throw new ApiError(400, "You need to be loggedin first ");
    }
    if (!playlist_id) {
        throw new ApiError(400, "playlist id is required");
    }
    if (value != 1 && value != -1) {
        throw new ApiError(400, "value is required with correct logic");
    }

    const playlist = await Playlist.findById(playlist_id);

    if (!playlist) {
        throw new ApiError(404, "playlist not found");
    }
    // search for existing user and playlist combo in like collection
    let existingLike = await Like.findOne({
        owner: user._id,
        onPlaylist: playlist._id,
    });

    // exsisting :  0   0   1   1   -1  -1
    // value     :  1  -1   1  -1    1  -1
    // reult     :  1   -1  0  -1    1   0

    if (existingLike) {
        existingLike.value = toggledValue(existingLike.value, value);
        await existingLike.save();

        res.status(200).json(
            new ApiResponse(
                200,
                existingLike,
                "New value is changed successfully"
            )
        );

        return;
    }

    const newLike = await Like.create({
        owner: user._id,
        onPlaylist: playlist._id,
        value,
    });

    if (!newLike) {
        throw new ApiError(
            500,
            "Something went wrong while creating like object, try again"
        );
    }

    res.status(201).json(
        new ApiResponse(
            201,
            newLike,
            "Like object is create successfully for this user and playlist pair"
        )
    );
});

const getVideoReaction = asyncHandler(async (req, res) => {
    // get video id
    // get user 
    // validate
    // find video
    // agregate pipeline to get video reaction
    // count like object with value 1 and -1

    const video_id = req.params?.video_id;
    const user = req.user;

    if (!video_id) {
        throw new ApiError(400, "video id is required");
    }

    const video = await Video.findById(video_id);

    if (!video) {
        throw new ApiError(404, "video not found");
    }
    let urx = undefined
    if(user){
        urx = await Like.findOne({onVideo:video._id, owner:user._id})
    }

    // const likesData = await Like.find({
    //     onVideo:video._id,
    //     value:1
    //  })
    // const dislikesData = await Like.find({
    //     onVideo:video._id,
    //     value:-1
    //  })
    // const resetData = await Like.find({
    //     onVideo:video._id,
    //     value:0
    //  })

    const stats = await Like.aggregate([
        {
            $match: {
                onVideo: video._id,
            },
        },
        {
            $group: {
                _id: "$value",
                count: { $sum: 1 },
            },
        },
    ]);

    const number_of_likes = stats.find((ele) => ele._id === 1)?.count || 0;
    const number_of_dislikes = stats.find((ele) => ele._id === -1)?.count || 0;
    const number_of_reset = stats.find((ele) => ele._id === 0)?.count || 0;
    const total_reaction = number_of_dislikes + number_of_likes + number_of_reset;
    const retObj = {
        likes : number_of_likes,
        dislikes : number_of_dislikes,
        rxn : total_reaction,
        userRxn: urx?.value ?? 0
    }
    res.status(200).json(new ApiResponse(200, retObj, "video reaction data fetched successfully"));
});

const getPostReaction = asyncHandler(async (req, res) => {
    // get post id
    // get user 
    // validate
    // find post
    // agregate pipeline to get post reaction
    // count like object with value 1 and -1

    const post_id = req.params?.post_id;
    const user = req.user;

    if (!post_id) {
        throw new ApiError(400, "post id is required");
    }

    const post = await Post.findById(post_id);

    if (!post) {
        throw new ApiError(404, "post not found");
    }
    let urx = undefined
    if(user){
        urx = await Like.findOne({onPost:post._id, owner:user._id})
    }

    // const likesData = await Like.find({
    //     onpost:post._id,
    //     value:1
    //  })
    // const dislikesData = await Like.find({
    //     onpost:post._id,
    //     value:-1
    //  })
    // const resetData = await Like.find({
    //     onpost:post._id,
    //     value:0
    //  })

    const stats = await Like.aggregate([
        {
            $match: {
                onPost: post._id,
            },
        },
        {
            $group: {
                _id: "$value",
                count: { $sum: 1 },
            },
        },
    ]);

    const number_of_likes = stats.find((ele) => ele._id === 1)?.count || 0;
    const number_of_dislikes = stats.find((ele) => ele._id === -1)?.count || 0;
    const number_of_reset = stats.find((ele) => ele._id === 0)?.count || 0;
    const total_reaction = number_of_dislikes + number_of_likes + number_of_reset;
    const retObj = {
        likes : number_of_likes,
        dislikes : number_of_dislikes,
        rxn : total_reaction,
        userRxn: urx?.value ?? 0
    }
    res.status(200).json(new ApiResponse(200, retObj, "post reaction data fetched successfully"));
});

const getCommentReaction = asyncHandler(async (req, res) => {
    // get comment id
    // get user 
    // validate
    // find comment
    // agregate pipeline to get comment reaction
    // count like object with value 1 and -1

    const comment_id = req.params?.comment_id;
    const user = req.user;

    if (!comment_id) {
        throw new ApiError(400, "comment id is required");
    }

    const comment = await Comment.findById(comment_id);

    if (!comment) {
        throw new ApiError(404, "comment not found");
    }
    let urx = undefined
    if(user){
        urx = await Like.findOne({onComment:comment._id, owner:user._id})
    }

    // const likesData = await Like.find({
    //     oncomment:comment._id,
    //     value:1
    //  })
    // const dislikesData = await Like.find({
    //     oncomment:comment._id,
    //     value:-1
    //  })
    // const resetData = await Like.find({
    //     oncomment:comment._id,
    //     value:0
    //  })

    const stats = await Like.aggregate([
        {
            $match: {
                onComment: comment._id,
            },
        },
        {
            $group: {
                _id: "$value",
                count: { $sum: 1 },
            },
        },
    ]);

    const number_of_likes = stats.find((ele) => ele._id === 1)?.count || 0;
    const number_of_dislikes = stats.find((ele) => ele._id === -1)?.count || 0;
    const number_of_reset = stats.find((ele) => ele._id === 0)?.count || 0;
    const total_reaction = number_of_dislikes + number_of_likes + number_of_reset;
    const retObj = {
        likes : number_of_likes,
        dislikes : number_of_dislikes,
        rxn : total_reaction,
        userRxn: urx?.value ?? 0
    }
    res.status(200).json(new ApiResponse(200, retObj, "comment reaction data fetched successfully"));
});

const getPlaylistReaction = asyncHandler(async (req, res) => {
    // get playlist id
    // get user 
    // validate
    // find playlist
    // agregate pipeline to get playlist reaction
    // count like object with value 1 and -1

    const playlist_id = req.params?.playlist_id;
    const user = req.user;

    if (!playlist_id) {
        throw new ApiError(400, "playlist id is required");
    }

    const playlist = await Playlist.findById(playlist_id);

    if (!playlist) {
        throw new ApiError(404, "playlist not found");
    }
    let urx = undefined
    if(user){
        urx = await Like.findOne({onPlaylist:playlist._id, owner:user._id})
    }

    // const likesData = await Like.find({
    //     onplaylist:playlist._id,
    //     value:1
    //  })
    // const dislikesData = await Like.find({
    //     onplaylist:playlist._id,
    //     value:-1
    //  })
    // const resetData = await Like.find({
    //     onplaylist:playlist._id,
    //     value:0
    //  })

    const stats = await Like.aggregate([
        {
            $match: {
                onPlaylist: playlist._id,
            },
        },
        {
            $group: {
                _id: "$value",
                count: { $sum: 1 },
            },
        },
    ]);

    const number_of_likes = stats.find((ele) => ele._id === 1)?.count || 0;
    const number_of_dislikes = stats.find((ele) => ele._id === -1)?.count || 0;
    const number_of_reset = stats.find((ele) => ele._id === 0)?.count || 0;
    const total_reaction = number_of_dislikes + number_of_likes + number_of_reset;
    const retObj = {
        likes : number_of_likes,
        dislikes : number_of_dislikes,
        rxn : total_reaction,
        userRxn: urx?.value ?? 0
    }
    res.status(200).json(new ApiResponse(200, retObj, "playlist reaction data fetched successfully"));
});

export { 
    reactToVideo, 
    reactToPost, 
    reactToPlaylist, 
    reactToComment,
    getVideoReaction,
    getPostReaction,
    getCommentReaction,
    getPlaylistReaction
};
