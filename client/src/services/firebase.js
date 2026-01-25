import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Configuration from environment variables
// User needs to add these to .env (VITE_ prefixed)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if config is present
let app;
let db;
let analytics;

try {
    if (firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
        db = getDatabase(app);
        // Analytics is optional, but good to have since user provided measurementId
        if (typeof window !== 'undefined') {
            const { getAnalytics } = await import("firebase/analytics");
            analytics = getAnalytics(app);
        }
        console.log("✅ Firebase initialized successfully");
    } else {
        console.warn("⚠️ Firebase config missing. Chat will not work until keys are added to .env");
    }
} catch (error) {
    console.error("❌ Firebase initialization error:", error);
}

export { db };
