import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import { 
    addCommentsOnVideo,
    addCommentsOnPost,
    addCommentsOnPlaylist,
    addCommentOnComment,
    updateComment,
    getCommentReplies

} from "../controllers/comment.controllers.js";

const router = Router();

router.route("/videos/:video_id").post(verifyJWT,addCommentsOnVideo)
router.route("/posts/:post_id").post(verifyJWT,addCommentsOnPost)
router.route("/playlists/:playlist_id").post(verifyJWT,addCommentsOnPlaylist)
router.route("/reply/:comment_id/").post(verifyJWT,addCommentOnComment)
router.route("/:comment_id/").patch(verifyJWT, updateComment)
router.route("/:comment_id/replies").get(getCommentReplies)

export default router