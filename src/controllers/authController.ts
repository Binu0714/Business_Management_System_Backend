import type { Request, Response } from 'express';
import { adminAuth, adminDb } from '../config/tempAdmin.js';
import axios from 'axios';

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

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    const response = await axios.post(url, {
      email,
      password,
      returnSecureToken: true,
    });

    const { localId, idToken } = response.data;

    const userDoc = await adminDb.collection('profiles').doc(localId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User profile not found in ERP" });
    }

    const userData = userDoc.data();

    res.json({
      message: "Login successful",
      token: idToken,
      user: {
        uid: localId,
        email: email,
        fullName: userData?.fullName,
        role: userData?.role
      }
    });

  } catch (error: any) {
    const firebaseError = error.response?.data?.error?.message || "SERVER_ERROR";
    
    let friendlyMessage = "An error occurred during login";
    
    if (firebaseError === "INVALID_PASSWORD") friendlyMessage = "The password you entered is incorrect.";
    if (firebaseError === "EMAIL_NOT_FOUND") friendlyMessage = "No account found with this email.";
    if (firebaseError === "USER_DISABLED") friendlyMessage = "This account has been disabled.";
    if (firebaseError === "INVALID_LOGIN_CREDENTIALS") friendlyMessage = "Invalid email or password.";

    res.status(401).json({ message: friendlyMessage });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { fullName, currentPassword, newPassword, email } = req.body;

  try {
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new password." });
      }

      const apiKey = process.env.FIREBASE_WEB_API_KEY;
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

      try {
        await axios.post(url, {
          email,
          password: currentPassword,
          returnSecureToken: false,
        });
      } catch (authError) {
        return res.status(401).json({ message: "The current password you entered is incorrect." });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters." });
      }
      await adminAuth.updateUser(uid, { password: newPassword });
    }

    if (fullName) {
      await adminDb.collection('profiles').doc(uid).update({
        fullName,
        updatedAt: new Date().toISOString()
      });
    }

    res.json({ message: "Profile updated successfully!" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};