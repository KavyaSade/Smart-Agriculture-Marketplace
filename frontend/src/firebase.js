import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

let auth = null;
let googleProvider = null;
let isFirebaseConfigured = false;
let messaging = null;

if (apiKey && authDomain && projectId) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    isFirebaseConfigured = true;
    console.log("Firebase initialized successfully.");

    // Check browser support for messaging
    isSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
        console.log("Firebase Cloud Messaging is supported and initialized.");
      } else {
        console.warn("FCM messaging is not supported in this browser.");
      }
    }).catch(err => {
      console.error("Error checking FCM messaging support:", err);
    });

  } catch (error) {
    console.error("Failed to initialize Firebase Auth:", error);
  }
} else {
  console.warn("Firebase configuration missing in VITE environment variables. Running in simulation mode.");
}

export { auth, googleProvider, isFirebaseConfigured, messaging };
