import type { Request, Response } from 'express';
import { adminAuth, adminDb } from '../config/FirebaseAdmin.js';

export const signUp = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;
  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
    });

    await adminDb.collection('profiles').doc(userRecord.uid).set({
      fullName,
      email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Admin registered successfully!" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};