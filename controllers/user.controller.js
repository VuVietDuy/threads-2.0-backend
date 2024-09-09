import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/helpers/generateToken.js";
import { v2 as cloudinary } from 'cloudinary';

async function signup(req, res, next) {
    try {
        const { name, email, username, password } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword
        });

        await newUser.save();

        if (newUser) {
            const token = generateToken({ userId: newUser._id });
            res.cookie("accessToken", token, {
                httpOnly: true,
                maxAge: 15 * 24 * 60 * 60 * 1000,
                sameSite: "strict"
            });
            res.status(201).json(newUser)
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

async function login(req, res, next) {
    try {
        console.log('object');
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = generateToken({ userId: user._id });
        res.cookie("accessToken", token, {
            httpOnly: true,
            maxAge: 15 * 24 * 60 * 60 * 1000,
            sameSite: "strict"
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function logout(req, res, next) {
    res.clearCookie("accessToken", { path: "/" });
    res.status(200).json({ message: "Logged out successfully" });
}

async function follow(req, res, next) {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);
        if (id === req.user._id)
            return res.status(400).json({ error: "You cannot follow/unfollow this user" });

        if (!userToModify || !currentUser)
            return res.status(404).json({ error: "User not found" });

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // unfollow
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            res.json({ message: "Unfollowing user successfully" });

        } else {
            // follow
            console.log(req.user._id);
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            res.json({ message: "Following user successfully" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateUser(req, res, next) {
    const { id } = req.params;
    const { name, email, username, password, bio } = req.body
    let { profilePic } = req.body;
    try {
        let user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (id !== req.user._id.toString()) return res.status(404).json({ error: "You cannot update this user" })
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        if (profilePic) {
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split('/').pop().split('.')[0]);
            }

            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadResponse.secure_url
        }

        user.name = name || user.name;
        user.username = username || user.username;
        user.email = email || user.email;
        user.password = password || user.password;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();
        user.password = null

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getUserProfile(req, res) {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username }).select("-password").select("-updatedAt");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export {
    signup,
    login,
    logout,
    follow,
    updateUser,
    getUserProfile
};