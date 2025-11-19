import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // <--- Importante: Importar Firestore
import { getAnalytics } from "firebase/analytics";

// Pega aquí tu configuración real de Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "appmusica-5c872.firebaseapp.com",
  projectId: "appmusica-5c872",
  storageBucket: "appmusica-5c872.appspot.com",
  messagingSenderId: "134336615838",
  appId: "1:134336615838:web:826064c59849c9c0d9b28f",
  measurementId: "G-KT5M6DYJ39"
};

// Inicializar la App
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ⚠️ ESTA ES LA LÍNEA QUE TE FALTABA:
const db = getFirestore(app); 

// Ahora sí podemos exportar db porque ya existe
export { db };