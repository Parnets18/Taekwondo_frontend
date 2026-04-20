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

const EMPTY_PROG = { title: '', category: '' };
const EMPTY_EX = { name: '', section: 'warmUp', equipment: 'chair', level: 'Easy', programId: '', programTitle: '', videoFile: null, videoName: '', steps: [''], tips: [''] };

export default function ProgramManagement() {
  const [activeTab, setActiveTab] = useState('programs');
  const [programs, setPrograms] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Program form
  const [showProgForm, setShowProgForm] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [progForm, setProgForm] = useState(EMPTY_PROG);
  const [progImageFile, setProgImageFile] = useState(null);
  const [progImagePreview, setProgImagePreview] = useState(null);

  // Exercise form
  const [showExForm, setShowExForm] = useState(false);
  const [editingEx, setEditingEx] = useState(null);
  const [exForm, setExForm] = useState(EMPTY_EX);
  const [exImageFile, setExImageFile] = useState(null);
  const [exImagePreview, setExImagePreview] = useState(null);
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [progRes, exRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/programs`),
        axios.get(`${API_BASE_URL}/programs/exercises/all`),
      ]);
      const freshExercises = exRes.data?.data?.exercises || [];
      setPrograms(progRes.data?.data?.programs || []);
      setExercises(freshExercises);
      setViewItem(v => v ? (freshExercises.find(e => e._id === v._id) || v) : null);
    } catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  };

  // ── Program CRUD ──────────────────────────────────────────────────────────────
  const openAddProg = () => { setEditingProg(null); setProgForm(EMPTY_PROG); setProgImageFile(null); setProgImagePreview(null); setError(''); setShowProgForm(true); };
  const openEditProg = (p) => { setEditingProg(p); setProgForm({ title: p.title, category: p.category }); setProgImagePreview(p.image ? getImageUrl(p.image) : null); setProgImageFile(null); setError(''); setShowProgForm(true); };
  const closeProgForm = () => { setShowProgForm(false); setEditingProg(null); setProgForm(EMPTY_PROG); setProgImageFile(null); setProgImagePreview(null); setError(''); };

  const handleProgImageChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setProgImageFile(file);
    const r = new FileReader(); r.onloadend = () => setProgImagePreview(r.result); r.readAsDataURL(file);
  };

  const saveProg = async (e) => {
    e.preventDefault();
    if (!progForm.title.trim()) return setError('Title is required.');
    if (!progForm.category.trim()) return setError('Category is required.');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(progForm).forEach(([k, v]) => fd.append(k, v));
      if (progImageFile) fd.append('image', progImageFile);
      if (editingProg) {
        await axios.put(`${API_BASE_URL}/programs/${editingProg._id}`, fd, { headers: getAuthHeadersMultipart() });
        setSuccess('Program updated.');
      } else {
        await axios.post(`${API_BASE_URL}/programs`, fd, { headers: getAuthHeadersMultipart() });
        setSuccess('Program created.');
      }
      await fetchAll(); closeProgForm();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save program.'); }
    finally { setSaving(false); }
  };

  const deleteProg = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try { await axios.delete(`${API_BASE_URL}/programs/${p._id}`, { headers: getAuthHeaders() }); setSuccess('Program deleted.'); fetchAll(); }
    catch { setError('Failed to delete.'); }
  };

  // ── Exercise CRUD ─────────────────────────────────────────────────────────────
  const openAddEx = (programId = '', programTitle = '') => { setEditingEx(null); setExForm({ ...EMPTY_EX, programId, programTitle }); setExImageFile(null); setExImagePreview(null); setError(''); setShowExForm(true); };
  const openEditEx = (ex) => {
    setEditingEx(ex);
    setExForm({ name: ex.name, section: ex.section, equipment: ex.equipment, level: ex.level || 'Easy', programId: ex.programId || '', programTitle: ex.programTitle || '', videoFile: null, videoName: ex.videoUrl ? 'Existing video' : '', steps: ex.steps?.length ? ex.steps : [''], tips: ex.tips?.length ? ex.tips : [''] });
    setExImagePreview(ex.image ? getImageUrl(ex.image) : null); setExImageFile(null); setError(''); setShowExForm(true);
  };
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
      fd.append('name', exForm.name);
      fd.append('section', exForm.section);
      fd.append('equipment', exForm.equipment);
      fd.append('level', exForm.level || 'Easy');
      fd.append('programId', exForm.programId || '');
      fd.append('programTitle', exForm.programTitle || '');
      fd.append('stepsJson', JSON.stringify(exForm.steps.filter(s => s?.trim())));
      fd.append('tipsJson', JSON.stringify(exForm.tips.filter(t => t?.trim())));
      if (exImageFile) fd.append('image', exImageFile);
      if (exForm.videoFile) fd.append('video', exForm.videoFile);

      const opts = { headers: getAuthHeadersMultipart(), timeout: 5 * 60 * 1000, onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)) };
      if (editingEx) {
        await axios.put(`${API_BASE_URL}/programs/exercises/${editingEx._id}`, fd, opts);
        setSuccess('Exercise updated.');
      } else {
        await axios.post(`${API_BASE_URL}/programs/exercises`, fd, opts);
        setSuccess('Exercise created.');
      }
      setUploadProgress(0); await fetchAll(); closeExForm();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save exercise.'); }
    finally { setSaving(false); }
  };

  const deleteEx = async (ex) => {
    if (!window.confirm(`Delete "${ex.name}"?`)) return;
    try { await axios.delete(`${API_BASE_URL}/programs/exercises/${ex._id}`, { headers: getAuthHeaders() }); setSuccess('Exercise deleted.'); fetchAll(); }
    catch { setError('Failed to delete.'); }
  };

  const filteredExercises = exercises.filter(ex => {
    const matchProg = filterProgram === 'All' || ex.programTitle === filterProgram;
    const matchSection = filterSection === 'All' || ex.section === filterSection;
    return matchProg && matchSection;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage training programs and their exercises shown in the mobile app</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'programs' ? (
            <>
              <button onClick={() => openAddEx()} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition hover:opacity-80" style={{ borderColor: '#006CB5', color: '#006CB5' }}>
                <FaPlus className="w-3 h-3" /> Add Exercise
              </button>
              <button onClick={openAddProg} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm shadow transition hover:opacity-90" style={{ backgroundColor: '#006CB5' }}>
                <FaPlus className="w-3 h-3" /> Add Program
              </button>
            </>
          ) : (
            <button onClick={() => openAddEx()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm shadow transition hover:opacity-90" style={{ backgroundColor: '#006CB5' }}>
              <FaPlus className="w-3 h-3" /> Add Exercise
            </button>
          )}
        </div>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error && !showProgForm && !showExForm && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[['programs', `Programs (${programs.length})`], ['exercises', `Exercises (${exercises.length})`]].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>
      ) : activeTab === 'programs' ? (
        /* ── PROGRAMS TAB ── */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {programs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No programs yet. Click "Add Program" to start.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-10">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-20">Image</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 w-36">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((prog, idx) => (
                  <tr key={prog._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                        {prog.image ? <img src={getImageUrl(prog.image)} alt={prog.title} className="w-full h-full object-cover" /> : <FaImage className="w-4 h-4 text-gray-300" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{prog.title}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{prog.category}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditProg(prog)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition"><FaEdit className="w-3 h-3" /> Edit</button>
                        <button onClick={() => deleteProg(prog)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition"><FaTrash className="w-3 h-3" /> Delete</button>
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
        {/* Filters removed */}
          {filteredExercises.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">No exercises yet. Click "Add Exercise" to start.</div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-10">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-16">Image</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Program</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Section</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Equipment</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Level</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 w-32">Actions</th>
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
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{ex.programTitle || '—'}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ex.section === 'warmUp' ? 'bg-orange-50 text-orange-700' : ex.section === 'training' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{SECTION_LABELS[ex.section]}</span></td>
                      <td className="px-4 py-3 text-gray-500">{EQUIPMENT_LABELS[ex.equipment]}</td>
                      <td className="px-4 py-3 text-gray-500">{ex.level}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setViewItem(ex)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-200 text-green-600 hover:bg-green-50 transition"><FaEye className="w-3 h-3" /> View</button>
                          <button onClick={() => openEditEx(ex)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition"><FaEdit className="w-3 h-3" /> Edit</button>
                          <button onClick={() => deleteEx(ex)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition"><FaTrash className="w-3 h-3" /> Delete</button>
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

      {/* ── PROGRAM FORM MODAL ── */}
      {showProgForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editingProg ? 'Edit Program' : 'Add Program'}</h2>
              <button onClick={closeProgForm} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={saveProg} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Program Image</label>
                <div className="flex items-start gap-4">
                  <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 transition flex-shrink-0" onClick={() => document.getElementById('prog-img-input').click()}>
                    {progImagePreview ? <img src={progImagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" /> : <div className="text-center text-gray-400"><FaImage className="w-7 h-7 mx-auto mb-1" /><span className="text-xs">Click to upload</span></div>}
                  </div>
                  <div>
                    <input id="prog-img-input" type="file" accept="image/*" className="hidden" onChange={handleProgImageChange} />
                    <button type="button" onClick={() => document.getElementById('prog-img-input').click()} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Choose Image</button>
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" value={progForm.title} onChange={e => setProgForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Basic Kicks" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <input type="text" value={progForm.category} onChange={e => setProgForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Taekwondo Kicks" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold shadow transition hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: '#006CB5' }}>
                  <FaSave className="w-4 h-4" /> {saving ? 'Saving...' : editingProg ? 'Update' : 'Save'}
                </button>
                <button type="button" onClick={closeProgForm} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
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
              {uploadProgress > 0 && uploadProgress < 100 && <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%`, backgroundColor: '#006CB5' }} /></div>}
              {/* Image + Name */}
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 transition flex-shrink-0" onClick={() => document.getElementById('ex-img-input').click()}>
                  {exImagePreview ? <img src={exImagePreview} alt="preview" className="w-full h-full object-cover rounded-lg" /> : <div className="text-center text-gray-400"><FaImage className="w-5 h-5 mx-auto mb-0.5" /><span className="text-xs">Image</span></div>}
                </div>
                <div className="flex-1">
                  <input id="ex-img-input" type="file" accept="image/*" className="hidden" onChange={handleExImageChange} />
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Exercise Name <span className="text-red-500">*</span></label>
                  <input type="text" value={exForm.name} onChange={e => setExForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Front Kick" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <button type="button" onClick={() => document.getElementById('ex-img-input').click()} className="mt-1 text-xs text-blue-500 hover:underline">Change image</button>
                </div>
              </div>
              {/* Program + Section + Equipment + Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Program</label>
                  <select value={exForm.programId} onChange={e => { const p = programs.find(p => p._id === e.target.value); setExForm(f => ({ ...f, programId: e.target.value, programTitle: p?.title || '' })); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    <option value="">Select program</option>
                    {programs.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
                  <select value={exForm.section} onChange={e => setExForm(f => ({ ...f, section: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    {SECTIONS.map(s => <option key={s} value={s}>{SECTION_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Equipment</label>
                  <select value={exForm.equipment} onChange={e => setExForm(f => ({ ...f, equipment: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    {EQUIPMENT.map(eq => <option key={eq} value={eq}>{EQUIPMENT_LABELS[eq]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Level</label>
                  <select value={exForm.level} onChange={e => setExForm(f => ({ ...f, level: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              {/* Video */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition cursor-pointer">
                  <span>🎬</span>{exForm.videoName ? 'Change Video' : 'Upload Video'}
                  <input type="file" accept="video/*" className="hidden" onChange={e => { const file = e.target.files[0]; if (!file) return; setExForm(f => ({ ...f, videoFile: file, videoName: file.name })); }} />
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
                      <input type="text" value={step} onChange={e => { const s = [...exForm.steps]; s[i] = e.target.value; setExForm(f => ({ ...f, steps: s })); }} placeholder={`Step ${i + 1}`} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <button type="button" onClick={() => { const s = exForm.steps.filter((_, idx) => idx !== i); setExForm(f => ({ ...f, steps: s.length ? s : [''] })); }} className="text-red-400 hover:text-red-600"><FaTimes className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setExForm(f => ({ ...f, steps: [...f.steps, ''] }))} className="mt-1 text-xs font-medium flex items-center gap-1 hover:opacity-80" style={{ color: '#006CB5' }}><FaPlus className="w-2.5 h-2.5" /> Add Step</button>
              </div>
              {/* Tips */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tips</label>
                <div className="space-y-1.5">
                  {exForm.tips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}.</span>
                      <input type="text" value={tip} onChange={e => { const t = [...exForm.tips]; t[i] = e.target.value; setExForm(f => ({ ...f, tips: t })); }} placeholder={`Tip ${i + 1}`} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <button type="button" onClick={() => { const t = exForm.tips.filter((_, idx) => idx !== i); setExForm(f => ({ ...f, tips: t.length ? t : [''] })); }} className="text-red-400 hover:text-red-600"><FaTimes className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setExForm(f => ({ ...f, tips: [...f.tips, ''] }))} className="mt-1 text-xs font-medium flex items-center gap-1 hover:opacity-80" style={{ color: '#006CB5' }}><FaPlus className="w-2.5 h-2.5" /> Add Tip</button>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold shadow transition hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: '#006CB5' }}>
                  <FaSave className="w-4 h-4" /> {saving ? 'Saving...' : editingEx ? 'Update' : 'Save'}
                </button>
                <button type="button" onClick={closeExForm} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
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
                  ['Program', viewItem.programTitle || '—'],
                  ['Section', SECTION_LABELS[viewItem.section]],
                  ['Equipment', EQUIPMENT_LABELS[viewItem.equipment]],
                  ['Level', viewItem.level || '—'],
                  ['Video', viewItem.videoUrl ? '✅ Uploaded' : '❌ Not uploaded'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2">
                    <span className="text-sm text-gray-500 font-medium">{label}</span>
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
