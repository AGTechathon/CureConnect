import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCFdbSFYfjh9UIvrfFJZr60U7OAZIUNU8I",
  authDomain: "goods-ab8b5.firebaseapp.com",
  projectId: "goods-ab8b5",
  storageBucket: "goods-ab8b5.firebasestorage.app",
  messagingSenderId: "1084647770453",
  appId: "1:1084647770453:web:53d5c957527728c6fd47dc",
  measurementId: "G-5SXG6Y87Y1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 