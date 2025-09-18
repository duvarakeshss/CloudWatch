import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { useTheme } from '../contexts/ThemeContext';

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Date');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    companyName: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const usersPerPage = 10;
  const navigate = useNavigate();

  // Check authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        // Check if user is actually an admin
        const userType = localStorage.getItem('userType');
        if (userType === 'admin') {
          setAdminUser(currentUser);
          console.log('👤 Admin authenticated:', currentUser.email);
          setAuthLoading(false);
        } else {
          console.log('🚫 Non-admin user trying to access admin dashboard, redirecting to user dashboard');
          navigate('/dashboard');
        }
      } else {
        console.log('❌ No authenticated user, redirecting to admin login');
        navigate('/admin-login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Function to decode Firebase timestamp
  const decodeFirebaseTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';

    // Handle Firebase Timestamp object
    if (timestamp._seconds) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    // Handle regular timestamp
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    // Handle string timestamp
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    return 'N/A';
  };

  // Function to fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${apiUrl}/admin/${userEmail}`);

      console.log('API Response:', response.data);

      if (response.data && response.data.users) {
        // Transform the API response to match our component's expected format
        const transformedUsers = response.data.users.map(user => ({
          id: user.id,
          username: user.name || user.email.split('@')[0], // Use name or email prefix as username
          email: user.email,
          registrationDate: decodeFirebaseTimestamp(user.createdAt),
          status: 'Active', // Default status, you can modify this based on your business logic
          companyName: user.companyName
        }));

        setUsers(transformedUsers);
      } else {
        setError('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to fetch users');
      // Fallback to empty array
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Optimized refresh function that only updates table data
  const refreshTableData = async () => {
    try {
      // Don't set global loading state to avoid UI disruption
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${apiUrl}/admin/${userEmail}`);

      if (response.data && response.data.users) {
        const transformedUsers = response.data.users.map(user => ({
          id: user.id,
          username: user.name || user.email.split('@')[0],
          email: user.email,
          registrationDate: decodeFirebaseTimestamp(user.createdAt),
          status: 'Active',
          companyName: user.companyName
        }));

        setUsers(transformedUsers);
        toast.success('User list refreshed');
      }
    } catch (error) {
      console.error('Error refreshing users:', error);
      toast.error('Failed to refresh user list');
    }
  };

  // Function to handle user edit
  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditForm({
      username: user.username,
      email: user.email,
      companyName: user.companyName
    });
  };

  // Function to cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      username: '',
      email: '',
      companyName: ''
    });
  };

  // Function to save user edits
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      
      const updateData = {
        name: editForm.username,
        companyName: editForm.companyName
      };

      await axios.put(`${apiUrl}/users/${editForm.email}`, updateData);
      
      toast.success('User updated successfully');
      setEditingUser(null);
      setEditForm({
        username: '',
        email: '',
        companyName: ''
      });
      
      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle user deletion
  const handleDeleteUser = async (userEmail) => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      
      await axios.delete(`${apiUrl}/users/${userEmail}`);
      
      toast.success('User deleted successfully');
      setShowDeleteConfirm(null);
      
      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle edit form changes
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Load admin user data from localStorage and fetch users
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setAdminUser({
          name: userData.name || 'Admin User',
          email: userData.email || 'admin@example.com',
          photoURL: userData.photoURL || null
        });
      } catch (error) {
        console.error('Error parsing admin user data:', error);
      }
    }

    // Fetch users from API
    fetchUsers();
  }, []);

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'Newest First') {
      return new Date(b.registrationDate) - new Date(a.registrationDate);
    } else if (sortBy === 'Oldest First') {
      return new Date(a.registrationDate) - new Date(b.registrationDate);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + usersPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Inactive': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Suspended': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-[var(--input-background)] text-[var(--subtle-text-color)] border border-[var(--border-color)]';
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background-color)]">
        <div className="animate-spin h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-color)] text-[var(--text-color)]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>
        {`
          :root {
            --primary-color: #3b82f6;
            --secondary-color: #1f2937;
            --text-color: #e5e7eb;
            --subtle-text-color: #9ca3af;
            --background-color: #111827;
            --input-background: #1f2937;
            --border-color: #374151;
            --table-header-bg: #1f2937;
            --table-row-hover-bg: #2d3748;
            --table-row-hover-border: #4a5568;
          }
        `}
      </style>

      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar isAdmin={true} />

        {/* Main Content */}
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-10">
          <div className="w-full max-w-7xl mx-auto">
            <div className="mb-10">
              <h2 className="text-4xl font-bold tracking-tight text-[var(--text-color)]">User Directory</h2>
              <p className="mt-3 text-base text-[var(--subtle-text-color)]">
                Manage and monitor all users in your system with comprehensive user information and controls.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--subtle-text-color)]">search</span>
                <input
                  className="w-full bg-[var(--input-background)] border border-[var(--border-color)] rounded-md py-3 pl-12 pr-4 text-[var(--text-color)] placeholder:text-[var(--subtle-text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-shadow"
                  placeholder="Search for users by name, email..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={refreshTableData}
                  disabled={loading}
                  className="flex items-center justify-center p-2 bg-[var(--input-background)] border border-[var(--border-color)] rounded-md hover:bg-[var(--secondary-color)] hover:border-[var(--primary-color)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh user list"
                >
                  <span className={`material-symbols-outlined text-base transition-transform duration-200 ${loading ? 'animate-spin' : 'hover:rotate-180'}`}>refresh</span>
                </button>
                <div className="relative">
                  <select
                    className="appearance-none w-full sm:w-auto bg-[var(--input-background)] border border-[var(--border-color)] rounded-md py-3 pl-4 pr-10 text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-shadow"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option>Sort by Date</option>
                    <option>Newest First</option>
                    <option>Oldest First</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[var(--subtle-text-color)] pointer-events-none">expand_more</span>
                </div>
                <div className="relative">
                  <select
                    className="appearance-none w-full sm:w-auto bg-[var(--input-background)] border border-[var(--border-color)] rounded-md py-3 pl-4 pr-10 text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-shadow"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option>Filter by Status</option>
                    <option>All</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[var(--subtle-text-color)] pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] hover:border-[var(--table-row-hover-border)] transition-all duration-300 shadow-lg hover:shadow-xl">
              <table className="min-w-full divide-y divide-[var(--border-color)]">
                <thead className="bg-[var(--table-header-bg)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--subtle-text-color)] uppercase tracking-wider" scope="col">
                      <a className="flex items-center gap-2 hover:text-[var(--text-color)] hover:bg-[var(--input-background)] px-2 py-1 rounded transition-all duration-200 cursor-pointer" href="#">
                        Username
                        <span className="material-symbols-outlined text-base transition-transform duration-200 hover:rotate-180">unfold_more</span>
                      </a>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--subtle-text-color)] uppercase tracking-wider" scope="col">
                      <a className="flex items-center gap-2 hover:text-[var(--text-color)] hover:bg-[var(--input-background)] px-2 py-1 rounded transition-all duration-200 cursor-pointer" href="#">
                        Email
                        <span className="material-symbols-outlined text-base transition-transform duration-200 hover:rotate-180">unfold_more</span>
                      </a>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--subtle-text-color)] uppercase tracking-wider" scope="col">
                      <a className="flex items-center gap-2 hover:text-[var(--text-color)] hover:bg-[var(--input-background)] px-2 py-1 rounded transition-all duration-200 cursor-pointer" href="#">
                        Registration Date
                        <span className="material-symbols-outlined text-base transition-transform duration-200 hover:rotate-180">unfold_more</span>
                      </a>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--subtle-text-color)] uppercase tracking-wider" scope="col">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--subtle-text-color)] uppercase tracking-wider" scope="col">Status</th>
                    <th className="relative px-6 py-3" scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent rounded-full mr-3"></div>
                          <span className="text-[var(--text-color)]">Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-red-400">
                          <span className="material-symbols-outlined text-4xl mb-2 block">error</span>
                          <p className="text-lg font-medium">Error loading users</p>
                          <p className="text-sm text-[var(--subtle-text-color)] mt-1">{error}</p>
                          <button
                            onClick={refreshTableData}
                            className="mt-3 px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-color)]/80 transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-[var(--subtle-text-color)]">
                          <span className="material-symbols-outlined text-4xl mb-2 block">person_off</span>
                          <p className="text-lg">No users found</p>
                          <p className="text-sm">There are no users to display at the moment.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => navigate(`/admin/user-dashboard/${user.email}`)}
                        className="hover:bg-[var(--table-row-hover-bg)] hover:border-l-4 hover:border-l-[var(--primary-color)] transition-all duration-300 ease-in-out cursor-pointer group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-color)] group-hover:text-[var(--text-color)] transition-colors duration-200">
                          {editingUser === user.id ? (
                            <input
                              type="text"
                              value={editForm.username}
                              onChange={(e) => handleEditFormChange('username', e.target.value)}
                              className="w-full bg-[var(--input-background)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                            />
                          ) : (
                            user.username
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--subtle-text-color)] group-hover:text-[var(--text-color)] transition-colors duration-200">
                          {editingUser === user.id ? (
                            <span className="text-[var(--text-color)] font-medium">{user.email}</span>
                          ) : (
                            user.email
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--subtle-text-color)] group-hover:text-[var(--text-color)] transition-colors duration-200">{user.registrationDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--subtle-text-color)] group-hover:text-[var(--text-color)] transition-colors duration-200">
                          {editingUser === user.id ? (
                            <input
                              type="text"
                              value={editForm.companyName}
                              onChange={(e) => handleEditFormChange('companyName', e.target.value)}
                              className="w-full bg-[var(--input-background)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                            />
                          ) : (
                            user.companyName
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-105 ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingUser === user.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="text-green-400 hover:text-green-300 transition-all duration-200 hover:scale-110"
                                disabled={loading}
                              >
                                <span className="material-symbols-outlined text-base">check</span>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-[var(--subtle-text-color)] hover:text-[var(--text-color)] transition-all duration-200 hover:scale-110"
                                disabled={loading}
                              >
                                <span className="material-symbols-outlined text-base">close</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-[var(--primary-color)] hover:text-[var(--primary-color)]/80 transition-all duration-200 hover:scale-110"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(user)}
                                className="text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - Only show when not loading and no error */}
            {!loading && !error && paginatedUsers.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-[var(--subtle-text-color)]">
                  Showing <span className="font-medium text-[var(--text-color)]">{startIndex + 1}</span> to <span className="font-medium text-[var(--text-color)]">{Math.min(startIndex + usersPerPage, sortedUsers.length)}</span> of <span className="font-medium text-[var(--text-color)]">{sortedUsers.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-md hover:bg-[var(--input-background)] text-[var(--subtle-text-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    className="p-2 rounded-md hover:bg-[var(--input-background)] text-[var(--subtle-text-color)] transition-colors"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[var(--background-color)]/80 flex items-center justify-center z-50">
          <div className="bg-[var(--secondary-color)] border border-[var(--border-color)] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-red-400 text-2xl">warning</span>
              <h3 className="text-lg font-semibold text-[var(--text-color)]">Confirm Deletion</h3>
            </div>
            <p className="text-[var(--subtle-text-color)] mb-6">
              Are you sure you want to delete the user <span className="text-[var(--text-color)] font-medium">"{showDeleteConfirm.username}"</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-[var(--subtle-text-color)] hover:text-[var(--text-color)] transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm.email)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;