import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

function AboutDojangStoryManagement() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: 'Our Dojang Story',
    description: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';

  const getPhotoUrl = (photo) => {
    if (!photo) return '';
    if (photo.startsWith('http')) return photo;
    return `${BASE_URL}/${photo.replace(/^\//, '')}`;
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/about-dojang-story/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setStories(data.data.stories || []);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photoFile && !selectedStory) {
      alert('Please select a photo');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);

      const url = selectedStory
        ? `${API_BASE_URL}/about-dojang-story/${selectedStory._id}`
        : `${API_BASE_URL}/about-dojang-story`;
      
      const method = selectedStory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(selectedStory ? 'Story updated successfully!' : 'Story created successfully!');
        setShowModal(false);
        resetForm();
        fetchStories();
      } else {
        alert(data.message || 'Error saving story');
      }
    } catch (error) {
      console.error('Error saving story:', error);
      alert('Error saving story');
    }
  };

  const handleDelete = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/about-dojang-story/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('Story deleted successfully!');
        fetchStories();
      } else {
        alert(data.message || 'Error deleting story');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Error deleting story');
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (story) => {
    setSelectedStory(story);
    setPhotoPreview(getPhotoUrl(story.photo));
    setFormData({
      title: story.title,
      description: story.description
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedStory(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData({
      title: 'Our Dojang Story',
      description: ''
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Dojang Story Management</h1>
          <p className="text-gray-600">Manage the Our Dojang Story section on About page</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium flex items-center gap-2"
          style={{ backgroundColor: '#006CB5' }}
        >
          <FaPlus /> Add Story
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600">Total Stories</p>
          <p className="text-2xl font-bold text-gray-900">{stories.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-sm font-medium text-gray-600">Active Story</p>
          <p className="text-2xl font-bold text-gray-900">{stories.filter(s => s.isActive).length}</p>
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {stories.length === 0 ? (
          <div className="text-center py-20 bg-white">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Story Yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first story</p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: '#006CB5' }}
            >
              Add First Story
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
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
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
                {stories.map((story) => (
                  <tr key={story._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-20 w-20">
                          <img
                            src={getPhotoUrl(story.photo)}
                            alt="Story"
                            className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{story.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {story.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        story.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {story.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedStory(story);
                            setPhotoPreview(getPhotoUrl(story.photo));
                            setShowViewModal(true);
                          }}
                          className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center border border-gray-300"
                          title="View"
                        >
                          <FaEye className="w-4 h-4" style={{ color: '#006CB5' }} />
                        </button>
                        <button
                          onClick={() => openEditModal(story)}
                          className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center border border-gray-300"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" style={{ color: '#006CB5' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(story._id)}
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedStory ? 'Edit Story' : 'Add New Story'}
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
              {/* Title */}
              <div className="bg-white">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div className="bg-white">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Photo Upload */}
              <div className="bg-white">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photo *
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
                      required={!selectedStory}
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
                  {selectedStory ? 'Update Story' : 'Create Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedStory && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">View Story</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStory(null);
                  setPhotoPreview(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 bg-white">
              {/* Photo Display */}
              <div className="bg-white">
                <div className="flex justify-center">
                  <img
                    src={photoPreview}
                    alt="Story"
                    className="max-w-full max-h-[50vh] object-contain rounded-lg border-2 border-gray-300"
                  />
                </div>
              </div>

              {/* Story Details */}
              <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Title</p>
                  <p className="text-base text-gray-900">{selectedStory.title}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Description</p>
                  <p className="text-base text-gray-900 whitespace-pre-wrap">{selectedStory.description}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Status</p>
                  <span className={`inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full ${
                    selectedStory.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedStory.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedStory(null);
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

export default AboutDojangStoryManagement;

