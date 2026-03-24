import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders, getAuthHeadersMultipart } from '../../../config/api';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage } from 'react-icons/fa';

const EMPTY_SLIDE = {
  title: '',
  description: '',
  points: [''],
  image: null,
};

export default function OnboardingManagement() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [form, setForm] = useState(EMPTY_SLIDE);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/onboarding`, { headers: getAuthHeaders() });
      setSlides(res.data || []);
    } catch {
      // If endpoint doesn't exist yet, start with empty
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingSlide(null);
    setForm({ ...EMPTY_SLIDE });
    setImagePreview(null);
    setImageFile(null);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (slide) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title || '',
      description: slide.description || '',
    points: Array.isArray(slide.points) && slide.points.filter(p => p?.trim()).length
      ? slide.points
      : [''],
      image: slide.image || null,
    });
    setImagePreview(slide.image ? slide.image : null);
    setImageFile(null);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSlide(null);
    setForm(EMPTY_SLIDE);
    setImagePreview(null);
    setImageFile(null);
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePointChange = (index, value) => {
    const updated = [...form.points];
    updated[index] = value;
    setForm({ ...form, points: updated });
  };

  const addPoint = () => setForm({ ...form, points: [...form.points, ''] });

  const removePoint = (index) => {
    const updated = form.points.filter((_, i) => i !== index);
    setForm({ ...form, points: updated.length ? updated : [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required.');
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      const filteredPoints = form.points.filter(p => p.trim());
      filteredPoints.forEach((p) => data.append('points[]', p));
      if (imageFile) data.append('image', imageFile);

      if (editingSlide) {
        await axios.put(`${API_BASE_URL}/onboarding/${editingSlide._id}`, data, {
          headers: getAuthHeadersMultipart(),
        });
        setSuccess('Slide updated successfully.');
      } else {
        await axios.post(`${API_BASE_URL}/onboarding`, data, {
          headers: getAuthHeadersMultipart(),
        });
        setSuccess('Slide created successfully.');
      }

      await fetchSlides();
      closeForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save slide.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/onboarding/${id}`, { headers: getAuthHeaders() });
      setSuccess('Slide deleted.');
      fetchSlides();
    } catch {
      setError('Failed to delete slide.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboarding Slides</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the onboarding screens shown in the mobile app</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow transition hover:opacity-90"
          style={{ backgroundColor: '#006CB5' }}
        >
          <FaPlus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>
      )}
      {error && !showForm && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* Slide Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSlide ? 'Edit Slide' : 'Add New Slide'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slide Image</label>
                <div className="flex items-start gap-4">
                  <div
                    className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer hover:border-blue-400 transition"
                    onClick={() => document.getElementById('slide-image-input').click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <FaImage className="w-8 h-8 mx-auto mb-1" />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      id="slide-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('slide-image-input').click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                    >
                      Choose Image
                    </button>
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Welcome to Taekwon-Do"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bullet Points</label>
                <div className="space-y-2">
                  {form.points.map((point, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-gray-300 flex-shrink-0">⠿</span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handlePointChange(i, e.target.value)}
                        placeholder={`Point ${i + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => removePoint(i)}
                        className="text-red-400 hover:text-red-600 flex-shrink-0"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPoint}
                  className="mt-2 text-sm font-medium flex items-center gap-1 hover:opacity-80"
                  style={{ color: '#006CB5' }}
                >
                  <FaPlus className="w-3 h-3" /> Add Point
                </button>
              </div>

              {/* Button Text & Order - removed */}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold shadow transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#006CB5' }}
                >
                  <FaSave className="w-4 h-4" />
                  {saving ? 'Saving...' : editingSlide ? 'Update Slide' : 'Save Slide'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slides List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <FaImage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No slides yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Slide" to create your first onboarding screen</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-10">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-20">Image</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Points</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((slide, idx) => (
                <tr key={slide._id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-500 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {slide.image ? (
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaImage className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 max-w-[140px]">
                    <span className="line-clamp-2">{slide.title}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                    {slide.points?.filter(p => p).length > 0 ? (
                      <ul className="space-y-0.5">
                        {slide.points.filter(p => p).map((pt, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#006CB5' }}></span>
                            <span className="line-clamp-1">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(slide)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                      >
                        <FaEdit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(slide._id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition"
                      >
                        <FaTrash className="w-3 h-3" /> Delete
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
  );
}
