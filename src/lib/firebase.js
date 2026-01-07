import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBQK1cy5yAsiN_RlVgzujnl0vDkI14mQy8",
    authDomain: "amecatzz.firebaseapp.com",
    projectId: "amecatzz",
    storageBucket: "amecatzz.firebasestorage.app",
    messagingSenderId: "432779469154",
    appId: "1:432779469154:web:c83e22955d258a81a14c3b",
    measurementId: "G-DT3BTY1R7S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
