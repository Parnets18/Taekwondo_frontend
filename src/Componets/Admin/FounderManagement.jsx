import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa';

function FounderManagement() {
  const [founders, setFounders] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    order: 0
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/founders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setFounders(data.data.founders || []);
        setDescription(data.data.description || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.title.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!selectedFounder && !photoFile) {
      alert('Please upload a photo');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      if (photoFile) formDataToSend.append('photo', photoFile);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('order', formData.order);

      const url = selectedFounder
        ? `${API_BASE_URL}/founders/${selectedFounder._id}`
        : `${API_BASE_URL}/founders`;
      
      const response = await fetch(url, {
        method: selectedFounder ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(selectedFounder ? 'Founder updated!' : 'Founder added!');
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving founder:', error);
      alert('Error saving founder');
    }
  };

  const handleSaveDescription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/founders/description/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description })
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Description saved!');
      } else {
        alert(data.message || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving description:', error);
      alert('Error saving description');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this founder?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/founders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Founder deleted!');
        fetchData();
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting founder:', error);
      alert('Error deleting founder');
    }
  };

  const handleEdit = (founder) => {
    setSelectedFounder(founder);
    setFormData({
      name: founder.name,
      title: founder.title,
      order: founder.order
    });
    setPhotoPreview(`${BASE_URL}/${founder.photo}`);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', title: '', order: 0 });
    setPhotoFile(null);
    setPhotoPreview(null);
    setSelectedFounder(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Founder of Taekwon-Do</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Founders */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Founders</h2>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-[#1E40AF] text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-[#1E3A8A]"
                >
                  <FaPlus /> Add
                </button>
              </div>
              
              <div className="space-y-3">
                {founders.map((founder) => (
                  <div key={founder._id} className="border rounded p-3">
                    <img
                      src={`${BASE_URL}/${founder.photo}`}
                      alt={founder.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <p className="font-bold text-sm">{founder.name}</p>
                    <p className="text-xs text-gray-600">{founder.title}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(founder)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(founder._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Description */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Description</h2>
                <button
                  onClick={handleSaveDescription}
                  className="bg-[#1E40AF] text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-[#1E3A8A]"
                >
                  <FaSave /> Save
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows="12"
                placeholder="Enter description for all founders..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {selectedFounder ? 'Edit' : 'Add'} Founder
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Photo *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E40AF] text-white rounded hover:bg-[#1E3A8A]"
                >
                  {selectedFounder ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FounderManagement;
