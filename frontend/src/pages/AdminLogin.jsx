import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithRedirect, signInWithPopup, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const AdminLogin = () => {
  const { theme, actualTheme, changeTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle redirect result on component mount
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Clear the redirect processing flag
          sessionStorage.removeItem('redirectProcessed');

          // Navigate to admin login page if we're on the auth handler
          if (window.location.pathname === '/__/auth/handler') {
            window.history.replaceState(null, null, '/admin-login');
          }

          // Handle the successful authentication
          await handleSuccessfulGoogleAuth(result.user);
        }
      } catch (error) {
        console.error('Redirect result error:', error);

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
      handleRedirectResult();
      sessionStorage.setItem('redirectProcessed', 'true');
      sessionStorage.removeItem('oauthStarted'); // Clean up
    }
  }, []);
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Store admin user data in localStorage
      const userData = {
        name: userCredential.user.displayName || userCredential.user.email.split('@')[0],
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        photoURL: userCredential.user.photoURL
      };
      localStorage.setItem('adminUser', JSON.stringify(userData));

      // Store user type in localStorage for routing logic
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('userEmail', userCredential.user.email);

      toast.success('Admin signed in successfully!');
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Admin login error:', error);

      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
          toast.error('No admin account found with this email. Please sign up first.');
          break;
        case 'auth/wrong-password':
          toast.error('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          toast.error('Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          toast.error('This admin account has been disabled.');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many failed attempts. Please try again later.');
          break;
        case 'auth/operation-not-allowed':
          toast.error('Email/password authentication is not enabled in Firebase.');
          break;
        default:
          toast.error(`Admin login failed: ${error.message}`);
      }
    }
  };

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  };

  // Function to check if admin exists in the database
  const checkAdminExists = async (email) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/admin/check/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { exists: false };
      }
      console.error('Error checking admin existence:', error);
      throw error;
    }
  };
  // Function to handle successful Google authentication
  const handleSuccessfulGoogleAuth = async (user) => {
    try {
      // Store admin user data in localStorage
      const userData = {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        uid: user.uid,
        photoURL: user.photoURL
      };
      localStorage.setItem('adminUser', JSON.stringify(userData));

      // Check if admin exists in our database
      const adminCheck = await checkAdminExists(user.email);

      if (adminCheck.exists) {
        // Store user type in localStorage for routing logic
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('userEmail', user.email);

        toast.success(`Welcome back, Admin ${user.displayName || user.email}!`);
        navigate('/admin-dashboard');
      } else {
        toast.success(`Welcome ${user.displayName || user.email}! Please complete your admin setup.`);
        // Navigate to admin company setup with admin data
        navigate('/admin-company-setup', {
          state: {
            userData: {
              name: user.displayName || '',
              email: user.email
            }
          }
        });
      }
    } catch (error) {
      console.error('Error in post-auth flow:', error);
      toast.error('Authentication successful, but there was an error. Please try again.');
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      // Use popup for development, redirect for production
      if (import.meta.env.DEV) {
        setIsLoading(true);
        const result = await signInWithPopup(auth, googleProvider);

        // Handle the successful authentication
        await handleSuccessfulGoogleAuth(result.user);
      } else {
        // Clear any previous redirect processing flag
        sessionStorage.removeItem('redirectProcessed');

        // Set a flag to indicate we're starting OAuth
        sessionStorage.setItem('oauthStarted', 'true');

        await signInWithRedirect(auth, googleProvider);
      }

    } catch (error) {
      console.error('Google sign-in error:', error);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className={`max-w-md w-full space-y-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Admin Sign In
          </h2>
          <p className={`mt-2 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Sign in to your admin account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleEmailSignIn}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                } rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                } rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
            >
              {isLoading ? 'Signing in...' : 'Sign in with Email'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/admin-signup"
              className={`font-medium ${
                theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
              } transition duration-150 ease-in-out`}
            >
              Don't have an admin account? Sign up
            </Link>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className={`font-medium ${
                theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
              } transition duration-150 ease-in-out`}
            >
              Back to User Login
            </Link>
          </div>
        </form>

        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              theme === 'dark' ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'
            } hover:opacity-80 transition duration-150 ease-in-out`}
            aria-label="Toggle theme"
          >
            {actualTheme === 'light' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
