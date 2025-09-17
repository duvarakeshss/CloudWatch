import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log('👤 User authenticated:', currentUser.email);
      } else {
        console.log('❌ No authenticated user, redirecting to login');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background-color)]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-color)]" style={{ fontFamily: "'Inter', sans-serif" }}>
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

      {/* Header */}
      <header className="bg-[var(--secondary-color)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[var(--text-color)]">
                CloudWatch Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-[var(--text-color)]">
                <span className="text-[var(--subtle-text-color)]">Welcome, </span>
                <span className="font-medium">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-[var(--border-color)] rounded-lg h-96 p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[var(--text-color)] mb-4">
                Welcome to CloudWatch!
              </h2>
              <p className="text-[var(--subtle-text-color)] text-lg mb-8">
                Your dashboard is ready. Start monitoring your cloud infrastructure.
              </p>
              
              {/* User Info Card */}
              <div className="max-w-md mx-auto bg-[var(--input-background)] rounded-lg p-6 border border-[var(--border-color)]">
                <h3 className="text-xl font-semibold text-[var(--text-color)] mb-4">
                  Account Information
                </h3>
                <div className="space-y-2 text-left">
                  <div>
                    <span className="text-[var(--subtle-text-color)]">Email: </span>
                    <span className="text-[var(--text-color)]">{user.email}</span>
                  </div>
                  {user.displayName && (
                    <div>
                      <span className="text-[var(--subtle-text-color)]">Name: </span>
                      <span className="text-[var(--text-color)]">{user.displayName}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[var(--subtle-text-color)]">Account Created: </span>
                    <span className="text-[var(--text-color)]">
                      {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <p className="text-[var(--subtle-text-color)]">
                  Dashboard features coming soon...
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
