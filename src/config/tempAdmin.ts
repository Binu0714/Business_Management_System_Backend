import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// 1. Read the raw JSON string from Vercel's environment variables
const serviceAccountKeyRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountKeyRaw) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
}

const serviceAccount = JSON.parse(serviceAccountKeyRaw);

// 2. Initialize using the modular cert
const app = initializeApp({
  credential: cert(serviceAccount),
});

// 3. Export using getAuth and getFirestore
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);