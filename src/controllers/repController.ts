import type { Request, Response } from 'express';
import { adminDb } from '../config/tempAdmin.js';

export const addRep = async (req: Request, res: Response) => {
  try {
    const { name, address, contactNo } = req.body;
    
    // Generate SR001 sequence
    const snapshot = await adminDb.collection('salesReps').orderBy('repId', 'desc').limit(1).get();
    let newId = 'SR001';
    if (!snapshot.empty) {
      const lastId = snapshot.docs[0].data().repId;
      const num = parseInt(lastId.substring(2)) + 1;
      newId = `SR${num.toString().padStart(3, '0')}`;
    }

    await adminDb.collection('salesReps').add({ 
      repId: newId, 
      name, 
      address, 
      contactNo,
      createdAt: new Date().toISOString() 
    });
    res.status(201).json({ message: "Sales Rep Added" });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const updateRep = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminDb.collection('salesReps').doc(id).update(req.body);
    res.json({ message: "Sales Rep Updated" });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const deleteRep = async (req: Request, res: Response) => {
  try {
    await adminDb.collection('salesReps').doc(req.params.id).delete();
    res.json({ message: "Sales Rep Deleted" });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getAllReps = async (req: Request, res: Response) => {
  const snap = await adminDb.collection('salesReps').get();
  res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};