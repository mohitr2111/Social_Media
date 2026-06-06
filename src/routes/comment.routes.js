import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import { 
    addCommentOnVideo,
    addCommentOnPost,
    addCommentOnComment,
    updateComment,
    getCommentReplies

} from "../controllers/comment.controllers.js";

const router = Router();

router.route("/videos/:videoId/addComment").post(verifyJWT,addCommentOnVideo)
router.route("/posts/:postId/addComment").post(verifyJWT,addCommentOnPost)
router.route("/comments/:commentId/addReply").post(verifyJWT,addCommentOnComment)
router.route("/:commentId/edit-comment").patch(verifyJWT, updateComment)
router.route("/:commentId/replies").get(getCommentReplies)

export default router