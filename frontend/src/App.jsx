import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompanySetup from './pages/CompanySetup';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminCompanySetup from './pages/AdminCompanySetup';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import AddMachine from './pages/AddMachine';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import UserDashboardView from './pages/UserDashboardView';
import UserReportsView from './pages/UserReportsView';
import AdminSettings from './pages/AdminSettings';
import { ToastContainer } from 'react-toastify';
import { useState, useEffect } from 'react';
import { auth } from './utils/firebase';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Loading } from './components';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background-color)]">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userType = localStorage.getItem('userType');
  const userEmail = localStorage.getItem('userEmail');

  // Check if stored email matches current user
  if (userEmail !== user.email) {
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && userType !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireAdmin && userType === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

// AuthWrapper component to handle automatic redirects
const AuthWrapper = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Check user type from localStorage
        const userType = localStorage.getItem('userType');
        const userEmail = localStorage.getItem('userEmail');

        // Check if the stored email matches current user
        if (userEmail === user.email) {
          if (userType === 'admin') {
            navigate('/admin-dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // Email mismatch, clear localStorage
          localStorage.removeItem('userType');
          localStorage.removeItem('userEmail');
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background-color)]">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  return children;
};

// AdminAuthWrapper for admin routes
const AdminAuthWrapper = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Check user type from localStorage
        const userType = localStorage.getItem('userType');
        const userEmail = localStorage.getItem('userEmail');

        // Check if the stored email matches current user
        if (userEmail === user.email) {
          if (userType === 'admin') {
            navigate('/admin-dashboard', { replace: true });
          } else {
            navigate('/login', { replace: true });
          }
        } else {
          localStorage.removeItem('userType');
          localStorage.removeItem('userEmail');
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background-color)]">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/company-setup" element={<CompanySetup />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/admin-company-setup" element={<AdminCompanySetup />} />
            <Route path="/admin-dashboard" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/user-dashboard/:userEmail" element={
              <ProtectedRoute requireAdmin={true}>
                <UserDashboardView />
              </ProtectedRoute>
            } />
            <Route path="/admin/user-reports/:userEmail" element={
              <ProtectedRoute requireAdmin={true}>
                <UserReportsView />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/add-machine" element={
              <ProtectedRoute>
                <AddMachine />
              </ProtectedRoute>
            } />
            {/* Handle Firebase OAuth redirect */}
            <Route path="/__/auth/handler" element={<Login />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastStyle={{
              backgroundColor: '#1c2127',
              color: '#ffffff',
              border: '1px solid #3b4754',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif"
            }}
            progressStyle={{
              background: '#1173d4'
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}export default App;
