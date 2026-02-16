import { useState, useEffect } from 'react';

function AdmissionManagement() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
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
        
        const response = await fetch('https://taekwon-frontend.onrender.com/api/admin/admissions', {
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
    const matchesSearch = !filters.search || 
      (admission.name && admission.name.toLowerCase().includes(filters.search.toLowerCase())) ||
      (admission.fullName && admission.fullName.toLowerCase().includes(filters.search.toLowerCase())) ||
      (admission.email && admission.email.toLowerCase().includes(filters.search.toLowerCase())) ||
      (admission.phone && admission.phone.toLowerCase().includes(filters.search.toLowerCase())) ||
      (admission.mobileNumber && admission.mobileNumber.toLowerCase().includes(filters.search.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async (admissionId, newStatus, adminNotes = '') => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://taekwon-frontend.onrender.com/api/admin/admissions/${admissionId}/status`, {
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
        
        const response = await fetch(`https://taekwon-frontend.onrender.com/api/admin/admissions/${admissionId}`, {
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
    <div className="min-h-screen bg-white py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading admissions...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b-2 border-slate-300">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">Photo</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">Age</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">Gender</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">Applied Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAdmissions.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          No admission applications found
                        </td>
                      </tr>
                    ) : (
                      filteredAdmissions.map((admission) => (
                        <tr key={admission._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            {admission.photo ? (
                              <img 
                                src={`https://taekwon-frontend.onrender.com/${admission.photo.replace(/\\/g, '/').replace(/^.*uploads/, 'uploads')}`}
                                alt={admission.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                {(admission.name || admission.fullName || 'U').charAt(0)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 uppercase">{admission.name || admission.fullName}</div>
                            {admission.studentId && (
                              <div className="text-xs text-slate-600 font-semibold mt-1">ID: {admission.studentId}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-700">{admission.mobileNumber || admission.phone}</div>
                            <div className="text-xs text-slate-500">{admission.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-800 font-semibold">
                              {admission.age || calculateAge(admission.dateOfBirth)} yrs
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-700">{admission.gender}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            {new Date(admission.submittedAt).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => viewAdmissionDetails(admission._id)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                title="View Details"
                                style={{ color: '#006CB5' }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteAdmission(admission._id)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Delete"
                                style={{ color: '#dc2626' }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
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
                {/* Application Form Data */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">1. Name (in capital letters)</label>
                      <p className="text-slate-900 font-bold text-lg uppercase">{selectedAdmission.name || selectedAdmission.fullName}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">2. Date of Birth (dd/mm/yyyy)</label>
                      <p className="text-slate-900">{new Date(selectedAdmission.dateOfBirth).toLocaleDateString('en-GB')}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Age (yy/mm)</label>
                      <p className="text-slate-900">{selectedAdmission.age || calculateAge(selectedAdmission.dateOfBirth)} years</p>
                    </div>
                    
                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">3. Gender</label>
                      <p className="text-slate-900">{selectedAdmission.gender}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">4. Father's Name</label>
                      <p className="text-slate-900">{selectedAdmission.fatherName || 'Not provided'}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">5. Mother's Name</label>
                      <p className="text-slate-900">{selectedAdmission.motherName || 'Not provided'}</p>
                    </div>
                    
                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">6. Res. Address</label>
                      <p className="text-slate-900">{selectedAdmission.residentialAddress || selectedAdmission.address}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">7. Contact No.(s) - Mob</label>
                      <p className="text-slate-900">{selectedAdmission.mobileNumber || selectedAdmission.phone}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Emergency Contact</label>
                      <p className="text-slate-900">{selectedAdmission.emergencyContact || 'Not provided'}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">8. E-mail ID</label>
                      <p className="text-slate-900">{selectedAdmission.email}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">9. Aadhaar Card No</label>
                      <p className="text-slate-900">{selectedAdmission.aadhaarNumber || 'Not provided'}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">10. Blood Group</label>
                      <p className="text-slate-900">{selectedAdmission.bloodGroup || 'Not provided'}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">11. Height (Cms)</label>
                      <p className="text-slate-900">{selectedAdmission.height ? `${selectedAdmission.height} cm` : 'Not provided'}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Weight (Kgs)</label>
                      <p className="text-slate-900">{selectedAdmission.weight ? `${selectedAdmission.weight} kg` : 'Not provided'}</p>
                    </div>
                    
                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">12. Physical disorder (if any)</label>
                      <p className="text-slate-900">{selectedAdmission.physicalDisorder || 'None'}</p>
                    </div>
                    
                    {selectedAdmission.photo && (
                      <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Photo</label>
                        <img 
                          src={`https://taekwon-frontend.onrender.com/${selectedAdmission.photo.replace(/\\/g, '/').replace(/^.*uploads/, 'uploads')}`}
                          alt="Student" 
                          className="w-32 h-32 object-cover rounded-lg border-2 border-slate-300"
                          onError={(e) => {
                            console.error('Image failed to load:', selectedAdmission.photo);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML += '<p class="text-red-500 text-sm mt-2">Photo not available</p>';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Admin Notes */}
                  {selectedAdmission.adminNotes && (
                    <div className="mt-8 pt-6 border-t-2 border-slate-200">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Admin Notes</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="text-slate-900">{selectedAdmission.adminNotes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end border-t pt-6 mt-6">
                  <button
                    onClick={() => {
                      handleDeleteAdmission(selectedAdmission._id);
                      setShowModal(false);
                      setSelectedAdmission(null);
                    }}
                    className="bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
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