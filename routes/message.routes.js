import express from 'express';
import { getConversation, getMessages, sendMessage } from '../controllers/message.controller.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.post('/', protectRoute, sendMessage);
router.get('/conversations', protectRoute, getConversation);
router.get('/:otherUserId', protectRoute, getMessages);

export default router