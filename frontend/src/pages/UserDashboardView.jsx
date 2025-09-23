import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const UserDashboardView = () => {
  const { theme } = useTheme();
  const { userEmail } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Fetch machines from API for the specific user
  const fetchMachines = async () => {
    if (!userEmail) return;

    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${apiUrl}/users/machine/${userEmail}`);

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

  // Fetch user data and machines on component mount
  useEffect(() => {
    if (userEmail) {
      fetchMachines();
      // Set user data for display
      setUserData({ email: userEmail });
    }
  }, [userEmail]);

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
            height: 100vh;
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

          /* Mobile-specific styles */
          @media (max-width: 1024px) {
            .leaflet-control-container {
              font-size: 14px;
            }
            
            .leaflet-popup-content-wrapper {
              font-size: 14px;
            }
          }

          @media (max-width: 768px) {
            .leaflet-control-container {
              font-size: 12px;
            }
            
            .leaflet-popup-content-wrapper {
              font-size: 12px;
              max-width: 200px;
            }
          }

          /* Touch-friendly interactions */
          .touch-manipulation {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }

          /* Improved mobile scrolling */
          .mobile-scroll {
            -webkit-overflow-scrolling: touch;
          }
        `}
      </style>

      {/* Header */}
      <Navbar isAdmin={true} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 p-4 lg:p-8 min-h-0 h-full">
        {/* Machines Sidebar */}
        <div className="w-full lg:w-1/3 bg-[var(--card-background)] rounded-lg p-4 lg:p-6 flex flex-col min-h-[50vh] lg:h-[calc(100vh-120px)] overflow-hidden border border-[var(--border-color)]/50 shadow-sm">
          {/* Header with Back Button */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="group flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10 bg-gradient-to-r from-[var(--secondary-color)] to-[var(--input-background)] border border-[var(--border-color)] text-[var(--text-color)] rounded-lg hover:border-[var(--primary-color)] hover:shadow-lg hover:shadow-[var(--primary-color)]/20 transition-all duration-300 hover:scale-105 touch-manipulation"
                title="Back to Admin Dashboard"
              >
                <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-300">arrow_back</span>
              </button>
              <h2 className="text-xl lg:text-2xl font-bold text-[var(--text-color)]">User Machines</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/admin/user-reports/${userEmail}`)}
                className="flex items-center justify-center w-12 h-12 lg:w-8 lg:h-8 bg-transparent border border-[var(--subtle-text-color)] text-[var(--subtle-text-color)] rounded-md hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 transition-all duration-200 touch-manipulation"
                title="View User Reports"
              >
                <span className="material-symbols-outlined text-sm">analytics</span>
              </button>
              <button
                onClick={fetchMachines}
                disabled={loading}
                className="flex items-center gap-1 bg-transparent border border-[var(--subtle-text-color)] text-[var(--subtle-text-color)] px-3 py-2 lg:px-2.5 lg:py-1.5 rounded-md hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--subtle-text-color)] disabled:hover:border-[var(--subtle-text-color)] touch-manipulation"
                title="Refresh machines"
              >
                <span className={`material-symbols-outlined text-base transition-transform duration-200 ${loading ? 'animate-spin' : ''}`}>
                  {loading ? 'refresh' : 'refresh'}
                </span>
              </button>
            </div>
          </div>

          {/* User Info */}
          {userData && (
            <div className="mb-4 p-3 lg:p-3 bg-[var(--input-background)] rounded-md border border-[var(--border-color)]">
              <p className="text-sm lg:text-sm text-[var(--subtle-text-color)]">Viewing machines for:</p>
              <p className="font-semibold text-base lg:text-base text-[var(--text-color)]">{userData.email}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--subtle-text-color)] text-lg lg:text-base"> search </span>
            <input
              className="w-full bg-[var(--input-background)] text-[var(--text-color)] border border-[var(--border-color)] rounded-md pl-12 lg:pl-10 pr-4 py-3 lg:py-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] text-base lg:text-base"
              placeholder="Search machines..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Machines List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mobile-scroll min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent rounded-full"></div>
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
                <p className="text-[var(--subtle-text-color)] text-sm">This user has no machines yet</p>
              </div>
            ) : (
              filteredMachines.map((machine) => (
                <div
                  key={machine.id}
                  className="group flex items-center justify-between p-4 lg:p-3 bg-[var(--input-background)] rounded-md cursor-pointer hover:bg-[var(--secondary-color)] transition-colors relative touch-manipulation"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className={`material-symbols-outlined text-4xl lg:text-3xl ${
                      machine.status === 'online' ? 'text-[var(--success-color)]' :
                      machine.status === 'idle' ? 'text-[var(--warning-color)]' :
                      'text-red-500'
                    }`}>
                      {getStatusIcon(machine.status)}
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--text-color)] text-base lg:text-base">{machine.name}</p>
                      <p className="text-sm lg:text-sm text-[var(--subtle-text-color)]">{machine.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 lg:w-3 lg:h-3 rounded-full ${
                      machine.status === 'online' ? 'bg-[var(--success-color)]' :
                      machine.status === 'idle' ? 'bg-[var(--warning-color)]' :
                      'bg-red-500'
                    }`}></div>
                    <span className={`text-sm lg:text-sm capitalize font-medium ${
                      machine.status === 'online' ? 'text-[var(--success-color)]' :
                      machine.status === 'idle' ? 'text-[var(--warning-color)]' :
                      'text-red-500'
                    }`}>
                      {machine.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="w-full lg:w-2/3 bg-[var(--card-background)] rounded-lg overflow-hidden min-h-[60vh] lg:h-[calc(100vh-120px)] border border-[var(--border-color)]/50 shadow-sm flex flex-col">
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
      </main>
    </div>
  );
};

export default UserDashboardView;