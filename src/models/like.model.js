import mongoose, { Schema } from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        onVideo: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            // default : null
        },
        onComment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            // default : null
        },
        onPost: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            // default : null
        },
        onPlaylist: {
            type: Schema.Types.ObjectId,
            ref: "Playlist",
            // default : null
        },
        value: {
            type: Number,
            default: 0,
            required: true,
            validate: {
                // value : 1 for like, 0 nothing, -1 for dislike
                validator: function (val) {
                    return val == -1 || val == 0 || val == 1;
                },
                message: "Value can be onllly -1,0,1 ",
            },
        },
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: true,
        },
    }
);

likeSchema.pre("validate", async function (next) {
    let targets = [onComment, onVideo, onPost, onPlaylist];
    
    const count = targets.filter(element => Boolean(element));

    if (count.length != 1) {
        return next(
            new Error("Like can only be associated to one object only ")
        );
    }

    next();
});

likeSchema.pre("save", async function (next) {
    if (!this.isNew) {
        if (
            this.isModified("onVideo") ||
            this.isModified("onPost") ||
            this.isModified("onComment") ||
            this.isModified("onPlaylist")
        ) {
            return next(
                new Error("You cannot change the target of an existing like"                )
            );
        }
    }
    next();
});

likeSchema.index(
    {
        owner: 1,
        onVideo: 1,
    },
    {
        unique: true,
        partialFilterExpression: { onVideo: { $exists: true } },
    }
);
likeSchema.index(
    {
        owner: 1,
        onComment: 1,
    },
    {
        unique: true,
        partialFilterExpression: { onComment: { $exists: true } },
    }
);
likeSchema.index(
    {
        owner: 1,
        onPost: 1,
    },
    {
        unique: true,
        partialFilterExpression: { onPost: { $exists: true } },
    }
);
likeSchema.index(
    {
        owner: 1,
        onPlaylist: 1,
    },
    {
        unique: true,
        partialFilterExpression: { onPlaylist: { $exists: true } },
    }
);

export const Like = mongoose.model("Like", likeSchema);
