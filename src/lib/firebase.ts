import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCI3ozlsb556m5a9kXtW4eVclGtqjTQBbg",
  authDomain: "budget-buddy-app-506ce.firebaseapp.com",
  projectId: "budget-buddy-app-506ce",
  storageBucket: "budget-buddy-app-506ce.firebasestorage.app",
  messagingSenderId: "419866507193",
  appId: "1:419866507193:web:8feead91c96998588fa868"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);