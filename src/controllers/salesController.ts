import type { Request, Response } from 'express';
import { adminDb } from '../config/firebaseAdmin.js';

// BMS_backend/src/controllers/salesController.ts

export const confirmSale = async (req: Request, res: Response) => {
  // FIX: Destructure the correct fields for a Sale (not a Purchase)
  const { shopName, date, remarks, items, grandTotal, amountPaid, outstanding, status, shopPhone } = req.body;

  try {
    // 1. Correct Validation: Check for Shop Name and items instead of supplierId
    if (!shopName || !date || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid sales data: Shop Name and Items are required." });
    }

    // 2. Run the atomic transaction to update stock levels
    await adminDb.runTransaction(async (transaction) => {
      const inventoryUpdates: { docRef: any, newQty: number }[] = [];

      for (const item of items) {
        // Find the matching item in the warehouse inventory
        const inventoryQuery = await adminDb.collection('inventory')
          .where('itemId', '==', item.itemId)
          .limit(1)
          .get();

        if (inventoryQuery.empty) {
          throw new Error(`Item ${item.itemName} (ID: ${item.itemId}) is not in your warehouse inventory!`);
        }

        const inventoryDoc = inventoryQuery.docs[0];
        const currentStock = inventoryDoc.data().stockQty || 0;

        // Verify if we have enough physical stock
        if (currentStock < item.qty) {
          throw new Error(`Out of stock! Only ${currentStock} left of ${item.itemName}.`);
        }

        inventoryUpdates.push({
          docRef: inventoryDoc.ref,
          newQty: currentStock - item.qty
        });
      }

      // If all items are in stock, execute the deductions
      for (const update of inventoryUpdates) {
        transaction.update(update.docRef, { stockQty: update.newQty });
      }

      // Save the sales record to the database
      const salesRef = adminDb.collection('sales').doc();
      transaction.set(salesRef, {
        shopName,
        shopPhone,
        date,
        remarks: remarks || "",
        items,
        grandTotal,
        amountPaid,
        outstanding,
        status,
        createdAt: new Date().toISOString()
      });
    });

    res.status(201).json({ message: "Sale confirmed and stock deducted successfully!" });

  } catch (error: any) {
    console.error("Sales Transaction Failed (Rolled Back):", error.message);
    res.status(400).json({ message: error.message }); // Sends the specific error
  }
};

export const getAllSales = async (req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection('sales').orderBy('createdAt', 'desc').get();
    const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Existing Sale (PUT)
export const updateSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminDb.collection('sales').doc(id).update(req.body);
    res.json({ message: "Sales record updated!" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete Sale (DELETE)
export const deleteSale = async (req: Request, res: Response) => {
  const { id } = req.params; // The sale document ID

  try {
    // Run the deletion and stock restoration as an Atomic Transaction
    await adminDb.runTransaction(async (transaction) => {
      const saleRef = adminDb.collection('sales').doc(id);
      const saleDoc = await transaction.get(saleRef);

      if (!saleDoc.exists) {
        throw new Error("Sales record not found.");
      }

      const saleData = saleDoc.data();
      const itemsToRestore = saleData?.items || [];

      // Find the inventory document for each item and prepare the restoration
      for (const item of itemsToRestore) {
        const inventoryQuery = await adminDb.collection('inventory')
          .where('itemId', '==', item.itemId)
          .limit(1)
          .get();

        if (!inventoryQuery.empty) {
          const inventoryDoc = inventoryQuery.docs[0];
          const currentStock = inventoryDoc.data().stockQty || 0;

          // RESTORE STOCK: Add the sold quantity back to the inventory
          transaction.update(inventoryDoc.ref, {
            stockQty: currentStock + item.qty
          });
        }
      }

      // Delete the actual sales record
      transaction.delete(saleRef);
    });

    res.json({ message: "Sales record deleted and stock restored successfully!" });
  } catch (error: any) {
    console.error("Failed to delete sale and restore stock:", error.message);
    res.status(500).json({ message: error.message });
  }
};