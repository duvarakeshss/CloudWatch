import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompanySetup from './pages/CompanySetup';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminCompanySetup from './pages/AdminCompanySetup';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import { ToastContainer } from 'react-toastify';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/company-setup" element={<CompanySetup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/admin-company-setup" element={<AdminCompanySetup />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
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
    </Router>
  );
}

export default App;
