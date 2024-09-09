import mongoose from "mongoose";

const userScheme = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        default: ""
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bio: {
        type: String,
        default: ""
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, {
    timestamps: true
})

const User = mongoose.model('User', userScheme);

export default User;