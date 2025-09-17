import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';

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
  console.log('🔧 Development mode: Configuring for localhost OAuth');
  // Note: You'll need to add localhost:5173 to your Firebase Console
  // under Authentication > Settings > Authorized domains
}

// Validate configuration
if (!firebaseConfig.apiKey) {
  console.error('Firebase API key is missing. Please check your .env file.');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure auth for development environment
if (import.meta.env.DEV) {
  console.log('Development mode: Firebase configured for localhost');
  
  // Set custom domain for development
  // This helps ensure OAuth redirects work properly in development
  auth.settings = {
    ...auth.settings,
    redirectUri: `${window.location.origin}/login`
  };
}

// Log Firebase initialization
console.log('Firebase initialized with project:', firebaseConfig.projectId);
console.log('Auth domain:', firebaseConfig.authDomain);