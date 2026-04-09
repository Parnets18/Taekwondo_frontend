import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaArrowUp, FaArrowDown } from 'react-icons/fa';

function MentorManagement() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rank: '',
    position: '',
    description: '',
    order: 0
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:9000';

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/mentors/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setMentors(data.data.mentors || []);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.rank.trim() || !formData.position.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('rank', formData.rank);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('order', formData.order);

      const url = selectedMentor
        ? `${API_BASE_URL}/mentors/${selectedMentor._id}`
        : `${API_BASE_URL}/mentors`;
      
      const method = selectedMentor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(selectedMentor ? 'Mentor updated successfully!' : 'Mentor created successfully!');
        setShowModal(false);
        resetForm();
        fetchMentors();
      } else {
        alert(data.message || 'Error saving mentor');
      }
    } catch (error) {
      console.error('Error saving mentor:', error);
      alert('Error saving mentor');
    }
  };

  const handleDelete = async (mentorId) => {
    if (!window.confirm('Are you sure you want to delete this mentor?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/mentors/${mentorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('Mentor deleted successfully!');
        fetchMentors();
      } else {
        alert(data.message || 'Error deleting mentor');
      }
    } catch (error) {
      console.error('Error deleting mentor:', error);
      alert('Error deleting mentor');
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (mentor) => {
    setSelectedMentor(mentor);
    if (mentor.photo) {
      setPhotoPreview(`${BASE_URL}/${mentor.photo}`);
    }
    setFormData({
      name: mentor.name,
      rank: mentor.rank,
      position: mentor.position,
      description: mentor.description || '',
      order: mentor.order || 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedMentor(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData({
      name: '',
      rank: '',
      position: '',
      description: '',
      order: 0
    });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor Management</h1>
          <p className="text-gray-600">Manage the Our Esteemed Mentors section on About page</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium flex items-center gap-2"
          style={{ backgroundColor: '#006CB5' }}
        >
          <FaPlus /> Add Mentor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600">Total Mentors</p>
          <p className="text-2xl font-bold text-gray-900">{mentors.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-sm font-medium text-gray-600">Active Mentors</p>
          <p className="text-2xl font-bold text-gray-900">{mentors.filter(m => m.isActive).length}</p>
        </div>
      </div>

      {/* Mentors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {mentors.length === 0 ? (
          <div className="text-center py-20 bg-white">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Mentors Yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first mentor</p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: '#006CB5' }}
            >
              Add First Mentor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mentors.map((mentor) => (
                  <tr key={mentor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
                        {mentor.photo ? (
                          <img
                            src={`${BASE_URL}/${mentor.photo}`}
                            alt={mentor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl text-gray-400">👤</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{mentor.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-red-600">{mentor.rank}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{mentor.position}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{mentor.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMentor(mentor);
                            if (mentor.photo) {
                              setPhotoPreview(`${BASE_URL}/${mentor.photo}`);
                            }
                            setShowViewModal(true);
                          }}
                          className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          title="View"
                        >
                          <FaEye className="w-4 h-4" style={{ color: '#006CB5' }} />
                        </button>
                        <button
                          onClick={() => openEditModal(mentor)}
                          className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" style={{ color: '#006CB5' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(mentor._id)}
                          className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedMentor ? 'Edit Mentor' : 'Add New Mentor'}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rank *</label>
                <input
                  type="text"
                  value={formData.rank}
                  onChange={(e) => setFormData({...formData, rank: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5th DAN Black Belt"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Position *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Technical Director ATAK"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., A passionate trainer and an amazing personality"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo (Optional)</label>
                <div className="flex flex-col items-center gap-4 p-6 rounded-lg border-2 border-dashed border-gray-300">
                  {photoPreview && (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
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
                    <p className="text-xs text-gray-500 mt-2 text-center">JPG, PNG. Max 5MB</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90"
                  style={{ backgroundColor: '#006CB5' }}
                >
                  {selectedMentor ? 'Update Mentor' : 'Create Mentor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedMentor && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">View Mentor</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMentor(null);
                  setPhotoPreview(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {photoPreview && (
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-600">
                    <img
                      src={photoPreview}
                      alt={selectedMentor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Name</p>
                  <p className="text-base text-gray-900">{selectedMentor.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Rank</p>
                  <p className="text-base text-red-600 font-bold">{selectedMentor.rank}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Position</p>
                  <p className="text-base text-gray-900">{selectedMentor.position}</p>
                </div>
                {selectedMentor.description && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Description</p>
                    <p className="text-base text-yellow-600">{selectedMentor.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-600">Status</p>
                  <span className={`inline-flex px-3 py-1 text-xs rounded-full ${
                    selectedMentor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedMentor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedMentor(null);
                    setPhotoPreview(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
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

export default MentorManagement;
