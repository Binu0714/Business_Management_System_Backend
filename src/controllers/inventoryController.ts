import type { Request, Response } from 'express';
import { adminDb } from '../config/FirebaseAdmin.js';
import admin from 'firebase-admin';

// 1. Fetch All Inventory Items
export const getInventory = async (req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection('inventory').orderBy('createdAt', 'desc').get();
    const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(inventory);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Adjust Stock Quantity Manually
export const adjustStock = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { adjustmentQty } = req.body; // Can be positive (e.g. +10) or negative (e.g. -5)

  try {
    const docRef = adminDb.collection('inventory').doc(id);
    
    // Use Firestore's increment operator for safety
    await docRef.update({
      stockQty: admin.firestore.FieldValue.increment(adjustmentQty),
      updatedAt: new Date().toISOString()
    });

    res.json({ message: "Stock adjusted successfully!" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};