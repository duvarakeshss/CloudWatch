import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// For development, we need to handle OAuth redirects differently
// because Firebase will try to redirect to the authDomain
if (import.meta.env.DEV) {
  // Note: You'll need to add localhost:5173 to your Firebase Console
  // under Authentication > Settings > Authorized domains
}

// Validate configuration
if (!firebaseConfig.apiKey) {
  console.error('Firebase API key is missing. Please check your .env file.');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Check if localStorage is available (important for persistence)
const checkLocalStorage = () => {
  try {
    const test = '__firebase_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('⚠️ localStorage is not available:', e);
    return false;
  }
};

// Set persistence to local storage (session persists until logout)
// This must be done synchronously before any auth operations
if (checkLocalStorage()) {
  try {
    setPersistence(auth, browserLocalPersistence);

    // Listen for auth state changes to debug persistence
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
      } else {
        // User is signed out
      }
    });

  } catch (error) {
    console.error('❌ Failed to set auth persistence:', error);
  }
} else {
  console.warn('⚠️ localStorage not available, using session persistence');
  // Fall back to session persistence if localStorage is not available
  try {
    setPersistence(auth, browserSessionPersistence);
  } catch (error) {
    console.error('❌ Failed to set session persistence:', error);
  }
}

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure auth for development environment
if (import.meta.env.DEV) {
  // Note: OAuth redirects should work automatically with proper Firebase Console configuration
  // Make sure to add your development domain to Firebase Console > Authentication > Authorized domains
}

// Log Firebase initialization status