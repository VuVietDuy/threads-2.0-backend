import express from 'express'
import protectRoute from '../middlewares/protectRoute.js';
import { createPost, deletePost, getPost } from '../controllers/post.controller.js';

const router = express.Router()

router.get('/:id', getPost)
router.post('/', protectRoute, createPost);
router.delete('/:id', deletePost)

export default router;