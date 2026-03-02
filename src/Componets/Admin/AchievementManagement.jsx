import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaTimes, FaImage, FaMedal, FaAward } from 'react-icons/fa';

function AchievementManagement() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAchievement, setViewingAchievement] = useState(null);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [formData, setFormData] = useState({
    type: 'instructor',
    description: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com';

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/achievements`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setAchievements(data.data.achievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      alert('Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to continue');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);

      const url = editingAchievement
        ? `${API_BASE_URL}/achievements/${editingAchievement._id}`
        : `${API_BASE_URL}/achievements`;

      const method = editingAchievement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(data.message);
        fetchAchievements();
        handleCloseModal();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving achievement:', error);
      alert('Failed to save achievement');
    }
  };

  const handleEdit = (achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      type: achievement.type,
      description: achievement.description
    });
    setShowModal(true);
  };

  const handleView = (achievement) => {
    setViewingAchievement(achievement);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to continue');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/achievements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(data.message);
        fetchAchievements();
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting achievement:', error);
      alert('Failed to delete achievement');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAchievement(null);
    setFormData({
      type: 'instructor',
      description: ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const instructorAchievements = achievements.filter(a => a.type === 'instructor');
  const studentAchievements = achievements.filter(a => a.type === 'student');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4" style={{ borderColor: '#006CB5' }}></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Achievement Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
          style={{ backgroundColor: '#006CB5' }}
        >
          <FaPlus className="text-white" /> Add Achievement
        </button>
      </div>

      {/* Instructor Achievements */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaMedal style={{ color: '#DC2626' }} /> Instructor Achievements ({instructorAchievements.length})
        </h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {instructorAchievements.map((achievement) => (
                  <tr key={achievement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{achievement.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleView(achievement)}
                          className="text-white px-3 py-1.5 rounded hover:opacity-90 transition-colors flex items-center gap-1 text-sm"
                          style={{ backgroundColor: '#006CB5' }}
                        >
                          <FaEye className="text-white" /> View
                        </button>
                        <button
                          onClick={() => handleEdit(achievement)}
                          className="text-white px-3 py-1.5 rounded hover:opacity-90 transition-colors flex items-center gap-1 text-sm"
                          style={{ backgroundColor: '#006CB5' }}
                        >
                          <FaEdit className="text-white" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(achievement._id)}
                          className="text-white px-3 py-1.5 rounded hover:opacity-90 transition-colors flex items-center gap-1 text-sm"
                          style={{ backgroundColor: '#006CB5' }}
                        >
                          <FaTrash className="text-white" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {instructorAchievements.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <p className="text-gray-500 text-lg">No instructor achievements found.</p>
          </div>
        )}
      </div>

      {/* Student Achievements */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaAward style={{ color: '#DC2626' }} /> Student Achievements ({studentAchievements.length})
        </h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentAchievements.map((achievement) => (
                  <tr key={achievement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{achievement.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleView(achievement)}
                          className="text-white px-3 py-1.5 rounded hover:opacity-90 transition-colors flex items-center gap-1 text-sm"
                          style={{ backgroundColor: '#006CB5' }}
                        >
                          <FaEye className="text-white" /> View
                        </button>
                        <button
                          onClick={() => handleEdit(achievement)}
                          className="text-white px-3 py-1.5 rounded hover:opacity-90 transition-colors flex items-center gap-1 text-sm"
                          style={{ backgroundColor: '#006CB5' }}
                        >
                          <FaEdit className="text-white" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(achievement._id)}
                          className="text-white px-3 py-1.5 rounded hover:opacity-90 transition-colors flex items-center gap-1 text-sm"
                          style={{ backgroundColor: '#006CB5' }}
                        >
                          <FaTrash className="text-white" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {studentAchievements.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <p className="text-gray-500 text-lg">No student achievements found.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingAchievement ? 'Edit Achievement' : 'Add Achievement'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                >
                  <option value="instructor">Instructor Achievement</option>
                  <option value="student">Student Achievement</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  placeholder="Enter achievement description"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 text-white py-3 rounded-lg hover:opacity-90 transition-colors font-semibold"
                  style={{ backgroundColor: '#006CB5' }}
                >
                  {editingAchievement ? 'Update Achievement' : 'Add Achievement'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Achievement Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-500 text-sm font-semibold mb-1">Type</label>
                  <p className="text-lg font-semibold capitalize" style={{ color: '#006CB5' }}>
                    {viewingAchievement.type}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-500 text-sm font-semibold mb-1">Description</label>
                  <p className="text-gray-700 leading-relaxed">{viewingAchievement.description}</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full text-white py-3 rounded-lg hover:opacity-90 transition-colors font-semibold"
                  style={{ backgroundColor: '#006CB5' }}
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

export default AchievementManagement;
