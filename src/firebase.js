import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID, // Optional
};

// Validate configuration at runtime (development only)
if (process.env.NODE_ENV === 'development') {
  const missingVars = Object.entries(firebaseConfig)
    .filter(([key, value]) => key !== 'measurementId' && !value)
    .map(([key]) => `REACT_APP_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

  if (missingVars.length > 0) {
    console.error('❌ Missing Firebase configuration variables:', missingVars);
  }
}

console.log('🔥 Firebase initializing with project:', firebaseConfig.projectId);

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);