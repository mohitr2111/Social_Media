GET /home

GET /videos/:videoId

GET /videos/:videoId/comments

GET /videos/:videoId/recommendations

GET /users/:username

GET /users/:username/videos

GET /users/:username/posts

GET /users/:username/playlists

GET /posts/:postId

GET /posts/:postId/comments

GET /playlists/:playlistId

GET /dashboard                    required AUTH

GET /search?q=react




GET /home
    with cookies {
        1 - avatar {
            =>logout/ login
            =>user profilepage access by @username
        }
        2 - #recomendation system
        a conatiner box containing video and its details
        pagination limit = 36
        [
            videoContainer - {
            _id,
            thumbnail:{
                url
            },
            title,
            views,
            duration,
            created at,
            owner :{
                _id, i think i should comment this as username is important
                username,(cause we have getUser by username not by id )
                fullname ?? usename,
                avatar
            }
            }
        ]
    }

    without cookies {
        same as with cookie just replace avatar with sign in
    }



GET videos/:_id/page        video watching page 

    1- video detail {
            _id,
            videoFile : {
                url
            },
            thumbnail : {
                url
            },
            title,
            description,
            created at,
            views, 
            duration
        }
        owner: {
            _id, (i think i should comment this as username is important)
            username,(cause we have getUser by username not by id )
            channel avatar,
            channel name
        }
        stats:{
            likes, 
            dislikes,
            user rxn
            channel subscribers,
            is subscribed,
            add to playlist,
            number of comments
        }




GET videos/:video_id/comments

    pagination limit = 40

    comment detail - [{
        _id,
        content,
        comment level,
        created at
        owner:{
            _id, (i think i should comment this as username is important)
            username,(cause we have getUser by username not by id )
            avatar,
        }
        
        likes
        dislikes,
        user rxn


        show reply
        add reply,
        number of reply
    }]

GET videos/:video_id/recommendation system:

    pagination limit = 50

        [
            videoContainer : {
            _id,
            thumbnail:{
                url
            },
            title,
            views,
            duration,
            created at,
            owner :{
                _id, (i think i should comment this as username is important)
                username,(cause we have getUser by username not by id )
                fullname ?? usename,
                avatar
            }
            }
        ]




GET user/:username
    1- user:{
        username,
        fullname,
        avatar:{
            url
        },
        coverImage;{
            url
        },
    }

    2- stats:{
        number of subscribers,
        number of videos,
        number of playlists,
        number of posts,
        is subscribed,
    }

    3- starVideo:{
        _id,
        thumbanail:{
            url
        },
        views,
        title,
        description,
        created at
    }

    4-starPlaylists:{
        _id,
        title,
        description,
        thubmnail,
        videos : [ <!-- (video container) -->
            {
                _id,
                thumbnail:{
                    url
                },
                title,
                views,
                duration,
                created at,
            }
        ]
    }

    limit = 10
    5- starPosts:{[
        {    <!-- post container -->
            avatar,
            post:{
                _id,
                content,
                1st photo,
                created at
            },
            number of likes,
            number of dislikes,
            user rxn,
            number of comments
        }
    ]}


Get user/:username/videos
    <!-- 1- user:{
        username,
        fullname,
        avatar:{
            url
        },
        coverImage;{
            url
        },
    } -->

    <!-- 2- stats:{
        number of subscribers,
        number of videos,
        is subscribed,
    } -->

    limit 30
    3-video Container :{[
        {
            {
                _id,
                thumbanail:{
                    url
                },
                views,
                title,
                duration,
                created at
            },
            add to playlist            
        }
    ]}






Get user/:username/playlist
    <!-- 1- user:{
        username,
        fullname,
        avatar:{
            url
        },
        coverImage;{
            url
        },
    }

    2- stats:{
        number of subscribers,
        number of videos,
        is subscribed,
    } -->

    limit 30
    3-playlist Container :{[
        {
            _id,
            title,
            number of videos
            updated at
        }           
    ]}






Get user/:username/post
    <!-- 1- user:{
        username,
        fullname,
        avatar:{
            url
        },
        coverImage;{
            url
        },
    }

    2- stats:{
        number of subscribers,
        number of videos,
        is subscribed,
    } -->


    limit 30
    3-post Container :{[
        {
            user:{
                avatar,
                fullname
            }
            post:{
                _id,
                content,
                photos[],
                created at
            },
            number of likes,
            number of dislikes,
            user rxn,
            number of comments
        }        
    ]}






Get /post/:_id
    1- user:{
                avatar,
                fullname
            }
    2- post:{
        _id,
        content,
        photos[],
        created at
    },
    3- stats: {    
        number of likes,
        number of dislikes,
        user rxn,
        number of comments
    },

GET /post/:_id/comments
    limit 40
    comments:{[  
        {    
            comment:{    _id,
                content,
                comment level,
                created at
                owner:{
                    _id, (i think i should comment this as username is important)
                    username,(cause we have getUser by username not by id )
                    avatar,
                }
            }
            
            stats: {    likes
                dislikes,
                user rxn


                show reply
                add reply,
                number of reply
            }
        }
    ]}



GET /playlist/:_id
    1-user:{
        _id,
        avatar:{
            url
        },
        fullname,
        username,
    }
    2-stats:{
        number of likes,
        number of dislikes,
        number of videos,
        number of comments,
        user rxn
    }
    3-video container : {[
        {
            _id,
            thumbnail,
            duration,
            title,
            views,
            createdAt,
            owner:{
                fullname
            }
        }
    ]}


    limit 40
    4-comment continer:{[
        {
            comment:{
                _id,
                content,
                createdAt,
                comment level,
                owner:{
                    fullname, avatar
                }
            }

            
            stats: {    likes
                dislikes,
                user rxn


                show reply
                add reply,
                number of reply
            }
        }
    ]}



GET /dashboard
    1- user:{
        username,
        fullname,
        avatar:{
            url
        },
        coverImage;{
            url
        },
        email,
        created at
    }

    2- stats:{
        number of subscribers,
        number of videos

        total views,
        total comments,
        total like,
        total dislike,
        total post,
        total playlists,

    }



GET result/:query

    pagination limit = 36
        [
            videoContainer - {
            _id,
            thumbnail:{
                url
            },
            title,
            views,
            duration,
            created at,
            owner :{
                _id, i think i should comment this as username is important
                username,(cause we have getUser by username not by id )
                fullname ?? usename,
                avatar
            }
            }
        ]



