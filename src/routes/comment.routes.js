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

router.route("/videos/:videoId").post(verifyJWT,addCommentsOnVideo)
router.route("/posts/:postId").post(verifyJWT,addCommentsOnPost)
router.route("/playlists/:playlistId").post(verifyJWT,addCommentsOnPlaylist)
router.route("/reply/:commentId/").post(verifyJWT,addCommentOnComment)
router.route("/:commentId/").patch(verifyJWT, updateComment)
router.route("/:commentId/replies").get(getCommentReplies)

export default router