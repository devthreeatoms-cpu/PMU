import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
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
  if (!admin.apps.length) throw new Error("Firebase admin SDK is not initialized. Check server env vars.");
  return admin.apps[0]!;
};

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    return (admin.firestore(getAdminApp()) as any)[prop];
  },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    return (admin.auth(getAdminApp()) as any)[prop];
  },
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_, prop) {
    return (admin.storage(getAdminApp()) as any)[prop];
  },
});
