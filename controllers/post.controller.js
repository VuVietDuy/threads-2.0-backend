import Post from "../models/post.model.js";
import User from "../models/user.model.js";

async function createPost(req, res, next) {
    try {
        const { postedBy, text, img } = req.body;

        if (!postedBy || !text) {
            return res.status(400).json({ message: "Invalid post data" });
        }

        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to create post" });
        }

        const newPost = new Post({ postedBy, text, img });
        await newPost.save();

        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getPost(req, res, next) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json(post)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function deletePost(req, res, next) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete post" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(204).json();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export {
    createPost,
    getPost,
    deletePost
}