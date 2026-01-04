// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByERGPfdGKhiBaqiqVP5Gcm7TNaotmFtQ",
  authDomain: "operos-59460.firebaseapp.com",
  projectId: "operos-59460",
  storageBucket: "operos-59460.firebasestorage.app",
  messagingSenderId: "252103314888",
  appId: "1:252103314888:web:e98e6e654ad3d9190604fd",
  measurementId: "G-3EB2ZFXFG8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);