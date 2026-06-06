import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createPost,
    getPostById,
    updatePost
} from "../controllers/post.controllers.js"

const router = Router();

router.route("/createPost").post(
    verifyJWT,
    upload.fields([{
        name : "images",
        maxCount : 12
    }]),
    createPost
)

router.route("/:postId").get(getPostById)
router.route("/update/:postId").patch(
    verifyJWT,
    upload.fields([{
        name : "images",
        maxCount:12
    }]),
    updatePost
)

export default router;

