import type { Request, Response } from 'express';
import { adminDb } from '../config/tempAdmin.js';

export const addExpense = async (req: Request, res: Response) => {
  const { date, description, price } = req.body;
  try {
    if (!date || !description || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const docRef = await adminDb.collection('expenses').add({
      date,
      description,
      price: parseFloat(price),
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: "Expense Saved!", id: docRef.id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllExpenses = async (req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection('expenses').orderBy('date', 'desc').get();
    const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminDb.collection('expenses').doc(id).delete();
    res.json({ message: "Expense Deleted!" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, description, price } = req.body;

    await adminDb.collection('expenses').doc(id).update({
      date,
      description,
      price: parseFloat(price),
      updatedAt: new Date().toISOString()
    });

    res.json({ message: "Expense Updated!" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};