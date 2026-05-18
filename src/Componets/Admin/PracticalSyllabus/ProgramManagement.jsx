import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders, getAuthHeadersMultipart } from '../../../config/api';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage, FaEye } from 'react-icons/fa';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';
const SECTIONS = ['warmUp', 'training', 'stretching'];
const SECTION_LABELS = { warmUp: 'Warm-Up', training: 'Training', stretching: 'Stretching' };
const EQUIPMENT_LABELS = { chair: 'With Chair', noChair: 'No Chair' };
const LEVELS = ['Easy', 'Advance', 'Master'];
const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BASE_URL}/${img.replace(/^\//, '')}`;
};

const PAGE_SIZE = 10;
const EMPTY_PROG = { title: '', category: '' };

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex gap-1 items-center justify-between mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-sm font-medium border transition disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ borderColor: '#006CB5', color: page === 1 ? '#006CB5' : '#006CB5' }}
      >
        Previous
      </button>
      <div className="flex gap-1">
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="w-8 h-8 rounded-lg text-sm font-medium transition"
            style={
              p === page
                ? { backgroundColor: '#006CB5', color: '#fff' }
                : { border: '1px solid #d1d5db', color: '#374151' }
            }
          >
            {p}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm font-medium border transition disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ borderColor: '#006CB5', color: '#006CB5' }}
      >
        Next
      </button>
    </div>
  );
}

export default function ProgramManagement() {
  const [activeTab, setActiveTab] = useState('programs');
  const [programs, setPrograms] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Program form
  const [showProgForm, setShowProgForm] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [progForm, setProgForm] = useState(EMPTY_PROG);
  const [progImageFile, setProgImageFile] = useState(null);
  const [progImagePreview, setProgImagePreview] = useState(null);

  // Exercise form
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [filterLevel, setFilterLevel] = useState('All');
  const [viewItem, setViewItem] = useState(null);

  // Search & pagination
  const [progSearch, setProgSearch] = useState('');
  const [progPage, setProgPage] = useState(1);
  const [exSearch, setExSearch] = useState('');
  const [exPage, setExPage] = useState(1);

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

  // ── Exercise filter ───────────────────────────────────────────────────────────

  const filteredExercises = exercises.filter(ex => {
    // Program filter — support both legacy and new arrays
    const exTitles = Array.isArray(ex.programTitles) && ex.programTitles.length
      ? ex.programTitles : (ex.programTitle ? [ex.programTitle] : []);
    const matchProg = filterProgram === 'All' || exTitles.includes(filterProgram);
    const matchSection = filterSection === 'All' || ex.section === filterSection;
    const exLevels = Array.isArray(ex.level) ? ex.level : (ex.level ? [ex.level] : []);
    const matchLevel = filterLevel === 'All' || exLevels.length === 0 || exLevels.includes(filterLevel);
    const matchSearch = !exSearch.trim() ||
      ex.name?.toLowerCase().includes(exSearch.toLowerCase()) ||
      exTitles.some(t => t.toLowerCase().includes(exSearch.toLowerCase()));
    return matchProg && matchSection && matchLevel && matchSearch;
  });

  // Programs search + pagination
  const filteredPrograms = programs.filter(p =>
    !progSearch.trim() ||
    p.title?.toLowerCase().includes(progSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(progSearch.toLowerCase())
  );
  const progTotalPages = Math.max(1, Math.ceil(filteredPrograms.length / PAGE_SIZE));
  const progPageSafe = Math.min(progPage, progTotalPages);
  const progStart = (progPageSafe - 1) * PAGE_SIZE;
  const progPageItems = filteredPrograms.slice(progStart, progStart + PAGE_SIZE);

  // Exercises pagination
  const exTotalPages = Math.max(1, Math.ceil(filteredExercises.length / PAGE_SIZE));
  const exPageSafe = Math.min(exPage, exTotalPages);
  const exStart = (exPageSafe - 1) * PAGE_SIZE;
  const exPageItems = filteredExercises.slice(exStart, exStart + PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage training programs and their exercises shown in the mobile app</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openAddProg} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm shadow transition hover:opacity-90" style={{ backgroundColor: '#006CB5' }}>
            <FaPlus className="w-3 h-3" /> Add Program
          </button>
        </div>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error && !showProgForm && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

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
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              value={progSearch}
              onChange={e => { setProgSearch(e.target.value); setProgPage(1); }}
              placeholder="Search..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full max-w-xs"
            />
          </div>
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No programs found.</div>
          ) : (
            <>
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
                  {progPageItems.map((prog, idx) => (
                    <tr key={prog._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500">{progStart + idx + 1}</td>
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
              <div className="px-4 pb-4">
                <div className="text-xs text-gray-500 mt-3">
                  Showing {filteredPrograms.length === 0 ? 0 : progStart + 1}–{Math.min(progStart + PAGE_SIZE, filteredPrograms.length)} of {filteredPrograms.length}
                </div>
                <Pagination page={progPageSafe} totalPages={progTotalPages} onPageChange={setProgPage} />
              </div>
            </>
          )}
        </div>
      ) : (
        /* ── EXERCISES TAB ── */
        <div>
          {/* Search + Filters row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={exSearch}
                onChange={e => { setExSearch(e.target.value); setExPage(1); }}
                placeholder="Search..."
                className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <select value={filterProgram} onChange={e => { setFilterProgram(e.target.value); setExPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="All">All Programs</option>
              {programs.map(p => <option key={p._id} value={p.title}>{p.title}</option>)}
            </select>
            <select value={filterSection} onChange={e => { setFilterSection(e.target.value); setExPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="All">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>{SECTION_LABELS[s]}</option>)}
            </select>
            <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setExPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="All">All Levels</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          {filteredExercises.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              {exSearch || filterProgram !== 'All' || filterSection !== 'All' || filterLevel !== 'All'
                ? 'No exercises match your search/filters.'
                : 'No exercises yet. Add them from Techniques & Kicks → assign a Program in the form.'}
            </div>
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
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 w-20">View</th>
                  </tr>
                </thead>
                <tbody>
                  {exPageItems.map((ex, idx) => (
                    <tr key={ex._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500">{exStart + idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          {ex.image ? <img src={getImageUrl(ex.image)} alt={ex.name} className="w-full h-full object-cover" /> : <FaImage className="w-4 h-4 text-gray-300" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{ex.name}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const titles = Array.isArray(ex.programTitles) && ex.programTitles.length
                            ? ex.programTitles
                            : (ex.programTitle ? [ex.programTitle] : []);
                          return titles.length ? (
                            <div className="flex flex-wrap gap-1">
                              {titles.map(t => <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{t}</span>)}
                            </div>
                          ) : <span className="text-gray-300 text-xs">—</span>;
                        })()}
                      </td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ex.section === 'warmUp' ? 'bg-orange-50 text-orange-700' : ex.section === 'training' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{SECTION_LABELS[ex.section]}</span></td>
                      <td className="px-4 py-3 text-gray-500">{EQUIPMENT_LABELS[ex.equipment]}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const lvls = Array.isArray(ex.level) ? ex.level : (ex.level ? [ex.level] : []);
                          return lvls.length ? (
                            <div className="flex flex-wrap gap-1">
                              {lvls.map(l => (
                                <span key={l} className={`px-2 py-0.5 rounded-full text-xs font-medium ${l === 'Easy' ? 'bg-green-50 text-green-700' : l === 'Advance' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{l}</span>
                              ))}
                            </div>
                          ) : <span className="text-gray-300 text-xs">—</span>;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <button onClick={() => setViewItem(ex)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-200 text-green-600 hover:bg-green-50 transition"><FaEye className="w-3 h-3" /> View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 pb-4">
                <div className="text-xs text-gray-500 mt-3">
                  Showing {filteredExercises.length === 0 ? 0 : exStart + 1}–{Math.min(exStart + PAGE_SIZE, filteredExercises.length)} of {filteredExercises.length}
                </div>
                <Pagination page={exPageSafe} totalPages={exTotalPages} onPageChange={setExPage} />
              </div>
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
                  ['Program', (() => { const t = Array.isArray(viewItem.programTitles) && viewItem.programTitles.length ? viewItem.programTitles : (viewItem.programTitle ? [viewItem.programTitle] : []); return t.length ? t.join(', ') : '—'; })()],
                  ['Section', SECTION_LABELS[viewItem.section]],
                  ['Equipment', EQUIPMENT_LABELS[viewItem.equipment]],
                  ['Level', (() => { const lvls = Array.isArray(viewItem.level) ? viewItem.level : (viewItem.level ? [viewItem.level] : []); return lvls.length ? lvls.join(', ') : '—'; })()],
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
