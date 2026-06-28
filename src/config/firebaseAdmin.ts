import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

let serviceAccount: any;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  const keyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  
  if (!existsSync(keyPath)) {
    throw new Error("Error: Neither FIREBASE_SERVICE_ACCOUNT environment variable nor local serviceAccountKey.json was found.");
  }
  
  serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
  console.log("📁 Loaded Firebase Credentials from local serviceAccountKey.json");
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);