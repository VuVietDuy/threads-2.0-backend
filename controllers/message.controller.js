import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

async function sendMessage(req, res, next) {
    try {
        const { recipientId, message } = req.body;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipienId],
                lastMessage: senderId,
            });
            await conversation.save();
        }

        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            text: message
        })

        await Promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage: newMessage._id
            }),
        ])
        await newMessage.populate({
            path: 'sender',
            select: 'name username profilePic'
        })
        res.status(201).json(newMessage)

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

async function getMessages(req, res, next) {
    const { otherUserId } = req.params
    try {
        const conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, otherUserId] }
        })
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }
        const messages = await Message.find({ conversationId: conversation._id })
            .populate({
                path: 'sender',
                select: 'name username profilePic'
            })
            .sort({ createdAt: 1 })

        res.status(200).json(messages)
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

async function getConversation(req, res, next) {
    const userId = req.user._id
    try {
        const conversations = await Conversation.find({ participants: userId })
            .populate({
                path: 'participants',
                select: 'username profilePic'
            })
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'username profilePic'
                }
            })

        conversations.forEach(conversation => {
            conversation.participants = conversation.participants.filter(
                participant => participant._id.toString() !== userId.toString()
            )
        })

        res.status(200).json(conversations)
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

export {
    sendMessage,
    getMessages,
    getConversation
}