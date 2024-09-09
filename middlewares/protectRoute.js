import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../models/user.model.js';

dotenv.config()

async function protectRoute(req, res, next) {
    try {
        const token = req.cookies.accessToken
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const user = await User.findById(decoded.userId).select("password");
        req.user = user
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

export default protectRoute;