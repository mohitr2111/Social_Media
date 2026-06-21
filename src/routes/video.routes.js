import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { optionAuth } from "../middlewares/optionalAuth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";
import{
    uploadVideo,
    watchVideo,
    updateVideoDetails,
    updateThumbnail,
    un_ListVideo,
    deleteVideo
} from "../controllers/video.controllers.js"

const router = Router(); 

router.route("/upload").post(
    verifyJWT, 
    upload.fields([
        {
            name: "thumbnail",
            maxCount : 1
        },
        {
            name: "video",
            maxCount: 1
        }
    ]),
    uploadVideo
)

router.route("/:videoId")
.get(optionAuth, watchVideo)
.patch(verifyJWT, updateVideoDetails)
.delete(verifyJWT, deleteVideo)

router.route("/:videoId/update-thumbnail").patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateThumbnail
)
router.route("/:videoId/un-list").patch(verifyJWT,un_ListVideo)

// router.route("/:videoId").delete(verifyJWT, deleteVideo)
export default router;