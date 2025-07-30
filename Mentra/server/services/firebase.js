// firebase.js

import admin from "firebase-admin";

// Read the base64-encoded Firebase config from the environment
const firebaseBase64 = process.env.FIREBASE_CONFIG_BASE64;

if (!firebaseBase64) {
  throw new Error("Missing FIREBASE_CONFIG_BASE64 environment variable.");
}

// Decode and parse the service account JSON
const serviceAccount = JSON.parse(
  Buffer.from(firebaseBase64, "base64").toString("utf-8")
);

// Initialize Firebase Admin SDK (prevent double init in dev/hot-reload)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Export admin auth
const adminAuth = admin.auth();
export { adminAuth };
export default admin;
