import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    
}))


app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({
    extended: true,
    limit: "20kb"
}))
app.use(express.static("public"))
app.use(cookieParser())



// routes

import route from './routes/user.routes.js'
import routeVideo from './routes/video.routes.js'
import routeComment from './routes/comment.routes.js'
import routePost from './routes/post.route.js'
import routePlaylist from './routes/post.route.js'
import routeLike from './routes/like.routes.js'
import routeSubscription from './routes/subscription.route.js'
app.use("/api/v1/users", route)
app.use("/api/v1/videos", routeVideo)
app.use("/api/v1/comments", routeComment)
app.use("/api/v1/posts", routePost)
app.use("/api/v1/playlists", routePlaylist)
app.use("/api/v1/likes", routeLike)
app.use("/api/v1/subscriptions", routeSubscription)


export{app}