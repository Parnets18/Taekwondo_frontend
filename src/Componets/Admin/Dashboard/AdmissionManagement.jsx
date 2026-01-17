import { useState, useEffect } from 'react';

function AdmissionManagement() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    courseLevel: '',
    search: ''
  });
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    thisMonthApplications: 0
  });

  // Load admissions from backend API
  useEffect(() => {
    const loadAdmissions = async () => {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/admin/admissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch admissions');
        }
        
        const data = await response.json();
        const fetchedAdmissions = data.data.admissions || [];
        setAdmissions(fetchedAdmissions);
        
        // Calculate stats
        const totalApplications = fetchedAdmissions.length;
        const pendingApplications = fetchedAdmissions.filter(admission => admission.status === 'pending').length;
        const approvedApplications = fetchedAdmissions.filter(admission => admission.status === 'approved').length;
        
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const thisMonthApplications = fetchedAdmissions.filter(admission => {
          const submittedDate = new Date(admission.submittedAt);
          return submittedDate >= thisMonth;
        }).length;
        
        setStats({ totalApplications, pendingApplications, approvedApplications, thisMonthApplications });
        setLoading(false);
      } catch (error) {
        console.error('Error loading admissions:', error);
        setAdmissions([]);
        setStats({ totalApplications: 0, pendingApplications: 0, approvedApplications: 0, thisMonthApplications: 0 });
        setLoading(false);
      }
    };

    loadAdmissions();
  }, []);

  // Filter admissions based on current filters
  const filteredAdmissions = admissions.filter(admission => {
    const matchesStatus = !filters.status || admission.status === filters.status;
    const matchesCourseLevel = !filters.courseLevel || admission.courseLevel === filters.courseLevel;
    const matchesSearch = !filters.search || 
      admission.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
      admission.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      admission.phone.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesCourseLevel && matchesSearch;
  });

  const handleStatusUpdate = async (admissionId, newStatus, adminNotes = '') => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/admissions/${admissionId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update admission status');
      }

      const data = await response.json();
      
      // Update local state with the updated admission
      const updatedAdmissions = admissions.map(admission => {
        if (admission._id === admissionId) {
          return data.data.admission;
        }
        return admission;
      });
      
      setAdmissions(updatedAdmissions);
      
      // Update stats
      const totalApplications = updatedAdmissions.length;
      const pendingApplications = updatedAdmissions.filter(admission => admission.status === 'pending').length;
      const approvedApplications = updatedAdmissions.filter(admission => admission.status === 'approved').length;
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const thisMonthApplications = updatedAdmissions.filter(admission => {
        const submittedDate = new Date(admission.submittedAt);
        return submittedDate >= thisMonth;
      }).length;
      
      setStats({ totalApplications, pendingApplications, approvedApplications, thisMonthApplications });
      setShowModal(false);
      setSelectedAdmission(null);
    } catch (error) {
      console.error('Error updating admission status:', error);
      alert('Error updating admission status. Please try again.');
    }
  };

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CW${year}${randomNum}`;
  };

  const viewAdmissionDetails = (admissionId) => {
    const admission = admissions.find(admission => admission._id === admissionId);
    if (admission) {
      setSelectedAdmission(admission);
      setShowModal(true);
    }
  };

  const handleDeleteAdmission = async (admissionId) => {
    if (window.confirm('Are you sure you want to permanently delete this admission application? This action cannot be undone and will remove the application from the database forever.')) {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:5000/api/admin/admissions/${admissionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Remove from local state
          const updatedAdmissions = admissions.filter(admission => admission._id !== admissionId);
          setAdmissions(updatedAdmissions);
          
          // Update stats
          const totalApplications = updatedAdmissions.length;
          const pendingApplications = updatedAdmissions.filter(admission => admission.status === 'pending').length;
          const approvedApplications = updatedAdmissions.filter(admission => admission.status === 'approved').length;
          
          const thisMonth = new Date();
          thisMonth.setDate(1);
          thisMonth.setHours(0, 0, 0, 0);
          
          const thisMonthApplications = updatedAdmissions.filter(admission => {
            const submittedDate = new Date(admission.submittedAt);
            return submittedDate >= thisMonth;
          }).length;
          
          setStats({
            totalApplications,
            pendingApplications,
            approvedApplications,
            thisMonthApplications
          });
          
          alert('Admission application permanently deleted from database!');
        } else {
          throw new Error('Failed to delete admission');
        }
      } catch (err) {
        console.error('Error deleting admission:', err);
        alert('Error deleting admission. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'waitlist': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-amber-100 text-amber-800',
      'advanced': 'bg-purple-100 text-purple-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 mb-2">Admission Management</h1>
          <p className="text-slate-600">Review and manage student admission applications</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonthApplications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="waitlist">Waitlist</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Course Level</label>
              <select
                value={filters.courseLevel}
                onChange={(e) => setFilters({ ...filters, courseLevel: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name, email, or phone..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Admissions Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading admissions...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Applicant</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Age</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Course Level</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Applied Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAdmissions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          No admission applications found
                        </td>
                      </tr>
                    ) : (
                      filteredAdmissions.map((admission) => (
                        <tr key={admission._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-slate-800">{admission.fullName}</div>
                              <div className="text-sm text-slate-600">{admission.email}</div>
                              <div className="text-sm text-slate-600">{admission.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-800 font-medium">
                              {calculateAge(admission.dateOfBirth)} years
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(admission.courseLevel)}`}>
                              {admission.courseLevel.charAt(0).toUpperCase() + admission.courseLevel.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(admission.status)}`}>
                              {admission.status.charAt(0).toUpperCase() + admission.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {new Date(admission.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => viewAdmissionDetails(admission._id)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                View
                              </button>
                              {admission.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(admission._id, 'approved')}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(admission._id, 'rejected')}
                                    className="px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteAdmission(admission._id)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Admission Details Modal */}
        {showModal && selectedAdmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Admission Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-gray-300 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Personal Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">1</span>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <p className="text-slate-800 font-semibold">{selectedAdmission.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                      <p className="text-slate-800">{new Date(selectedAdmission.dateOfBirth).toLocaleDateString()} ({calculateAge(selectedAdmission.dateOfBirth)} years old)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                      <p className="text-slate-800 capitalize">{selectedAdmission.gender}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <p className="text-slate-800">{selectedAdmission.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                      <p className="text-slate-800">{selectedAdmission.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                      <p className="text-slate-800">{selectedAdmission.nationality || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">2</span>
                    Address Information
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                        <p className="text-slate-800">{selectedAdmission.address}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                        <p className="text-slate-800">{selectedAdmission.city || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                        <p className="text-slate-800">{selectedAdmission.state || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">PIN Code</label>
                        <p className="text-slate-800">{selectedAdmission.pincode || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Training Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">3</span>
                    Training Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Training Level</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedAdmission.courseLevel)}`}>
                        {selectedAdmission.courseLevel.charAt(0).toUpperCase() + selectedAdmission.courseLevel.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Schedule</label>
                      <p className="text-slate-800 capitalize">{selectedAdmission.preferredSchedule || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Training Goals</label>
                      <p className="text-slate-800 capitalize">{selectedAdmission.trainingGoals || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Previous Martial Arts Experience</label>
                      <p className="text-slate-800 capitalize">{selectedAdmission.previousMartialArts || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Current Fitness Level</label>
                      <p className="text-slate-800 capitalize">{selectedAdmission.fitnessLevel || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact & Guardian Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">4</span>
                    Emergency Contact & Guardian Information
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Name</label>
                        <p className="text-slate-800 font-semibold">{selectedAdmission.emergencyContactName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Phone</label>
                        <p className="text-slate-800">{selectedAdmission.emergencyContactPhone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Relationship to Student</label>
                        <p className="text-slate-800 capitalize">{selectedAdmission.relationshipToStudent}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Address</label>
                        <p className="text-slate-800">{selectedAdmission.emergencyContactAddress || 'Same as student address'}</p>
                      </div>
                    </div>
                    
                    {(selectedAdmission.parentGuardianName || selectedAdmission.parentGuardianPhone) && (
                      <div className="border-t border-slate-200 pt-4">
                        <h4 className="text-lg font-semibold text-slate-800 mb-3">Parent/Guardian Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Parent/Guardian Name</label>
                            <p className="text-slate-800">{selectedAdmission.parentGuardianName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Parent/Guardian Phone</label>
                            <p className="text-slate-800">{selectedAdmission.parentGuardianPhone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical & Health Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">5</span>
                    Medical & Health Information
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Medical Conditions</label>
                        <p className="text-slate-800">{selectedAdmission.medicalConditions || 'None reported'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Allergies</label>
                        <p className="text-slate-800">{selectedAdmission.allergies || 'None reported'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Medications</label>
                        <p className="text-slate-800">{selectedAdmission.currentMedications || 'None reported'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Physician Name</label>
                        <p className="text-slate-800">{selectedAdmission.physicianName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Physician Phone</label>
                        <p className="text-slate-800">{selectedAdmission.physicianPhone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">6</span>
                    Additional Information
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">How did you hear about us?</label>
                        <p className="text-slate-800 capitalize">{selectedAdmission.howDidYouHear || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Special Requests/Notes</label>
                        <p className="text-slate-800">{selectedAdmission.specialRequests || 'None'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consent & Agreements */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">7</span>
                    Consent & Agreements
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Terms & Conditions</label>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedAdmission.agreeToTerms ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedAdmission.agreeToTerms ? 'Agreed' : 'Not Agreed'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Photo/Video Consent</label>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedAdmission.agreeToPhotos ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedAdmission.agreeToPhotos ? 'Consented' : 'Not Consented'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Communication Consent</label>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedAdmission.agreeToEmails ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedAdmission.agreeToEmails ? 'Consented' : 'Not Consented'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">8</span>
                    Application Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Current Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAdmission.status)}`}>
                        {selectedAdmission.status.charAt(0).toUpperCase() + selectedAdmission.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Submitted Date</label>
                      <p className="text-slate-800">{new Date(selectedAdmission.submittedAt).toLocaleDateString()}</p>
                    </div>
                    {selectedAdmission.studentId && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                        <p className="text-slate-800 font-semibold">{selectedAdmission.studentId}</p>
                      </div>
                    )}
                    {selectedAdmission.reviewedAt && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reviewed Date</label>
                        <p className="text-slate-800">{new Date(selectedAdmission.reviewedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedAdmission.adminNotes && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">📝</span>
                      Admin Notes
                    </h3>
                    <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                      <p className="text-slate-800">{selectedAdmission.adminNotes}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-200">
                  {selectedAdmission.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          const notes = prompt('Add admin notes (optional):');
                          handleStatusUpdate(selectedAdmission._id, 'approved', notes || '');
                        }}
                        className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Add rejection reason:');
                          if (notes) {
                            handleStatusUpdate(selectedAdmission._id, 'rejected', notes);
                          }
                        }}
                        className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
                      >
                        Reject Application
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Add waitlist notes:');
                          handleStatusUpdate(selectedAdmission._id, 'waitlist', notes || '');
                        }}
                        className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Add to Waitlist
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteAdmission(selectedAdmission._id);
                      setShowModal(false);
                      setSelectedAdmission(null);
                    }}
                    className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Delete Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdmissionManagement;