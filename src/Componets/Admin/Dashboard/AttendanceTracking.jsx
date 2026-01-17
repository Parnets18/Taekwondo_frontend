import { useState, useEffect } from 'react';
import { 
  FaCalendarCheck, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
  FaUserTimes
} from 'react-icons/fa';

function AttendanceTracking() {
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [showBulkMarkModal, setShowBulkMarkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  
  // Data states
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState({
    totalRecords: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    todayPresent: 0,
    todayLate: 0,
    attendanceRate: 0
  });

  // Filter states
  const [viewMode, setViewMode] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState(getWeekRange(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [attendanceForm, setAttendanceForm] = useState({
    student: '',
    studentName: '',
    date: new Date().toISOString().split('T')[0],
    checkInTime: new Date().toTimeString().slice(0, 5),
    checkOutTime: '',
    status: 'Present',
    class: '',
    notes: ''
  });

  // Bulk mark states
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkClass, setBulkClass] = useState('');
  const [bulkStatus, setBulkStatus] = useState('Present');

  // Autocomplete states
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Helper function to get week range
  function getWeekRange(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  }

  // Helper function to get month range
  function getMonthRange(yearMonth) {
    const [year, month] = yearMonth.split('-');
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  }

  // Get current date range based on view mode
  const getDateRange = () => {
    switch (viewMode) {
      case 'daily':
        return { start: selectedDate, end: selectedDate };
      case 'weekly':
        return selectedWeek;
      case 'monthly':
        return getMonthRange(selectedMonth);
      default:
        return { start: selectedDate, end: selectedDate };
    }
  };

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // Get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    };
  };

  // Fetch functions
  const fetchAttendance = async () => {
    if (!authToken) return;
    try {
      const dateRange = getDateRange();
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        ...(selectedClass !== 'all' && { class: selectedClass }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      });

      const response = await fetch(`${API_BASE_URL}/attendance?${params}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      if (data.status === 'success') {
        setAttendance(data.data.attendance || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchStudents = async () => {
    if (!authToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      if (data.status === 'success') {
        console.log('Fetched students:', data.data.students);
        console.log('First student sample:', data.data.students[0]);
        setStudents(data.data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStatistics = async () => {
    if (!authToken) return;
    try {
      const dateRange = getDateRange();
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        ...(selectedClass !== 'all' && { class: selectedClass })
      });

      const response = await fetch(`${API_BASE_URL}/attendance/statistics?${params}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      if (data.status === 'success') {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Load data
  useEffect(() => {
    if (authToken) {
      Promise.all([
        fetchAttendance(),
        fetchStudents(),
        fetchStatistics()
      ]);
    }
  }, [authToken, viewMode, selectedDate, selectedWeek, selectedMonth, selectedClass, selectedStatus]);

  // Form handlers
  const resetAttendanceForm = () => {
    setAttendanceForm({
      student: '',
      studentName: '',
      date: new Date().toISOString().split('T')[0],
      checkInTime: new Date().toTimeString().slice(0, 5),
      checkOutTime: '',
      status: 'Present',
      class: '',
      notes: ''
    });
    setStudentSuggestions([]);
    setShowStudentSuggestions(false);
  };

  // Autocomplete handlers
  const handleStudentNameChange = (value) => {
    setAttendanceForm(prev => ({
      ...prev,
      studentName: value,
      student: ''
    }));

    if (value.trim() === '') {
      setStudentSuggestions([]);
      setShowStudentSuggestions(false);
    } else {
      const filtered = students.filter(s => 
        s.fullName.toLowerCase().includes(value.toLowerCase())
      );
      setStudentSuggestions(filtered);
      setShowStudentSuggestions(true);
    }
  };

  const selectStudent = (student) => {
    const studentId = student._id || student.id;
    console.log('Selected student:', student);
    console.log('Student ID:', studentId);
    console.log('Student studentId field:', student.studentId);
    console.log('Student courseLevel:', student.courseLevel);
    setAttendanceForm(prev => ({
      ...prev,
      studentName: student.fullName,
      student: studentId,
      class: student.courseLevel ? student.courseLevel.charAt(0).toUpperCase() + student.courseLevel.slice(1) : ''
    }));
    setShowStudentSuggestions(false);
  };

  // Click outside handler for autocomplete
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowStudentSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // CRUD operations
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceForm.student || !attendanceForm.class) {
      alert('Please select a student and class');
      return;
    }

    try {
      const checkInDateTime = new Date(`${attendanceForm.date}T${attendanceForm.checkInTime}`);
      
      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          studentId: attendanceForm.student,
          date: attendanceForm.date,
          checkInTime: checkInDateTime.toISOString(),
          status: attendanceForm.status,
          class: attendanceForm.class,
          notes: attendanceForm.notes
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to mark attendance');

      if (data.status === 'success') {
        alert('Attendance marked successfully!');
        setShowMarkAttendanceModal(false);
        resetAttendanceForm();
        await fetchAttendance();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleQuickCheckOut = async (recordId) => {
    if (!confirm('Check out this student now?')) {
      return;
    }

    try {
      const now = new Date();
      const response = await fetch(`${API_BASE_URL}/attendance/${recordId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          checkOutTime: now.toISOString()
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to check out');

      if (data.status === 'success') {
        alert('Student checked out successfully!');
        await fetchAttendance();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error checking out:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleMarkRemainingAbsent = async () => {
    if (!confirm('Mark all students without attendance today as Absent?')) {
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all students
      const studentsResponse = await fetch(`${API_BASE_URL}/students`, {
        headers: getAuthHeaders()
      });
      const studentsData = await studentsResponse.json();
      const allStudents = studentsData.data.students || [];

      // Get today's attendance
      const attendanceResponse = await fetch(`${API_BASE_URL}/attendance?startDate=${today}&endDate=${today}`, {
        headers: getAuthHeaders()
      });
      const attendanceData = await attendanceResponse.json();
      const todayAttendance = attendanceData.data.attendance || [];

      // Find students who don't have attendance today
      const markedStudentIds = todayAttendance.map(a => a.student._id || a.student.id);
      const absentStudents = allStudents.filter(s => !markedStudentIds.includes(s.id));

      if (absentStudents.length === 0) {
        alert('All students already have attendance marked for today!');
        return;
      }

      // Mark absent students
      let markedCount = 0;
      for (const student of absentStudents) {
        try {
          const response = await fetch(`${API_BASE_URL}/attendance`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              studentId: student.id,
              date: today,
              checkInTime: new Date().toISOString(),
              status: 'Absent',
              class: student.courseLevel ? student.courseLevel.charAt(0).toUpperCase() + student.courseLevel.slice(1) : 'Beginner',
              notes: 'Auto-marked absent'
            })
          });

          if (response.ok) {
            markedCount++;
          }
        } catch (error) {
          console.error(`Error marking ${student.fullName} as absent:`, error);
        }
      }

      alert(`Successfully marked ${markedCount} students as Absent!`);
      await fetchAttendance();
      await fetchStatistics();
    } catch (error) {
      console.error('Error marking remaining as absent:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleBulkMarkAttendance = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0 || !bulkClass) {
      alert('Please select students and class');
      return;
    }

    try {
      const checkInDateTime = new Date(`${bulkDate}T${new Date().toTimeString().slice(0, 5)}`);
      
      const response = await fetch(`${API_BASE_URL}/attendance/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          students: selectedStudents,
          date: bulkDate,
          checkInTime: checkInDateTime.toISOString(),
          class: bulkClass,
          status: bulkStatus
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to bulk mark attendance');

      if (data.status === 'success') {
        alert(`Attendance marked for ${data.data.marked} students!`);
        setShowBulkMarkModal(false);
        setSelectedStudents([]);
        await fetchAttendance();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error bulk marking attendance:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateAttendance = async (e) => {
    e.preventDefault();
    if (!selectedAttendance) return;

    try {
      const updateData = {
        status: attendanceForm.status,
        notes: attendanceForm.notes
      };

      if (attendanceForm.checkOutTime) {
        const checkOutDateTime = new Date(`${attendanceForm.date}T${attendanceForm.checkOutTime}`);
        updateData.checkOutTime = checkOutDateTime.toISOString();
      }

      const response = await fetch(`${API_BASE_URL}/attendance/${selectedAttendance._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update attendance');

      if (data.status === 'success') {
        alert('Attendance updated successfully!');
        setShowEditModal(false);
        setSelectedAttendance(null);
        resetAttendanceForm();
        await fetchAttendance();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete attendance');

      if (data.status === 'success') {
        alert('Attendance deleted successfully!');
        await fetchAttendance();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditAttendance = (record) => {
    setSelectedAttendance(record);
    setAttendanceForm({
      student: record.student._id,
      studentName: record.studentName,
      date: new Date(record.date).toISOString().split('T')[0],
      checkInTime: new Date(record.checkInTime).toTimeString().slice(0, 5),
      checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toTimeString().slice(0, 5) : '',
      status: record.status,
      class: record.class,
      notes: record.notes || ''
    });
    setShowEditModal(true);
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <FaCalendarCheck className="mr-3 text-blue-500" />
            Attendance Management
          </h1>
          <p className="text-slate-600 mt-2">Track and manage student attendance records</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Today Present</p>
              <p className="text-3xl font-bold text-green-600">{statistics.todayPresent}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaUserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Today Late</p>
              <p className="text-3xl font-bold text-yellow-600">{statistics.todayLate}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FaClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Records</p>
              <p className="text-3xl font-bold text-blue-600">{statistics.totalRecords}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Attendance Rate</p>
              <p className="text-3xl font-bold text-purple-600">{statistics.attendanceRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly View
          </button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Date selector based on view mode */}
          {viewMode === 'daily' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {viewMode === 'weekly' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Week</label>
              <input
                type="week"
                value={`${selectedWeek.start.slice(0, 4)}-W${Math.ceil((new Date(selectedWeek.start) - new Date(new Date(selectedWeek.start).getFullYear(), 0, 1)) / 604800000)}`}
                onChange={(e) => {
                  const [year, week] = e.target.value.split('-W');
                  const firstDay = new Date(year, 0, 1 + (week - 1) * 7);
                  setSelectedWeek(getWeekRange(firstDay));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {new Date(selectedWeek.start).toLocaleDateString()} - {new Date(selectedWeek.end).toLocaleDateString()}
              </p>
            </div>
          )}

          {viewMode === 'monthly' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Classes</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="Excused">Excused</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => setShowMarkAttendanceModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
          </div>
        </div>

        {/* Mark Remaining Absent Button - Separate Row */}
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleMarkRemainingAbsent}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            title="Mark all unmarked students as absent for today"
          >
            <FaUserTimes className="w-4 h-4" />
            <span>Mark Remaining Absent</span>
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Table Header with Date Range */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-slate-800">
            Attendance Records - {
              viewMode === 'daily' 
                ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                : viewMode === 'weekly'
                ? `Week: ${new Date(selectedWeek.start).toLocaleDateString()} - ${new Date(selectedWeek.end).toLocaleDateString()}`
                : `Month: ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
            }
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Showing {filteredAttendance.length} record{filteredAttendance.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Student ID</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Student Name</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Class</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Check-In</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Check-Out</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Duration</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center">
                    <FaCalendarCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">No attendance records found</p>
                    <p className="text-slate-400 text-sm mt-1">Click "Mark Attendance" to add attendance</p>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => (
                  <tr key={record._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {record.student?.studentId || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900">{record.studentName}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{record.class}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {(record.status === 'Absent' || record.status === 'Excused') ? '-' : formatTime(record.checkInTime)}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {(record.status === 'Absent' || record.status === 'Excused') ? '-' : (record.checkOutTime ? formatTime(record.checkOutTime) : '-')}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {(record.status === 'Absent' || record.status === 'Excused') ? '-' : (record.duration > 0 ? formatDuration(record.duration) : '-')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {/* Only show Check Out button for Present/Late students who haven't checked out */}
                        {!record.checkOutTime && (record.status === 'Present' || record.status === 'Late') && (
                          <button 
                            onClick={() => handleQuickCheckOut(record._id)}
                            className="px-3 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                            title="Check Out"
                          >
                            <FaClock className="w-4 h-4" />
                            <span>Check Out</span>
                          </button>
                        )}
                        {/* Show "N/A" badge for Absent/Excused students */}
                        {(record.status === 'Absent' || record.status === 'Excused') && (
                          <span className="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                            No Check-Out
                          </span>
                        )}
                        {/* Show "Checked Out" badge for students who already checked out */}
                        {record.checkOutTime && (
                          <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                            <FaCheckCircle className="w-4 h-4" />
                            <span>Checked Out</span>
                          </span>
                        )}
                        <button 
                          onClick={() => handleDeleteAttendance(record._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Mark Attendance</h2>
                <button 
                  onClick={() => {
                    setShowMarkAttendanceModal(false);
                    resetAttendanceForm();
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleMarkAttendance} className="space-y-4">
                <div className="autocomplete-container relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={attendanceForm.studentName}
                    onChange={(e) => handleStudentNameChange(e.target.value)}
                    placeholder="Type student name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    autoComplete="off"
                  />
                  
                  {showStudentSuggestions && studentSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {studentSuggestions.map((student) => (
                        <div
                          key={student._id}
                          onClick={() => selectStudent(student)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{student.fullName}</p>
                              <p className="text-sm text-gray-500">{student.email || 'No email'}</p>
                            </div>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                              {student.studentId}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {attendanceForm.student && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-700 font-semibold">Student ID</p>
                        <p className="text-blue-900 font-bold">
                          {students.find(s => (s._id || s.id) === attendanceForm.student)?.studentId || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 font-semibold">Class Level</p>
                        <p className="text-blue-900 font-bold">{attendanceForm.class || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date (Auto)
                    </label>
                    <input
                      type="text"
                      value={new Date(attendanceForm.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check-In Time (Auto)
                    </label>
                    <input
                      type="text"
                      value={new Date(`${attendanceForm.date}T${attendanceForm.checkInTime}`).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={attendanceForm.status}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                      <option value="Excused">Excused</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold transition"
                  >
                    Mark Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMarkAttendanceModal(false);
                      resetAttendanceForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Mark Attendance Modal */}
      {showBulkMarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl">
            <div className="bg-green-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Bulk Mark Attendance</h2>
                <button 
                  onClick={() => {
                    setShowBulkMarkModal(false);
                    setSelectedStudents([]);
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleBulkMarkAttendance} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={bulkDate}
                      onChange={(e) => setBulkDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class *
                    </label>
                    <select
                      value={bulkClass}
                      onChange={(e) => setBulkClass(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Class</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                      <option value="Excused">Excused</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Students ({selectedStudents.length} selected)
                  </label>
                  <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                    {students.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => toggleStudentSelection(student._id)}
                        className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                          selectedStudents.includes(student._id) ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => {}}
                            className="mr-3 w-4 h-4 text-green-600"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{student.fullName}</p>
                            <p className="text-sm text-gray-500">{student.email || 'No email'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold transition"
                  >
                    Mark Attendance for {selectedStudents.length} Students
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkMarkModal(false);
                      setSelectedStudents([]);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {showEditModal && selectedAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            <div className="bg-amber-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Edit Attendance</h2>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAttendance(null);
                    resetAttendanceForm();
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleUpdateAttendance} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Student:</strong> {attendanceForm.studentName}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Date:</strong> {new Date(attendanceForm.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check-Out Time
                    </label>
                    <input
                      type="time"
                      value={attendanceForm.checkOutTime}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, checkOutTime: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={attendanceForm.status}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                      <option value="Excused">Excused</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={attendanceForm.notes}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 font-semibold transition"
                  >
                    Update Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedAttendance(null);
                      resetAttendanceForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceTracking;
