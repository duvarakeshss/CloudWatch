import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const Login = () => {
  const { theme, actualTheme, changeTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle redirect result on component mount (for mobile devices)
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Redirect auth successful:', result.user);
          await handleSuccessfulGoogleAuth(result.user);
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        if (error.code !== 'auth/user-cancelled' && error.code !== 'auth/popup-closed-by-user') {
          toast.error(`Authentication failed: ${error.message}`);
        }
      }
    };

    // Check if we're returning from a redirect
    const urlParams = new URLSearchParams(window.location.search);
    const isRedirect = urlParams.has('code') || urlParams.has('state');

    if (isRedirect) {
      handleRedirectResult();
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !sessionStorage.getItem('authProcessed')) {
        sessionStorage.setItem('authProcessed', 'true');
        handleSuccessfulGoogleAuth(user);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Store user type in localStorage for routing logic
      localStorage.setItem('userType', 'user');
      localStorage.setItem('userEmail', userCredential.user.email);

      toast.success('Signed in successfully!');
    } catch (error) {
      console.error('Email sign in error:', error);

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

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  };

  // Function to check if user exists in the database
  const checkUserExists = async (email) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${apiUrl}/users/check/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { exists: false };
      }
      console.error('Error checking user existence:', error);
      throw error;
    }
  };

  // Function to handle successful Google authentication
  const handleSuccessfulGoogleAuth = async (user) => {
    try {
      // Check if user exists in our database
      const userCheck = await checkUserExists(user.email);

      if (userCheck.exists) {
        // Store user type in localStorage for routing logic
        localStorage.setItem('userType', 'user');
        localStorage.setItem('userEmail', user.email);

        toast.success(`Welcome back, ${user.displayName || user.email}!`);
        navigate('/dashboard');
      } else {
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
      console.error('Error in post-auth flow:', error);
      toast.error('Authentication successful, but there was an error. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      // Always use popup authentication for better user experience
      console.log('Using popup authentication');
      const result = await signInWithPopup(auth, googleProvider);
      await handleSuccessfulGoogleAuth(result.user);

    } catch (error) {
      console.error('Google sign-in error:', error);

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          toast.warning('Sign-in was cancelled');
          break;
        case 'auth/popup-blocked':
          toast.error('Popup was blocked. Please allow popups for this site and try again, or use a different browser.');
          break;
        case 'auth/cancelled-popup-request':
          toast.info('Another sign-in request is in progress');
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--color-background)', fontFamily: "'Inter', sans-serif" }}>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid px-10 py-4" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
          <svg className="h-8 w-8" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <h1 className="text-xl font-bold">DotWatch</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors hover:bg-[var(--hover-background)]"
            title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
            style={{ backgroundColor: 'transparent' }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--color-text)' }}>
              {actualTheme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
          <button className="p-2 rounded-full transition-colors hover:bg-[var(--hover-background)]" style={{ backgroundColor: 'transparent' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-text)' }}> help </span>
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-xl shadow-2xl p-6 space-y-6" style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--color-border)' }}>
            <div>
              <h2 className="mt-4 text-center text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Sign in to your account</h2>
              <p className="mt-1 text-center text-sm" style={{ color: 'var(--color-subtle-text)' }}>
                Don't have an account?
                <Link className="font-medium hover:text-[var(--color-primary-hover)] ml-1 transition-colors duration-200" style={{ color: 'var(--color-primary)' }} to="/signup"> Sign up </Link>
              </p>
            </div>
            <div className="space-y-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ 
                  color: 'var(--color-text)', 
                  backgroundColor: 'var(--color-input-background)',
                  border: '1px solid var(--color-border)',
                  '--tw-ring-color': '#4285f4',
                  '--tw-ring-offset-color': 'var(--color-background)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--hover-background)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--color-input-background)';
                }}
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-t-transparent rounded-full" style={{ borderColor: '#4285f4', borderTopColor: 'transparent' }}></div>
                ) : (
                  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </button>
              <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 rounded-full border" style={{ backgroundColor: 'var(--color-input-background)', color: 'var(--color-subtle-text)', borderColor: 'var(--color-border)' }}> OR </span>
                </div>
              </div>
              <form onSubmit={handleEmailSignIn} className="space-y-6">
                <div className="relative">
                  <input
                    autoComplete="email"
                    className="peer h-14 w-full border rounded-lg p-4 transition-all duration-200 focus:outline-none focus:ring-2 hover:border-[var(--input-hover-border)]"
                    style={{ 
                      backgroundColor: 'var(--color-background)', 
                      color: 'var(--color-text)', 
                      borderColor: 'var(--color-border)',
                      '--tw-ring-color': 'var(--color-primary)'
                    }}
                    id="email"
                    name="email"
                    placeholder="Email address"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label className="absolute left-4 -top-3.5 text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 px-1" 
                         style={{ 
                           color: 'var(--color-subtle-text)', 
                           backgroundColor: 'var(--color-background)'
                         }} 
                         htmlFor="email">Email address</label>
                </div>
                <div className="relative">
                  <input
                    autoComplete="current-password"
                    className="peer h-14 w-full border rounded-lg p-4 pr-12 transition-all duration-200 focus:outline-none focus:ring-2 hover:border-[var(--input-hover-border)]"
                    style={{ 
                      backgroundColor: 'var(--color-background)', 
                      color: 'var(--color-text)', 
                      borderColor: 'var(--color-border)',
                      '--tw-ring-color': 'var(--color-primary)'
                    }}
                    id="password"
                    name="password"
                    placeholder="Password"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label className="absolute left-4 -top-3.5 text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 px-1" 
                         style={{ 
                           color: 'var(--color-subtle-text)', 
                           backgroundColor: 'var(--color-background)'
                         }} 
                         htmlFor="password">Password</label>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-subtle-text)] hover:text-[var(--color-text)] transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ backgroundColor: 'transparent', border: 'none' }}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <div>
                  <button 
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white hover:bg-[var(--button-hover-bg)] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                    style={{ 
                      backgroundColor: 'var(--color-primary)',
                      '--tw-ring-color': 'var(--color-primary)',
                      '--tw-ring-offset-color': 'var(--color-input-background)'
                    }}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;