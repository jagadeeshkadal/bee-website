import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAgRdNdFZChiCvZX4e9rDL1iRMVKWl0e7E",
  authDomain: "honey-fc72d.firebaseapp.com",
  projectId: "honey-fc72d",
  storageBucket: "honey-fc72d.firebasestorage.app",
  messagingSenderId: "963063491053",
  appId: "1:963063491053:web:1498a84a5712d27834dfe4",
  measurementId: "G-C3ZR44PE3T"
};

// Initialize Firebase client app (HMR-safe for Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
