import { initializeApp, credential, auth, firestore } from 'firebase-admin';

const serviceAccountKeyRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountKeyRaw) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
}

const serviceAccount = JSON.parse(serviceAccountKeyRaw);

initializeApp({
  credential: credential.cert(serviceAccount),
});

export const adminAuth = auth();
export const adminDb = firestore();