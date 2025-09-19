import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme, changeTheme } = useTheme();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingMachineId, setDeletingMachineId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);
  const navigate = useNavigate();

  // Fetch machines from API
  const fetchMachines = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${apiUrl}/users/machine/${user.email}`);

      // Handle different response formats
      let machinesData = [];

      if (response.data && response.data.machines && Array.isArray(response.data.machines)) {
        machinesData = response.data.machines;
      } else if (Array.isArray(response.data)) {
        // Fallback for old format
        machinesData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's a single object, wrap it in an array
        machinesData = [response.data];
      } else if (!response.data) {
        machinesData = [];
      } else {
        throw new Error('Invalid response format from API');
      }

      // Transform API response to include additional properties for UI
      const machinesWithUIProps = machinesData.map((machine, index) => ({
        id: index + 1,
        name: machine.machineId || machine.name || `Machine-${index + 1}`,
        location: machine.location || 'Unknown Location',
        status: machine.status || 'online', // Use API status or default to online
        lat: getRandomLatLng(machine.location || 'Unknown').lat,
        lng: getRandomLatLng(machine.location || 'Unknown').lng,
      }));

      setMachines(machinesWithUIProps);
    } catch (error) {
      console.error('Error fetching machines:', error);

      let errorMessage = 'Failed to load machines';
      if (error.response?.status === 404) {
        errorMessage = 'No machines found for this user';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error - please try again later';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
      setMachines([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get random lat/lng for demo purposes
  const getRandomLatLng = (location) => {
    // Simple hash function to get consistent coordinates for same location
    let hash = 0;
    for (let i = 0; i < location.length; i++) {
      hash = ((hash << 5) - hash) + location.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Generate coordinates based on hash
    const lat = (hash % 180) - 90; // -90 to 90
    const lng = ((hash * 7) % 360) - 180; // -180 to 180

    return { lat, lng };
  };

  // Get status icon based on machine status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return 'dns';
      case 'idle':
        return 'schedule';
      case 'offline':
        return 'error';
      default:
        return 'help';
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (machine) => {
    setMachineToDelete(machine);
    setShowDeleteConfirm(true);
  };

  // Hide delete confirmation modal
  const hideDeleteConfirmation = () => {
    setShowDeleteConfirm(false);
    setMachineToDelete(null);
  };

  // Delete machine function
  const deleteMachine = async () => {
    if (!machineToDelete) return;

    setDeletingMachineId(machineToDelete.name);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      await axios.delete(`${apiUrl}/users/machine/${user.email}/${machineToDelete.name}`);

      toast.success('Machine deleted successfully');
      fetchMachines(); // Refresh the list
    } catch (error) {
      console.error('❌ Error deleting machine:', error);
      toast.error('Failed to delete machine');
    } finally {
      setDeletingMachineId(null);
      hideDeleteConfirmation();
    }
  };

  // Fetch machines when user is set - don't affect profile UI
  useEffect(() => {
    if (user && !authLoading) {
      fetchMachines();
    }
  }, [user, authLoading]);

  const handleAddMachine = () => {
    navigate('/add-machine');
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

          #root {
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
          }
        `}
      </style>
      {/* Profile information is displayed immediately without loading states */}
      <Navbar user={user} isAdmin={false} />

      <main className="flex-1 p-8 text-[var(--text-color)]">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Connected Machines Section */}
            <div className="lg:col-span-2">
              <div className="bg-[var(--card-background)] rounded-lg p-6 border border-[var(--border-color)]/50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Connected Machines</h2>
                  <button
                    onClick={handleAddMachine}
                    className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-color)]/80 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Machine
                  </button>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent rounded-full"></div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                    <p className="text-[var(--text-color)] font-medium mb-1">Error loading machines</p>
                    <p className="text-[var(--subtle-text-color)] text-sm">{error}</p>
                  </div>
                )}

                {/* Empty State */}
                {!loading && !error && machines.length === 0 && (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-[var(--subtle-text-color)] mb-2">inventory_2</span>
                    <p className="text-[var(--text-color)] font-medium mb-1">No machines found</p>
                    <p className="text-[var(--subtle-text-color)] text-sm">Add your first machine to get started</p>
                  </div>
                )}

                {/* Machines List */}
                {!loading && !error && machines.length > 0 && (
                  <div className="space-y-3">
                    {machines.map((machine) => (
                      <div
                        key={machine.id}
                        className="group flex items-center justify-between p-3 bg-[var(--input-background)] rounded-md cursor-pointer hover:bg-[var(--secondary-color)] transition-colors relative"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className={`material-symbols-outlined text-3xl ${
                            machine.status === 'online' ? 'text-[var(--success-color)]' :
                            machine.status === 'idle' ? 'text-[var(--warning-color)]' :
                            'text-red-500'
                          }`}>
                            {getStatusIcon(machine.status)}
                          </span>
                          <div>
                            <p className="font-semibold text-[var(--text-color)]">{machine.name}</p>
                            <p className="text-sm text-[var(--subtle-text-color)]">{machine.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            machine.status === 'online' ? 'bg-[var(--success-color)]' :
                            machine.status === 'idle' ? 'bg-[var(--warning-color)]' :
                            'bg-red-500'
                          }`}></div>
                          <span className={`text-sm capitalize ${
                            machine.status === 'online' ? 'text-[var(--success-color)]' :
                            machine.status === 'idle' ? 'text-[var(--warning-color)]' :
                            'text-red-500'
                          }`}>
                            {machine.status}
                          </span>
                          {/* Delete button - appears on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showDeleteConfirmation(machine);
                            }}
                            disabled={deletingMachineId === machine.name}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md hover:bg-red-500/20 disabled:opacity-50"
                            title="Delete machine"
                          >
                            <span className={`material-symbols-outlined text-lg ${
                              deletingMachineId === machine.name ? 'text-[var(--subtle-text-color)]' : 'text-red-400 hover:text-red-300'
                            }`}>
                              {deletingMachineId === machine.name ? 'hourglass_empty' : 'delete'}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* General App Settings */}
            <div className="lg:col-span-1">
              <div className="bg-[var(--card-background)] rounded-lg p-6 border border-[var(--border-color)]/50 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">App Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--subtle-text-color)] mb-1" htmlFor="theme">Theme</label>
                    <select
                      className="w-full bg-[var(--input-background)] text-[var(--text-color)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                      id="theme"
                      value={theme}
                      onChange={(e) => changeTheme(e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[var(--background-color)]/80 flex items-center justify-center z-[10000] p-4">
          <div className="bg-[var(--secondary-color)] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-[var(--text-color)]">Delete Machine</h3>
            <p className="text-[var(--subtle-text-color)] mb-6">
              Are you sure you want to delete "{machineToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={hideDeleteConfirmation}
                className="px-4 py-2 text-[var(--subtle-text-color)] hover:text-[var(--text-color)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteMachine}
                disabled={deletingMachineId === machineToDelete?.name}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingMachineId === machineToDelete?.name ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;