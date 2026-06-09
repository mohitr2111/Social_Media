import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import {  verifyToken } from "../utils/verifyToken.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";

// todo
// addVideoToPlaylist()
// ↓
// updatePlaylistDetails()
// ↓
// changePlaylistVisibility()

const createPlaylist = asyncHandler(async (req, res) => {
    // create Playlist
    // get title, description, public
    // get owner by cookies verifyjwt
    // validate
    // asign empty array to videos
    // create playlsit
    // res

    const { title, description = "", isPublic = true } = req.body;
    const user = req.user;

    if (!title || title.trim() === "") {
        throw new ApiError(400, "title is required!!");
    }
    if (!user) {
        throw new ApiError(
            400,
            "you need to be logged in to create a playlist"
        );
    }

    const createdPlaylist = await Playlist.create({
        title,
        description,
        owner: user._id,
        isPublic,
    });

    if (!createdPlaylist) {
        throw new ApiError(
            500,
            "Something Went wrong from our side, please trt again"
        );
    }

    res.status(201).json(
        new ApiResponse(
            201,
            createdPlaylist,
            "New playlist is created successfully"
        )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    // without login
    // playlistid from params
    // validity
    // check whether playlist exist or not
    // return Playlist

    const playlist_id = req.params?.playlist_id;
    const user = req.user;

    if (!playlist_id) {
        throw new ApiError(400, "Playlist id is required");
    }

    const playlist = await Playlist.findById(playlist_id).populate("videos");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if(!playlist.isPublic){

        // const token = 
        // req.cookies?.accessToken || 
        // req.header("Authorization")?.replace("Bearer ", "") ||
        // null;

        // const user = await VerifyCookie(token);

        if(!user){
            throw new ApiError(401, "Invalid access")
        }

        if(user._id.toString() !== playlist.owner.toString()){
            throw new ApiError(403, "You are not authorized to access this playlist")
        }
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist is fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // get video id
    // get playlist id
    // get user from cookies
    // user should be the owner of playlist
    //check for video exist or playlist exist

    const video_id = req.params?.video_id;
    const playlist_id = req.params?.playlist_id;
    const user = req.user;

    if (!playlist_id || !video_id) {
        throw new ApiError(400, "Both video and palylist id's are required !!");
    }

    if (!user) {
        throw new ApiError(
            400,
            "You need to be logged in to add video in playlist"
        );
    }

    const playlist = await Playlist.findById(playlist_id);
    const video = await Video.findById(video_id);

    if (!playlist) {
        throw new ApiError(404, "Playlist does not exist");
    }
    if (!video) {
        throw new ApiError(404, "Video does not exist");
    }

    if (playlist.owner.toString() !== user._id.toString()) {
        throw new ApiError(
            400,
            "You are not Authorized to add video in this playlist"
        );
    }

    const alreadyExist = playlist.videos.some(ele => ele.toString() === video._id.toString())

    if (alreadyExist) {
        throw new ApiError(400, "Video already exist in this playlist");
    }

    playlist.videos.push(video._id);

    await playlist.save();

    res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "video is successfully added into playlist"
        )
    );
});

const updatePlaylistDetails = asyncHandler(async (req, res) => {
    // visibility, title, description

    const { isPublic, title, description } = req.body;
    const playlist_id = req.params?.playlist_id;
    const user = req.user;

    if (!playlist_id) {
        throw new ApiError(400, "Playlist id is required");
    }

    if (!user) {
        throw new ApiError(401, "You need to be logged in");
    }
    if(title !== undefined){
        if (title.trim() === "") {
            throw new ApiError(400, "title is required");
        }
    }

    const playlist = await Playlist.findById(playlist_id);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== user._id.toString()) {
        throw new ApiError(
            403,
            "You are not Authorized to update playlist details"
        );
    }

    if (title !== undefined) playlist.title = title;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist details updated successfully")
    );
});

const getUserPlaylist = asyncHandler(async(req, res)=>{
    // get user id from params
    // to agregate pipe for user and plalist with isPublic = true
    
    const user_id = req.params?.user_id;
    
    if(!user_id){
        throw new ApiError(400, "You need user to get its all playlist")
    }

    const user = await User.findById(user_id);
    if(!user){
        throw new ApiError(404, "User not found")
    }

    const userPlaylist = await Playlist.find({
        owner : user._id,
        isPublic : true 
    }).populate({
        path: 'videos',
        select: 'videoFile thumbnail title duration owner'
    })

    res
    .status(200)
    .json(new ApiResponse(200, userPlaylist, "user playlist detail fetched successfully"))
});

export {
    createPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    updatePlaylistDetails,
    getUserPlaylist
};
