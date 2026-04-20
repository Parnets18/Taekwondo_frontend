import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUser, FaTimes, FaImage, FaEye } from 'react-icons/fa';

function LeadershipManagement() {
  const [leadership, setLeadership] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingLeader, setViewingLeader] = useState(null);
  const [editingLeader, setEditingLeader] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rank: '',
    position: '',
    description: '',
    order: 0
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';

  useEffect(() => {
    fetchLeadership();
  }, []);

  const fetchLeadership = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/leadership`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setLeadership(data.data.leadership);
      }
    } catch (error) {
      console.error('Error fetching leadership:', error);
      alert('Failed to fetch leadership members');
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
      formDataToSend.append('name', formData.name);
      formDataToSend.append('rank', formData.rank);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('order', formData.order);

      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const url = editingLeader
        ? `${API_BASE_URL}/leadership/${editingLeader._id}`
        : `${API_BASE_URL}/leadership`;

      const method = editingLeader ? 'PUT' : 'POST';

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
        fetchLeadership();
        handleCloseModal();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving leadership member:', error);
      alert('Failed to save leadership member');
    }
  };

  const handleEdit = (leader) => {
    setEditingLeader(leader);
    setFormData({
      name: leader.name,
      rank: leader.rank,
      position: leader.position,
      description: leader.description,
      order: leader.order
    });
    if (leader.photo) {
      setPhotoPreview(`${BASE_URL}/${leader.photo}`);
    }
    setShowModal(true);
  };

  const handleView = (leader) => {
    setViewingLeader(leader);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leadership member?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to continue');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/leadership/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(data.message);
        fetchLeadership();
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting leadership member:', error);
      alert('Failed to delete leadership member');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLeader(null);
    setFormData({
      name: '',
      rank: '',
      position: '',
      description: '',
      order: 0
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

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
        <h1 className="text-3xl font-bold text-gray-800">CWTAK Leadership Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
          style={{ backgroundColor: '#006CB5' }}
        >
          <FaPlus className="text-white" /> Add Leadership Member
        </button>
      </div>

      {/* Leadership Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Photo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leadership.map((leader) => (
                <tr key={leader._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: '#006CB5' }}>
                      {leader.photo ? (
                        <img
                          src={`${BASE_URL}/${leader.photo}`}
                          alt={leader.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-2xl text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{leader.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold" style={{ color: '#006CB5' }}>{leader.rank}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{leader.position}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 max-w-xs truncate" title={leader.description}>
                      {leader.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{leader.order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleView(leader)}
                        className="text-white px-3 py-1.5 rounded hover:opacity-90 transition-colors flex items-center gap-1 text-sm"
                        style={{ backgroundColor: '#006CB5' }}
                      >
                        <FaEye className="text-white" /> View
                      </button>
                      <button
                        onClick={() => handleEdit(leader)}
                        className="text-white px-3 py-1.5 rounded hover:opacity-90 transition-colors flex items-center gap-1 text-sm"
                        style={{ backgroundColor: '#006CB5' }}
                      >
                        <FaEdit className="text-white" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(leader._id)}
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

      {leadership.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-lg">
          <p className="text-gray-500 text-lg">No leadership members found. Add your first member!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingLeader ? 'Edit Leadership Member' : 'Add Leadership Member'}
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
                <label className="block text-gray-700 font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: '#006CB5' }}
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Rank *</label>
                <input
                  type="text"
                  name="rank"
                  value={formData.rank}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  placeholder="e.g., 3rd DAN Black Belt"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Position *</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  placeholder="e.g., President, CWTAK"
                />
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
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Photo</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center">
                      <FaImage className="mx-auto text-2xl mb-2" style={{ color: '#006CB5' }} />
                      <span className="text-sm text-gray-600">Click to upload photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </div>
                  </label>
                  {photoPreview && (
                    <div className="flex-shrink-0">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border-2"
                        style={{ borderColor: '#006CB5' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 text-white py-3 rounded-lg hover:opacity-90 transition-colors font-semibold"
                  style={{ backgroundColor: '#006CB5' }}
                >
                  {editingLeader ? 'Update Leadership Member' : 'Add Leadership Member'}
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
      {showViewModal && viewingLeader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Leadership Member Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Photo */}
              {viewingLeader.photo && (
                <div className="flex justify-center">
                  <img
                    src={`${BASE_URL}/${viewingLeader.photo}`}
                    alt={viewingLeader.name}
                    className="w-48 h-48 object-cover rounded-lg border-4"
                    style={{ borderColor: '#006CB5' }}
                  />
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-500 text-sm font-semibold mb-1">Name</label>
                  <p className="text-lg font-medium text-gray-900">{viewingLeader.name}</p>
                </div>

                <div>
                  <label className="block text-gray-500 text-sm font-semibold mb-1">Rank</label>
                  <p className="text-lg font-semibold" style={{ color: '#006CB5' }}>{viewingLeader.rank}</p>
                </div>

                <div>
                  <label className="block text-gray-500 text-sm font-semibold mb-1">Position</label>
                  <p className="text-lg text-gray-900">{viewingLeader.position}</p>
                </div>

                <div>
                  <label className="block text-gray-500 text-sm font-semibold mb-1">Description</label>
                  <p className="text-gray-700 leading-relaxed">{viewingLeader.description}</p>
                </div>

                <div>
                  <label className="block text-gray-500 text-sm font-semibold mb-1">Display Order</label>
                  <p className="text-gray-900">{viewingLeader.order}</p>
                </div>
              </div>

              {/* Close Button */}
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

export default LeadershipManagement;
