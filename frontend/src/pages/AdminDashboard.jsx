import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Date');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [adminUser, setAdminUser] = useState({ name: 'Admin User', email: 'admin@example.com', photoURL: null });
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const usersPerPage = 10;

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

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/admin/coderdk05@gmail.com`);

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

  const handleLogout = () => {
    // Clear admin user data from localStorage
    localStorage.removeItem('adminUser');
    // Close dropdown
    setIsProfileDropdownOpen(false);
    // Firebase sign out will be handled by the Link navigation to /admin-login
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Inactive': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Suspended': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

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
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[var(--border-color)] px-6 lg:px-10 py-4">
          <div className="flex items-center gap-4 text-[var(--text-color)]">
            <svg className="h-9 w-9 text-[var(--primary-color)]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor"></path>
              <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
            <h1 className="text-2xl font-bold">CloudWatch</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[var(--subtle-text-color)]">notifications</span>
            </button>
            <div className="relative profile-dropdown">
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center gap-3 hover:bg-white/5 rounded-lg px-3 py-2 transition-colors cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">person</span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-[var(--text-color)]">{adminUser.name}</p>
                  <p className="text-[var(--subtle-text-color)]">{adminUser.email}</p>
                </div>
                <span className="material-symbols-outlined text-[var(--subtle-text-color)] transition-transform duration-200" style={{ transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  expand_more
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--input-background)] border border-[var(--border-color)] rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-[var(--border-color)]">
                      <p className="text-sm font-medium text-[var(--text-color)]">{adminUser.name}</p>
                      <p className="text-xs text-[var(--subtle-text-color)]">{adminUser.email}</p>
                    </div>
                    <Link
                      to="/admin-login"
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-color)] hover:bg-[var(--secondary-color)] transition-colors"
                    >
                      <span className="material-symbols-outlined text-red-400">logout</span>
                      <span>Logout</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

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
            <div className="overflow-x-auto rounded-lg border border-[var(--border-color)] bg-[var(--secondary-color)] hover:border-[var(--table-row-hover-border)] transition-all duration-300 shadow-lg hover:shadow-xl">
              <table className="min-w-full divide-y divide-[var(--border-color)]">
                <thead className="bg-[var(--table-header-bg)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--subtle-text-color)] uppercase tracking-wider" scope="col">
                      <a className="flex items-center gap-2 hover:text-white hover:bg-white/10 px-2 py-1 rounded transition-all duration-200 cursor-pointer" href="#">
                        Username
                        <span className="material-symbols-outlined text-base transition-transform duration-200 hover:rotate-180">unfold_more</span>
                      </a>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--subtle-text-color)] uppercase tracking-wider" scope="col">
                      <a className="flex items-center gap-2 hover:text-white hover:bg-white/10 px-2 py-1 rounded transition-all duration-200 cursor-pointer" href="#">
                        Email
                        <span className="material-symbols-outlined text-base transition-transform duration-200 hover:rotate-180">unfold_more</span>
                      </a>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--subtle-text-color)] uppercase tracking-wider" scope="col">
                      <a className="flex items-center gap-2 hover:text-white hover:bg-white/10 px-2 py-1 rounded transition-all duration-200 cursor-pointer" href="#">
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
                            onClick={fetchUsers}
                            className="mt-3 px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-blue-600 transition-colors"
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
                        className="hover:bg-[var(--table-row-hover-bg)] hover:border-l-4 hover:border-l-[var(--primary-color)] transition-all duration-300 ease-in-out cursor-pointer group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-color)] group-hover:text-white transition-colors duration-200">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--subtle-text-color)] group-hover:text-gray-300 transition-colors duration-200">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--subtle-text-color)] group-hover:text-gray-300 transition-colors duration-200">{user.registrationDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--subtle-text-color)] group-hover:text-gray-300 transition-colors duration-200">{user.companyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-105 ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            className="text-[var(--primary-color)] hover:text-blue-300 mr-4 transition-all duration-200 hover:scale-110 inline-block"
                            href="#"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Edit
                          </a>
                          <a
                            className="text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110 inline-block"
                            href="#"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Delete
                          </a>
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
                    className="p-2 rounded-md hover:bg-white/10 text-[var(--subtle-text-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    className="p-2 rounded-md hover:bg-white/10 text-[var(--subtle-text-color)] transition-colors"
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
    </div>
  );
};

export default AdminDashboard;