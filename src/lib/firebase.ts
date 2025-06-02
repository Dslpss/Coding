// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "barbearia-bd25e.firebaseapp.com",
  projectId: "barbearia-bd25e",
  storageBucket: "barbearia-bd25e.appspot.com",
  messagingSenderId: "1079641275104",
  appId: "1:1079641275104:web:e166f6912943c96bee6e85",
  measurementId: "G-0MM4VLLQJR",
};

// Garante que o app não será inicializado mais de uma vez (SSR/Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
