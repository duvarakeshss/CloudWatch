import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const CompanySetup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Pre-fill name and email from Google OAuth data if available
    const userData = location.state?.userData;
    if (userData) {
      console.log('📝 Pre-filling form with Google OAuth data:', userData);
      setName(userData.name || '');
      setEmail(userData.email || '');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !companyName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🚀 Creating new user:', { name, email, companyName });
      
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/users`, {
        name: name.trim(),
        email: email.trim(),
        companyName: companyName.trim()
      });

      console.log('✅ User created successfully:', response.data);
      toast.success('Welcome! Your account has been set up successfully.');
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('❌ Error creating user:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to set up your account. Please try again.');
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

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-[var(--text-color)]">
              Complete Your Setup
            </h2>
            <p className="mt-2 text-sm text-[var(--subtle-text-color)]">
              Please provide your company information to complete your account setup
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] placeholder-transparent rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4"
                  placeholder="Full Name"
                  required
                />
                <label
                  htmlFor="name"
                  className="absolute left-4 -top-2.5 bg-[var(--input-background)] px-1 text-sm text-[var(--subtle-text-color)] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--subtle-text-color)] peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)]"
                >
                  Full Name
                </label>
              </div>

              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] placeholder-transparent rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4"
                  placeholder="Email Address"
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 -top-2.5 bg-[var(--input-background)] px-1 text-sm text-[var(--subtle-text-color)] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--subtle-text-color)] peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)]"
                >
                  Email Address
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] placeholder-transparent rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4"
                  placeholder="Company Name"
                  required
                />
                <label
                  htmlFor="companyName"
                  className="absolute left-4 -top-2.5 bg-[var(--input-background)] px-1 text-sm text-[var(--subtle-text-color)] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--subtle-text-color)] peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)]"
                >
                  Company Name
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--primary-color)] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Setting up your account...
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanySetup;
