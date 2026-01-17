import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';

// Certificate Management Component - Updated 2026-01-13
function CertificationManagement() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    uploaded: 0,
    pending: 0,
    beltPromotions: 0
  });

  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [certificateImage, setCertificateImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form data for creating/editing certificates
  const [formData, setFormData] = useState({
    studentName: '',
    instructorName: '',
    achievementType: '',
    achievementTitle: '',
    achievementDescription: '',
    level: '',
    grade: '',
    examiner: '',
    customVerificationCode: ''
  });

  // Autocomplete states
  const [students, setStudents] = useState([]);
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);

  useEffect(() => {
    fetchCertificates();
    fetchStatistics();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setStudents(response.data.data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        setCertificates([]);
        return;
      }

      const response = await axios.get('/api/certificates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setCertificates(response.data.data.certificates || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Authentication required. Please log in as an admin or instructor.');
      }
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await axios.get('/api/certificates/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        const stats = response.data.data;
        setStatistics({
          total: stats.totalCertificates || 0,
          uploaded: stats.activeCertificates || 0,
          pending: stats.totalCertificates - stats.activeCertificates || 0,
          beltPromotions: stats.byType?.belt_promotion || 0
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Statistics require authentication. Using default values.');
      }
      // Set default statistics if authentication fails
      setStatistics({
        total: 0,
        uploaded: 0,
        pending: 0,
        beltPromotions: 0
      });
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesType = filterType === 'all' || cert.achievementType === filterType;
    const matchesSearch = searchTerm === '' || 
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.verificationCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleExportCSV = async () => {
    try {
      // Simple CSV export as fallback if PDF doesn't work
      const csvContent = [
        ['Student Name', 'Achievement', 'Type', 'Level', 'Code', 'Date', 'Examiner'],
        ...filteredCertificates.map(cert => [
          cert.studentName,
          cert.achievementDetails.title,
          getTypeDisplay(cert.achievementType),
          cert.achievementDetails.level || '-',
          cert.verificationCode,
          new Date(cert.issuedDate).toLocaleDateString(),
          cert.achievementDetails.examiner || '-'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificates_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating export:', error);
      alert('Failed to generate export. Please try again.');
    }
  };

  const getTypeDisplay = (type) => {
    const displays = {
      'belt_promotion': 'Belt Promotion',
      'tournament_award': 'Tournament Award',
      'course_completion': 'Course Completion',
      'special_achievement': 'Special Achievement',
      'participation': 'Participation'
    };
    return displays[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'revoked': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const previewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowPreviewModal(true);
  };

  const editCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setFormData({
      studentName: certificate.studentName,
      instructorName: certificate.metadata?.instructorName || '',
      achievementType: certificate.achievementType,
      achievementTitle: certificate.achievementDetails.title,
      achievementDescription: certificate.achievementDetails.description || '',
      level: certificate.achievementDetails.level || '',
      grade: certificate.achievementDetails.grade || '',
      examiner: certificate.achievementDetails.examiner || '',
      customVerificationCode: certificate.verificationCode
    });
    setShowEditModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setCertificateImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCertificateImage(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      instructorName: '',
      achievementType: '',
      achievementTitle: '',
      achievementDescription: '',
      level: '',
      grade: '',
      examiner: '',
      customVerificationCode: ''
    });
    setCertificateImage(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle student name autocomplete
    if (name === 'studentName') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (value.trim() === '') {
        setStudentSuggestions([]);
        setShowStudentSuggestions(false);
      } else {
        // Filter students by name
        const filtered = students.filter(s => 
          s.fullName.toLowerCase().includes(value.toLowerCase())
        );
        setStudentSuggestions(filtered);
        setShowStudentSuggestions(true);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const selectStudent = (student) => {
    setFormData(prev => ({
      ...prev,
      studentName: student.fullName
    }));
    setShowStudentSuggestions(false);
  };

  // Click outside handler to close autocomplete
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

  const handleCreateCertificate = async (e) => {
    e.preventDefault();
    
    if (!formData.studentName || !formData.instructorName || !formData.achievementType || !formData.achievementTitle || !formData.customVerificationCode || !certificateImage) {
      alert('Please fill in all required fields and upload a certificate image');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('studentName', formData.studentName);
      submitData.append('instructorName', formData.instructorName);
      submitData.append('achievementType', formData.achievementType);
      submitData.append('achievementTitle', formData.achievementTitle);
      submitData.append('achievementDescription', formData.achievementDescription);
      submitData.append('level', formData.level);
      submitData.append('grade', formData.grade);
      submitData.append('examiner', formData.examiner || formData.instructorName);
      submitData.append('customVerificationCode', formData.customVerificationCode);
      submitData.append('certificateImage', certificateImage);

      const response = await axios.post('/api/certificates', submitData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.status === 'success') {
        alert('Certificate uploaded successfully!');
        setShowCreateModal(false);
        fetchCertificates();
        fetchStatistics();
        resetForm();
      }
    } catch (error) {
      console.error('Error uploading certificate:', error);
      alert(error.response?.data?.message || 'Failed to upload certificate. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdateCertificate = async (e) => {
    e.preventDefault();
    
    if (!formData.studentName || !formData.achievementType || !formData.achievementTitle) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('studentName', formData.studentName);
      submitData.append('achievementType', formData.achievementType);
      submitData.append('achievementTitle', formData.achievementTitle);
      submitData.append('achievementDescription', formData.achievementDescription);
      submitData.append('level', formData.level);
      submitData.append('grade', formData.grade);
      submitData.append('examiner', formData.examiner);
      
      if (certificateImage) {
        submitData.append('certificateImage', certificateImage);
      }

      const response = await axios.put(`/api/certificates/${selectedCertificate._id}`, submitData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.status === 'success') {
        alert('Certificate updated successfully!');
        setShowEditModal(false);
        fetchCertificates();
        fetchStatistics();
        resetForm();
        setSelectedCertificate(null);
      }
    } catch (error) {
      console.error('Error updating certificate:', error);
      alert(error.response?.data?.message || 'Failed to update certificate. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await axios.delete(`/api/certificates/${certificateId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert('Certificate deleted successfully');
        fetchCertificates();
        fetchStatistics();
      } catch (error) {
        console.error('Error deleting certificate:', error);
        alert('Failed to delete certificate');
      }
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      // Try without authentication first (public route)
      window.open(`/api/certificates/${certificateId}/download`, '_blank');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Certification Management</h1>
          <p className="text-slate-600">Issue and manage digital certificates for students</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
          >
            Add Certificate
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
          <div className="text-3xl font-black text-blue-600 mb-2">{statistics.total}</div>
          <div className="text-slate-600 font-medium">Total Certificates</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
          <div className="text-3xl font-black text-green-600 mb-2">{statistics.uploaded}</div>
          <div className="text-slate-600 font-medium">Active</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
          <div className="text-3xl font-black text-yellow-600 mb-2">{statistics.pending}</div>
          <div className="text-slate-600 font-medium">Pending</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
          <div className="text-3xl font-black text-purple-600 mb-2">{statistics.beltPromotions}</div>
          <div className="text-slate-600 font-medium">Belt Promotions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or certificate code..."
                className="w-full px-4 py-3 pr-10 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="belt_promotion">Belt Promotion</option>
              <option value="tournament_award">Tournament Award</option>
              <option value="course_completion">Course Completion</option>
              <option value="special_achievement">Special Achievement</option>
              <option value="participation">Participation</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-2">
            <button 
              onClick={handleExportCSV}
              className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Results Counter */}
      {searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 font-medium">
            Found {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Student</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Achievement</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Type</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Level</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Code</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading certificates...</p>
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="text-6xl text-slate-400 mb-4">📄</div>
                    <h3 className="text-xl font-bold text-slate-600 mb-2">No Certificates Found</h3>
                    <p className="text-slate-500">Create your first certificate to get started</p>
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((certificate) => (
                  <tr key={certificate._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{certificate.studentName}</div>
                      <div className="text-sm text-slate-500">{certificate.achievementDetails.examiner}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{certificate.achievementDetails.title}</div>
                      {certificate.achievementDetails.description && (
                        <div className="text-sm text-slate-500 truncate max-w-xs">{certificate.achievementDetails.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getTypeDisplay(certificate.achievementType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800">{certificate.achievementDetails.level || '-'}</div>
                      {certificate.achievementDetails.grade && (
                        <div className="text-xs text-slate-500">{certificate.achievementDetails.grade}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{certificate.verificationCode}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(certificate.issuedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => previewCertificate(certificate)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                          title="View"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => editCertificate(certificate)}
                          className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        {certificate.imageUrl && (
                          <button 
                            onClick={() => handleDownloadCertificate(certificate._id)}
                            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                            title="Download"
                          >
                            <FaDownload className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteCertificate(certificate._id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
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

      {/* Create Certificate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Add Certificate</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateCertificate} className="space-y-6">
              {/* Certificate Image Upload - Required */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Certificate Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6">
                  {!imagePreview ? (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4">
                        <label htmlFor="certificate-image" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-bold text-slate-800">
                            Upload certificate image
                          </span>
                          <span className="mt-1 block text-sm text-slate-500">
                            PNG, JPG, GIF up to 5MB
                          </span>
                        </label>
                        <input
                          id="certificate-image"
                          name="certificate-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Certificate preview"
                        className="mx-auto max-h-48 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="mt-2 text-center">
                        <p className="text-sm text-slate-600">{certificateImage?.name}</p>
                        <p className="text-xs text-slate-500">
                          {(certificateImage?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative autocomplete-container">
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      onFocus={() => {
                        if (formData.studentName && studentSuggestions.length > 0) {
                          setShowStudentSuggestions(true);
                        }
                      }}
                      placeholder="Type student name..."
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                      autoComplete="off"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {showStudentSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {studentSuggestions.length > 0 ? (
                          studentSuggestions.map((student) => (
                            <div
                              key={student._id}
                              onClick={() => selectStudent(student)}
                              className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{student.fullName}</p>
                                </div>
                                <div className="text-xs text-green-600 font-semibold">Select</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-red-600">
                            <p className="font-medium">Student not found</p>
                            <p className="text-xs text-gray-500 mt-1">No student matches "{formData.studentName}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.studentName && !students.find(s => s.fullName === formData.studentName) && !showStudentSuggestions && (
                    <p className="text-xs text-red-600 mt-1">⚠️ This student is not in Student Management</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Certificate Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customVerificationCode"
                    value={formData.customVerificationCode}
                    onChange={handleInputChange}
                    placeholder="Enter certificate verification code"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    maxLength="32"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Instructor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instructorName"
                    value={formData.instructorName}
                    onChange={handleInputChange}
                    placeholder="Enter instructor name"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Achievement Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="achievementType"
                    value={formData.achievementType}
                    onChange={handleInputChange}
                    placeholder="e.g., Belt Promotion, Tournament Award"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Achievement Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="achievementTitle"
                    value={formData.achievementTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Yellow Belt Promotion"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Level/Belt</label>
                  <input
                    type="text"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    placeholder="e.g., Yellow Belt, 1st Dan"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Achievement Description</label>
                <textarea
                  name="achievementDescription"
                  value={formData.achievementDescription}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of the achievement"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div>
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || !certificateImage}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Certificate Modal */}
      {showEditModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Edit Certificate</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCertificate(null);
                  resetForm();
                }}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateCertificate} className="space-y-6">
              {/* Certificate Image Upload - Optional for edit */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Certificate Image (Optional - leave empty to keep current image)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6">
                  {!imagePreview ? (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4">
                        <label htmlFor="edit-certificate-image" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-bold text-slate-800">
                            Upload new certificate image
                          </span>
                          <span className="mt-1 block text-sm text-slate-500">
                            PNG, JPG, GIF up to 5MB
                          </span>
                        </label>
                        <input
                          id="edit-certificate-image"
                          name="edit-certificate-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Certificate preview"
                        className="mx-auto max-h-48 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="mt-2 text-center">
                        <p className="text-sm text-slate-600">{certificateImage?.name}</p>
                        <p className="text-xs text-slate-500">
                          {(certificateImage?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative autocomplete-container">
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      onFocus={() => {
                        if (formData.studentName && studentSuggestions.length > 0) {
                          setShowStudentSuggestions(true);
                        }
                      }}
                      placeholder="Type student name..."
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                      autoComplete="off"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {showStudentSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {studentSuggestions.length > 0 ? (
                          studentSuggestions.map((student) => (
                            <div
                              key={student._id}
                              onClick={() => selectStudent(student)}
                              className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{student.fullName}</p>
                                </div>
                                <div className="text-xs text-green-600 font-semibold">Select</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-red-600">
                            <p className="font-medium">Student not found</p>
                            <p className="text-xs text-gray-500 mt-1">No student matches "{formData.studentName}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.studentName && !students.find(s => s.fullName === formData.studentName) && !showStudentSuggestions && (
                    <p className="text-xs text-red-600 mt-1">⚠️ This student is not in Student Management</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Certificate Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customVerificationCode"
                    value={formData.customVerificationCode}
                    onChange={handleInputChange}
                    placeholder="Enter certificate verification code"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    maxLength="32"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Instructor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instructorName"
                    value={formData.instructorName}
                    onChange={handleInputChange}
                    placeholder="Enter instructor name"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Achievement Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="achievementType"
                    value={formData.achievementType}
                    onChange={handleInputChange}
                    placeholder="e.g., Belt Promotion, Tournament Award"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Achievement Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="achievementTitle"
                    value={formData.achievementTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Yellow Belt Promotion"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Level/Belt</label>
                  <input
                    type="text"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    placeholder="e.g., Yellow Belt, 1st Dan"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Achievement Description</label>
                <textarea
                  name="achievementDescription"
                  value={formData.achievementDescription}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of the achievement"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div>
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Updating...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCertificate(null);
                    resetForm();
                  }}
                  className="flex-1 bg-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {showPreviewModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Certificate View</h2>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {/* Certificate Image Display */}
            {selectedCertificate.imageUrl ? (
              <div className="mb-8">
                <div className="bg-slate-50 rounded-2xl p-6 text-center">
                  <img 
                    src={selectedCertificate.imageUrl} 
                    alt="Certificate" 
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg border"
                  />
                  <p className="text-slate-600 mt-4 text-sm">Certificate Image - {selectedCertificate.verificationCode}</p>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <div className="bg-slate-100 rounded-2xl p-12 text-center">
                  <div className="text-6xl text-slate-400 mb-4">📄</div>
                  <h3 className="text-xl font-bold text-slate-600 mb-2">No Certificate Image</h3>
                  <p className="text-slate-500">Certificate image has not been uploaded yet</p>
                </div>
              </div>
            )}

            {/* Certificate Details */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Certificate Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-600 text-sm">Verification Code:</span>
                  <p className="font-semibold text-slate-800 font-mono">{selectedCertificate.verificationCode}</p>
                </div>
                <div>
                  <span className="text-slate-600 text-sm">Student:</span>
                  <p className="font-semibold text-slate-800">{selectedCertificate.studentName}</p>
                </div>
                <div>
                  <span className="text-slate-600 text-sm">Type:</span>
                  <p className="font-semibold text-slate-800">{getTypeDisplay(selectedCertificate.achievementType)}</p>
                </div>
                <div>
                  <span className="text-slate-600 text-sm">Achievement:</span>
                  <p className="font-semibold text-slate-800">{selectedCertificate.achievementDetails.title}</p>
                </div>
                {selectedCertificate.achievementDetails.description && (
                  <div className="md:col-span-2">
                    <span className="text-slate-600 text-sm">Description:</span>
                    <p className="font-semibold text-slate-800">{selectedCertificate.achievementDetails.description}</p>
                  </div>
                )}
                {selectedCertificate.achievementDetails.level && (
                  <div>
                    <span className="text-slate-600 text-sm">Level/Belt:</span>
                    <p className="font-semibold text-slate-800">{selectedCertificate.achievementDetails.level}</p>
                  </div>
                )}
                {selectedCertificate.achievementDetails.grade && (
                  <div>
                    <span className="text-slate-600 text-sm">Grade:</span>
                    <p className="font-semibold text-slate-800">{selectedCertificate.achievementDetails.grade}</p>
                  </div>
                )}
                {selectedCertificate.achievementDetails.examiner && (
                  <div>
                    <span className="text-slate-600 text-sm">Examiner:</span>
                    <p className="font-semibold text-slate-800">{selectedCertificate.achievementDetails.examiner}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-600 text-sm">Issue Date:</span>
                  <p className="font-semibold text-slate-800">
                    {new Date(selectedCertificate.issuedDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 text-sm">Status:</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedCertificate.status)}`}>
                    {selectedCertificate.status.charAt(0).toUpperCase() + selectedCertificate.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              {selectedCertificate.imageUrl && (
                <>
                  <button 
                    onClick={() => window.open(selectedCertificate.imageUrl, '_blank')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                  >
                    View Full Size
                  </button>
                  <button 
                    onClick={() => handleDownloadCertificate(selectedCertificate._id)}
                    className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                  >
                    Download Certificate
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificationManagement;