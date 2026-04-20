import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders, getAuthHeadersMultipart } from '../../../config/api';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage, FaEye } from 'react-icons/fa';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';
const SECTIONS = ['warmUp', 'training', 'stretching'];
const SECTION_LABELS = { warmUp: 'Warm-Up', training: 'Training', stretching: 'Stretching' };
const EQUIPMENT = ['chair', 'noChair'];
const EQUIPMENT_LABELS = { chair: 'With Chair', noChair: 'No Chair' };
const LEVELS = ['Easy', 'Advance', 'Master'];

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BASE_URL}/${img.replace(/^\//, '')}`;
};

const EMPTY_BELT = { beltName: '' };
const EMPTY_EX = { name: '', section: 'warmUp', equipment: 'chair', level: 'Easy', duration: '25 sec', videoFile: null, videoName: '', steps: [''], tips: [''] };

export default function BeltContentManagement() {
  const [activeTab, setActiveTab] = useState('belts');
  const [belts, setBelts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Belt form
  const [showBeltForm, setShowBeltForm] = useState(false);
  const [editingBelt, setEditingBelt] = useState(null);
  const [beltForm, setBeltForm] = useState(EMPTY_BELT);
  const [beltImageFile, setBeltImageFile] = useState(null);
  const [beltImagePreview, setBeltImagePreview] = useState(null);

  // Exercise form
  const [showExForm, setShowExForm] = useState(false);
  const [editingEx, setEditingEx] = useState(null);
  const [exForm, setExForm] = useState(EMPTY_EX);
  const [exImageFile, setExImageFile] = useState(null);
  const [exImagePreview, setExImagePreview] = useState(null);
  const [filterBelt, setFilterBelt] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [beltRes, exRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/belt-content`),
        axios.get(`${API_BASE_URL}/exercises`),
      ]);
      const freshExercises = exRes.data?.data?.exercises || [];
      setBelts(beltRes.data?.data?.belts || []);
      setExercises(freshExercises);
      // keep viewItem in sync with fresh data
      setViewItem(v => v ? (freshExercises.find(e => e._id === v._id) || v) : null);
    } catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  };

  // ── Belt CRUD ──────────────────────────────────────────────
  const openAddBelt = () => { setEditingBelt(null); setBeltForm(EMPTY_BELT); setBeltImageFile(null); setBeltImagePreview(null); setError(''); setShowBeltForm(true); };
  const openEditBelt = (b) => { setEditingBelt(b); setBeltForm({ beltName: b.beltName }); setBeltImagePreview(b.image ? getImageUrl(b.image) : null); setBeltImageFile(null); setError(''); setShowBeltForm(true); };
  const closeBeltForm = () => { setShowBeltForm(false); setEditingBelt(null); setBeltForm(EMPTY_BELT); setBeltImageFile(null); setBeltImagePreview(null); setError(''); };

  const handleBeltImageChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setBeltImageFile(file);
    const r = new FileReader(); r.onloadend = () => setBeltImagePreview(r.result); r.readAsDataURL(file);
  };

  const saveBelt = async (e) => {
    e.preventDefault();
    if (!beltForm.beltName.trim()) return setError('Belt name is required.');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('beltName', beltForm.beltName);
      if (beltImageFile) fd.append('image', beltImageFile);
      if (editingBelt) {
        await axios.put(`${API_BASE_URL}/belt-content/${editingBelt._id}`, fd, { headers: getAuthHeadersMultipart() });
        setSuccess('Belt updated.');
      } else {
        await axios.post(`${API_BASE_URL}/belt-content`, fd, { headers: getAuthHeadersMultipart() });
        setSuccess('Belt created.');
      }
      await fetchAll(); closeBeltForm();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save belt.'); }
    finally { setSaving(false); }
  };

  const deleteBelt = async (b) => {
    if (!window.confirm(`Delete "${b.beltName}"?`)) return;
    try { await axios.delete(`${API_BASE_URL}/belt-content/${b._id}`, { headers: getAuthHeaders() }); setSuccess('Belt deleted.'); fetchAll(); }
    catch { setError('Failed to delete.'); }
  };

  // ── Exercise CRUD ──────────────────────────────────────────
  const openAddEx = (beltName = '') => { setEditingEx(null); setExForm({ ...EMPTY_EX, beltName }); setExImageFile(null); setExImagePreview(null); setError(''); setShowExForm(true); };
  const openEditEx = (ex) => { setEditingEx(ex); setExForm({ name: ex.name, section: ex.section, equipment: ex.equipment, level: ex.level || 'Easy', duration: ex.duration || '25 sec', beltName: ex.beltName || '', videoFile: null, videoName: ex.videoUrl ? 'Existing video uploaded' : '', steps: ex.steps?.length ? ex.steps : [''], tips: ex.tips?.length ? ex.tips : [''] }); setExImagePreview(ex.image ? getImageUrl(ex.image) : null); setExImageFile(null); setError(''); setShowExForm(true); };
  const closeExForm = () => { setShowExForm(false); setEditingEx(null); setExForm(EMPTY_EX); setExImageFile(null); setExImagePreview(null); setError(''); };

  const handleExImageChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setExImageFile(file);
    const r = new FileReader(); r.onloadend = () => setExImagePreview(r.result); r.readAsDataURL(file);
  };

  const saveEx = async (e) => {
    e.preventDefault();
    if (!exForm.name.trim()) return setError('Name is required.');
    setSaving(true);
    try {
      const fd = new FormData();
      // Text fields FIRST — files must come last to ensure multer parses all text fields
      fd.append('name', exForm.name);
      fd.append('section', exForm.section);
      fd.append('equipment', exForm.equipment);
      fd.append('level', exForm.level || 'Easy');
      fd.append('beltName', exForm.beltName || '');
      // Send steps and tips as JSON strings — avoids multipart array parsing issues
      const cleanSteps = exForm.steps.filter(s => s && s.trim());
      const cleanTips = exForm.tips.filter(t => t && t.trim());
      fd.append('stepsJson', JSON.stringify(cleanSteps));
      fd.append('tipsJson', JSON.stringify(cleanTips));
      // Files LAST
      if (exImageFile) fd.append('image', exImageFile);
      if (exForm.videoFile) fd.append('video', exForm.videoFile);

      if (editingEx) {
        await axios.put(`${API_BASE_URL}/exercises/${editingEx._id}`, fd, {
          headers: getAuthHeadersMultipart(),
          timeout: 5 * 60 * 1000, // 5 min for large videos
          onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
        });
        setSuccess('Exercise updated.');
      } else {
        await axios.post(`${API_BASE_URL}/exercises`, fd, {
          headers: getAuthHeadersMultipart(),
          timeout: 5 * 60 * 1000,
          onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
        });
        setSuccess('Exercise created.');
      }
      setUploadProgress(0);
      await fetchAll();
      closeExForm();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save exercise.'); }
    finally { setSaving(false); }
  };

  const deleteEx = async (ex) => {
    if (!window.confirm(`Delete "${ex.name}"?`)) return;
    try { await axios.delete(`${API_BASE_URL}/exercises/${ex._id}`, { headers: getAuthHeaders() }); setSuccess('Exercise deleted.'); fetchAll(); }
    catch { setError('Failed to delete.'); }
  };

  const filteredExercises = exercises.filter(ex => {
    const matchBelt = filterBelt === 'All' || ex.beltName === filterBelt;
    const matchSection = filterSection === 'All' || ex.section === filterSection;
    return matchBelt && matchSection;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Belt Content Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage belt images and training exercises shown in the mobile app</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'belts' ? (
            <>
              <button onClick={() => openAddEx()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition hover:opacity-80"
                style={{ borderColor: '#006CB5', color: '#006CB5' }}>
                <FaPlus className="w-3 h-3" /> Add Training
              </button>
              <button onClick={openAddBelt}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm shadow transition hover:opacity-90"
                style={{ backgroundColor: '#006CB5' }}>
                <FaPlus className="w-3 h-3" /> Add Belt
              </button>
            </>
          ) : (
            <button onClick={() => openAddEx()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm shadow transition hover:opacity-90"
              style={{ backgroundColor: '#006CB5' }}>
              <FaPlus className="w-3 h-3" /> Add Exercise
            </button>
          )}
        </div>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error && !showBeltForm && !showExForm && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[['belts', `Belts (${belts.length})`], ['exercises', `Exercises (${exercises.length})`]].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : activeTab === 'belts' ? (
        /* ── BELTS TAB ── */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {belts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No belts yet. Click "Add Belt" to start.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-10">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-20">Image</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Belt Name</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {belts.map((belt, idx) => (
                  <tr key={belt._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                        {belt.image
                          ? <img src={getImageUrl(belt.image)} alt={belt.beltName} className="w-full h-full object-cover" />
                          : <FaImage className="w-4 h-4 text-gray-300" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{belt.beltName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditBelt(belt)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
                          <FaEdit className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => deleteBelt(belt)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition">
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
        /* ── EXERCISES TAB ── */
        <div>
          {filteredExercises.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              No exercises yet. Click "Add Exercise" to start.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-10">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-16">Image</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Belt</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Section</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Equipment</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExercises.map((ex, idx) => (
                    <tr key={ex._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          {ex.image ? <img src={getImageUrl(ex.image)} alt={ex.name} className="w-full h-full object-cover" /> : <FaImage className="w-4 h-4 text-gray-300" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{ex.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{ex.beltName || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ex.section === 'warmUp' ? 'bg-orange-50 text-orange-700' : ex.section === 'training' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                          {SECTION_LABELS[ex.section]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{EQUIPMENT_LABELS[ex.equipment]}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setViewItem(ex)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-200 text-green-600 hover:bg-green-50 transition">
                            <FaEye className="w-3 h-3" /> View
                          </button>
                          <button onClick={() => openEditEx(ex)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
                            <FaEdit className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={() => deleteEx(ex)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition">
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

      {/* ── BELT FORM MODAL ── */}
      {showBeltForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editingBelt ? 'Edit Belt' : 'Add Belt'}</h2>
              <button onClick={closeBeltForm} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={saveBelt} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Belt Image</label>
                <div className="flex items-start gap-4">
                  <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 transition flex-shrink-0"
                    onClick={() => document.getElementById('belt-img-input').click()}>
                    {beltImagePreview
                      ? <img src={beltImagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                      : <div className="text-center text-gray-400"><FaImage className="w-7 h-7 mx-auto mb-1" /><span className="text-xs">Click to upload</span></div>}
                  </div>
                  <div>
                    <input id="belt-img-input" type="file" accept="image/*" className="hidden" onChange={handleBeltImageChange} />
                    <button type="button" onClick={() => document.getElementById('belt-img-input').click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Choose Image</button>
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Belt Name <span className="text-red-500">*</span></label>
                <input type="text" value={beltForm.beltName} onChange={e => setBeltForm(f => ({ ...f, beltName: e.target.value }))}
                  placeholder="e.g. White Belt"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold shadow transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#006CB5' }}>
                  <FaSave className="w-4 h-4" /> {saving ? 'Saving...' : editingBelt ? 'Update' : 'Save'}
                </button>
                <button type="button" onClick={closeBeltForm} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EXERCISE FORM MODAL ── */}
      {showExForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-base font-bold text-gray-900">{editingEx ? 'Edit Exercise' : 'Add Exercise'}</h2>
              <button onClick={closeExForm} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={saveEx} className="px-4 py-3 space-y-3">
              {error && <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">{error}</div>}

              {/* Image + Name row */}
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 transition flex-shrink-0"
                  onClick={() => document.getElementById('ex-img-input').click()}>
                  {exImagePreview
                    ? <img src={exImagePreview} alt="preview" className="w-full h-full object-cover rounded-lg" />
                    : <div className="text-center text-gray-400"><FaImage className="w-5 h-5 mx-auto mb-0.5" /><span className="text-xs">Image</span></div>}
                </div>
                <div className="flex-1">
                  <input id="ex-img-input" type="file" accept="image/*" className="hidden" onChange={handleExImageChange} />
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Exercise Name <span className="text-red-500">*</span></label>
                  <input type="text" value={exForm.name} onChange={e => setExForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Front Kick"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <button type="button" onClick={() => document.getElementById('ex-img-input').click()}
                    className="mt-1 text-xs text-blue-500 hover:underline">Change image</button>
                </div>
              </div>

              {/* Belt + Section + Equipment + Level in grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Belt</label>
                  <select value={exForm.beltName} onChange={e => setExForm(f => ({ ...f, beltName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    <option value="">Select belt</option>
                    {belts.map(b => <option key={b._id} value={b.beltName}>{b.beltName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
                  <select value={exForm.section} onChange={e => setExForm(f => ({ ...f, section: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    {SECTIONS.map(s => <option key={s} value={s}>{SECTION_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Equipment</label>
                  <select value={exForm.equipment} onChange={e => setExForm(f => ({ ...f, equipment: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    {EQUIPMENT.map(eq => <option key={eq} value={eq}>{EQUIPMENT_LABELS[eq]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Level</label>
                  <select value={exForm.level} onChange={e => setExForm(f => ({ ...f, level: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Video */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition cursor-pointer">
                  <span>🎬</span>{exForm.videoName ? 'Change Video' : 'Upload Video'}
                  <input type="file" accept="video/*" className="hidden"
                    onChange={e => { const file = e.target.files[0]; if (!file) return; setExForm(f => ({ ...f, videoFile: file, videoName: file.name })); }} />
                </label>
                {exForm.videoName && <span className="text-xs text-gray-500 truncate max-w-[160px]">{exForm.videoName}</span>}
                {exForm.videoName && <button type="button" onClick={() => setExForm(f => ({ ...f, videoFile: null, videoName: '' }))} className="text-red-400 hover:text-red-600 text-xs">Remove</button>}
              </div>

              {/* Steps */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Steps</label>
                <div className="space-y-1.5">
                  {exForm.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}.</span>
                      <input type="text" value={step}
                        onChange={e => { const s = [...exForm.steps]; s[i] = e.target.value; setExForm(f => ({ ...f, steps: s })); }}
                        placeholder={`Step ${i + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <button type="button" onClick={() => { const s = exForm.steps.filter((_, idx) => idx !== i); setExForm(f => ({ ...f, steps: s.length ? s : [''] })); }}
                        className="text-red-400 hover:text-red-600"><FaTimes className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setExForm(f => ({ ...f, steps: [...f.steps, ''] }))}
                  className="mt-1 text-xs font-medium flex items-center gap-1 hover:opacity-80" style={{ color: '#006CB5' }}>
                  <FaPlus className="w-2.5 h-2.5" /> Add Step
                </button>
              </div>

              {/* Tips */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tips</label>
                <div className="space-y-1.5">
                  {exForm.tips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}.</span>
                      <input type="text" value={tip}
                        onChange={e => { const t = [...exForm.tips]; t[i] = e.target.value; setExForm(f => ({ ...f, tips: t })); }}
                        placeholder={`Tip ${i + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <button type="button" onClick={() => { const t = exForm.tips.filter((_, idx) => idx !== i); setExForm(f => ({ ...f, tips: t.length ? t : [''] })); }}
                        className="text-red-400 hover:text-red-600"><FaTimes className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setExForm(f => ({ ...f, tips: [...f.tips, ''] }))}
                  className="mt-1 text-xs font-medium flex items-center gap-1 hover:opacity-80" style={{ color: '#006CB5' }}>
                  <FaPlus className="w-2.5 h-2.5" /> Add Tip
                </button>
              </div>

              <div className="flex gap-2 pt-1 flex-col">
                {saving && uploadProgress > 0 && (
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{uploadProgress < 100 ? 'Uploading...' : 'Processing...'}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%`, backgroundColor: '#006CB5' }} />
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-sm font-semibold shadow transition hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: '#006CB5' }}>
                    {saving ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" /> : <FaSave className="w-3.5 h-3.5" />}
                    {saving ? (uploadProgress > 0 ? `${uploadProgress}%` : 'Saving...') : editingEx ? 'Update' : 'Save'}
                  </button>
                  <button type="button" onClick={closeExForm} disabled={saving} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-40">Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ── */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0">
              <h2 className="text-base font-bold text-gray-900">Exercise Details</h2>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
              <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                {viewItem.image
                  ? <img src={getImageUrl(viewItem.image)} alt={viewItem.name} className="w-full h-full object-cover" />
                  : <div className="text-gray-400 flex flex-col items-center"><FaImage size={28} /><span className="text-xs mt-1">No image</span></div>}
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  ['Name', viewItem.name],
                  ['Belt', viewItem.beltName || '—'],
                  ['Section', SECTION_LABELS[viewItem.section]],
                  ['Equipment', EQUIPMENT_LABELS[viewItem.equipment]],
                  ['Level', viewItem.level || '—'],
                  ['Video', viewItem.videoUrl ? '✅ Uploaded' : '❌ Not uploaded'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              {viewItem.steps?.filter(s => s).length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Steps ({viewItem.steps.filter(s => s).length})</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {viewItem.steps.filter(s => s).map((s, i) => <li key={i} className="text-sm text-gray-600">{s}</li>)}
                  </ol>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No steps added</p>
              )}
              {viewItem.tips?.filter(t => t).length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Tips ({viewItem.tips.filter(t => t).length})</p>
                  <ul className="list-disc list-inside space-y-1">
                    {viewItem.tips.filter(t => t).map((t, i) => <li key={i} className="text-sm text-gray-600">{t}</li>)}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No tips added</p>
              )}
              <button onClick={() => setViewItem(null)}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: '#006CB5' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
