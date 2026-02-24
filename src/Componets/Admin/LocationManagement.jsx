import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const BASE_URL = 'https://taekwondo-backend-j8w4.onrender.com';

function LocationManagement() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingLocation, setViewingLocation] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'location',
    location: ''
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/locations`);
      const data = await response.json();
      setLocations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingLocation
        ? `${BASE_URL}/api/locations/${editingLocation._id}`
        : `${BASE_URL}/api/locations`;
      
      const method = editingLocation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchLocations();
        handleCloseModal();
        alert(editingLocation ? 'Location updated successfully!' : 'Location added successfully!');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Error saving location');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        const response = await fetch(`${BASE_URL}/api/locations/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchLocations();
          alert('Location deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting location:', error);
        alert('Error deleting location');
      }
    }
  };

  const handleView = (location) => {
    setViewingLocation(location);
    setShowViewModal(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name || '',
      type: location.type || 'location',
      location: location.location || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      type: 'location',
      location: ''
    });
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingLocation(null);
  };

  const filteredLocations = activeTab === 'all' 
    ? locations 
    : activeTab === 'locations' 
    ? locations.filter(loc => loc.type === 'location')
    : locations.filter(loc => loc.type === 'school');

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Locations & School Partnerships</h1>
        <button
          onClick={() => setShowModal(true)}
          className="text-white px-4 py-2 rounded-lg flex items-center gap-2"
          style={{ backgroundColor: '#006CB5' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#005a9c'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#006CB5'}
        >
          <FaPlus /> Add New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'all' 
              ? 'text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={activeTab === 'all' ? { backgroundColor: '#006CB5' } : {}}
        >
          All ({locations.length})
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'locations' 
              ? 'text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={activeTab === 'locations' ? { backgroundColor: '#006CB5' } : {}}
        >
          Class Locations ({locations.filter(loc => loc.type === 'location').length})
        </button>
        <button
          onClick={() => setActiveTab('schools')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'schools' 
              ? 'text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={activeTab === 'schools' ? { backgroundColor: '#006CB5' } : {}}
        >
          School Partnerships ({locations.filter(loc => loc.type === 'school').length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLocations.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No locations found. Click "Add New" to create one.
                </td>
              </tr>
            ) : (
              filteredLocations.map((location) => (
                <tr key={location._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      location.type === 'location' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {location.type === 'location' ? 'Class Location' : 'School Partnership'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{location.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{location.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(location)}
                        className="p-2 rounded"
                        style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#C8E6C9'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#E8F5E9'}
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(location)}
                        className="p-2 rounded"
                        style={{ backgroundColor: '#E3F2FD', color: '#006CB5' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#BBDEFB'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#E3F2FD'}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(location._id)}
                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showViewModal && viewingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Location Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                <p className="text-gray-900">
                  {viewingLocation.type === 'location' ? 'Class Location' : 'School Partnership'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <p className="text-gray-900">{viewingLocation.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                <p className="text-gray-900">{viewingLocation.location}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseViewModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = '#006CB5'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                >
                  <option value="location">Class Location</option>
                  <option value="school">School Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="e.g., Main Training Center"
                  onFocus={(e) => e.target.style.borderColor = '#006CB5'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="e.g., Bangalore, Karnataka"
                  onFocus={(e) => e.target.style.borderColor = '#006CB5'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 text-white py-2 rounded-lg"
                  style={{ backgroundColor: '#006CB5' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#005a9c'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#006CB5'}
                >
                  {editingLocation ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationManagement;
