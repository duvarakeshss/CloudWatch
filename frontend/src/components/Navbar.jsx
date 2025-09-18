import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../utils/firebase';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';

const Navbar = ({ user: propUser, isAdmin = false }) => {
  const { user: contextUser } = useAuth();
  const { theme } = useTheme();
  const [user, setUser] = useState(propUser || contextUser || null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Detect admin status if not provided as prop
  const adminStatus = isAdmin || localStorage.getItem('userType') === 'admin';

  useEffect(() => {
    // Use propUser if provided, otherwise use context user
    if (propUser) {
      setUser(propUser);
    } else if (contextUser) {
      setUser(contextUser);
    }
  }, [propUser, contextUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('adminUser');
      toast.success('Logged out successfully');
      
      // Navigate to appropriate login page based on user type
      if (adminStatus) {
        navigate('/admin-login');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="relative bg-gradient-to-r from-[var(--secondary-color)]/95 to-[var(--secondary-color)]/90 backdrop-blur-xl border-b border-[var(--border-color)]/50 shadow-lg shadow-black/10 z-[10001]">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)]/5 via-transparent to-[var(--primary-color)]/5"></div>
      <div className="relative flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">

        {/* Logo & Brand */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 group cursor-pointer">
            <svg className="h-8 w-8 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--text-color)] to-[var(--subtle-text-color)] bg-clip-text text-transparent">CloudWatch</h1>
              <p className="text-xs text-[var(--subtle-text-color)] font-medium">
                {adminStatus ? 'Admin Dashboard' : 'Monitoring Dashboard'}
              </p>
            </div>
          </div>

          {/* Navigation - Different for Admin vs User */}
          <nav className="hidden md:flex items-center gap-2">
            {adminStatus ? (
              // Admin Navigation - No navigation buttons for admin
              <></>
            ) : (
              // User Navigation
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`nav-link smooth-button relative px-4 py-2.5 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${location.pathname === '/dashboard'
                    ? 'text-[var(--text-color)] bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 hover:bg-[var(--primary-color)]/20'
                    : 'text-[var(--subtle-text-color)] hover:text-[var(--text-color)] hover:bg-[var(--input-background)]'
                  }`}>
                  <span className="relative z-10">Machines</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)]/0 via-[var(--primary-color)]/5 to-[var(--primary-color)]/0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button
                  onClick={() => navigate('/reports')}
                  className={`nav-link smooth-button relative px-4 py-2.5 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${location.pathname === '/reports'
                    ? 'text-[var(--text-color)] bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 hover:bg-[var(--primary-color)]/20'
                    : 'text-[var(--subtle-text-color)] hover:text-[var(--text-color)] hover:bg-[var(--input-background)]'
                  }`}>
                  <span className="relative z-10">Reports</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)]/0 via-[var(--primary-color)]/5 to-[var(--primary-color)]/0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-1">
            <button className="group relative p-2.5 rounded-xl hover:bg-[var(--input-background)] transition-all duration-300 hover:shadow-lg">
              <span className="material-symbols-outlined text-lg text-[var(--subtle-text-color)] group-hover:text-[var(--text-color)] transition-colors duration-300">help</span>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/10 to-[var(--primary-color)]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button
              onClick={() => navigate(adminStatus ? "/admin/settings" : "/settings")}
              className={`smooth-button group relative p-2.5 rounded-xl transition-all duration-300 hover:shadow-lg ${
                (location.pathname === '/settings' || location.pathname === '/admin/settings')
                  ? 'bg-[var(--primary-color)]/20'
                  : 'hover:bg-[var(--input-background)]'
              }`}>
              <span className={`material-symbols-outlined text-lg transition-colors duration-300 ${
                (location.pathname === '/settings' || location.pathname === '/admin/settings')
                  ? 'text-[var(--primary-color)]'
                  : 'text-[var(--subtle-text-color)] group-hover:text-[var(--text-color)]'
              }`}>settings</span>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Profile Dropdown - Only show when user is available */}
          {user && (
            <div className="relative profile-dropdown">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--input-background)] transition-all duration-300 hover:shadow-lg border border-transparent hover:border-[var(--border-color)]"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-[var(--text-color)] font-medium truncate max-w-32">{user?.displayName || user?.email?.split('@')[0] || 'User'}</p>
                </div>
                <div className="relative">
                  <img
                    alt="User avatar"
                    className="h-10 w-10 rounded-xl ring-2 ring-[var(--border-color)] group-hover:ring-[var(--primary-color)]/50 transition-all duration-300"
                    src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80"}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-[var(--secondary-color)] rounded-full"></div>
                </div>
                <span className={`material-symbols-outlined text-[var(--text-color)]/70 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-[var(--secondary-color)]/95 backdrop-blur-xl border border-[var(--border-color)]/50 rounded-xl shadow-2xl shadow-black/20 z-[10000] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
                  <div className="relative">
                    {/* Profile Header */}
                    <div className="px-5 py-4 border-b border-[var(--border-color)]/30">
                      <div className="flex items-center gap-3">
                        <img
                          alt="User avatar"
                          className="h-12 w-12 rounded-xl ring-2 ring-white/10"
                          src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80"}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-color)] truncate">{user?.displayName || 'User'}</p>
                          <p className="text-xs text-[var(--subtle-text-color)] truncate">{user?.email}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-xs text-green-400 font-medium">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button className="w-full text-left px-5 py-3 text-sm text-[var(--subtle-text-color)] hover:text-[var(--text-color)] hover:bg-[var(--input-background)] transition-all duration-200 flex items-center gap-3 group">
                        <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform duration-200">help</span>
                        Help & Support
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-[var(--border-color)]/30">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 flex items-center gap-3 group"
                      >
                        <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform duration-200">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;