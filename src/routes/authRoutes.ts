import express from 'express';
import { signUp , login, updateProfile  } from '../controllers/authController.js';
import { protect } from '../middleware/AuthMiddeleware.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.put('/profile/:uid', protect, updateProfile);

export default router;