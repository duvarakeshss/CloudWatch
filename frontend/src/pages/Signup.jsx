import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// Signup component for user registration
const Signup = () => {
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

      // Send email verification
      try {
        await sendEmailVerification(userCredential.user);
        toast.success('Account created! Please check your email (including spam folder) to verify your account.');
      } catch (verificationError) {
        console.error('Email verification error:', verificationError);
        toast.warning('Account created but verification email failed to send. You can still sign in.');
      }

      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Signup error:', error);

      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error('This email is already registered. Try signing in instead.');
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
          toast.error(`Signup failed: ${error.message}`);
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
            --background-color: #000000;
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
          <h1 className="text-xl font-bold">CloudWatch</h1>
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
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--text-color)]">Create your account</h2>
            <p className="mt-2 text-center text-sm text-[var(--subtle-text-color)]">
              Or
              <Link className="font-medium text-[var(--primary-color)] hover:text-blue-500 ml-1" to="/login"> sign in to your existing account </Link>
            </p>
          </div>
          <div className="space-y-6">
            <form onSubmit={handleEmailSignUp} className="space-y-6">
              <div className="relative">
                <input
                  autoComplete="email"
                  className="peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] placeholder-transparent rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4 transition-all duration-200 hover:border-[var(--primary-color)] focus:outline-none"
                  id="email"
                  name="email"
                  placeholder="Email address"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label className="absolute left-4 -top-3.5 text-[var(--subtle-text-color)] text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--subtle-text-color)] peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)] bg-[var(--input-background)] px-1" htmlFor="email">Email address</label>
              </div>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  className="peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] placeholder-transparent rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4 transition-all duration-200 hover:border-[var(--primary-color)] focus:outline-none"
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label className="absolute left-4 -top-3.5 text-[var(--subtle-text-color)] text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--subtle-text-color)] peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)] bg-[var(--input-background)] px-1" htmlFor="password">Password</label>
              </div>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  className="peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] placeholder-transparent rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4 transition-all duration-200 hover:border-[var(--primary-color)] focus:outline-none"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <label className="absolute left-4 -top-3.5 text-[var(--subtle-text-color)] text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--subtle-text-color)] peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)] bg-[var(--input-background)] px-1" htmlFor="confirmPassword">Confirm Password</label>
              </div>
              <div>
                <button className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[var(--primary-color)] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] focus:ring-offset-[var(--background-color)] transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" type="submit">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;