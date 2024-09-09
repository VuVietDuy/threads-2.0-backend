import mongoose from "mongoose";

const replySchema = mongoose.Schema({
    repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})

const Reply = mongoose.model('Reply', replySchema);

export default Reply;