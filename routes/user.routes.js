import express from 'express';
import { follow, getUserProfile, login, logout, signup, updateUser } from '../controllers/user.controller.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.get('/:username', getUserProfile);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/:id/follow', protectRoute, follow);
router.put('/:id', protectRoute, updateUser);

export default router;