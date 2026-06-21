import express from 'express';
import { addExpense, getAllExpenses, deleteExpense, updateExpense } from '../controllers/expenseController.js';
import { protect } from '../middleware/AuthMiddeleware.js';

const router = express.Router();

router.get('/', protect, getAllExpenses);
router.post('/', protect, addExpense);
router.delete('/:id', protect, deleteExpense);
router.put('/:id', protect, updateExpense);

export default router;