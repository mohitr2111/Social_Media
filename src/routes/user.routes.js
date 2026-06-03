import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

import {
    loginUser, 
    registerUser, 
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
    deleteUser

} from "../controllers/user.controllers.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar", maxcount :1
        },
        {
            name: "coverImage", maxcount :1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/reset-token").post(systemLoginByAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-fullname").patch(verifyJWT,updatefullname)
router.route("/update-email").patch(verifyJWT,updateEmail)
router.route("/update-avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
)
router.route("/update-cover-image").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateCoverImg
)
router.route("/channel/:username").get(getUserProfile)
router.route("/history").get(verifyJWT,getWatchHistory)
router.route("/delete-user").delete(verifyJWT,deleteUser)
export default router;