import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import axios from 'axios';

const CompanySetup = () => {
  const [companyName, setCompanyName] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user information
    const user = auth.currentUser;
    if (user) {
      setUserInfo({
        name: user.displayName || user.email.split('@')[0],
        email: user.email
      });
    } else {
      // If no user, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast.error('Please enter a company name');
      return;
    }

    if (!userInfo) {
      toast.error('User information not available');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: userInfo.name,
        email: userInfo.email,
        companyName: companyName.trim()
      };

      console.log('Sending data to server:', payload);

      // Send to backend server using axios
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
      const response = await axios.post(`${serverUrl}/users`, payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Server response:', response.data);

      // Mark user as having completed company setup
      const user = auth.currentUser;
      if (user) {
        localStorage.setItem(`companySetup_${user.uid}`, 'true');
        console.log('Marked user as completed setup:', user.uid);
      }

      toast.success('Company setup completed successfully!');

      // Redirect to dashboard or main app
      navigate('/dashboard');
    } catch (error) {
      console.error('Request error:', error);

      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        console.error('Server error response:', error.response.data);
        toast.error(error.response.data.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Other error
        console.error('Request setup error:', error.message);
        toast.error('Request failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background-color)]">
        <div className="text-[var(--text-color)]">Loading...</div>
      </div>
    );
  }

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
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--text-color)]">Welcome to CloudWatch!</h2>
            <p className="mt-2 text-center text-sm text-[var(--subtle-text-color)]">
              Let's set up your company profile to get started.
            </p>
          </div>

          <div className="space-y-6">
            {/* User Info Display */}
            <div className="bg-[var(--input-background)] p-4 rounded-md border border-[var(--border-color)]">
              <div className="text-sm text-[var(--subtle-text-color)] mb-2">Account Information</div>
              <div className="space-y-1">
                <div className="text-[var(--text-color)]">
                  <span className="font-medium">Name:</span> {userInfo.name}
                </div>
                <div className="text-[var(--text-color)]">
                  <span className="font-medium">Email:</span> {userInfo.email}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  autoComplete="organization"
                  className="peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4"
                  id="companyName"
                  name="companyName"
                  required
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder=" "
                />
                <label className="absolute left-4 top-4 text-[var(--subtle-text-color)] text-sm transition-all peer-focus:-top-3.5 peer-focus:text-[var(--primary-color)] peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-3.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[var(--primary-color)]" htmlFor="companyName">
                  Company Name
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--primary-color)] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanySetup;