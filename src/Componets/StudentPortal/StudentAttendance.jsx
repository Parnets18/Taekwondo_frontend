import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt } from 'react-icons/fa';

const StudentAttendance = () => {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0, percentage: 0 });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com/api';

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2024, 2025, 2026, 2027];

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/verify-certificate');
      return;
    }
    loadAttendanceData();
  }, [selectedMonth, selectedYear]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];
      
      const response = await fetch(
        `${API_BASE_URL}/student-portal/attendance?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          const records = data.data?.attendance || [];
          setAttendanceData(records);
          calculateStats(records);
        }
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    const present = records.filter(r => r.status?.toLowerCase() === 'present').length;
    const absent = records.filter(r => r.status?.toLowerCase() === 'absent').length;
    const late = records.filter(r => r.status?.toLowerCase() === 'late').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    
    setStats({ present, absent, late, total, percentage });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'present') return 'bg-green-100 text-green-800 border-green-300';
    if (statusLower === 'absent') return 'bg-gray-100 text-gray-800 border-gray-300';
    if (statusLower === 'late') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'present') return <FaCheckCircle className="text-2xl" />;
    if (statusLower === 'absent') return <FaTimesCircle className="text-2xl" />;
    if (statusLower === 'late') return <FaClock className="text-2xl" />;
    return '?';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#006CB5]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            >
              <IoMdArrowBack className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">My Attendance</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Total Days</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Present</p>
            <p className="text-3xl font-bold text-green-600">{stats.present}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-gray-500">
            <p className="text-sm text-gray-600 mb-1">Absent</p>
            <p className="text-3xl font-bold text-gray-600">{stats.absent}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 mb-1">Late</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Percentage</p>
            <p className="text-3xl font-bold text-purple-600">{stats.percentage}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Attendance Records</h3>
          </div>
          
          {attendanceData.length === 0 ? (
            <div className="p-12 text-center">
              <FaCalendarAlt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No attendance records found</p>
              <p className="text-gray-500 text-sm mt-2">for {months[selectedMonth]} {selectedYear}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {attendanceData.map((record, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getStatusColor(record.status)} border-2`}>
                        {getStatusIcon(record.status)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{formatDate(record.date)}</p>
                        {record.remarks && (
                          <p className="text-sm text-gray-600 mt-1">{record.remarks}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
