import express from 'express';
import { addRep, updateRep, deleteRep, getAllReps } from '../controllers/repController.js';
import { protect } from '../middleware/AuthMiddeleware.js';

const router = express.Router();

router.get('/', protect, getAllReps);
router.post('/', protect, addRep);
router.put('/:id', protect, updateRep);
router.delete('/:id', protect, deleteRep);

export default router;