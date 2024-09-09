import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default function connectDB() {
    mongoose
        .connect(process.env.MONGODB_CONNECT_URI_DEVELOPMENT)
        .then(() => console.log("Connected!"))
        .catch((err) => console.log(err));
}

