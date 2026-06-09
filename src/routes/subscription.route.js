import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    subscribeChannel,
    checkSubscriptionStatus,
    getChannelSubscribers,
    getUserSubscriptions
} from "../controllers/subscription.controllers.js"

const router = Router();

router.route("/channel/user/:username").post(verifyJWT, subscribeChannel).get(verifyJWT, checkSubscriptionStatus)

router.route("/channel/:channel_id").get(getChannelSubscribers)
router.route("/user/:user_id").get(getUserSubscriptions)


export default router;