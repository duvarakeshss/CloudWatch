import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const UserReportsView = () => {
  const { theme } = useTheme();
  const { userEmail } = useParams();
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState('Monthly');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data for user-specific reports - in a real app, this would come from API
  const [reportData, setReportData] = useState({
    totalMachines: 5,
    onlineMachines: 4,
    offlineMachines: 1,
    totalUptime: 98.5,
    averageResponseTime: 45,
    alertsToday: 2,
    uptimeChange: 2,
    responseTimeChange: -5,
    alertsChange: -15
  });

  // Mock data for charts
  const machineActivityData = [
    { day: 'Mon', value: 85 },
    { day: 'Tue', value: 92 },
    { day: 'Wed', value: 78 },
    { day: 'Thu', value: 95 },
    { day: 'Fri', value: 88 },
    { day: 'Sat', value: 82 },
    { day: 'Sun', value: 90 }
  ];

  const weeklyUptimeData = [95, 97, 94, 98, 96, 99, 97];

  useEffect(() => {
    if (userEmail) {
      setUserData({ email: userEmail });
      fetchUserReportData();
    }
  }, [userEmail, timePeriod]);

  const fetchUserReportData = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would fetch data from your API
      // const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      // const response = await axios.get(`${apiUrl}/admin/user-reports/${userEmail}/${timePeriod.toLowerCase()}`);

      // For now, we'll use mock data that changes based on time period
      setTimeout(() => {
        const mockData = {
          Daily: { totalMachines: 5, onlineMachines: 4, offlineMachines: 1, totalUptime: 96.2, averageResponseTime: 42, alertsToday: 1, uptimeChange: 1, responseTimeChange: -3, alertsChange: -25 },
          Weekly: { totalMachines: 5, onlineMachines: 4, offlineMachines: 1, totalUptime: 97.8, averageResponseTime: 44, alertsToday: 3, uptimeChange: 3, responseTimeChange: -2, alertsChange: -10 },
          Monthly: { totalMachines: 5, onlineMachines: 4, offlineMachines: 1, totalUptime: 98.5, averageResponseTime: 45, alertsToday: 2, uptimeChange: 2, responseTimeChange: -5, alertsChange: -15 },
          Annual: { totalMachines: 5, onlineMachines: 4, offlineMachines: 1, totalUptime: 99.1, averageResponseTime: 38, alertsToday: 8, uptimeChange: 5, responseTimeChange: -8, alertsChange: 20 }
        };

        setReportData(mockData[timePeriod]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching user report data:', error);
      toast.error('Failed to load user report data');
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    // In a real implementation, this would trigger a download from your API
    toast.success(`Report download started for ${userEmail}`);
  };

  const maxActivityValue = Math.max(...machineActivityData.map(d => d.value));

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

      <div className="flex min-h-screen w-full flex-col overflow-auto">
        {/* Main Content - Full Width */}
        <main className="flex-1">
          <div className="p-4">
            <header className="mb-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(`/admin/user-dashboard/${userEmail}`)}
                    className="group flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[var(--secondary-color)] to-[var(--input-background)] border border-[var(--border-color)] text-[var(--text-color)] rounded-lg hover:border-[var(--primary-color)] hover:shadow-lg hover:shadow-[var(--primary-color)]/20 transition-all duration-300 hover:scale-105"
                    title="Back to User Dashboard"
                  >
                    <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-300">arrow_back</span>
                  </button>
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-color)] mb-2">User Report: {userEmail}</h1>

                    {/* Time Period Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 rounded-md bg-[var(--input-background)] p-1">
                        {['Daily', 'Weekly', 'Monthly', 'Annual'].map((period, index) => (
                          <label
                            key={period}
                            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                              timePeriod === period
                                ? 'bg-[var(--primary-color)] text-white'
                                : 'text-[var(--subtle-text-color)] hover:text-[var(--text-color)]'
                            }`}
                          >
                            <input
                              className="sr-only"
                              name="time-period"
                              type="radio"
                              value={period}
                              checked={timePeriod === period}
                              onChange={(e) => setTimePeriod(e.target.value)}
                            />
                            {period}
                          </label>
                        ))}

                        {/* Download Button - Mobile (inline after Annual) */}
                        <button
                          onClick={handleDownloadReport}
                          className="sm:hidden ml-2 flex items-center gap-1 rounded-md bg-[var(--primary-color)] px-2 py-1 text-xs font-medium text-white hover:bg-blue-600 transition-colors"
                          title="Download Report"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                        </button>
                      </div>
                    </div>

                    {/* Subtext */}
                    <p className="text-sm text-[var(--subtle-text-color)] leading-relaxed">
                      Summary of data from all machines connected to this user's account for the selected time period.
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
              <div className="flex flex-col gap-2 rounded-md bg-[var(--card-background)] p-4 border border-[var(--border-color)]/30 shadow-sm">
                <p className="text-sm text-[var(--subtle-text-color)]">Total Machines</p>
                <p className="text-2xl font-bold text-[var(--text-color)]">
                  {loading ? '...' : reportData.totalMachines}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-md bg-[var(--card-background)] p-4 border border-[var(--border-color)]/30 shadow-sm">
                <p className="text-sm text-[var(--subtle-text-color)]">Online Machines</p>
                <p className="text-2xl font-bold text-[var(--text-color)]">
                  {loading ? '...' : reportData.onlineMachines}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-md bg-[var(--secondary-color)] p-4">
                <p className="text-sm text-[var(--subtle-text-color)]">Average Uptime</p>
                <p className="text-2xl font-bold text-[var(--text-color)]">
                  {loading ? '...' : `${reportData.totalUptime}%`}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Machine Activity Chart */}
              <div className="rounded-md bg-[var(--secondary-color)] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-medium text-[var(--text-color)]">Machine Activity</h3>
                    <p className="text-2xl font-bold text-[var(--text-color)]">
                      {loading ? '...' : `${reportData.onlineMachines}/${reportData.totalMachines}`}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${
                    reportData.uptimeChange >= 0 ? 'text-[var(--success-color)]' : 'text-[var(--error-color)]'
                  }`}>
                    <span className="material-symbols-outlined">
                      {reportData.uptimeChange >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    <span>{reportData.uptimeChange >= 0 ? '+' : ''}{reportData.uptimeChange}%</span>
                    <span className="text-[var(--subtle-text-color)]">vs last {timePeriod.toLowerCase()}</span>
                  </div>
                </div>

                <div className="h-[292px]">
                  <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 478 150" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="activityGradient" x1="239" x2="239" y1="0" y2="150">
                        <stop stopColor="var(--primary-color)" stopOpacity="0.3"></stop>
                        <stop offset="1" stopColor="var(--primary-color)" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path
                      d={`M0 ${150 - (machineActivityData[0].value / maxActivityValue) * 120} ${machineActivityData.map((data, index) => {
                        const x = (index / (machineActivityData.length - 1)) * 478;
                        const y = 150 - (data.value / maxActivityValue) * 120;
                        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')} V150 H0 Z`}
                      fill="url(#activityGradient)"
                    ></path>
                    <path
                      d={machineActivityData.map((data, index) => {
                        const x = (index / (machineActivityData.length - 1)) * 478;
                        const y = 150 - (data.value / maxActivityValue) * 120;
                        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      stroke="var(--primary-color)"
                      strokeLinecap="round"
                      strokeWidth="3"
                      fill="none"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* Response Time Chart */}
              <div className="rounded-md bg-[var(--secondary-color)] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-medium text-[var(--text-color)]">Average Response Time</h3>
                    <p className="text-2xl font-bold text-[var(--text-color)]">
                      {loading ? '...' : `${reportData.averageResponseTime}ms`}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${
                    reportData.responseTimeChange <= 0 ? 'text-[var(--success-color)]' : 'text-[var(--error-color)]'
                  }`}>
                    <span className="material-symbols-outlined">
                      {reportData.responseTimeChange <= 0 ? 'trending_down' : 'trending_up'}
                    </span>
                    <span>{reportData.responseTimeChange >= 0 ? '+' : ''}{reportData.responseTimeChange}%</span>
                    <span className="text-[var(--subtle-text-color)]">vs last {timePeriod.toLowerCase()}</span>
                  </div>
                </div>

                <div className="mt-3 grid h-[292px] grid-cols-7 items-end justify-items-center gap-3 px-3">
                  {weeklyUptimeData.map((value, index) => (
                    <div
                      key={index}
                      className="w-full rounded-t-md bg-[var(--primary-color)] transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${value}%` }}
                    ></div>
                  ))}
                  <p className="col-span-1 text-xs text-[var(--subtle-text-color)]">W1</p>
                  <p className="col-span-1 text-xs text-[var(--subtle-text-color)]">W2</p>
                  <p className="col-span-1 text-xs text-[var(--subtle-text-color)]">W3</p>
                  <p className="col-span-1 text-xs text-[var(--subtle-text-color)]">W4</p>
                  <p className="col-span-1 text-xs text-[var(--subtle-text-color)]">W5</p>
                  <p className="col-span-1 text-xs text-[var(--subtle-text-color)]">W6</p>
                  <p className="col-span-1 text-xs text-[var(--subtle-text-color)]">W7</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserReportsView;