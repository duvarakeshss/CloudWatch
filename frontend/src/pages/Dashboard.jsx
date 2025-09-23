import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import { Loading, InlineLoading } from '../components';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
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
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
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

  // Delete machine from API
  const deleteMachine = async () => {
    if (!user?.email || !machineToDelete) return;

    setDeletingMachineId(machineToDelete.name);
    hideDeleteConfirmation();

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      await axios.delete(`${apiUrl}/users/machine/${user.email}/${machineToDelete.name}`);

      toast.success(`Machine "${machineToDelete.name}" deleted successfully`);

      // Remove machine from local state
      setMachines(prevMachines => prevMachines.filter(machine => machine.name !== machineToDelete.name));

    } catch (error) {
      console.error('Error deleting machine:', error);
      toast.error(error.response?.data?.message || 'Failed to delete machine');
    } finally {
      setDeletingMachineId(null);
    }
  };

  // Helper function to get approximate coordinates for locations
  const getRandomLatLng = (location) => {
    const locationCoords = {
      'New York': { lat: 40.7128, lng: -74.0060 },
      'London': { lat: 51.5074, lng: -0.1278 },
      'Tokyo': { lat: 35.6762, lng: 139.6503 },
      'Sydney': { lat: -33.8688, lng: 151.2093 },
      'São Paulo': { lat: -23.5505, lng: -46.6333 },
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
    };

    // Try to match location or return random coordinates
    for (const [key, coords] of Object.entries(locationCoords)) {
      if (location.toLowerCase().includes(key.toLowerCase())) {
        return coords;
      }
    }

    // Default coordinates if location not found
    return { lat: 20, lng: 0 };
  };

  useEffect(() => {
    // Check if user is authenticated and not an admin
    if (!authLoading) {
      if (user) {
        const userType = localStorage.getItem('userType');
        if (userType === 'admin') {
          navigate('/admin-dashboard');
        }
      } else {
        navigate('/login');
      }
    }
  }, [user, authLoading, navigate]);

  // Fetch machines when user is set
  useEffect(() => {
    if (user && !authLoading) {
      fetchMachines();
    }
  }, [user, authLoading]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'var(--success-color)';
      case 'idle':
        return 'var(--warning-color)';
      case 'offline':
        return 'red-500';
      default:
        return 'var(--subtle-text-color)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return 'desktop_windows';
      case 'idle':
        return 'desktop_windows';
      case 'offline':
        return 'desktop_windows';
      default:
        return 'desktop_windows';
    }
  };

  // Create custom marker icons based on machine status
  const createCustomIcon = (status) => {
    const color = status === 'online' ? '#22c55e' : status === 'idle' ? '#f59e0b' : '#ef4444';
    return new L.DivIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background-color)]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-color)] min-h-screen flex flex-col overflow-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
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

          /* Custom Leaflet popup styling */
          .leaflet-popup-content-wrapper {
            background-color: var(--secondary-color);
            color: var(--text-color);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .leaflet-popup-tip {
            background-color: var(--secondary-color);
          }

          .leaflet-popup-content {
            margin: 0;
          }

          /* Custom marker styling */
          .custom-marker {
            border: none !important;
          }

          /* Custom scrollbar styling */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: var(--input-background);
            border-radius: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: var(--subtle-text-color);
          }
        `}
      </style>

      {/* Header */}
      <Navbar user={user} isAdmin={false} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 p-4 lg:p-8 min-h-0">
        {/* Machines Sidebar */}
        <div className="w-full lg:w-1/3 bg-[var(--card-background)] rounded-lg p-4 lg:p-6 flex flex-col min-h-[50vh] lg:min-h-[60vh] overflow-hidden border border-[var(--border-color)]/50 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[var(--text-color)]">Machines</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchMachines}
                disabled={loading}
                className="flex items-center gap-1 bg-transparent border border-[var(--subtle-text-color)] text-[var(--subtle-text-color)] px-2.5 py-1.5 rounded-md hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--subtle-text-color)] disabled:hover:border-[var(--subtle-text-color)]"
                title="Refresh machines"
              >
                {loading ? (
                  <InlineLoading size="sm" />
                ) : (
                  <span className="material-symbols-outlined text-base">refresh</span>
                )}
              </button>
              <button
                onClick={() => navigate('/add-machine')}
                className="flex items-center gap-1.5 bg-transparent border border-[var(--primary-color)] text-[var(--primary-color)] px-3 py-1.5 rounded-lg hover:bg-[var(--primary-color)] hover:text-[var(--text-color)] transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Add Machine</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--subtle-text-color)]"> search </span>
            <input
              className="w-full bg-[var(--input-background)] text-[var(--text-color)] border border-[var(--border-color)] rounded-md pl-10 pr-4 py-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
              placeholder="Search machines..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Machines List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loading size="lg" text="Loading machines..." />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                <p className="text-[var(--text-color)] font-medium mb-1">Failed to load machines</p>
                <p className="text-[var(--subtle-text-color)] text-sm">{error}</p>
              </div>
            ) : filteredMachines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[var(--subtle-text-color)] mb-2">inventory_2</span>
                <p className="text-[var(--text-color)] font-medium mb-1">No machines found</p>
                <p className="text-[var(--subtle-text-color)] text-sm">Add your first machine to get started</p>
              </div>
            ) : (
              filteredMachines.map((machine) => (
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
              ))
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="w-full lg:w-2/3 bg-[var(--secondary-color)] rounded-lg overflow-hidden min-h-[50vh] lg:min-h-[60vh] border border-[var(--border-color)]/50 shadow-sm flex flex-col">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%', minHeight: '400px' }}
            className="rounded-lg flex-1"
            attributionControl={false}
            zoomControl={true}
            scrollWheelZoom={true}
            touchZoom={true}
            doubleClickZoom={true}
          >
            <TileLayer
              attribution=''
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredMachines.map((machine) => (
              <Marker
                key={machine.id}
                position={[machine.lat, machine.lng]}
                icon={createCustomIcon(machine.status)}
                eventHandlers={{
                  click: (e) => {
                    const map = e.target._map;
                    map.setView([machine.lat, machine.lng], 15); // Close zoom level
                  }
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2">
                    <h3 className="font-bold text-[var(--text-color)]">{machine.name}</h3>
                    <p className="text-sm text-[var(--subtle-text-color)]">{machine.location}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-3 h-3 rounded-full ${
                        machine.status === 'online' ? 'bg-green-500' :
                        machine.status === 'idle' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className={`text-sm capitalize font-medium ${
                        machine.status === 'online' ? 'text-green-600' :
                        machine.status === 'idle' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {machine.status}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && machineToDelete && (
          <div className="fixed inset-0 bg-[var(--background-color)]/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[var(--secondary-color)] border border-[var(--border-color)] rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl relative z-[10000] transform transition-all duration-200 ease-out scale-100">
              {/* Header with Icon */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-red-400">delete_forever</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[var(--text-color)] mb-1">Delete Machine</h3>
                  <p className="text-sm text-[var(--subtle-text-color)] leading-relaxed">
                    This action cannot be undone and will permanently remove the machine from your dashboard.
                  </p>
                </div>
              </div>

              {/* Machine Details */}
              <div className="bg-[var(--input-background)] rounded-lg p-4 mb-6 border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-xl ${
                    machineToDelete.status === 'online' ? 'text-[var(--success-color)]' :
                    machineToDelete.status === 'idle' ? 'text-[var(--warning-color)]' :
                    'text-red-500'
                  }`}>
                    {getStatusIcon(machineToDelete.status)}
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--text-color)] text-lg">{machineToDelete.name}</p>
                    <p className="text-sm text-[var(--subtle-text-color)]">{machineToDelete.location}</p>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-lg text-red-400 mt-0.5">warning</span>
                  <div>
                    <p className="text-sm font-medium text-red-400 mb-1">Warning</p>
                    <p className="text-sm text-[var(--subtle-text-color)]">
                      Deleting this machine will remove all associated data, monitoring history, and configurations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={hideDeleteConfirmation}
                  className="px-6 py-2.5 text-[var(--text-color)] hover:bg-[var(--input-background)] rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-[var(--border-color)]"
                  disabled={deletingMachineId === machineToDelete.name}
                >
                  Cancel
                </button>
                <button
                  onClick={deleteMachine}
                  disabled={deletingMachineId === machineToDelete.name}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2 min-w-[100px] justify-center"
                >
                  {deletingMachineId === machineToDelete.name ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">hourglass_empty</span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
