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
app.use("/api/v1/users", route)
app.use("/api/v1/video", routeVideo)
app.use("/api/v1/comment", routeComment)
app.use("/api/v1/post", routePost)


export{app}