import { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBelt, setSelectedBelt] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blackBelts: 0,
    newThisMonth: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [authToken, setAuthToken] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formAge, setFormAge] = useState(null);

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Helper function to calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    } else {
      setShowLoginModal(true);
    }
  }, []);

  // Manual login function
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          const token = data.data.token;
          setAuthToken(token);
          localStorage.setItem('authToken', token);
          setShowLoginModal(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    };
  };

  // Fetch students from backend
  const fetchStudents = async (page = 1, search = '', belt = '') => {
    if (!authToken) {
      console.log('No auth token available, skipping API call');
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(belt && { currentBelt: belt })
      });

      const response = await fetch(`${API_BASE_URL}/students?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, clear it and show login
          localStorage.removeItem('authToken');
          setAuthToken(null);
          setShowLoginModal(true);
          throw new Error('Authentication required');
        }
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setStudents(data.data.students);
        setStats(data.data.stats);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Error fetching students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create new student
  const createStudent = async (studentData) => {
    if (!authToken) {
      alert('Please login first');
      return;
    }

    try {
      console.log('📝 Creating student with data:', studentData);
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(studentData)
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Error response:', errorData);
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          setAuthToken(null);
          setShowLoginModal(true);
          throw new Error('Authentication required');
        }
        throw new Error(errorData.message || 'Failed to create student');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Refresh the students list
        fetchStudents(pagination.currentPage, searchTerm, selectedBelt);
        setShowAddModal(false);
        setFormAge(null);
        alert('Student created successfully!');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      
      // Show specific error message from server
      if (error.message.includes('at least 5 years old')) {
        alert(`❌ Age Validation Error: ${error.message}`);
      } else if (error.message.includes('already registered')) {
        alert(`❌ Email Error: ${error.message}`);
      } else {
        alert(`❌ Error creating student: ${error.message}`);
      }
    }
  };

  // Update student
  const updateStudent = async (studentId, studentData) => {
    if (!authToken) {
      alert('Please login first');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(studentData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          setAuthToken(null);
          setShowLoginModal(true);
          throw new Error('Authentication required');
        }
        throw new Error('Failed to update student');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Refresh the students list
        fetchStudents(pagination.currentPage, searchTerm, selectedBelt);
        setShowEditModal(false);
        setSelectedStudent(null);
        alert('Student updated successfully!');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student. Please try again.');
    }
  };

  // Delete student
  const deleteStudentHandler = async (studentId) => {
    console.log('🗑️ Delete handler called for student:', studentId);
    
    if (!authToken) {
      alert('Please login first');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete this student? This action cannot be undone and will remove the student from the database forever.')) {
      return;
    }

    try {
      console.log('📤 Sending DELETE request to:', `${API_BASE_URL}/students/${studentId}`);
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          setAuthToken(null);
          setShowLoginModal(true);
          throw new Error('Authentication required');
        }
        throw new Error(`Failed to delete student: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Delete response:', data);
      
      if (data.status === 'success') {
        // Refresh the students list
        fetchStudents(pagination.currentPage, searchTerm, selectedBelt);
        alert('Student permanently deleted from database!');
      }
    } catch (error) {
      console.error('❌ Error deleting student:', error);
      alert(`Error deleting student: ${error.message}`);
    }
  };

  // Promote student belt
  const promoteStudent = async (studentId, belt, notes = '') => {
    if (!authToken) {
      alert('Please login first');
      return;
    }

    try {
      // Update student with new belt
      const studentData = { currentBelt: belt };
      await updateStudent(studentId, studentData);
    } catch (error) {
      console.error('Error promoting student:', error);
      alert('Error promoting student. Please try again.');
    }
  };




  useEffect(() => {
    if (authToken) {
      fetchStudents(1, searchTerm, selectedBelt);
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      const delayedSearch = setTimeout(() => {
        fetchStudents(1, searchTerm, selectedBelt);
      }, 500);

      return () => clearTimeout(delayedSearch);
    }
  }, [searchTerm, selectedBelt, authToken]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBelt = selectedBelt === '' || student.currentBelt === selectedBelt;
    // Remove age filter as it's causing issues with age calculation
    // const matchesAge = student.age >= 5;
    const matchesStatus = student.status === 'active';
    
    // Debug logging
    console.log('Student filter debug:', {
      student: student.fullName,
      matchesSearch,
      matchesBelt,
      matchesStatus,
      status: student.status,
      age: student.age
    });
    
    return matchesSearch && matchesBelt && matchesStatus;
  });

  const beltLevels = [
    { value: 'white', label: 'White Belt' },
    { value: 'yellow', label: 'Yellow Belt' },
    { value: 'green', label: 'Green Belt' },
    { value: 'blue', label: 'Blue Belt' },
    { value: 'red', label: 'Red Belt' },
    { value: 'black-1st', label: 'Black Belt 1st Dan' },
    { value: 'black-2nd', label: 'Black Belt 2nd Dan' },
    { value: 'black-3rd', label: 'Black Belt 3rd Dan' }
  ];

  const getBeltColor = (belt) => {
    const colors = {
      'white': 'bg-gray-100 text-gray-800',
      'yellow': 'bg-yellow-100 text-yellow-800',
      'green': 'bg-green-100 text-green-800',
      'blue': 'bg-blue-100 text-blue-800',
      'red': 'bg-red-100 text-red-800',
      'black-1st': 'bg-black text-white',
      'black-2nd': 'bg-black text-white',
      'black-3rd': 'bg-black text-white'
    };
    return colors[belt] || 'bg-gray-100 text-gray-800';
  };

  const getBeltLabel = (belt) => {
    const labels = {
      'white': 'White Belt',
      'yellow': 'Yellow Belt',
      'green': 'Green Belt',
      'blue': 'Blue Belt',
      'red': 'Red Belt',
      'black-1st': 'Black Belt 1st Dan',
      'black-2nd': 'Black Belt 2nd Dan',
      'black-3rd': 'Black Belt 3rd Dan'
    };
    return labels[belt] || belt;
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleAddStudent = (formData) => {
    // Client-side age validation
    const dateOfBirth = formData.get('dateOfBirth');
    const age = calculateAge(dateOfBirth);
    
    if (age < 5) {
      alert(`❌ Age Validation Error: Student must be at least 5 years old. Current age: ${age} years. Please check the date of birth.`);
      return;
    }

    const studentData = {
      fullName: formData.get('fullName'),
      dateOfBirth: formData.get('dateOfBirth'),
      gender: formData.get('gender'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      emergencyContact: {
        name: formData.get('emergencyContactName'),
        phone: formData.get('emergencyContactPhone'),
        relationship: formData.get('emergencyContactRelationship')
      },
      courseLevel: formData.get('courseLevel')
    };

    console.log('📋 Form data extracted:', studentData);
    createStudent(studentData);
  };

  const handleEditStudent = (formData) => {
    if (!selectedStudent) return;

    const studentData = {
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      emergencyContact: {
        name: formData.get('emergencyContactName'),
        phone: formData.get('emergencyContactPhone'),
        relationship: formData.get('emergencyContactRelationship')
      },
      courseLevel: formData.get('courseLevel'),
      status: formData.get('status')
    };

    updateStudent(selectedStudent.id, studentData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
        <p className="text-gray-600">Manage student records, belt progressions, and enrollment details</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🥋</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Black Belts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.blackBelts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search students by name or email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={selectedBelt}
                onChange={(e) => setSelectedBelt(e.target.value)}
              >
                <option value="">All Belt Levels</option>
                {beltLevels.map(belt => (
                  <option key={belt.value} value={belt.value}>{belt.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.studentId || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowViewModal(true);
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                      >
                        {student.fullName}
                      </button>
                      <div className="text-sm text-gray-500">Age: {student.age || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{student.courseLevel}</div>
                    <div className="text-sm text-gray-500">
                      Joined: {new Date(student.enrollmentDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                      {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowViewModal(true);
                        }}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        title="View"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowEditModal(true);
                        }}
                        className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center"
                        title="Edit"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteStudentHandler(student.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                        title="Delete"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">📭</div>
          <div className="text-gray-600 text-lg font-medium mb-2">No students found</div>
          <div className="text-gray-500 text-sm mb-6">
            {stats.total === 0 
              ? 'No student data is available. Start by adding a new student.' 
              : 'No students match your search criteria.'}
          </div>
          {stats.total === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Add First Student
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => fetchStudents(pagination.currentPage - 1, searchTerm, selectedBelt)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchStudents(pagination.currentPage + 1, searchTerm, selectedBelt)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span> of{' '}
                <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => fetchStudents(pagination.currentPage - 1, searchTerm, selectedBelt)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => fetchStudents(index + 1, searchTerm, selectedBelt)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.currentPage === index + 1
                        ? 'z-10 bg-red-50 border-red-500 text-red-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => fetchStudents(pagination.currentPage + 1, searchTerm, selectedBelt)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Add New Student</h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setFormAge(null);
                }}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddStudent(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter student name"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date of Birth * 
                    {formAge !== null && (
                      <span className={`ml-2 text-sm ${formAge >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                        (Age: {formAge} years {formAge < 5 ? '- Too young!' : '- Valid'})
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      formAge !== null && formAge < 5 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    onChange={(e) => {
                      const age = calculateAge(e.target.value);
                      setFormAge(age);
                    }}
                    required
                  />
                  {formAge !== null && formAge < 5 && (
                    <p className="text-red-600 text-sm mt-1">
                      ⚠️ Student must be at least 5 years old for enrollment
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender *</label>
                  <select name="gender" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="student@example.com"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Course Level *</label>
                  <select name="courseLevel" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" required>
                    <option value="">Select Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Contact Name *</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    placeholder="Parent or guardian name"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Contact Phone *</label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Relationship *</label>
                  <input
                    type="text"
                    name="emergencyContactRelationship"
                    placeholder="Father, Mother, Guardian, etc."
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address *</label>
                <textarea
                  name="address"
                  rows="3"
                  placeholder="Enter complete address"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-colors"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Edit Student</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStudent(null);
                }}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleEditStudent(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={selectedStudent.fullName}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedStudent.email}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={selectedStudent.phone}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Course Level *</label>
                  <select name="courseLevel" defaultValue={selectedStudent.courseLevel} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" required>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status *</label>
                  <select name="status" defaultValue={selectedStudent.status} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" required>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="graduated">Graduated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Contact Name *</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    defaultValue={selectedStudent.emergencyContact?.name}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Contact Phone *</label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    defaultValue={selectedStudent.emergencyContact?.phone}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Relationship *</label>
                  <input
                    type="text"
                    name="emergencyContactRelationship"
                    defaultValue={selectedStudent.emergencyContact?.relationship}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address *</label>
                <textarea
                  name="address"
                  rows="3"
                  defaultValue={selectedStudent.address}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
                  }}
                  className="px-6 py-3 bg-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-colors"
                >
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Student Details</h2>
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStudent(null);
                }}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Full Name</label>
                      <p className="text-slate-900">{selectedStudent.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Age</label>
                      <p className="text-slate-900">{selectedStudent.age || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <p className="text-slate-900">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Phone</label>
                      <p className="text-slate-900">{selectedStudent.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Training Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Current Belt</label>
                      <p className="text-slate-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBeltColor(selectedStudent.currentBelt)}`}>
                          {getBeltLabel(selectedStudent.currentBelt)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Course Level</label>
                      <p className="text-slate-900 capitalize">{selectedStudent.courseLevel}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Status</label>
                      <p className="text-slate-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedStudent.status)}`}>
                          {selectedStudent.status?.charAt(0).toUpperCase() + selectedStudent.status?.slice(1)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Enrollment Date</label>
                      <p className="text-slate-900">{new Date(selectedStudent.enrollmentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Name</label>
                    <p className="text-slate-900">{selectedStudent.emergencyContact?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone</label>
                    <p className="text-slate-900">{selectedStudent.emergencyContact?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Relationship</label>
                    <p className="text-slate-900">{selectedStudent.emergencyContact?.relationship || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {selectedStudent.address && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Address</h3>
                  <p className="text-slate-900">{selectedStudent.address}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-4 pt-6">
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStudent(selectedStudent);
                  setShowEditModal(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Edit Student
              </button>
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStudent(null);
                }}
                className="px-6 py-3 bg-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Admin Login</h2>
              <p className="text-slate-600 mt-2">Please login to access student management</p>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const email = formData.get('email');
              const password = formData.get('password');
              
              const success = await handleLogin(email, password);
              if (!success) {
                alert('Login failed. Please check your credentials.');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue="admin@combatwarrior.com"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  defaultValue="admin123"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                <strong>Demo Credentials:</strong><br />
                Email: admin@combatwarrior.com<br />
                Password: admin123
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  type="submit"
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;