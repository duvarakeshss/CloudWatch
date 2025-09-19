import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// AdminSignup component for admin registration
const AdminSignup = () => {
  const { theme, actualTheme, changeTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      toast.error('Password should be at least 6 characters');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Admin created:', userCredential.user);

      // Send email verification
      try {
        await sendEmailVerification(userCredential.user);
        console.log('Verification email sent to:', email);
        toast.success('Admin account created! Please check your email (including spam folder) to verify your account.');
      } catch (verificationError) {
        console.error('Email verification error:', verificationError);
        toast.warning('Admin account created but verification email failed to send. You can still sign in.');
      }

      // Navigate to admin login page after a short delay
      setTimeout(() => {
        navigate('/admin-login');
      }, 3000);
    } catch (error) {
      console.error('Admin signup error:', error);

      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error('This email is already registered. Try signing in instead.');
          console.log('Email already in use error handled');
          break;
        case 'auth/invalid-email':
          toast.error('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          toast.error('Password is too weak. Please choose a stronger password.');
          break;
        case 'auth/operation-not-allowed':
          toast.error('Email/password authentication is not enabled in Firebase.');
          break;
        case 'auth/api-key-not-valid':
          toast.error('Firebase API key is not valid. Please check your configuration.');
          break;
        default:
          toast.error(`Admin signup failed: ${error.message}`);
          console.log('Default error:', error.code, error.message);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-background)', fontFamily: "'Inter', sans-serif" }}>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid px-10 py-4" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
          <svg className="h-8 w-8" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <h1 className="text-xl font-bold">CloudWatch Admin</h1>
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
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-xl shadow-2xl p-8 space-y-8" style={{ backgroundColor: 'var(--color-input-background)', border: '1px solid var(--color-border)' }}>
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Create admin account</h2>
              <p className="mt-2 text-center text-sm" style={{ color: 'var(--color-subtle-text)' }}>
                Or
                <Link className="font-medium hover:text-[var(--color-primary-hover)] ml-1 transition-colors duration-200" style={{ color: 'var(--color-primary)' }} to="/admin-login"> sign in to your admin account </Link>
              </p>
            </div>
            <div className="space-y-6">
              <form onSubmit={handleEmailSignUp} className="space-y-6">
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
                    autoComplete="new-password"
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
                <div className="relative">
                  <input
                    autoComplete="new-password"
                    className="peer h-14 w-full border rounded-lg p-4 transition-all duration-200 focus:outline-none focus:ring-2 hover:border-[var(--input-hover-border)]"
                    style={{ 
                      backgroundColor: 'var(--color-background)', 
                      color: 'var(--color-text)', 
                      borderColor: 'var(--color-border)',
                      '--tw-ring-color': 'var(--color-primary)'
                    }}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label className="absolute left-4 -top-3.5 text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 px-1" 
                         style={{ 
                           color: 'var(--color-subtle-text)', 
                           backgroundColor: 'var(--color-background)'
                         }} 
                         htmlFor="confirmPassword">Confirm Password</label>
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
                  >
                    Create Admin Account
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

export default AdminSignup;