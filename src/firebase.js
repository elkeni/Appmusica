import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "appmusica-5c872.firebaseapp.com",
  projectId: "appmusica-5c872",
  storageBucket: "appmusica-5c872.appspot.com",
  messagingSenderId: "134336615838",
  appId: "1:134336615838:web:826064c59849c9c0d9b28f",
  measurementId: "G-KT5M6DYJ39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };