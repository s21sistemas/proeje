// Import the functions you need from the SDKs you need
import "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyDA3Vlj5YM0gIR40eH-JDMAd28DPFtxcm4",
  authDomain: "proeje-bbc0c.firebaseapp.com",
  projectId: "proeje-bbc0c",
  storageBucket: "proeje-bbc0c.firebasestorage.app",
  messagingSenderId: "23539267147",
  appId: "1:23539267147:web:a394968f418c6614d97fce"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

export { db };
export const storage = getStorage(app);