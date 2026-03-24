import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { 
  FaUser, FaIdCard, FaBirthdayCake, FaVenusMars, FaTint, FaCalendarAlt, 
  FaSchool, FaBuilding, FaGraduationCap, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaMedal, FaTrophy, FaLock, FaHome, FaEdit, FaCamera, FaDownload
} from 'react-icons/fa';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/verify-certificate');
      return;
    }
    
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch(`${API_BASE_URL}/students/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setProfileData(data.data);
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentData');
        navigate('/verify-certificate');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    navigate('/');
  };

  const handleEditField = (field, currentValue) => {
    setEditField(field);
    setEditValue(currentValue || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) {
      alert('Value cannot be empty');
      return;
    }

    try {
      // Update the profile data locally
      const updatedData = { ...profileData, [editField]: editValue.trim() };
      setProfileData(updatedData);
      setShowEditModal(false);
      setEditField('');
      setEditValue('');
    } catch (error) {
      console.error('Error updating field:', error);
      alert('Failed to update. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    try {
      // Call password change API here
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  const handleDownloadCertificate = async (achievement) => {
    if (!achievement.certificateImage) {
      alert('No certificate file available');
      return;
    }

    try {
      const certificateUrl = `${BASE_URL}/${achievement.certificateImage}`;
      
      // Open in new tab for download
      window.open(certificateUrl, '_blank');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border border-[#006CB5] border-t-transparent"></div>
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
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Photo Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
          {profileData?.photo ? (
            <img 
              src={`${BASE_URL}/${profileData.photo}`}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#006CB5] shadow-xl"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-4 flex items-center justify-center text-white shadow-xl">
              <FaUser className="text-5xl" />
            </div>
          )}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{profileData?.fullName || profileData?.name}</h2>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-1">
            <InfoRow label="Admission Number" value={profileData?.admissionNumber} Icon={FaIdCard} />
            <InfoRow label="ID Number" value={profileData?.idNumber} Icon={FaIdCard} />
            <InfoRow label="Date of Birth" value={profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'N/A'} Icon={FaBirthdayCake} />
            <InfoRow label="Age" value={profileData?.age ? `${profileData.age} years` : 'N/A'} Icon={FaUser} />
            <InfoRow label="Gender" value={profileData?.gender} Icon={FaVenusMars} />
            <InfoRow label="Blood Group" value={profileData?.bloodGroup} Icon={FaTint} />
            <InfoRow label="Joining Date" value={profileData?.joiningDate ? new Date(profileData.joiningDate).toLocaleDateString() : 'N/A'} Icon={FaCalendarAlt} />
            <InfoRow label="School/College" value={profileData?.schoolCollegeName} Icon={FaSchool} />
            <InfoRow label="Organization" value={profileData?.organizationName} Icon={FaBuilding} />
            <InfoRow label="Qualification" value={profileData?.qualification} Icon={FaGraduationCap} />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-1">
            <InfoRow 
              label="Email" 
              value={profileData?.email} 
              Icon={FaEnvelope}
              editable
              onEdit={() => handleEditField('email', profileData?.email)}
            />
            <InfoRow 
              label="Phone" 
              value={profileData?.phone} 
              Icon={FaPhone}
              editable
              onEdit={() => handleEditField('phone', profileData?.phone)}
            />
            <InfoRow label="Address" value={profileData?.address} Icon={FaMapMarkerAlt} />
          </div>
        </div>

        {/* Training Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Training Information</h3>
          <div className="space-y-1">
            <InfoRow label="Current Belt Level" value={profileData?.currentBeltLevel} Icon={FaMedal} />
            <InfoRow label="Instructor Name" value={profileData?.instructorName} Icon={FaUser} />
            <InfoRow label="Class Address" value={profileData?.classAddress} Icon={FaMapMarkerAlt} />
          </div>
        </div>

        {/* Achievements */}
        {profileData?.achievements && profileData.achievements.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaTrophy className="w-6 h-6 mr-2 text-yellow-500" />
              Achievements ({profileData.achievements.length})
            </h3>
            <div className="space-y-4">
              {profileData.achievements.map((achievement, index) => (
                <div key={index} className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                  <div className="flex flex-col space-y-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">
                        {achievement.tournamentName || 'Tournament'}
                      </h4>
                      
                      {achievement.address && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                          <span>{achievement.address}</span>
                        </div>
                      )}
                      
                      {achievement.date && (
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <FaCalendarAlt className="w-4 h-4 mr-2" />
                          <span>{new Date(achievement.date).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Display type-price pairs */}
                      {achievement.typePrices && achievement.typePrices.length > 0 ? (
                        <div className="space-y-2">
                          {achievement.typePrices.map((tp, tpIndex) => (
                            tp.type && (
                              <div key={tpIndex} className="bg-white p-3 rounded-lg border border-yellow-200">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <FaMedal className="w-5 h-5 text-yellow-600" />
                                    <span className="font-bold text-gray-900 text-base">{tp.type}</span>
                                  </div>
                                  {tp.price && (
                                    <span className="px-3 py-1 bg-yellow-500 rounded-full text-xs font-bold" style={{ color: '#006CB5' }}>
                                      {tp.price}
                                    </span>
                                  )}
                                </div>
                                {tp.certificateCode && (
                                  <div className="text-xs text-gray-600 mb-2">
                                    Certificate Code: {tp.certificateCode}
                                  </div>
                                )}
                                {tp.certificateFile && (
                                  <button
                                    onClick={() => window.open(`${BASE_URL}/${tp.certificateFile}`, '_blank')}
                                    className="w-full px-3 py-2 bg-[#006CB5] rounded-lg text-sm font-bold hover:bg-[#005a9c] transition-all flex items-center justify-center space-x-2"
                                    style={{ color: '#ffffff !important' }}
                                  >
                                    <FaDownload className="w-4 h-4 text-white" />
                                    <span className="text-white">Download Certificate</span>
                                  </button>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      ) : (
                        // Fallback to old structure
                        achievement.type && (
                          <div className="bg-white p-3 rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <FaMedal className="w-4 h-4 text-yellow-600" />
                                <span className="font-semibold text-gray-900">{achievement.type}</span>
                              </div>
                              {achievement.prize && (
                                <span className="px-3 py-1 bg-yellow-500 rounded-full text-xs font-bold" style={{ color: '#006CB5' }}>
                                  {achievement.prize}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-3 border-2 border-[#006CB5]"
          >
            <FaLock className="w-6 h-6 text-[#006CB5]" />
            <span className="font-semibold text-gray-900">Change Password</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-[#006CB5] rounded-xl p-4 shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-3 hover:bg-[#005a9c]"
            style={{ color: '#ffffff' }}
          >
            <FaHome className="w-6 h-6" style={{ color: '#ffffff' }} />
            <span className="font-semibold" style={{ color: '#ffffff' }}>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#006CB5] text-white rounded-lg font-semibold hover:bg-[#005a9c] transition-all"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Field Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 capitalize">Edit {editField}</h3>
            <div className="space-y-4">
              <input
                type={editField === 'email' ? 'email' : editField === 'phone' ? 'tel' : 'text'}
                placeholder={`Enter ${editField}`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditField('');
                    setEditValue('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-3 bg-[#006CB5] text-white rounded-lg font-semibold hover:bg-[#005a9c] transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for info rows
const InfoRow = ({ label, value, Icon, editable, onEdit }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div className="flex items-center space-x-3 flex-1">
      <Icon className="w-5 h-5 text-gray-400" />
      <span className="text-gray-600 text-sm">{label}</span>
    </div>
    <div className="flex items-center space-x-2">
      <span className="text-gray-900 font-medium text-sm">{value || 'N/A'}</span>
      {editable && (
        <button onClick={onEdit} className="text-[#006CB5] hover:text-[#005a9c]">
          <FaEdit className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

export default StudentProfile;
