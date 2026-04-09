import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders, getAuthHeadersMultipart } from '../../../config/api';
import { FaEdit, FaTrash, FaImage, FaSave, FaTimes, FaEye } from 'react-icons/fa';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:9000';
const SECTIONS = ['warmUp', 'training', 'stretching'];
const SECTION_LABELS = { warmUp: 'Warm-Up', training: 'Training', stretching: 'Stretching' };
const EQUIPMENT = ['all', 'chair', 'noChair'];
const EQUIPMENT_LABELS = { all: 'All', chair: 'With Chair', noChair: 'No Chair' };
const EMPTY = { name: '', section: 'warmUp', equipment: 'all', duration: '25 sec' };

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BASE_URL}/${img.replace(/^\//, '')}`;
};

export default function ExerciseManagement() {
  const [searchParams] = useSearchParams();
  const beltContext = searchParams.get('belt') || '';
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filterSection, setFilterSection] = useState('');

  useEffect(() => { fetchExercises(); }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/exercises`);
      setExercises(res.data?.data?.exercises || []);
    } catch { setExercises([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null); setForm({ ...EMPTY, beltName: beltContext });
    setImageFile(null); setImagePreview(null);
    setError(''); setSuccess(''); setShowForm(true);
  };

  const openEdit = (ex) => {
    setEditing(ex);
    setForm({ name: ex.name, section: ex.section, equipment: ex.equipment, duration: ex.duration || '25 sec' });
    setImagePreview(ex.image ? getImageUrl(ex.image) : null);
    setImageFile(null); setError(''); setSuccess(''); setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditing(null);
    setForm(EMPTY); setImageFile(null); setImagePreview(null); setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Exercise name is required'); return; }
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('section', form.section);
      fd.append('equipment', form.equipment);
      fd.append('duration', form.duration);
      if (imageFile) fd.append('image', imageFile);

      if (editing) {
        await axios.put(`${API_BASE_URL}/exercises/${editing._id}`, fd, { headers: getAuthHeadersMultipart() });
        setSuccess('Exercise updated!');
      } else {
        await axios.post(`${API_BASE_URL}/exercises`, fd, { headers: getAuthHeadersMultipart() });
        setSuccess('Exercise created!');
      }
      fetchExercises();
      setTimeout(closeForm, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (ex) => {
    if (!window.confirm(`Delete "${ex.name}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/exercises/${ex._id}`, { headers: getAuthHeaders() });
      fetchExercises();
    } catch { alert('Failed to delete'); }
  };

  const filtered = filterSection ? exercises.filter(e => e.section === filterSection) : exercises;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercise Management</h1>
          <p className="text-gray-500 mt-1">Manage exercises shown in the mobile app training sessions</p>
          {beltContext && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#006CB5' }}>
              🥋 {beltContext}
            </div>
          )}
        </div>
        <button onClick={openAdd} className="px-5 py-2 text-white rounded-lg hover:opacity-90 font-medium" style={{ backgroundColor: '#006CB5' }}>
          + Add Exercise
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button onClick={() => setFilterSection('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${!filterSection ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
          All
        </button>
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setFilterSection(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${filterSection === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No exercises yet. Click "+ Add Exercise" to get started.</td></tr>
              ) : filtered.map((ex, idx) => (
                <tr key={ex._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4">
                    {ex.image ? (
                      <img src={getImageUrl(ex.image)} alt={ex.name} className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><FaImage size={16} /></div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{ex.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ex.section === 'warmUp' ? 'bg-orange-100 text-orange-700' : ex.section === 'training' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {SECTION_LABELS[ex.section]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{EQUIPMENT_LABELS[ex.equipment]}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ex.duration}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewItem(ex)} title="View" className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"><FaEye size={14} /></button>
                      <button onClick={() => openEdit(ex)} title="Edit" className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"><FaEdit size={14} /></button>
                      <button onClick={() => handleDelete(ex)} title="Delete" className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"><FaTrash size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Exercise' : 'Add New Exercise'}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
              {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exercise Image</label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer hover:border-blue-400 transition"
                    onClick={() => document.getElementById('ex-image-input').click()}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-center text-gray-400"><FaImage className="w-8 h-8 mx-auto mb-1" /><span className="text-xs">Click to upload</span></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input id="ex-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    <button type="button" onClick={() => document.getElementById('ex-image-input').click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Choose Image</button>
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Exercise Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Front Kick"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              {/* Section + Equipment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                  <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    {SECTIONS.map(s => <option key={s} value={s}>{SECTION_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Equipment</label>
                  <select value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    {EQUIPMENT.map(eq => <option key={eq} value={eq}>{EQUIPMENT_LABELS[eq]}</option>)}
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                <input type="text" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  placeholder="e.g. 25 sec"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl text-white font-semibold shadow transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#006CB5' }}>
                  {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <FaSave />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">Exercise Details</h2>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {viewItem.image ? (
                  <img src={getImageUrl(viewItem.image)} alt={viewItem.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center"><FaImage size={40} /><span className="text-sm mt-2">No image</span></div>
                )}
              </div>
              <div className="space-y-2">
                {[
                  ['Name', viewItem.name],
                  ['Section', SECTION_LABELS[viewItem.section]],
                  ['Equipment', EQUIPMENT_LABELS[viewItem.equipment]],
                  ['Duration', viewItem.duration],
                  ['Created', new Date(viewItem.createdAt).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500 font-medium">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setViewItem(null)}
                className="w-full py-2.5 rounded-xl text-white font-semibold transition hover:opacity-90"
                style={{ backgroundColor: '#006CB5' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
