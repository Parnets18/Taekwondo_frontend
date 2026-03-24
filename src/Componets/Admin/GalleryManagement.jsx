import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

function GalleryManagement() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/gallery`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setPhotos(data.data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Some files are larger than 10MB and will be skipped');
    }

    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
    setPhotoFiles(validFiles);

    // Generate previews
    const previews = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setPhotoPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (photoFiles.length === 0 && !selectedPhoto) {
      alert('Please select at least one photo');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Add all photos
      photoFiles.forEach(file => {
        formDataToSend.append('photos', file);
      });

      const url = `${API_BASE_URL}/gallery`;
      const method = 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(`${photoFiles.length} photo(s) uploaded successfully!`);
        setShowModal(false);
        resetForm();
        fetchPhotos();
      } else {
        alert(data.message || 'Error saving photos');
      }
    } catch (error) {
      console.error('Error saving photos:', error);
      alert('Error saving photos');
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/gallery/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('Photo deleted successfully!');
        fetchPhotos();
      } else {
        alert(data.message || 'Error deleting photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error deleting photo');
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedPhoto(null);
    setPhotoFiles([]);
    setPhotoPreviews([]);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gallery Management</h1>
          <p className="text-gray-600">Manage gallery photos</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium flex items-center gap-2"
          style={{ backgroundColor: '#006CB5' }}
        >
          <FaPlus /> Add Photos
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600">Total Photos</p>
          <p className="text-2xl font-bold text-gray-900">{photos.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-sm font-medium text-gray-600">Active Photos</p>
          <p className="text-2xl font-bold text-gray-900">{photos.filter(p => p.isActive).length}</p>
        </div>
      </div>

      {/* Photos Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {photos.length === 0 ? (
          <div className="text-center py-20 bg-white">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Photos Yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first photo</p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: '#006CB5' }}
            >
              Add First Photo
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
                    Upload Date
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
                {photos.map((photo) => (
                  <tr key={photo._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-20 w-20">
                          <img
                            src={`${BASE_URL}/${photo.photo}`}
                            alt="Gallery photo"
                            className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(photo.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(photo.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        photo.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {photo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPhoto(photo);
                            setShowViewModal(true);
                          }}
                          className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center border border-gray-300"
                          title="View"
                        >
                          <FaEye className="w-4 h-4" style={{ color: '#006CB5' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(photo._id)}
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

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Photos</h2>
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
                  Select Photos (Multiple)
                </label>
                <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
                  {photoPreviews.length > 0 && (
                    <div className="w-full grid grid-cols-3 gap-4">
                      {photoPreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                      ))}
                    </div>
                  )}
                  <div className="w-full">
                    <input
                      type="file"
                      id="photos"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                      required
                    />
                    <label
                      htmlFor="photos"
                      className="cursor-pointer inline-block w-full px-4 py-3 text-white text-center rounded-lg hover:opacity-90 transition-colors font-medium"
                      style={{ backgroundColor: '#006CB5' }}
                    >
                      {photoPreviews.length > 0 ? `${photoPreviews.length} Photo(s) Selected` : 'Choose Photos'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2 text-center">JPG, PNG, GIF. Max 10MB per file. Select multiple files.</p>
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
                  Upload Photos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPhoto && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">View Photo</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPhoto(null);
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
                    src={`${BASE_URL}/${selectedPhoto.photo}`}
                    alt="Gallery photo"
                    className="max-w-full max-h-[70vh] object-contain rounded-lg border-2 border-gray-300"
                  />
                </div>
              </div>

              {/* Photo Details */}
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Upload Date</p>
                  <p className="text-base text-gray-900">
                    {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Upload Time</p>
                  <p className="text-base text-gray-900">
                    {new Date(selectedPhoto.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Status</p>
                  <span className={`inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full ${
                    selectedPhoto.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedPhoto.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Photo ID</p>
                  <p className="text-base text-gray-900 font-mono text-xs">
                    {selectedPhoto._id}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedPhoto(null);
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

export default GalleryManagement;
