import type { Request, Response } from 'express';
import { adminDb } from '../config/FirebaseAdmin.js';

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
  try {
    await adminDb.collection('suppliers').doc(req.params.id).delete();
    res.json({ message: "Supplier Deleted" });
    
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getAll = async (req: Request, res: Response) => {
  const snap = await adminDb.collection('suppliers').get();
  res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};