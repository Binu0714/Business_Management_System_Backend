import type { Request, Response } from 'express';
import { adminDb } from '../config/tempAdmin.js';

export const addSupplier = async (req: Request, res: Response) => {
  try {
    const { name, location, address, contactNo } = req.body;
    
    const snapshot = await adminDb.collection('suppliers').orderBy('supplierId', 'desc').limit(1).get();

    let newId = 'S001';

    if (!snapshot.empty) {
      const lastId = snapshot.docs[0].data().supplierId;
      const num = parseInt(lastId.substring(1)) + 1;
      newId = `S${num.toString().padStart(3, '0')}`;
    }

    await adminDb.collection('suppliers').add({ supplierId: newId, name, location, address, contactNo });

    res.status(201).json({ message: "Supplier Added" });

  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminDb.collection('suppliers').doc(id).update(req.body);
    res.json({ message: "Supplier Updated" });

  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  const { id } = req.params; // The Supplier ID

  try {
    // 1. Find all past purchases associated with this supplier
    const purchasesSnapshot = await adminDb.collection('purchases')
      .where('supplierId', '==', id)
      .get();

    if (!purchasesSnapshot.empty) {
      // 2. Loop through each purchase to check if its stock has been sold
      for (const purchaseDoc of purchasesSnapshot.docs) {
        const purchaseId = purchaseDoc.id;
        
        const inventorySnapshot = await adminDb.collection('inventory')
          .where('purchaseId', '==', purchaseId)
          .get();

        for (const invDoc of inventorySnapshot.docs) {
          const invData = invDoc.data();
          const currentStock = invData.stockQty ?? 0;
          const originalQty = invData.originalQty ?? 0;

          // If any stock has been sold, block the deletion immediately!
          if (currentStock < originalQty) {
            return res.status(400).json({
              message: `Cannot delete supplier! Some items supplied by them (e.g., '${invData.productName}') have already been sold.`
            });
          }
        }
      }
    }

    await adminDb.collection('suppliers').doc(id).delete();
    
    res.json({ message: "Supplier deleted successfully!" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  const snap = await adminDb.collection('suppliers').get();
  res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};