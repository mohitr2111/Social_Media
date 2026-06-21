import { Router } from "express";
import {
    reactToVideo, 
    reactToPost, 
    reactToPlaylist, 
    reactToComment,
    getVideoReaction,
    getPostReaction,
    getCommentReaction,
    getPlaylistReaction
} from "../controllers/like.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optionAuth } from "../middlewares/optionalAuth.middleware.js";

const router = Router();

router.route("/videos/:video_id").post(verifyJWT, reactToVideo).get(optionAuth, getVideoReaction)
router.route("/posts/:post_id").post(verifyJWT, reactToPost).get(optionAuth, getPostReaction)
router.route("/comments/:comment_id").post(verifyJWT, reactToComment).get(optionAuth, getCommentReaction)
router.route("/playlists/:playlist_id").post(verifyJWT, reactToPlaylist).get(optionAuth, getPlaylistReaction)

export default router;