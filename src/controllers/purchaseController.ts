import type { Request, Response } from 'express';
import { adminDb } from '../config/FirebaseAdmin.js';

// 1. Confirm and Save a New Purchase Order
export const savePurchase = async (req: Request, res: Response) => {
  try {
    const { supplierId, supplierName, date, remarks, items, grandTotal, batchNo, expDate } = req.body;

    const purchaseRef = await adminDb.collection('purchases').add({
      supplierId,
      supplierName,
      date,
      batchNo, // FIX: Added this so it actually gets saved in the purchases document!
      expDate, // FIX: Added this so it actually gets saved in the purchases document!
      remarks,
      items,
      grandTotal,
      createdAt: new Date().toISOString()
    });

    for (const item of items) {
      await adminDb.collection('inventory').add({
        itemId: item.itemId,
        itemName: item.itemName,
        price: item.price,
        sellingPrice: item.sellingPrice,
        qty: item.qty,
        batchNo: batchNo, 
        expDate: expDate, 
        purchaseId: purchaseRef.id,
        createdAt: new Date().toISOString()
      });
    }

    res.status(201).json({ message: "Purchase Order Confirmed!" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Fetch All Purchase Orders
export const getAllPurchases = async (req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection('purchases').orderBy('createdAt', 'desc').get();
    const purchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(purchases);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update an Existing Purchase Order
export const updatePurchase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    await adminDb.collection('purchases').doc(id).update(updatedData);
    res.json({ message: "Purchase Order Updated!" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete a Purchase Order
export const deletePurchase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminDb.collection('purchases').doc(id).delete();
    res.json({ message: "Purchase Order Deleted!" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};