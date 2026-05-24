import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCI3oz1sb556m5a9kXtW4eVclGtqjTQBBg",
  authDomain: "budget-buddy-app-506ce.firebaseapp.com",
  projectId: "budget-buddy-app-506ce",
  storageBucket: "budget-buddy-app-506ce.firebasestorage.app",
  messagingSenderId: "419866507193",
  appId: "1:419866507193:web:8feead91c96998588fa868",
};

const app = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
