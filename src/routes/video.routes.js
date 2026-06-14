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

router.route("/upload-video").post(
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

router.route("/watch/:videoId").get(optionAuth, watchVideo)
router.route("/update-details/:videoId").patch(verifyJWT, updateVideoDetails)
router.route("/update-thumbnail/:videoId").patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateThumbnail
)
router.route("/un-List/:videoId").patch(verifyJWT,un_ListVideo)
router.route("/delete/:videoId").delete(verifyJWT, deleteVideo)
export default router;