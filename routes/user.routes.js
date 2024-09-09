import express from 'express';
import { follow, login, logout, signup, updateUser } from '../controllers/user.controller.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/follow/:id', protectRoute, follow);
router.post('/update/:id', protectRoute, updateUser);

export default router;