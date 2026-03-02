import { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { StudentFormModal } from './StudentManagementForm';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBelt, setSelectedBelt] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com'; // For static files like images

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
    const token = localStorage.getItem('token');
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
          localStorage.setItem('token', token);
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
          localStorage.removeItem('token');
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
        
        // Debug: Log photo paths
        console.log('📸 Student photos:', data.data.students.map(s => ({ 
          name: s.fullName, 
          photo: s.photo,
          photoUrl: s.photo ? (s.photo.startsWith('http') ? s.photo : `${BASE_URL}/${s.photo}`) : 'No photo'
        })));
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
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(studentData).forEach(key => {
        if (key === 'emergencyContact') {
          formData.append('emergencyContact[name]', studentData.emergencyContact.name);
          formData.append('emergencyContact[phone]', studentData.emergencyContact.phone);
          formData.append('emergencyContact[relationship]', studentData.emergencyContact.relationship);
        } else if (key === 'photo' && studentData.photo instanceof File) {
          formData.append('photo', studentData.photo);
        } else if (studentData[key]) {
          formData.append(key, studentData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: formData
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Error response:', errorData);
        if (response.status === 401) {
          localStorage.removeItem('token');
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
        setPhotoPreview(null);
        setPhotoFile(null);
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
  const updateStudent = async (studentId, formData) => {
    if (!authToken) {
      alert('Please login first');
      return;
    }

    try {
      // Send FormData directly (includes photo file if uploaded)
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setAuthToken(null);
          setShowLoginModal(true);
          throw new Error('Authentication required');
        }
        console.error('Update failed:', data);
        throw new Error(data.message || 'Failed to update student');
      }
      
      if (data.status === 'success') {
        // Refresh the students list
        fetchStudents(pagination.currentPage, searchTerm, selectedBelt);
        setShowEditModal(false);
        setSelectedStudent(null);
        alert('Student updated successfully!');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert(`Error updating student: ${error.message}`);
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
          localStorage.removeItem('token');
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
    
    // Debug logging
    console.log('Student filter debug:', {
      student: student.fullName,
      matchesSearch,
      matchesBelt,
      age: student.age
    });
    
    return matchesSearch && matchesBelt;
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, JPEG, and PNG files are allowed');
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudent = (formData) => {
    // Client-side age validation
    const dateOfBirth = formData.get('dateOfBirth');
    const age = calculateAge(dateOfBirth);
    
    if (age < 3) {
      alert(`❌ Age Validation Error: Student must be at least 3 years old. Current age: ${age} years. Please check the date of birth.`);
      return;
    }

    const studentData = {
      fullName: formData.get('fullName'),
      dateOfBirth: formData.get('dateOfBirth'),
      gender: formData.get('gender'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      bloodGroup: formData.get('bloodGroup') || undefined,
      fatherName: formData.get('fatherName') || undefined,
      motherName: formData.get('motherName') || undefined,
      fatherPhone: formData.get('fatherPhone') || undefined,
      motherPhone: formData.get('motherPhone') || undefined,
      fatherOccupation: formData.get('fatherOccupation') || undefined,
      motherOccupation: formData.get('motherOccupation') || undefined,
      schoolCollegeName: formData.get('schoolCollegeName') || undefined,
      qualification: formData.get('qualification') || undefined,
      instructorName: formData.get('instructorName') || undefined,
      classAddress: formData.get('classAddress') || undefined,
      organizationName: formData.get('organizationName') || undefined,
      admissionNumber: formData.get('admissionNumber') || undefined,
      joiningDate: formData.get('joiningDate') || undefined,
      photo: photoFile || undefined,
      // Achievements (already stringified in form)
      achievements: formData.get('achievements'),
      // Exam Dates
      examYellowStripe: formData.get('examYellowStripe') || undefined,
      examYellowBelt: formData.get('examYellowBelt') || undefined,
      examGreenStripe: formData.get('examGreenStripe') || undefined,
      examGreenBelt: formData.get('examGreenBelt') || undefined,
      examBlueStripe: formData.get('examBlueStripe') || undefined,
      examBlueBelt: formData.get('examBlueBelt') || undefined,
      examRedStripe: formData.get('examRedStripe') || undefined,
      examRedBelt: formData.get('examRedBelt') || undefined,
      examBlackStripe: formData.get('examBlackStripe') || undefined,
      examBlackBelt: formData.get('examBlackBelt') || undefined,
      currentBeltLevel: formData.get('currentBeltLevel') || undefined,
      idNumber: formData.get('idNumber') || undefined
    };

    console.log('📋 Form data extracted:', studentData);
    createStudent(studentData);
  };

  const handleEditStudent = (formData) => {
    if (!selectedStudent) return;

    // Clean up FormData - remove empty values for optional fields
    const cleanedFormData = new FormData();
    
    for (let [key, value] of formData.entries()) {
      // Skip empty values for optional fields (but keep required fields even if empty)
      if (value && value !== '' && value !== 'null' && value !== 'undefined') {
        cleanedFormData.append(key, value);
      } else if (['fullName', 'phone', 'email', 'address', 'admissionNumber', 'joiningDate'].includes(key)) {
        // Keep required fields even if empty (will be validated by backend)
        cleanedFormData.append(key, value);
      }
    }

    updateStudent(selectedStudent.id, cleanedFormData);
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
        <div className="bg-white rounded-lg shadow p-6" style={{ borderLeft: '4px solid #006CB5' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e3f2fd' }}>
                <span className="text-sm font-bold" style={{ color: '#006CB5' }}>👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: '#666666' }}>Total Students</p>
              <p className="text-2xl font-bold" style={{ color: '#000000' }}>{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6" style={{ borderLeft: '4px solid #006CB5' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e3f2fd' }}>
                <span className="text-sm font-bold" style={{ color: '#006CB5' }}>✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: '#666666' }}>Active Students</p>
              <p className="text-2xl font-bold" style={{ color: '#000000' }}>{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6" style={{ borderLeft: '4px solid #006CB5' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e3f2fd' }}>
                <span className="text-sm font-bold" style={{ color: '#006CB5' }}>🥋</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: '#666666' }}>Black Belts</p>
              <p className="text-2xl font-bold" style={{ color: '#000000' }}>{stats.blackBelts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6" style={{ borderLeft: '4px solid #006CB5' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e3f2fd' }}>
                <span className="text-sm font-bold" style={{ color: '#006CB5' }}>📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: '#666666' }}>New This Month</p>
              <p className="text-2xl font-bold" style={{ color: '#000000' }}>{stats.newThisMonth}</p>
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
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: '#006CB5' }}
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
                  Photo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School/College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joining Date
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
                    <div className="flex-shrink-0 h-10 w-10">
                      {student.photo ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover border-2 border-gray-300" 
                          src={student.photo.startsWith('http') ? student.photo : `${BASE_URL}/${student.photo}`}
                          alt={student.fullName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-blue-300">
                                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-blue-300">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowViewModal(true);
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left uppercase"
                      >
                        {student.fullName}
                      </button>
                      <div className="text-sm text-gray-500">
                        Age: {student.age || 'N/A'} | {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.admissionNumber || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.instructorName || 'N/A'}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{student.classAddress || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.schoolCollegeName || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{student.qualification || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.joiningDate ? new Date(student.joiningDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowViewModal(true);
                        }}
                        className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                        title="View"
                      >
                        <FaEye className="w-4 h-4" style={{ color: '#006CB5' }} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowEditModal(true);
                        }}
                        className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                        title="Edit"
                      >
                        <FaEdit className="w-4 h-4" style={{ color: '#006CB5' }} />
                      </button>
                      <button 
                        onClick={() => deleteStudentHandler(student.id)}
                        className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                        title="Delete"
                      >
                        <FaTrash className="w-4 h-4" style={{ color: '#dc2626' }} />
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
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: '#006CB5' }}
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

      {/* Student Form Modals */}
      <StudentFormModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddStudent}
        student={null}
        formAge={formAge}
        setFormAge={setFormAge}
        calculateAge={calculateAge}
        photoPreview={photoPreview}
        setPhotoPreview={setPhotoPreview}
        photoFile={photoFile}
        setPhotoFile={setPhotoFile}
        handlePhotoChange={handlePhotoChange}
      />

      <StudentFormModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleEditStudent}
        student={selectedStudent}
        formAge={formAge}
        setFormAge={setFormAge}
        calculateAge={calculateAge}
        photoPreview={photoPreview}
        setPhotoPreview={setPhotoPreview}
        photoFile={photoFile}
        setPhotoFile={setPhotoFile}
        handlePhotoChange={handlePhotoChange}
      />

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black">
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
                      <span className={`ml-2 text-sm ${formAge >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                        (Age: {formAge} years {formAge < 3 ? '- Too young!' : '- Valid'})
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      formAge !== null && formAge < 3 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    onChange={(e) => {
                      const age = calculateAge(e.target.value);
                      setFormAge(age);
                    }}
                    required
                  />
                  {formAge !== null && formAge < 3 && (
                    <p className="text-red-600 text-sm mt-1">
                      ⚠️ Student must be at least 3 years old for enrollment
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
                  className="px-6 py-3 rounded-xl font-semibold transition-colors"
                  style={{ backgroundColor: '#e5e7eb', color: '#374151' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-colors"
                  style={{ backgroundColor: '#006CB5' }}
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-black">
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
              {/* Photo Section */}
              <div className="flex justify-center">
                {selectedStudent.photo ? (
                  <img 
                    src={`${BASE_URL}/${selectedStudent.photo}`} 
                    alt={selectedStudent.fullName}
                    className="w-32 h-32 object-cover rounded-lg border-4 border-blue-300 shadow-lg"
                    onError={(e) => {
                      console.error('View modal image failed to load:', `${BASE_URL}/${selectedStudent.photo}`);
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center border-4 border-blue-300 shadow-lg">
                          <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center border-4 border-blue-300 shadow-lg">
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Instructor Name</label>
                    <p className="text-slate-900">{selectedStudent.instructorName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Class Address</label>
                    <p className="text-slate-900">{selectedStudent.classAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Full Name</label>
                    <p className="text-slate-900 uppercase">{selectedStudent.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date of Birth</label>
                    <p className="text-slate-900">{selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Age</label>
                    <p className="text-slate-900">{selectedStudent.age || 'N/A'} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Gender</label>
                    <p className="text-slate-900 capitalize">{selectedStudent.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Blood Group</label>
                    <p className="text-slate-900">{selectedStudent.bloodGroup || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Joining Date</label>
                    <p className="text-slate-900">{selectedStudent.joiningDate ? new Date(selectedStudent.joiningDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Admission Number</label>
                    <p className="text-slate-900">{selectedStudent.admissionNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">School/College Name</label>
                    <p className="text-slate-900">{selectedStudent.schoolCollegeName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Organization Name</label>
                    <p className="text-slate-900">{selectedStudent.organizationName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Qualification</label>
                    <p className="text-slate-900">{selectedStudent.qualification || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <p className="text-slate-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone</label>
                    <p className="text-slate-900">{selectedStudent.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-600">Address</label>
                    <p className="text-slate-900">{selectedStudent.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Family Information */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Family Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Father Name</label>
                    <p className="text-slate-900">{selectedStudent.fatherName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Mother Name</label>
                    <p className="text-slate-900">{selectedStudent.motherName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Father Phone</label>
                    <p className="text-slate-900">{selectedStudent.fatherPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Mother Phone</label>
                    <p className="text-slate-900">{selectedStudent.motherPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Father Occupation</label>
                    <p className="text-slate-900">{selectedStudent.fatherOccupation || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Mother Occupation</label>
                    <p className="text-slate-900">{selectedStudent.motherOccupation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Training Information */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Training Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Current Belt Level</label>
                    <p className="text-slate-900">{selectedStudent.currentBeltLevel || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">ID Number</label>
                    <p className="text-slate-900">{selectedStudent.idNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              {selectedStudent.achievements && selectedStudent.achievements.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Achievements</h3>
                    <div className="flex gap-4">
                      <span className="text-sm font-medium text-slate-600">
                        No. of Events: <span className="text-blue-600 font-bold">
                          {selectedStudent.achievements.reduce((total, ach) => {
                            return total + (ach.typePrices?.filter(tp => tp.type).length || 0);
                          }, 0)}
                        </span>
                      </span>
                      <span className="text-sm font-medium text-slate-600">
                        No. of Medals: <span className="text-blue-600 font-bold">
                          {selectedStudent.achievements.reduce((total, ach) => {
                            return total + (ach.typePrices?.filter(tp => tp.price).length || 0);
                          }, 0)}
                        </span>
                      </span>
                    </div>
                  </div>
                  {selectedStudent.achievements.map((achievement, index) => (
                    <div key={index} className="mb-4 p-4 bg-white rounded-lg border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Tournament</label>
                          <p className="text-sm text-slate-900">{achievement.tournamentName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Address</label>
                          <p className="text-sm text-slate-900">{achievement.address || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Date</label>
                          <p className="text-sm text-slate-900">{achievement.date ? new Date(achievement.date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      
                      {/* Events & Medals */}
                      {achievement.typePrices && achievement.typePrices.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <label className="text-xs font-semibold text-slate-700 mb-2 block">Events & Medals</label>
                          {achievement.typePrices.map((tp, tpIndex) => (
                            <div key={tpIndex} className="mb-2 p-2 bg-slate-50 rounded border border-slate-200">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <div>
                                  <label className="text-xs font-medium text-slate-600">Event</label>
                                  <p className="text-sm text-slate-900">{tp.type || 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-slate-600">Medal</label>
                                  <p className="text-sm text-slate-900">{tp.price || 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-slate-600">Certificate Code</label>
                                  <p className="text-sm text-slate-900">{tp.certificateCode || 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-slate-600 mb-1 block">Certificate</label>
                                  {tp.certificateFile ? (
                                    <button
                                      onClick={() => {
                                        const filename = tp.certificateFile.split('/').pop();
                                        const link = document.createElement('a');
                                        link.href = `${BASE_URL}/api/students/certificate/download/${filename}`;
                                        link.download = filename;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }}
                                      className="inline-flex items-center gap-1 text-xs text-white px-3 py-1.5 rounded hover:opacity-90 w-full justify-center"
                                      style={{ backgroundColor: '#006CB5' }}
                                    >
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                      Download
                                    </button>
                                  ) : (
                                    <p className="text-xs text-slate-500">No certificate</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Exam Dates */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Exam Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedStudent.examYellowStripe && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Yellow Stripe</label>
                      <p className="text-slate-900">{new Date(selectedStudent.examYellowStripe).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedStudent.examYellowBelt && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Yellow Belt</label>
                      <p className="text-slate-900">{new Date(selectedStudent.examYellowBelt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedStudent.examGreenStripe && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Green Stripe</label>
                      <p className="text-slate-900">{new Date(selectedStudent.examGreenStripe).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedStudent.examGreenBelt && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Green Belt</label>
                      <p className="text-slate-900">{new Date(selectedStudent.examGreenBelt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedStudent.examBlueStripe && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Blue Stripe</label>
                      <p className="text-slate-900">{new Date(selectedStudent.examBlueStripe).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedStudent.examBlueBelt && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Blue Belt</label>
                      <p className="text-slate-900">{new Date(selectedStudent.examBlueBelt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedStudent.examRedStripe && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Red Stripe</label>
                      <p className="text-slate-900">{new Date(selectedStudent.examRedStripe).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedStudent.examRedBelt && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Red Belt</label>
                      <p className="text-slate-900">{new Date(selectedStudent.examRedBelt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedStudent.examBlackStripe && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Black Stripe</label>
                      <p className="text-slate-900">{new Date(selectedStudent.examBlackStripe).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedStudent.examBlackBelt && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Black Belt</label>
                      <p className="text-slate-900">{new Date(selectedStudent.examBlackBelt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-6">
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStudent(selectedStudent);
                  setShowEditModal(true);
                }}
                className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#006CB5' }}
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black">
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
