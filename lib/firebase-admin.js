import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// 1. Decode service account from base64 environment variable
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf-8")
);

// 2. Initialize Firebase only once
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

// 3. Export Firestore instance
export const adminDb = getFirestore();
