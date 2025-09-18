import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { toast } from 'react-toastify';
import { signOut } from 'firebase/auth';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useTheme } from '../contexts/ThemeContext';

const AddMachine = () => {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [newMachine, setNewMachine] = useState({
    machineId: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        // Check if user is not an admin (admins should use admin dashboard)
        const userType = localStorage.getItem('userType');
        if (userType !== 'admin') {
          setUser(currentUser);
        } else {
          navigate('/admin-dashboard');
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleMachineInputChange = (field, value) => {
    setNewMachine(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitMachine = async (e) => {
    e.preventDefault();

    if (!newMachine.machineId.trim() || !newMachine.location.trim()) {
      toast.error('Machine ID and Location are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const userEmail = localStorage.getItem('userEmail') || user?.email;

      const machineData = {
        machineId: newMachine.machineId.trim(),
        location: newMachine.location.trim(),
        userEmail: userEmail
      };

      await axios.post(`${apiUrl}/users/machine`, machineData);

      toast.success('Machine added successfully!');
      navigate('/dashboard'); // Go back to dashboard after successful addition

    } catch (error) {
      console.error('Error adding machine:', error);
      toast.error(error.response?.data?.message || 'Failed to add machine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard'); // Go back to dashboard
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background-color)]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-color)] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
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
            --success-color: #22c55e;
            --warning-color: #f59e0b;
          }
        `}
      </style>

      {/* Header */}
      <Navbar user={user} isAdmin={false} />

      {/* Main Content - Form Only */}
      <main className="flex-1">
        {/* Add Machine Form */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-[var(--secondary-color)] rounded-lg p-8">
            <h2 className="text-2xl font-bold text-[var(--text-color)] mb-6">Add New Machine</h2>

            <form onSubmit={handleSubmitMachine} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--subtle-text-color)] mb-2" htmlFor="machine-id">
                  Machine ID
                </label>
                <input
                  id="machine-id"
                  type="text"
                  placeholder="e.g., machine-07"
                  value={newMachine.machineId}
                  onChange={(e) => handleMachineInputChange('machineId', e.target.value)}
                  className="w-full bg-[var(--input-background)] text-[var(--text-color)] border border-[var(--border-color)] rounded-md px-4 py-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--subtle-text-color)] mb-2" htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g., Berlin, Germany"
                  value={newMachine.location}
                  onChange={(e) => handleMachineInputChange('location', e.target.value)}
                  className="w-full bg-[var(--input-background)] text-[var(--text-color)] border border-[var(--border-color)] rounded-md px-4 py-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 rounded-md text-[var(--text-color)] bg-[var(--secondary-color)] border border-[var(--border-color)] hover:bg-[var(--input-background)] transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-md text-[var(--text-color)] bg-[var(--primary-color)] hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddMachine;