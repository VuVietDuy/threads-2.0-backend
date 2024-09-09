import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    img: {
        type: String,
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
    replies: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Reply",
        default: []
    },
}, {
    timestamps: true
})

const Post = mongoose.model('Post', postSchema);

export default Post;