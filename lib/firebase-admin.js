import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Attempt to load the service account from an environment variable (preferred)
let serviceAccount;

try {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf-8")
  );
} catch (envError) {
  // If environment variable is not set or invalid, fallback to loading from file
  try {
    const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    console.warn("⚠️ Loaded Firebase service account from file. Consider using environment variables in production.");
  } catch (fileError) {
    console.error("❌ Failed to load Firebase service account:", fileError.message);
    throw fileError;
  }
}

// Initialize Firebase Admin SDK only once, with error handling and logging
if (!getApps().length) {
  try {
    initializeApp({ credential: cert(serviceAccount) });
    console.log("✅ Firebase Admin Initialized");
  } catch (initError) {
    console.error("❌ Failed to initialize Firebase Admin:", initError.message);
    throw initError;
  }
}

// Export Firestore instance and admin object for use elsewhere in your app
export const adminDb = getFirestore();
export { admin };
