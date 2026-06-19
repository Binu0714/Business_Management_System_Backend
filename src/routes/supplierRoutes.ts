import express from 'express';
import { addSupplier, updateSupplier, deleteSupplier, getAll } from '../controllers/SupplierController.js';
import { protect } from '../middleware/AuthMiddeleware.js';

const router = express.Router();

router.get('/', protect, getAll);
router.post('/', protect, addSupplier);
router.put('/:id', protect, updateSupplier);
router.delete('/:id', protect, deleteSupplier);

export default router;