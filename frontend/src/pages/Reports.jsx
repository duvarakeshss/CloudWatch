import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Reports = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [timePeriod, setTimePeriod] = useState('Monthly');
  const [reportData, setReportData] = useState({
    totalLogins: 3456,
    successfulLogins: 3387,
    failedLogins: 69,
    loginActivity: 1234,
    adminSuccessRate: 98,
    activityChange: 5,
    successRateChange: -2
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mock data for charts - in a real app, this would come from your API
  const loginActivityData = [
    { day: 'Mon', value: 120 },
    { day: 'Tue', value: 150 },
    { day: 'Wed', value: 180 },
    { day: 'Thu', value: 140 },
    { day: 'Fri', value: 200 },
    { day: 'Sat', value: 160 },
    { day: 'Sun', value: 130 }
  ];

  const weeklyData = [70, 70, 90, 80, 30, 10, 60];

  useEffect(() => {
    if (user && !authLoading) {
      fetchReportData();
    }
  }, [user, authLoading, timePeriod]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would fetch data from your API
      // const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      // const response = await axios.get(`${apiUrl}/reports/${timePeriod.toLowerCase()}`);

      // For now, we'll use mock data that changes based on time period
      setTimeout(() => {
        const mockData = {
          Daily: { totalLogins: 120, successfulLogins: 115, failedLogins: 5, loginActivity: 45, adminSuccessRate: 96, activityChange: 12, successRateChange: 1 },
          Weekly: { totalLogins: 840, successfulLogins: 812, failedLogins: 28, loginActivity: 315, adminSuccessRate: 97, activityChange: 8, successRateChange: -1 },
          Monthly: { totalLogins: 3456, successfulLogins: 3387, failedLogins: 69, loginActivity: 1234, adminSuccessRate: 98, activityChange: 5, successRateChange: -2 },
          Annual: { totalLogins: 42180, successfulLogins: 41345, failedLogins: 835, loginActivity: 15234, adminSuccessRate: 98, activityChange: 15, successRateChange: 3 }
        };

        setReportData(mockData[timePeriod]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    // In a real implementation, this would trigger a download from your API
    toast.success('Report download started');
  };

  const maxActivityValue = Math.max(...loginActivityData.map(d => d.value));

  return (
    <div className="bg-[var(--background-color)] min-h-screen overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>
        {`
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
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

      <Navbar user={user} isAdmin={false} />

      <div className="flex h-screen w-full">
        {/* Main Content - Full Width */}
        <main className="flex-1">
          <div className="p-4">
            <header className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-color)]">Overall Report</h1>
                <p className="text-sm text-[var(--subtle-text-color)]">Summary of data from all machines connected to your account.</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Time Period Selector */}
                <div className="flex items-center gap-2 rounded-md bg-[var(--input-background)] p-1">
                  {['Daily', 'Weekly', 'Monthly', 'Annual'].map((period) => (
                    <label
                      key={period}
                      className={`cursor-pointer rounded-md px-3 py-1 text-sm transition-colors ${
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
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 rounded-md bg-[var(--primary-color)] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                >
                  <span className="material-symbols-outlined">download</span>
                  Download Report
                </button>
              </div>
            </header>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
              <div className="flex flex-col gap-2 rounded-md bg-[var(--card-background)] p-4 border border-[var(--border-color)]/30 shadow-sm">
                <p className="text-sm text-[var(--subtle-text-color)]">Total Logins</p>
                <p className="text-2xl font-bold text-[var(--text-color)]">
                  {loading ? '...' : reportData.totalLogins.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-md bg-[var(--card-background)] p-4 border border-[var(--border-color)]/30 shadow-sm">
                <p className="text-sm text-[var(--subtle-text-color)]">Successful Logins</p>
                <p className="text-2xl font-bold text-[var(--text-color)]">
                  {loading ? '...' : reportData.successfulLogins.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-md bg-[var(--card-background)] p-4 border border-[var(--border-color)]/30 shadow-sm">
                <p className="text-sm text-[var(--subtle-text-color)]">Failed Logins</p>
                <p className="text-2xl font-bold text-[var(--text-color)]">
                  {loading ? '...' : reportData.failedLogins.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Login Activity Chart */}
              <div className="rounded-md bg-[var(--secondary-color)] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-medium text-[var(--text-color)]">Login Activity</h3>
                    <p className="text-2xl font-bold text-[var(--text-color)]">
                      {loading ? '...' : reportData.loginActivity.toLocaleString()}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${
                    reportData.activityChange >= 0 ? 'text-[var(--success-color)]' : 'text-[var(--error-color)]'
                  }`}>
                    <span className="material-symbols-outlined">
                      {reportData.activityChange >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    <span>{reportData.activityChange >= 0 ? '+' : ''}{reportData.activityChange}%</span>
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
                      d={`M0 ${150 - (loginActivityData[0].value / maxActivityValue) * 120} ${loginActivityData.map((data, index) => {
                        const x = (index / (loginActivityData.length - 1)) * 478;
                        const y = 150 - (data.value / maxActivityValue) * 120;
                        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')} V150 H0 Z`}
                      fill="url(#activityGradient)"
                    ></path>
                    <path
                      d={loginActivityData.map((data, index) => {
                        const x = (index / (loginActivityData.length - 1)) * 478;
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

              {/* Admin Login Success Rate Chart */}
              <div className="rounded-md bg-[var(--secondary-color)] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-medium text-[var(--text-color)]">Admin Login Success Rate</h3>
                    <p className="text-2xl font-bold text-[var(--text-color)]">
                      {loading ? '...' : `${reportData.adminSuccessRate}%`}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${
                    reportData.successRateChange >= 0 ? 'text-[var(--success-color)]' : 'text-[var(--error-color)]'
                  }`}>
                    <span className="material-symbols-outlined">
                      {reportData.successRateChange >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    <span>{reportData.successRateChange >= 0 ? '+' : ''}{reportData.successRateChange}%</span>
                    <span className="text-[var(--subtle-text-color)]">vs last {timePeriod.toLowerCase()}</span>
                  </div>
                </div>

                <div className="mt-3 grid h-[292px] grid-cols-7 items-end justify-items-center gap-3 px-3">
                  {weeklyData.map((value, index) => (
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

export default Reports;