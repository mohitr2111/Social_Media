import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/verifyToken.js";
import { ApiError } from "../utils/ApiError.js";

const optionAuth = asyncHandler(async (req, res, next) => {
    const aliveToken =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "") ||
        null;

    if (!aliveToken) {
        req.user = null;
        return next();
    }

    const _user = await verifyToken(aliveToken);

    if (!_user) {
        throw new ApiError(401, "Invalid access");
    }

    req.user = _user;
    return next();
});

export { optionAuth };
