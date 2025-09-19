import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { user } = useAuth();
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      // In a real app, fetch admin profile data from API
      const storedName = localStorage.getItem('adminName') || user.displayName || user.email?.split('@')[0] || 'Admin';
      setAdminName(storedName);
      setOriginalName(storedName);
    }
  }, [user]);

  const handleNameChange = (e) => {
    setAdminName(e.target.value);
  };

  const handleSaveName = async () => {
    if (!adminName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      // In a real implementation, you would save to your API
      // const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      // await axios.put(`${apiUrl}/admin/profile`, { name: adminName });

      // For now, just save to localStorage
      localStorage.setItem('adminName', adminName);
      setOriginalName(adminName);
      setIsEditing(false);
      toast.success('Admin name updated successfully');
    } catch (error) {
      console.error('Error updating admin name:', error);
      toast.error('Failed to update admin name');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setAdminName(originalName);
    setIsEditing(false);
  };

  const handleSettingChange = (settingKey, value) => {
    if (settingKey === 'theme') {
      changeTheme(value);
      toast.success(`Theme changed to ${value}`);
    } else {
      toast.success(`${settingKey.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Theme is already saved by ThemeContext, only save other settings if needed
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--background-color)] min-h-screen flex flex-col overflow-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>
        {`
          html, body {
            margin: 0;
            padding: 0;
            height: auto;
            min-height: 100vh;
            overflow: auto;
          }
          :root {
            --primary-color: #1173d4;
            --secondary-color: #283039;
            --text-color: #ffffff;
            --subtle-text-color: #9dabb9;
            --background-color: #111418;
            --input-background: #1c2127;
            --border-color: #3b4754;
            --success-color: #22c55e;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
          }
        `}
      </style>

      {/* Header */}
      <Navbar isAdmin={true} />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 min-h-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="group flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[var(--secondary-color)] to-[var(--input-background)] border border-[var(--border-color)] text-[var(--text-color)] rounded-lg hover:border-[var(--primary-color)] hover:shadow-lg hover:shadow-[var(--primary-color)]/20 transition-all duration-300 hover:scale-105"
              title="Back to Admin Dashboard"
            >
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-300">arrow_back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-color)]">Admin Settings</h1>
              <p className="text-[var(--subtle-text-color)] mt-1">Manage your admin profile and system preferences</p>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-[var(--card-background)] rounded-lg border border-[var(--border-color)] p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[var(--text-color)] mb-6">Profile Information</h2>

            <div className="space-y-6">
              {/* Admin Name */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--subtle-text-color)] mb-2">
                    Admin Name
                  </label>
                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={adminName}
                        onChange={handleNameChange}
                        className="flex-1 bg-[var(--input-background)] border border-[var(--border-color)] rounded-md px-3 py-2 text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        placeholder="Enter admin name"
                        disabled={saving}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saving || adminName.trim() === originalName}
                        className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-color)]/80 disabled:bg-[var(--input-background)] disabled:text-[var(--subtle-text-color)] disabled:cursor-not-allowed transition-colors"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="px-4 py-2 bg-[var(--input-background)] border border-[var(--border-color)] text-[var(--text-color)] rounded-md hover:bg-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-lg text-[var(--text-color)]">{adminName}</span>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 text-sm bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-color)]/80 transition-colors"
                      >
                        Edit Name
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-[var(--subtle-text-color)] mb-2">
                  Email Address
                </label>
                <div className="bg-[var(--input-background)] border border-[var(--border-color)] rounded-md px-3 py-2 text-[var(--text-color)] opacity-75">
                  {user?.email || 'admin@example.com'}
                </div>
                <p className="text-xs text-[var(--subtle-text-color)] mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* System Preferences */}
          <div className="bg-[var(--card-background)] rounded-lg border border-[var(--border-color)] p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[var(--text-color)] mb-6">System Preferences</h2>

            <div className="grid grid-cols-1 gap-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--subtle-text-color)] mb-2">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="w-full bg-[var(--input-background)] border border-[var(--border-color)] rounded-md px-3 py-2 text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color)]/80 disabled:bg-[var(--input-background)] disabled:text-[var(--subtle-text-color)] disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;