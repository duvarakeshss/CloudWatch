import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// AdminSignup component for admin registration
const AdminSignup = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

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
          <svg className="h-8 w-8 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <h1 className="text-xl font-bold">CloudWatch Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[var(--input-background)] transition-colors">
            <span className="material-symbols-outlined text-[var(--text-color)]"> help </span>
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--text-color)]">Create admin account</h2>
            <p className="mt-2 text-center text-sm text-[var(--subtle-text-color)]">
              Or
              <Link className="font-medium text-[var(--primary-color)] hover:text-blue-500 ml-1" to="/admin-login"> sign in to your admin account </Link>
            </p>
          </div>
          <div className="space-y-6">
            <form onSubmit={handleEmailSignUp} className="space-y-6">
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
                <label className="absolute left-4 -top-3.5 text-[var(--subtle-text-color)] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--subtle-text-color)] peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)]" htmlFor="email">Email address</label>
              </div>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  className="peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] placeholder-transparent rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4"
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label className="absolute left-4 -top-3.5 text-[var(--subtle-text-color)] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--subtle-text-color)] peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)]" htmlFor="password">Password</label>
              </div>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  className="peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] placeholder-transparent rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <label className="absolute left-4 -top-3.5 text-[var(--subtle-text-color)] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--subtle-text-color)] peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)]" htmlFor="confirmPassword">Confirm Password</label>
              </div>
              <div>
                <button className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--primary-color)] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[var(--background-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-all" type="submit">
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSignup;