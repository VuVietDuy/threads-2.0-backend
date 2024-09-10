import Post from '../models/post.model.js';
import Reply from '../models/reply.model.js';
import User from '../models/user.model.js';
import { v2 as cloudinary } from 'cloudinary';

async function createPost(req, res, next) {
    try {
        const { postedBy, text } = req.body;
        let img = req.body.img;
        if (!postedBy || !text) {
            return res.status(400).json({ error: 'Invalid post data' });
        }

        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized to create post' });
        }

        if (img) {
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url
        }

        const newPost = new Post({ postedBy, text, img });
        await newPost.save();

        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getPost(req, res, next) {
    try {
        const post = await Post.findById(req.params.id)
            .populate({
                path: 'postedBy',
                select: '_id name username profilePic'
            })
            .populate({
                path: 'replies',
                model: 'Reply',
                populate: {
                    path: 'repliedBy',
                    model: 'User',
                    select: '_id name username profilePic'
                }
            });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
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
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized to delete post' });
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        return res.status(204).json({ message: "Deleted post" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function like(req, res, next) {
    try {
        const id = req.params.id
        const userId = req.user._id
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userLikedPost = post.likes.includes(userId)
        if (userLikedPost) {
            // Unlike
            await Post.updateOne({ _id: id }, { $pull: { likes: userId } })
            res.status(200).json({ message: 'Unliked post' });
        } else {
            // Like
            await Post.updateOne({ _id: id }, { $push: { likes: userId } })
            res.status(200).json({ message: 'Liked post' });
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function reply(req, res, next) {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ message: 'Text is required' })
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const reply = await Reply.create({ text: text, repliedBy: userId })


        post.replies.push(reply);
        await post.save();

        res.status(201).json({ message: 'Reply post successfully', post });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getFeedPosts(req, res, next) {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });

        const following = user.following;

        const feedPosts = await Post.find({ postedBy: { $in: following } })
            .populate({
                path: 'postedBy',
                select: '_id name username profilePic'
            })
            .populate({
                path: 'replies',
                model: 'Reply',
                populate: {
                    path: 'repliedBy',
                    model: 'User',
                    select: '_id name username profilePic'
                }
            })
            .sort({ createdAt: -1 })
        res.status(200).json(feedPosts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getPosts(req, res, next) {
    const { username } = req.params
    try {
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const posts = await Post.find({ postedBy: user._id })
            .populate({
                path: 'postedBy',
                select: '_id name username profilePic'
            })
            .populate({
                path: 'replies',
                model: 'Reply',
                populate: {
                    path: 'repliedBy',
                    model: 'User',
                    select: '_id name username profilePic'
                }
            })
            .sort({ createdAt: -1 })
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export {
    createPost,
    getPost,
    deletePost,
    like,
    reply,
    getFeedPosts,
    getPosts
}