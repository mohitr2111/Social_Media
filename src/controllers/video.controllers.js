import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    uploadOnCloudinary,
    deleteVideoFromCloudinary,
    deleteImageFromCloudinary,
} from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { url } from "inspector";

const uploadVideo = asyncHandler(async (req, res) => {
    // get the details
    // validate those details
    // multer
    // cloudinary
    // save

    const { title, description } = req.body;

    if (
        [title, description].some((fields) => {
            fields?.trim() === "";
        })
    ) {
        throw new ApiError(400, "Title and Description are mandatory fields");
    }

    const LocalPathThumbnail = req.files?.thumbnail[0]?.path;
    const LocalPathVideo = req.files?.video[0]?.path;

    if (!LocalPathThumbnail || !LocalPathVideo) {
        throw new ApiError(401, "Thumbnail & Video both are required");
    }

    const ThumbnailCloudinaryResult =
        await uploadOnCloudinary(LocalPathThumbnail);
    const VideoCloudinaryResult = await uploadOnCloudinary(LocalPathVideo);

    if (!ThumbnailCloudinaryResult || !VideoCloudinaryResult) {
        throw new ApiError(
            501,
            "Server Error video is not uploaded on Cloudinary"
        );
    }

    const createdVideo = await Video.create({
        videoFile: {
            url: VideoCloudinaryResult?.url,
            public_id: VideoCloudinaryResult?.public_id,
        },
        thumbnail: {
            url: ThumbnailCloudinaryResult?.url,
            public_id: ThumbnailCloudinaryResult?.public_id,
        },
        description,
        title,
        duration: VideoCloudinaryResult.duration,
        owner: req.user._id,
    });

    // const createdVideo = await Video.findById(newVideo.id);

    if (!createdVideo) {
        throw new ApiError(500, "Server Error video is not created in DB");
    }

    res.status(201).json(
        new ApiResponse(201, createdVideo, "Video uploaded successfully")
    );
});

const watchVideo = asyncHandler(async (req, res) => {
    // here we don't need to be logined but viewws will be increased by 1
    // we also have to add the video to the watch history of the user if he is logined
    // same url for both logined and non logined users

    // get thge video id from the url
    // find the video by id
    // check for the video if it is Listed or not
    // if not Listed then throw an error
    // if Listed then increase the views by 1
    // if the user is logined then add the video to the watch history of the user
    // return the video url to the user

    const nvideoId = req.params?.videoId;

    const video = await Video.findById(nvideoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (!video.isListed) {
        throw new ApiError(403, "Video is UnListed ");
    }

    video.views += 1;

    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "") ||
        null;

    if (token) {
        try {
            const decodedToken = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            );

            const _user = await User.findById(decodedToken?._id);
            if (!_user) {
                throw new ApiError(401, "Invalid access");
            }

            // Prevent duplicate entries in watch history
            if (!_user.watchHistory.includes(video._id)) {
                _user.watchHistory.push(video._id);
                await _user.save();
            } else {
                video.views -= 1;
            }
        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while auth_middleware"
            );
        }
    }

    await video.save();

    res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

const updateVideoDetails = asyncHandler(async (req, res) => {
    // description & title can be updated only by this method
    // user should be logined
    // get the video id from the param
    // find the video
    // user should be the owner of the video
    // change the details and save it
    // return the updated video details

    const videoId = req.params?.videoId;
    const { newTitle, newDescription } = req.body;
    const user = req.user;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not Found!");
    }
    if (video.owner.toString() != user._id.toString()) {
        throw new ApiError(
            403,
            "You are not the authorized owner of this video"
        );
    }
    if ([newTitle, newDescription].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and Description cannot be empty");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        video._id,
        {
            $set: {
                title: newTitle,
                description: newDescription,
            },
        },
        {
            new: true,
        }
    );

    res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Title and Description are updated Successfully"
        )
    );
});

const updateThumbnail = asyncHandler(async (req, res) => {
    // get videoid
    // get user
    // get thumbnail
    // authorization
    // get local path of thumbnail
    // upload on cloudinary
    // get back clooudinary result
    // update the thumbnail details on database
    // save the datbase
    // respponse

    const videoId = req.params?.videoId;
    const user = req.user;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() != user._id.toString()) {
        throw new ApiError(
            400,
            "You are not Authorized to change the thumnail of this video"
        );
    }

    const localPathOfThumbnail = req.file?.path;

    if (!localPathOfThumbnail) {
        throw new ApiError(404, "Could not get the new thumbnail. retry!!");
    }
    
    const deleteOldThumbnailFromCloudinary = await deleteImageFromCloudinary(video.thumbnail.public_id);
    if(!deleteImageFromCloudinary){
        throw new ApiError(500, "Old thumbnail is not deleted from cloudinary")
    }

    const cloudinaryResults = await uploadOnCloudinary(localPathOfThumbnail);

    if (!cloudinaryResults) {
        throw new ApiError(
            500,
            "Something went wrong while uploading on cloudinary"
        );
    }


    const updatedVideo = await Video.findByIdAndUpdate(
        video._id,
        {
            $set: {
                thumbnail: {
                    url: cloudinaryResults?.url,
                    public_id: cloudinaryResults?.public_id,
                },
            },
        },
        {
            new: true,
        }
    );

    res.status(200).json(
        new ApiResponse(200, updatedVideo, "Thumbnail is successfully updated")
    );
});

const un_ListVideo = asyncHandler(async (req, res) => {
    // get videoid
    // get user-
    // authorization
    // check for video is listed or unlisted
    // toggle it save it in database
    // response

    const videoId = req.params?.videoId;
    const user = req.user;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() != user._id.toString()) {
        throw new ApiError(
            400,
            "You are not Authorized to list or unlist this video"
        );
    }

    let curr = video.isListed;

    video.isListed = !curr;
    video.save({ validateBeforeSave: false });

    res.status(200).json(new ApiResponse(200, "value is toggled successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    // get videoid
    // get user
    // validity & authorization
    // delete video and thumbnail from cloudinary
    // delete this object
    // remove this video from watch history of users
    // res

    const videoId = req.params?.videoId;
    const user = req.user;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() != user._id.toString()) {
        throw new ApiError(403, "You are not Authorized to delete this video");
    }

    const deleteResultVideo = await deleteVideoFromCloudinary(
        video.videoFile.public_id
    );
    const deleteResultImage = await deleteImageFromCloudinary(
        video.thumbnail.public_id
    );

    if (!deleteResultVideo || !deleteResultImage) {
        throw ApiError(404, "Something went wrong, see in the console");
    }

    const Check_video_is_deleted_or_not = await Video.findByIdAndDelete(
        video._id
    );

    if (!Check_video_is_deleted_or_not) {
        throw new ApiError(500, "Video Cant be deleted, try again");
    }

    User.updateMany(
        { watchHistory: video._id },
        {
            $pull: { watchHistory: video._id },
        }
    );

    res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video is deleted from all sources Successfully "
        )
    );
});

export {
    uploadVideo,
    watchVideo,
    updateVideoDetails,
    updateThumbnail,
    un_ListVideo,
    deleteVideo,
};
