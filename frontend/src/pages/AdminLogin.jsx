import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
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
      setIsLoading(true);

      // Always use popup authentication for better user experience
      console.log('Using popup authentication');
      const result = await signInWithPopup(auth, googleProvider);
      await handleSuccessfulGoogleAuth(result.user);

    } catch (error) {
      console.error('Google sign-in error:', error);

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
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--color-background)', fontFamily: "'Inter', sans-serif" }}>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid px-10 py-4" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
          <svg className="h-8 w-8" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <h1 className="text-xl font-bold">CloudWatch</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors hover:bg-[var(--hover-background)]"
            title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
            style={{ backgroundColor: 'var(--color-input-background)' }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--color-text)' }}>
              {actualTheme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
          <button className="p-2 rounded-full transition-colors hover:bg-[var(--hover-background)]" style={{ backgroundColor: 'var(--color-input-background)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-text)' }}> help </span>
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-xl shadow-2xl p-6 space-y-6" style={{ backgroundColor: 'var(--color-input-background)', border: '1px solid var(--color-border)' }}>
            <div>
              <h2 className="mt-4 text-center text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Admin Sign In</h2>
              <p className="mt-1 text-center text-sm" style={{ color: 'var(--color-subtle-text)' }}>
                Don't have an admin account?
                <Link className="font-medium hover:text-[var(--color-primary-hover)] ml-1 transition-colors duration-200" style={{ color: 'var(--color-primary)' }} to="/admin-signup"> Sign up </Link>
              </p>
            </div>
            <div className="space-y-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:bg-[var(--hover-background)]"
                style={{ 
                  color: 'var(--color-text)', 
                  backgroundColor: 'var(--color-input-background)',
                  border: '1px solid var(--color-border)',
                  '--tw-ring-color': 'var(--color-primary)',
                  '--tw-ring-offset-color': 'var(--color-input-background)'
                }}
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--color-text)', borderTopColor: 'transparent' }}></div>
                ) : (
                  <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.945 11.055h-8.09v3.636h4.59c-.205 1.41-1.636 3.273-4.59 3.273-2.727 0-4.955-2.273-4.955-5.09s2.228-5.09 4.955-5.09c1.5 0 2.59.636 3.182 1.227l2.863-2.863C16.955 4.318 14.864 3 12.045 3 7.045 3 3.09 7.045 3.09 12s3.955 9 8.955 9c5.273 0 8.773-3.636 8.773-8.955 0-.636-.045-1.227-.136-1.99z"></path>
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
                    className="peer h-14 w-full border rounded-lg p-4 transition-all duration-200 focus:outline-none focus:ring-2 hover:border-[var(--input-hover-border)]"
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label className="absolute left-4 -top-3.5 text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 px-1" 
                         style={{ 
                           color: 'var(--color-subtle-text)', 
                           backgroundColor: 'var(--color-background)'
                         }} 
                         htmlFor="password">Password</label>
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

export default AdminLogin;
