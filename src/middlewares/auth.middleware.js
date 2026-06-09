import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { verifyToken } from "../utils/verifyToken.js";
// import { useDeferredValue } from "react";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    // authentication wheather the user is autherize or not
    // 1) bring the active access token in the backend and check it by access tokken sceret key wheather it is verified or not

    try {
        const aliveToken =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!aliveToken) {
            throw new ApiError(401, " Unauthorized access");
        }

        const _user = await verifyToken(aliveToken);

        /*
          const decodedToken = jwt.verify(
              aliveToken,
              process.env.ACCESS_TOKEN_SECRET
          );
          
          const _user = await User.findById(decodedToken?._id).select(
            "-password, -refreshToken"
          );
       */

        if (!_user) {
            throw new ApiError(401, "Invalid access");
        }

        req.user = _user;
        next();
    } catch (error) {
        throw new ApiError(
            error.statusCode || 401,
            error?.message || "Something went wrong while auth_middleware"
        );
    }
});
