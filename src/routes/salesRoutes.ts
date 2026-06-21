import express from 'express';
import { confirmSale, deleteSale, getAllSales, updateSale } from '../controllers/salesController.js';
import { protect } from '../middleware/AuthMiddeleware.js';

const router = express.Router();

router.get('/', protect, getAllSales);
router.post('/confirm', protect, confirmSale);
router.put('/:id', protect, updateSale);
router.delete('/:id', protect, deleteSale);

export default router;