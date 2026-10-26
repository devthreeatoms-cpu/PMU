import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    try {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } catch (error) {
      console.error("Firebase admin initialization error", error);
    }
  } else {
    console.warn(
      "Firebase admin: missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY — admin SDK not initialized"
    );
  }
}

const getAdminApp = () => {
  const app = getApps()[0];
  if (!app) throw new Error("Firebase admin SDK is not initialized. Check server env vars.");
  return app;
};

export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    return (getFirestore(getAdminApp()) as any)[prop];
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    return (getAuth(getAdminApp()) as any)[prop];
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(_, prop) {
    return (getStorage(getAdminApp()) as any)[prop];
  },
});
