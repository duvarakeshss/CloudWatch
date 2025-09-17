import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithRedirect, signInWithPopup, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle redirect result on component mount
    const handleRedirectResult = async () => {
      try {
        console.log('🔍 Checking for OAuth redirect result...');
        console.log('Current URL:', window.location.href);
        console.log('URL params:', new URLSearchParams(window.location.search).toString());
        console.log('URL pathname:', window.location.pathname);

        // Check if this is the Firebase auth handler callback
        if (window.location.pathname === '/__/auth/handler') {
          console.log('🔄 Firebase auth handler detected, processing...');
        }

        const result = await getRedirectResult(auth);
        if (result) {
          console.log('✅ Google sign-in successful:', result.user);
          console.log('📧 User email:', result.user.email);
          console.log('👤 User display name:', result.user.displayName);

          // Clear the redirect processing flag
          sessionStorage.removeItem('redirectProcessed');

          // Navigate to login page if we're on the auth handler
          if (window.location.pathname === '/__/auth/handler') {
            console.log('🏠 Redirecting from auth handler to home...');
            window.history.replaceState(null, null, '/login');
          }

          // Handle the successful authentication
          await handleSuccessfulGoogleAuth(result.user);
        } else {
          console.log('ℹ️ No redirect result found - normal for initial page load');
        }
      } catch (error) {
        console.error('❌ Redirect result error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error object:', error);

        // Clear the redirect processing flag on error
        sessionStorage.removeItem('redirectProcessed');

        switch (error.code) {
          case 'auth/popup-closed-by-user':
            toast.info('Google sign-in was cancelled');
            break;
          case 'auth/cancelled-popup-request':
            toast.info('Another sign-in request is in progress');
            break;
          case 'auth/popup-blocked':
            toast.error('Popup was blocked by browser. Please allow popups for this site.');
            break;
          case 'auth/unauthorized-domain':
            toast.error('This domain is not authorized for Google sign-in. Please check Firebase Console.');
            console.error('🔧 Fix: Add your domain to Firebase Console > Authentication > Authorized domains');
            break;
          case 'auth/invalid-api-key':
            toast.error('Invalid Firebase API key. Please check your .env file.');
            break;
          case 'auth/operation-not-allowed':
            toast.error('Google sign-in is not enabled. Please enable it in Firebase Console.');
            break;
          case 'auth/invalid-credential':
            toast.error('Invalid OAuth credential. Please try again.');
            break;
          default:
            toast.error(`Google sign-in failed: ${error.message}`);
        }
      }
    };

    // Only run if we haven't already processed a redirect
    const redirectProcessed = sessionStorage.getItem('redirectProcessed');
    const oauthStarted = sessionStorage.getItem('oauthStarted');

    if (!redirectProcessed && oauthStarted) {
      console.log('🚀 Processing OAuth redirect...');
      handleRedirectResult();
      sessionStorage.setItem('redirectProcessed', 'true');
      sessionStorage.removeItem('oauthStarted'); // Clean up
    } else if (!oauthStarted) {
      console.log('ℹ️ No OAuth flow started, normal page load');
    } else {
      console.log('⏭️ Redirect already processed, skipping...');
    }
  }, []);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', userCredential.user);
      toast.success('Signed in successfully!');
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
          toast.error('No account found with this email. Please sign up first.');
          break;
        case 'auth/wrong-password':
          toast.error('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          toast.error('Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          toast.error('This account has been disabled.');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many failed attempts. Please try again later.');
          break;
        case 'auth/operation-not-allowed':
          toast.error('Email/password authentication is not enabled in Firebase.');
          break;
        default:
          toast.error(`Login failed: ${error.message}`);
      }
    }
  };

  // Function to check if user exists in the database
  const checkUserExists = async (email) => {
    try {
      console.log('🔍 Checking if user exists:', email);
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/users/check/${encodeURIComponent(email)}`);
      console.log('✅ User check response:', response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️ User does not exist in database');
        return { exists: false };
      }
      console.error('❌ Error checking user existence:', error);
      throw error;
    }
  };

  // Function to handle successful Google authentication
  const handleSuccessfulGoogleAuth = async (user) => {
    try {
      console.log('🎉 Google authentication successful for:', user.email);
      
      // Check if user exists in our database
      const userCheck = await checkUserExists(user.email);
      
      if (userCheck.exists) {
        console.log('👤 Existing user found, navigating to dashboard');
        toast.success(`Welcome back, ${user.displayName || user.email}!`);
        navigate('/dashboard');
      } else {
        console.log('🆕 New user, navigating to company setup');
        toast.success(`Welcome ${user.displayName || user.email}! Please complete your setup.`);
        // Navigate to company setup with user data
        navigate('/company-setup', { 
          state: { 
            userData: {
              name: user.displayName || '',
              email: user.email
            }
          }
        });
      }
    } catch (error) {
      console.error('❌ Error in post-auth flow:', error);
      toast.error('Authentication successful, but there was an error. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('🚀 Starting Google sign-in...');
      console.log('Current auth state:', auth.currentUser ? 'User logged in' : 'No user');
      console.log('Current URL before auth:', window.location.href);

      // Use popup for development, redirect for production
      if (import.meta.env.DEV) {
        console.log('🔧 Development mode: Using popup authentication');
        setIsLoading(true);
        const result = await signInWithPopup(auth, googleProvider);
        console.log('✅ Google sign-in successful (popup):', result.user);
        
        // Handle the successful authentication
        await handleSuccessfulGoogleAuth(result.user);
      } else {
        console.log('🏭 Production mode: Using redirect authentication');
        // Clear any previous redirect processing flag
        sessionStorage.removeItem('redirectProcessed');
        console.log('🧹 Cleared previous redirect processing flag');

        // Set a flag to indicate we're starting OAuth
        sessionStorage.setItem('oauthStarted', 'true');

        await signInWithRedirect(auth, googleProvider);
        console.log('✅ Google sign-in redirect initiated successfully');
      }

    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Clear flags on error
      sessionStorage.removeItem('redirectProcessed');
      sessionStorage.removeItem('oauthStarted');

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          toast.warning('Sign-in was cancelled');
          break;
        case 'auth/popup-blocked':
          toast.error('Popup was blocked. Please allow popups and try again.');
          break;
        case 'auth/unauthorized-domain':
          toast.error('This domain is not authorized for Google sign-in.');
          console.error('🔧 Fix: Add your domain to Firebase Console > Authentication > Authorized domains');
          console.error('   Current domain should be added:', window.location.origin);
          break;
        case 'auth/invalid-api-key':
          toast.error('Invalid Firebase API key. Please check your .env file.');
          break;
        case 'auth/api-key-not-valid':
          toast.error('Firebase API key is not valid. Please check Firebase Console.');
          break;
        case 'auth/operation-not-allowed':
          toast.error('Google sign-in is not enabled. Please enable it in Firebase Console.');
          console.error('🔧 Fix: Firebase Console > Authentication > Sign-in method > Google > Enable');
          break;
        default:
          toast.error(`Google sign-in failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background-color)]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>
        {`
          :root {
            --primary-color: #1173d4;
            --secondary-color: #283039;
            --text-color: #ffffff;
            --subtle-text-color: #9dabb9;
            --background-color: #111418;
            --input-background: #1c2127;
            --border-color: #3b4754;
          }
        `}
      </style>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[var(--border-color)] px-10 py-4">
        <div className="flex items-center gap-3 text-[var(--text-color)]">
          <svg className="h-8 w-8 text-[var(--primary-color)]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor"></path>
            <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd"></path>
          </svg>
          <h1 className="text-xl font-bold">CloudWatch</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-white/80"> help </span>
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--text-color)]">Sign in to your account</h2>
            <p className="mt-2 text-center text-sm text-[var(--subtle-text-color)]">
              Don't have an account?
              <Link className="font-medium text-[var(--primary-color)] hover:text-blue-500 ml-1" to="/signup"> Sign up </Link>
            </p>
          </div>
          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--text-color)] bg-[var(--secondary-color)] hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.945 11.055h-8.09v3.636h4.59c-.205 1.41-1.636 3.273-4.59 3.273-2.727 0-4.955-2.273-4.955-5.09s2.228-5.09 4.955-5.09c1.5 0 2.59.636 3.182 1.227l2.863-2.863C16.955 4.318 14.864 3 12.045 3 7.045 3 3.09 7.045 3.09 12s3.955 9 8.955 9c5.273 0 8.773-3.636 8.773-8.955 0-.636-.045-1.227-.136-1.99z"></path>
                </svg>
              )}
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
            <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-color)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--background-color)] text-[var(--subtle-text-color)]"> OR </span>
              </div>
            </div>
            <form onSubmit={handleEmailSignIn} className="space-y-6">
              <div className="relative">
                <input
                  autoComplete="email"
                  className="peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] placeholder-transparent rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4"
                  id="email"
                  name="email"
                  placeholder="Email address"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label className="absolute left-4 -top-3.5 text-[var(--subtle-text-color)] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)]" htmlFor="email">Email address</label>
              </div>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] placeholder-transparent rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4"
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label className="absolute left-4 -top-3.5 text-[var(--subtle-text-color)] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)]" htmlFor="password">Password</label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    className="h-4 w-4 rounded border-[var(--border-color)] bg-[var(--input-background)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="ml-2 block text-sm text-[var(--subtle-text-color)]" htmlFor="remember-me"> Remember me </label>
                </div>
                <div className="text-sm">
                  <a className="font-medium text-[var(--primary-color)] hover:text-blue-500" href="#"> Forgot your password? </a>
                </div>
              </div>
              <div>
                <button className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--primary-color)] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-all" type="submit">
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;