import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebaseAdmin.js';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};