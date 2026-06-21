import type { Request, Response } from 'express';
import { adminDb } from '../config/FirebaseAdmin.js';

export const savePurchase = async (req: Request, res: Response) => {
  try {
    const { supplierId, supplierName, date, remarks, items, grandTotal, batchNo, expDate } = req.body;

    const purchaseRef = await adminDb.collection('purchases').add({
      supplierId,
      supplierName,
      date,
      batchNo, 
      expDate, 
      remarks,
      items,
      grandTotal,
      createdAt: new Date().toISOString()
    });

    for (const item of items) {
      await adminDb.collection('inventory').add({
        itemId: item.itemId,
        productName: item.itemName,
        price: item.price,
        sellingPrice: item.sellingPrice,
        originalQty: item.qty, // FIX: Save original quantity as a separate field
        stockQty: item.qty,    // This is the one that will decrease during sales
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

export const getAllPurchases = async (req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection('purchases').orderBy('createdAt', 'desc').get();
    const purchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(purchases);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePurchase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const { supplierId, supplierName, date, remarks, items, grandTotal, batchNo, expDate } = req.body;

    await adminDb.collection('purchases').doc(id).update({
      supplierId,
      supplierName,
      date,
      remarks,
      items,
      grandTotal,
      batchNo,
      expDate,
      updatedAt: new Date().toISOString()
    });

    const oldInventorySnapshot = await adminDb.collection('inventory')
      .where('purchaseId', '==', id)
      .get();

    const batch = adminDb.batch();
    oldInventorySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit(); 

    for (const item of items) {
      await adminDb.collection('inventory').add({
        itemId: item.itemId,
        productName: item.itemName,
        price: item.price,
        sellingPrice: item.sellingPrice,
        originalQty: item.qty, // FIX: Save original quantity as a separate field
        stockQty: item.qty,    // This is the one that will decrease during sales
        batchNo: batchNo,
        expDate: expDate,
        purchaseId: id,
        createdAt: new Date().toISOString()
      });
    }

    res.json({ message: "Purchase Order and Inventory synced successfully!" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePurchase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 

    const inventorySnapshot = await adminDb.collection('inventory')
      .where('purchaseId', '==', id)
      .get();

    for (const doc of inventorySnapshot.docs) {
      const data = doc.data();
      const currentStock = data.stockQty ?? 0;
      const originalQty = data.originalQty ?? 0;

      if (currentStock < originalQty) {
        return res.status(400).json({ 
          message: `Cannot delete purchase! Some units of '${data.productName}' have already been sold.` 
        });
      }
    }

    await adminDb.collection('purchases').doc(id).delete();

    const batch = adminDb.batch();
    inventorySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({ message: "Purchase Order deleted and inventory cleaned up successfully!" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};