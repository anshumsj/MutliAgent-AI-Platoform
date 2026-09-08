import admin from "firebase-admin";

import serviceAccount from "/c:/Users/Anshum/OneDrive/Desktop/MutiAI/backend/services/auth/serviceAccountKey.json";

export const app = admin.initializeApp({
  credential: cert(serviceAccount)
});
