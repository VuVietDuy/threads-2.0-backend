import express from 'express'
import protectRoute from '../middlewares/protectRoute.js';
import { createPost, deletePost, getFeedPosts, getPost, getPosts, like, reply } from '../controllers/post.controller.js';

const router = express.Router()

router.get('/feed', protectRoute, getFeedPosts)
router.get('/:id', getPost)
router.get('/user/:username', getPosts)
router.post('/', protectRoute, createPost);
router.delete('/:id', protectRoute, deletePost)
router.put('/:id/like', protectRoute, like)
router.put('/:id/reply', protectRoute, reply)

export default router;