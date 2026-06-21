import express from 'express';
import { getInventory, adjustStock } from '../controllers/inventoryController.js';
import { protect } from '../middleware/AuthMiddeleware.js';

const router = express.Router();

router.get('/', protect, getInventory);
router.put('/adjust/:id', protect, adjustStock);

export default router;