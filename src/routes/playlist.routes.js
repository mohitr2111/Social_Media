import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    updatePlaylistDetails,
    getUserPlaylist
} from "../controllers/playlist.controllers.js"
import { optionAuth } from "../middlewares/optionalAuth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createPlaylist)

router.route("/:playlist_id")
.get(optionAuth , getPlaylistById)
.patch(verifyJWT, updatePlaylistDetails)

router.route("/:playlist_id/videos/:video_id").patch(verifyJWT,addVideoToPlaylist)
router.route("user/:user_id").get(getPlaylistById)




export default router;