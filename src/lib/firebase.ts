import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-itV0kCBD5gHo8KZa0PE96eGJmvE_JT8",
  authDomain: "seagan-48f3c.firebaseapp.com",
  projectId: "seagan-48f3c",
  storageBucket: "seagan-48f3c.firebasestorage.app",
  messagingSenderId: "421168615195",
  appId: "1:421168615195:web:7bed10d358ab3dc00c8dbe",
  measurementId: "G-DFDS0TJHY1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Admin Error:", error);
    throw error;
  }
};
