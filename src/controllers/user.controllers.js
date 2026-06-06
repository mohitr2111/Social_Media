import { configDotenv } from "dotenv";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteImageFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessANDRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const AccessToken = user.generateAccessToken();
        const RefreshToken = user.generateRefreshToken();

        user.refreshToken = RefreshToken;
        await user.save({ validateBeforeSave: false });

        return { AccessToken, RefreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong while generating access token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    //  steps to register user
    // 1) enter the details in the form  and submit the form
    // 2) get the data from the form to the backend
    // 3) data is validation
    // 4) no existing user found in database
    // 5) check for avatar
    // 6) upload on cloudinary and get the url of the avatar
    // 7) then create a new user
    // 8) update the database with new user details
    // 9) check that user is created successfully or not
    // 10) remove the refresh token and password from the response
    // 11) send the respond to the frontend

    //  get the data from the form to the backend
    const { username, email, fullname, password } = req.body;
    console.log(req.body);

    // validation in if else form
    // if(username == ""){
    //     throw new ApiError(400, "Username is required")
    // }

    //  validation in
    if (
        [username, email, fullname, password].some(
            (field) => field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    //  check for existing user
    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    //  bring the address of avatar and cover image to backend
    let avatarLocalPath;
    // = req.files?.avatar[0]?.path;

    if (
        req.files &&
        Array.isArray(req.files.avatar) &&
        req.files.avatar.length > 0
    ) {
        avatarLocalPath = req.files.avatar[0].path;
    }

    let coverLocalPath;

    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverLocalPath = req.files.coverImage[0].path;
    }

    //  req.files?.coverImage[0]?.path;

    //  validation of avatarimage

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // upload the avatar and cover image to cloudinary and get the url of the images
    const avatarCloudinaryResult = await uploadOnCloudinary(avatarLocalPath);
    // what if no cover image is uploaded by the user
    const coverCloudinaryResult = !coverLocalPath
        ? null
        : await uploadOnCloudinary(coverLocalPath);
    // console.log("avatarCloudinaryResult", avatarCloudinaryResult);

    //  create a new user
    const newUser = await User.create({
        username: username.toLowerCase(),
        email,
        fullname,
        password,
        avatar: {
            url: avatarCloudinaryResult.url,
            public_id: avatarCloudinaryResult.public_id,
        },
        coverImage: {
            url: coverCloudinaryResult?.url || "",
            public_id: coverCloudinaryResult?.public_id || "",
        },
    });

    // remove the refresh token and password from the response
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    // send the respond to the frontend
    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // steps to login a user
    // 1) get data from body
    // 2) email or username and paasword
    // 3) validation
    // 4) find user by email or username in database
    // 5) if user exist match the password
    // 5) generate the refresh and access token
    // 6) remove the password and refresh token and send the response

    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "No user exist by this email or username ");
    }

    const passC = await user.isPasswordCorrect(password);
    if (!passC) {
        throw new ApiError(401, "Enter the correct password");
    }

    const { AccessToken, RefreshToken } = await generateAccessANDRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password, -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .cookie("accessToken", AccessToken, options)
        .cookie("refreshToken", RefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    AccessToken,
                    RefreshToken,
                },
                "User is Successfully loggedIn"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    //  logout user
    // 1) authentication
    // 2) set the refresh token undefined in the database
    // 3) clear the cookies

    const c_user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User is logged out"));
});

const systemLoginByAccessToken = asyncHandler(async (req, res) => {
    // As access token get expire(refresh token is still alive), system automatically generate new tokens and set the cookies
    // step 1) get the refresh token from the cookies
    // step 2) decode the refresh token by jwt.verify and take out _id
    // step 3) DB call to find the user by _id
    // step 4) match the refresh token from cookie and db
    // step 5) generate the new access and refresh token
    // step 6) save the refresh token in data base
    // step 7) send the response with setting the cookies and json file

    try {
        const aliveRefreshToken =
            req.cookies?.refreshToken || req.body.refreshToken;

        if (!aliveRefreshToken) {
            throw new ApiError(401, "No alive token");
        }

        const decodedRefreshToken = jwt.verify(
            aliveRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        if (!decodedRefreshToken) {
            throw new ApiError(401, "Unauthorized access");
        }

        const user = await User.findById(decodedRefreshToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (aliveRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token (doesnt match)");
        }

        const { AccessToken, RefreshToken } =
            await generateAccessANDRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        const options = {
            httpOnly: true,
            secure: true,
        };

        res.status(200)
            .cookie("accessToken", AccessToken, options)
            .cookie("refreshToken", RefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        AccessToken,
                        RefreshToken,
                    },
                    "Access Token Refreshed successfully "
                )
            );
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Something went wrong while resetting the tokens"
        );
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // changing the password
    // step 0) Authentication check
    // step 1) get the current , new , confirm password from req.body
    // step 2) match the new and confirm password
    // step 3)  find the user in data base
    // step 4) check current password
    // step 5) change the password
    // step 6) respond

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All fields are reqired");
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(
            400,
            "new password and confirm password should be same"
        );
    }

    const user = await User.findById(req.user._id);

    const does_password_match = await user.isPasswordCorrect(currentPassword);

    if (!does_password_match) {
        throw new ApiError(400, "Enter the correct current password");
    }

    // const updatedUser = await User.findByIdAndUpdate(user._id,
    //     {
    //         $set:{
    //             password : newPassword
    //         }
    //     },
    //     {
    //         new: true
    //     }
    // )

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, "Password is changed successfully")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "current user fetched successfully")
        );
});

const updatefullname = asyncHandler(async (req, res) => {
    // things that can  be updtated
    // fullname
    // validation of fullname
    // find user
    // save the fulllname
    // send response

    const { newfullname } = req.body;

    if (newfullname.trim() === "") {
        throw new ApiError(400, "fullname is required");
    }

    const user = await User.findById(req.user._id);

    user.fullname = newfullname;

    await user.save({ validateBeforeSave: false });

    res.status(201).json(new ApiResponse(201, "fullname is updated"));
});

const updateEmail = asyncHandler(async (req, res) => {
    // get new email
    // validate the email
    // is this email already in use
    // change the email in database
    // save
    // res

    const { newemail } = req.body;

    if (!newemail || newemail.trim() === "") {
        throw new ApiError(400, "email is required");
    }

    const existing_email = await User.findOne({ email: newemail });

    if (existing_email) {
        throw new ApiError(
            400,
            "This email is already in use, try with another email"
        );
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                email: newemail,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");

    res.status(201).json(new ApiResponse(201, user, "email is changed"));
});

const updateAvatar = asyncHandler(async (req, res) => {
    // get the avatar file from multer
    // check for validity
    // delete previous avatar from cloudinary
    // push it to cloudinary, get back its url
    // update the user
    // response

    const newAvatarLocalPath = req.file?.path;
    const user = req.user;

    if (!newAvatarLocalPath) {
        throw new ApiError(400, "Did not recive avatar, try again");
    }

    const deleteAvatarCloudinaryResult = await deleteImageFromCloudinary(
        user.avatar.public_id
    );

    if (!deleteAvatarCloudinaryResult) {
        throw new ApiError(404, "avatar is not deleted from cloudinary");
    }

    const uploadedAvatarResult = await uploadOnCloudinary(newAvatarLocalPath);

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: {
                    url: uploadedAvatarResult?.url,
                    public_id: uploadedAvatarResult?.public_id,
                },
            },
        },
        { validateBeforeSave: false }
    ).select("-password -refreshToken");

    res.status(200).json(
        new ApiResponse(200, updatedUser, "avatar is updated successfully")
    );
});

const updateCoverImg = asyncHandler(async (req, res) => {
    // get the cover image  file from multer
    // check for validity
    // push it to cloudinary, get back its url
    // update the user
    // response

    const newCoverImgLocalPath = req.file?.path;
    const user = req.user;

    if (!newCoverImgLocalPath) {
        throw new ApiError(400, "Did not recive cover Image, try again");
    }

    const deleteCICloudinaryResult = await deleteImageFromCloudinary(
        user.coverImage.public_id
    );

    if (!deleteCICloudinaryResult) {
        throw new ApiError(404, "Cover Image is not deleted from cloudinary");
    }

    const uploadedCoverImgResult =
        await uploadOnCloudinary(newCoverImgLocalPath);

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: {
                    url: uploadedCoverImgResult?.url,
                    public_id: uploadedCoverImgResult?.public_id,
                },
            },
        },
        { validateBeforeSave: false }
    ).select("-password -refreshToken");

    res.status(200).json(
        new ApiResponse(200, updatedUser, "Cover Image is updated successfully")
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
    // on visiting someone profile
    // get the username(whose profile we are visitng) from params ✅
    // pipelines 1)match
    // 2)lookup for subscribers: channel
    // 3)lookup for susbcribed to: subscriber
    // add fields for subscribercount, subscribedToCount, isSubscribed
    // project only neccessary things
    // res

    const username = req.params?.username;

    if (!username) {
        throw new ApiError(400, "Didnt get username try again!!");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                subscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                username: 1,
                email: 1,
                avatar: 1,
                fullname: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                subscribers: 1,
                subscribedTo: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "This channel doesn't exist");
    }

    res.status(202).json(
        new ApiResponse(
            200,
            channel[0],
            "Channel Profile Accessed successfully"
        )
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    // get the watch history of our user
    // by auth middleware we get id of user
    // aggregate pipeline 1) match with id
    // 2) lookup for video list
    // 3) nested lookup for getting the owner of video
    // 4) nested lookup for owner project detail
    // 5) res

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullname: 1,
                                        avatar: {
                                            url: 1,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            videoFile: {
                                url: 1,
                            },
                            thumbnail: {
                                url: 1,
                            },
                            title: 1,
                            duration: 1,
                            view: 1,
                            owner: 1,
                        },
                    },
                ],
            },
        },
    ]);

    if (!user) {
        throw new ApiError(404, "User History not found");
    }

    const rawHistory = user[0]?.watchHistory || [];

    res.status(200).json(
        new ApiResponse(
            200,
            rawHistory,
            "watch History is fetched successfully"
        )
    );
});

const deleteUser = asyncHandler(async (req, res) => {
    const { givenPass } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "user not found");
    }

    const does_password_match = await user.isPasswordCorrect(givenPass);

    if (!does_password_match) {
        throw new ApiError(400, "Password is wrong");
    }

    const deleteAvatarCloudinaryResult = await deleteImageFromCloudinary(
        user.avatar.public_id
    );
    if (!deleteAvatarCloudinaryResult) {
        throw new ApiError(404, "avatar   is not deleted from cloudinary");
    }
    if (user.coverImage.public_id) {
        const deleteCICloudinaryResult = await deleteImageFromCloudinary(
            user.coverImage.public_id
        );

        if (!deleteCICloudinaryResult) {
            throw new ApiError(
                404,
                "Cover Image  is not deleted from cloudinary"
            );
        }
    }

    const Check_user_is_deleted_or_not = await User.findByIdAndDelete(user._id);
    if (!Check_user_is_deleted_or_not) {
        throw new ApiError(500, "failed to delete the user, try again");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Successfully, User Accounnt is Deleted Permanently"
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    systemLoginByAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updatefullname,
    updateEmail,
    updateAvatar,
    updateCoverImg,
    getUserProfile,
    getWatchHistory,
    deleteUser,
};
