import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

function BlackBeltManagement() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    belt: '',
    yearsTraining: '',
    achievements: ['']
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/black-belt`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setMembers(data.data.members || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAchievementChange = (index, value) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData(prev => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }));
  };

  const removeAchievement = (index) => {
    if (formData.achievements.length > 1) {
      const newAchievements = formData.achievements.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        achievements: newAchievements
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.belt || !formData.yearsTraining || formData.achievements.filter(a => a.trim()).length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('belt', formData.belt);
      formDataToSend.append('yearsTraining', formData.yearsTraining);
      formDataToSend.append('achievements', formData.achievements.filter(a => a.trim()).join(', '));
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const url = selectedMember
        ? `${API_BASE_URL}/black-belt/${selectedMember._id}`
        : `${API_BASE_URL}/black-belt`;
      
      const method = selectedMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(selectedMember ? 'Member updated successfully!' : 'Member added successfully!');
        setShowModal(false);
        resetForm();
        fetchMembers();
      } else {
        alert(data.message || 'Error saving member');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Error saving member');
    }
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/black-belt/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('Member deleted successfully!');
        fetchMembers();
      } else {
        alert(data.message || 'Error deleting member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Error deleting member');
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      belt: member.belt,
      yearsTraining: member.yearsTraining,
      achievements: member.achievements ? member.achievements.split(', ') : ['']
    });
    setPhotoPreview(member.photo ? `${BASE_URL}/${member.photo}` : null);
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedMember(null);
    setFormData({
      name: '',
      belt: '',
      yearsTraining: '',
      achievements: ['']
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Black Belt Management</h1>
          <p className="text-gray-600">Manage black belt members</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium flex items-center gap-2"
          style={{ backgroundColor: '#006CB5' }}
        >
          <FaPlus /> Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-black">
          <p className="text-sm font-medium text-gray-600">Total Black Belts</p>
          <p className="text-2xl font-bold text-gray-900">{members.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-sm font-medium text-gray-600">Active Members</p>
          <p className="text-2xl font-bold text-gray-900">{members.filter(m => m.isActive).length}</p>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {members.length === 0 ? (
          <div className="text-center py-20 bg-white">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Black Belt Members Yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first black belt member</p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: '#006CB5' }}
            >
              Add First Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Photo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Belt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Training
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-20 w-20">
                          {member.photo ? (
                            <img
                              src={`${BASE_URL}/${member.photo}`}
                              alt={member.name}
                              className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-black text-white">
                        {member.belt}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.yearsTraining}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setPhotoPreview(member.photo ? `${BASE_URL}/${member.photo}` : null);
                            setShowViewModal(true);
                          }}
                          className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center border border-gray-300"
                          title="View"
                        >
                          <FaEye className="w-4 h-4" style={{ color: '#006CB5' }} />
                        </button>
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center border border-gray-300"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" style={{ color: '#006CB5' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center border border-gray-300"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedMember ? 'Edit Black Belt Member' : 'Add New Black Belt Member'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white">
              {/* Photo Upload */}
              <div className="bg-white">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photo
                </label>
                <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
                  {photoPreview && (
                    <div className="w-full max-w-md">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                      />
                    </div>
                  )}
                  <div className="w-full">
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo"
                      className="cursor-pointer inline-block w-full px-4 py-3 text-white text-center rounded-lg hover:opacity-90 transition-colors font-medium"
                      style={{ backgroundColor: '#006CB5' }}
                    >
                      {photoPreview ? 'Change Photo' : 'Choose Photo'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2 text-center">JPG, PNG, GIF. Max 10MB</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Belt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Belt *
                </label>
                <input
                  type="text"
                  name="belt"
                  value={formData.belt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Black Belt 5th Dan"
                  required
                />
              </div>

              {/* Years Training */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Years of Training *
                </label>
                <input
                  type="text"
                  name="yearsTraining"
                  value={formData.yearsTraining}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 25 years"
                  required
                />
              </div>

              {/* Achievements */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Achievements *
                </label>
                <div className="space-y-3">
                  {formData.achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2">
                      <textarea
                        value={achievement}
                        onChange={(e) => handleAchievementChange(index, e.target.value)}
                        rows="2"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., National Champion 2020"
                        required={index === 0}
                      />
                      {formData.achievements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAchievement(index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Remove"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAchievement}
                    className="px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center gap-2 text-sm"
                  >
                    <FaPlus className="text-xs" /> Add More Achievement
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-colors"
                  style={{ backgroundColor: '#006CB5' }}
                >
                  {selectedMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm max-h-[30vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">View Black Belt Member</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMember(null);
                  setPhotoPreview(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 bg-white">
              {/* Photo Display */}
              {photoPreview && (
                <div className="bg-white flex justify-center">
                  <img
                    src={photoPreview}
                    alt={selectedMember.name}
                    className="max-w-full max-h-48 object-contain rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}

              {/* Member Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Name</p>
                  <p className="text-base text-gray-900">{selectedMember.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Belt</p>
                  <p className="text-base text-gray-900">{selectedMember.belt}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Years of Training</p>
                  <p className="text-base text-gray-900">{selectedMember.yearsTraining}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Status</p>
                  <span className={`inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full ${
                    selectedMember.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedMember.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-gray-600">Achievements</p>
                  <p className="text-base text-gray-900">{selectedMember.achievements}</p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedMember(null);
                    setPhotoPreview(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlackBeltManagement;
