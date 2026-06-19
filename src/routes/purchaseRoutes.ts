import express from 'express';
import { savePurchase, getAllPurchases, updatePurchase, deletePurchase } from '../controllers/purchaseController.js';
import { protect } from '../middleware/AuthMiddeleware.js';

const router = express.Router();

router.get('/', protect, getAllPurchases);
router.post('/confirm', protect, savePurchase);
router.put('/:id', protect, updatePurchase);
router.delete('/:id', protect, deletePurchase);

export default router;