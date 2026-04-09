import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEye, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

const CATEGORIES = ['Seminars', 'Stunts', 'Our Memories', 'Video', 'Competitions', 'Belt Ceremonies'];

function GalleryManagement() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [category, setCategory] = useState('Our Memories');
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:9000';

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/gallery`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') setPhotos(data.data.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).filter(f => f.size <= 10 * 1024 * 1024);
    setPhotoFiles(files);
    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) setPhotoPreviews([...previews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (photoFiles.length === 0) return alert('Please select at least one photo');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      // Append category FIRST so multer parses it before files
      formData.append('category', category);
      photoFiles.forEach(file => formData.append('photos', file));

      const response = await fetch(`${API_BASE_URL}/gallery?uploadCategory=${encodeURIComponent(category)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();

      if (data.status === 'success') {
        setShowModal(false);
        resetForm();
        fetchPhotos();
      } else {
        alert(data.message || 'Error uploading photos');
      }
    } catch (error) {
      console.error('Error saving photos:', error);
      alert('Error saving photos');
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/gallery/${photoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') fetchPhotos();
      else alert(data.message || 'Error deleting photo');
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const resetForm = () => {
    setSelectedPhoto(null);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setCategory('Our Memories');
  };

  const startEditCategory = (photo) => {
    setEditingCategoryId(photo._id);
    setEditingCategoryValue(photo.category || 'Our Memories');
  };

  const saveCategory = async (photoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/gallery/${photoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: editingCategoryValue })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setEditingCategoryId(null);
        fetchPhotos();
      } else {
        alert(data.message || 'Error updating category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const getPhotoCategory = (photo) => photo.category || 'Our Memories';

  const displayedPhotos = filterCategory === 'All'
    ? photos
    : photos.filter(p => getPhotoCategory(p) === filterCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gallery Management</h1>
          <p className="text-gray-600">Manage gallery photos by category</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium flex items-center gap-2"
          style={{ backgroundColor: '#006CB5' }}
        >
          <FaPlus /> Add Photos
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600">Total Photos</p>
          <p className="text-2xl font-bold text-gray-900">{photos.length}</p>
        </div>
        {CATEGORIES.slice(0, 3).map(cat => (
          <div key={cat} className="bg-white rounded-lg shadow p-5 border-l-4 border-gray-300">
            <p className="text-sm font-medium text-gray-600">{cat}</p>
            <p className="text-2xl font-bold text-gray-900">{photos.filter(p => getPhotoCategory(p) === cat).length}</p>
          </div>
        ))}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              filterCategory === cat
                ? 'text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400'
            }`}
            style={filterCategory === cat ? { backgroundColor: '#006CB5' } : {}}
          >
            {cat}
            <span className="ml-2 text-xs opacity-75">
              ({cat === 'All' ? photos.length : photos.filter(p => getPhotoCategory(p) === cat).length})
            </span>
          </button>
        ))}
      </div>

      {/* Photos Grid / Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {displayedPhotos.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Photos Found</h3>
            <p className="text-gray-500 mb-6">
              {filterCategory === 'All' ? 'Start by adding your first photo' : `No photos in "${filterCategory}" category`}
            </p>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 font-medium"
              style={{ backgroundColor: '#006CB5' }}
            >
              Add Photos
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedPhotos.map((photo) => (
                  <tr key={photo._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img
                        src={`${BASE_URL}/${photo.photo}`}
                        alt="Gallery"
                        className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {editingCategoryId === photo._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingCategoryValue}
                            onChange={e => setEditingCategoryValue(e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                          >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                          <button onClick={() => saveCategory(photo._id)} className="text-green-600 hover:text-green-800" title="Save">
                            <FaCheck className="w-3 h-3" />
                          </button>
                          <button onClick={() => setEditingCategoryId(null)} className="text-red-500 hover:text-red-700" title="Cancel">
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: '#006CB5' }}>
                            {getPhotoCategory(photo)}
                          </span>
                          <button onClick={() => startEditCategory(photo)} className="text-gray-400 hover:text-gray-600" title="Edit category">
                            <FaEdit className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(photo.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${photo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {photo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedPhoto(photo); setShowViewModal(true); }}
                          className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
                          title="View"
                        >
                          <FaEye className="w-4 h-4" style={{ color: '#006CB5' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(photo._id)}
                          className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-red-50"
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Photos</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Photos (Multiple)</label>
                <div className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-dashed border-gray-300">
                  {photoPreviews.length > 0 && (
                    <div className="w-full grid grid-cols-3 gap-3">
                      {photoPreviews.map((preview, i) => (
                        <img key={i} src={preview} alt={`Preview ${i + 1}`} className="w-full h-28 object-cover rounded-lg border-2 border-gray-200" />
                      ))}
                    </div>
                  )}
                  <input type="file" id="photos" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" required={false} />
                  <label
                    htmlFor="photos"
                    className="cursor-pointer w-full px-4 py-3 text-white text-center rounded-lg hover:opacity-90 font-medium"
                    style={{ backgroundColor: '#006CB5' }}
                  >
                    {photoPreviews.length > 0 ? `${photoPreviews.length} Photo(s) Selected` : 'Choose Photos'}
                  </label>
                  <p className="text-xs text-gray-500">JPG, PNG, GIF. Max 10MB per file.</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90" style={{ backgroundColor: '#006CB5' }}>
                  Upload Photos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">View Photo</h2>
              <button onClick={() => { setShowViewModal(false); setSelectedPhoto(null); }} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="flex justify-center mb-6">
              <img src={`${BASE_URL}/${selectedPhoto.photo}`} alt="Gallery" className="max-w-full max-h-[60vh] object-contain rounded-lg border-2 border-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border border-gray-200 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Category</p>
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full text-white mt-1" style={{ backgroundColor: '#006CB5' }}>
                  {selectedPhoto.category || 'Uncategorized'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Status</p>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full mt-1 ${selectedPhoto.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {selectedPhoto.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Upload Date</p>
                <p className="text-sm text-gray-900">{new Date(selectedPhoto.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Photo ID</p>
                <p className="text-xs text-gray-900 font-mono">{selectedPhoto._id}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => { setShowViewModal(false); setSelectedPhoto(null); }} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryManagement;
