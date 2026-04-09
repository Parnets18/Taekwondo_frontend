import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders, getAuthHeadersMultipart } from '../../../config/api';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const EMPTY_TECHNIQUE = {
  name: '',
  category: '',
  difficulty: 'Easy',
  videoUrl: '',
  steps: [''],
  tips: [''],
  image: null,
};

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function TechniquesManagement() {
  const [categories, setCategories] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category state
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState('');

  // Technique state
  const [showTechForm, setShowTechForm] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [form, setForm] = useState(EMPTY_TECHNIQUE);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState('techniques'); // 'categories' | 'techniques'
  const [filterCategory, setFilterCategory] = useState('All');
  const [expandedCats, setExpandedCats] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [catRes, techRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/techniques/categories`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/techniques`, { headers: getAuthHeaders() }),
      ]);
      setCategories(catRes.data || []);
      setTechniques(techRes.data || []);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  // ── CATEGORY CRUD ──────────────────────────────────────────
  const openAddCat = () => { setEditingCat(null); setCatName(''); setShowCatForm(true); setError(''); };
  const openEditCat = (cat) => { setEditingCat(cat); setCatName(cat.name); setShowCatForm(true); setError(''); };
  const closeCatForm = () => { setShowCatForm(false); setEditingCat(null); setCatName(''); setError(''); };

  const saveCat = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return setError('Category name is required.');
    setSaving(true);
    try {
      if (editingCat) {
        await axios.put(`${API_BASE_URL}/techniques/categories/${editingCat._id}`, { name: catName }, { headers: getAuthHeaders() });
        setSuccess('Category updated.');
      } else {
        await axios.post(`${API_BASE_URL}/techniques/categories`, { name: catName }, { headers: getAuthHeaders() });
        setSuccess('Category created.');
      }
      await fetchAll();
      closeCatForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const deleteCat = async (id) => {
    if (!window.confirm('Delete this category? All its techniques will also be deleted.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/techniques/categories/${id}`, { headers: getAuthHeaders() });
      setSuccess('Category deleted.');
      fetchAll();
    } catch { setError('Failed to delete.'); }
  };

  // ── TECHNIQUE CRUD ─────────────────────────────────────────
  const openAddTech = (categoryName = '') => {
    setEditingTech(null);
    setForm({ ...EMPTY_TECHNIQUE, category: categoryName });
    setImageFile(null); setImagePreview(null);
    setVideoFile(null); setVideoName('');
    setShowTechForm(true); setError('');
  };

  const openEditTech = (tech) => {
    setEditingTech(tech);
    setForm({
      name: tech.name || '',
      category: tech.category || '',
      difficulty: tech.difficulty || 'Easy',
      videoUrl: tech.videoUrl || '',
      steps: tech.steps?.length ? tech.steps : [''],
      tips: tech.tips?.length ? tech.tips : [''],
      image: tech.image || null,
    });
    setImagePreview(tech.image || null);
    setImageFile(null);
    setVideoFile(null);
    setVideoName(tech.videoUrl ? 'Existing video uploaded' : '');
    setShowTechForm(true); setError('');
  };

  const closeTechForm = () => {
    setShowTechForm(false); setEditingTech(null);
    setForm(EMPTY_TECHNIQUE); setImageFile(null); setImagePreview(null);
    setVideoFile(null); setVideoName(''); setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const updateList = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const addListItem = (field) => setForm({ ...form, [field]: [...form[field], ''] });

  const removeListItem = (field, index) => {
    const updated = form[field].filter((_, i) => i !== index);
    setForm({ ...form, [field]: updated.length ? updated : [''] });
  };

  const saveTech = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required.');
    if (!form.category) return setError('Category is required.');
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('category', form.category);
      data.append('difficulty', form.difficulty);
      form.steps.filter(s => s.trim()).forEach(s => data.append('steps[]', s));
      form.tips.filter(t => t.trim()).forEach(t => data.append('tips[]', t));
      if (imageFile) data.append('image', imageFile);
      if (videoFile) data.append('video', videoFile);

      if (editingTech) {
        await axios.put(`${API_BASE_URL}/techniques/${editingTech._id}`, data, { headers: getAuthHeadersMultipart() });
        setSuccess('Technique updated.');
      } else {
        await axios.post(`${API_BASE_URL}/techniques`, data, { headers: getAuthHeadersMultipart() });
        setSuccess('Technique created.');
      }
      await fetchAll();
      closeTechForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save technique.');
    } finally {
      setSaving(false);
    }
  };

  const deleteTech = async (id) => {
    if (!window.confirm('Delete this technique?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/techniques/${id}`, { headers: getAuthHeaders() });
      setSuccess('Technique deleted.');
      fetchAll();
    } catch { setError('Failed to delete.'); }
  };

  // ── FILTERED TECHNIQUES ────────────────────────────────────
  const filteredTechniques = filterCategory === 'All'
    ? techniques
    : techniques.filter(t => t.category === filterCategory);

  const groupedByCategory = categories.map(cat => ({
    ...cat,
    techniques: techniques.filter(t => t.category === cat.name),
  }));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Techniques Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage kicks, punches and technique categories shown in the app</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAddCat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition hover:opacity-80"
            style={{ borderColor: '#006CB5', color: '#006CB5' }}
          >
            <FaPlus className="w-3 h-3" /> Add Category
          </button>
          <button
            onClick={() => openAddTech()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm shadow transition hover:opacity-90"
            style={{ backgroundColor: '#006CB5' }}
          >
            <FaPlus className="w-3 h-3" /> Add Technique
          </button>
        </div>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error && !showCatForm && !showTechForm && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {['techniques', 'categories'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab} {tab === 'techniques' ? `(${techniques.length})` : `(${categories.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : activeTab === 'categories' ? (
        /* ── CATEGORIES TAB ── */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No categories yet. Click "Add Category" to start.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-10">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Category Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Techniques</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {techniques.filter(t => t.category === cat.name).length} techniques
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditCat(cat)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
                          <FaEdit className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => deleteCat(cat._id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition">
                          <FaTrash className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* ── TECHNIQUES TAB ── */
        <div>
          {/* Category filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['All', ...categories.map(c => c.name)].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${filterCategory === cat ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                style={filterCategory === cat ? { backgroundColor: '#006CB5' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredTechniques.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              No techniques yet. Click "Add Technique" to start.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-10">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-16">Image</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Difficulty</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Steps</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTechniques.map((tech, idx) => (
                    <tr key={tech._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          {tech.image
                            ? <img src={tech.image} alt={tech.name} className="w-full h-full object-cover" />
                            : <FaImage className="w-4 h-4 text-gray-300" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{tech.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{tech.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          tech.difficulty === 'Easy' ? 'bg-green-50 text-green-700' :
                          tech.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'}`}>
                          {tech.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{tech.steps?.length || 0} steps</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditTech(tech)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
                            <FaEdit className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={() => deleteTech(tech._id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition">
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
      )}

      {/* ── CATEGORY FORM MODAL ── */}
      {showCatForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editingCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={closeCatForm} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={saveCat} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  placeholder="e.g. Kicks, Jump Kicks, Punches"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold shadow transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#006CB5' }}>
                  <FaSave className="w-4 h-4" /> {saving ? 'Saving...' : editingCat ? 'Update' : 'Save'}
                </button>
                <button type="button" onClick={closeCatForm} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TECHNIQUE FORM MODAL ── */}
      {showTechForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editingTech ? 'Edit Technique' : 'Add Technique'}</h2>
              <button onClick={closeTechForm} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={saveTech} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                <div className="flex items-start gap-4">
                  <div
                    className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 transition flex-shrink-0"
                    onClick={() => document.getElementById('tech-image-input').click()}
                  >
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                      : <div className="text-center text-gray-400"><FaImage className="w-7 h-7 mx-auto mb-1" /><span className="text-xs">Click to upload</span></div>}
                  </div>
                  <div>
                    <input id="tech-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    <button type="button" onClick={() => document.getElementById('tech-image-input').click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                      Choose Image
                    </button>
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Front Kick - Left"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              {/* Category + Difficulty row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Video</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition cursor-pointer">
                    <span>📹</span>
                    {videoName ? 'Change Video' : 'Upload Video'}
                    <input
                      id="tech-video-input"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setVideoFile(file);
                        setVideoName(file.name);
                      }}
                    />
                  </label>
                  {videoName && (
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">{videoName}</span>
                  )}
                  {videoName && (
                    <button type="button" onClick={() => { setVideoFile(null); setVideoName(''); }}
                      className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">MP4, MOV up to 100MB</p>
              </div>

              {/* Steps */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Steps</label>
                <div className="space-y-2">
                  {form.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0">{i + 1}.</span>
                      <input type="text" value={step} onChange={e => updateList('steps', i, e.target.value)}
                        placeholder={`Step ${i + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <button type="button" onClick={() => removeListItem('steps', i)} className="text-red-400 hover:text-red-600"><FaTimes className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addListItem('steps')}
                  className="mt-2 text-sm font-medium flex items-center gap-1 hover:opacity-80" style={{ color: '#006CB5' }}>
                  <FaPlus className="w-3 h-3" /> Add Step
                </button>
              </div>

              {/* Tips */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tips</label>
                <div className="space-y-2">
                  {form.tips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0">{i + 1}.</span>
                      <input type="text" value={tip} onChange={e => updateList('tips', i, e.target.value)}
                        placeholder={`Tip ${i + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <button type="button" onClick={() => removeListItem('tips', i)} className="text-red-400 hover:text-red-600"><FaTimes className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addListItem('tips')}
                  className="mt-2 text-sm font-medium flex items-center gap-1 hover:opacity-80" style={{ color: '#006CB5' }}>
                  <FaPlus className="w-3 h-3" /> Add Tip
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold shadow transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#006CB5' }}>
                  <FaSave className="w-4 h-4" /> {saving ? 'Saving...' : editingTech ? 'Update' : 'Save'}
                </button>
                <button type="button" onClick={closeTechForm} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
