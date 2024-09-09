import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import generateToken from "../utils/helpers/generateToken.js";

async function signup(req, res, next) {
    try {
        const { name, email, username, password } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
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
        res.status(500).json({ message: e.message });
    }
}

async function login(req, res, next) {
    try {
        console.log('object');
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken({ userId: user._id });
        res.cookie("accessToken", token, {
            httpOnly: true,
            maxAge: 15 * 24 * 60 * 60 * 1000,
            sameSite: "strict"
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        console.log(id);
        console.log(req.user._id);
        if (id === req.user._id)
            return res.status(400).json({ message: "You cannot follow/unfollow this user" });

        if (!userToModify || !currentUser)
            return res.status(404).json({ message: "User not found" });

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // unfollow
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            res.json({ message: "Unfollowing user successfully" });

        } else {
            // follow
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            res.json({ message: "Following user successfully" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const { password } = req.body
        if (password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(password, salt);
        }
        const user = await User.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


export {
    signup,
    login,
    logout,
    follow,
    updateUser
};