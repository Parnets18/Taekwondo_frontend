import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders, getAuthHeadersMultipart } from '../../../config/api';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage, FaChevronDown, FaChevronUp, FaVideo } from 'react-icons/fa';

const SECTIONS = ['warmUp', 'stretching'];
const SECTION_LABELS = { warmUp: 'Warm-Up', training: 'Training', stretching: 'Stretching' };
const EQUIPMENT_OPTIONS = [
  { value: 'chair', label: 'With Chair' },
  { value: 'noChair', label: 'No Chair' },
];
const LEVELS = ['Easy', 'Advance', 'Master'];

const EMPTY_EXERCISE = {
  name: '',
  section: 'warmUp',
  equipment: 'chair',
  level: [],
  beltNames: [],
  programIds: [],
  programTitles: [],
  steps: [''],
  tips: [''],
};

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';
const getMediaUrl = (p) => {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  return `${BASE_URL}/${p.replace(/^\//, '')}`;
};

const PAGE_SIZE = 10;

function Pagination({ page, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (totalPages <= 1 && total <= PAGE_SIZE) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="flex gap-1 items-center justify-between mt-4">
      <span className="text-xs text-gray-500">
        Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
      </span>
      <div className="flex gap-1 items-center">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
          style={{ borderColor: '#006CB5', color: '#006CB5' }}
        >
          Previous
        </button>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
            style={
              p === page
                ? { backgroundColor: '#006CB5', color: '#fff', borderColor: '#006CB5' }
                : { borderColor: '#006CB5', color: '#006CB5' }
            }
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
          style={{ borderColor: '#006CB5', color: '#006CB5' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

const EMPTY_TECHNIQUE = {
  name: '',
  category: '',
  difficulty: 'Easy',
  beltNames: [],
  programIds: [],
  programTitles: [],
  videoUrl: '',
  steps: [''],
  tips: [''],
  image: null,
};

const DIFFICULTIES = ['Easy', 'Advance', 'Master'];

export default function TechniquesManagement() {
  const [categories, setCategories] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [belts, setBelts] = useState([]);
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
  const [showTechProgramDropdown, setShowTechProgramDropdown] = useState(false);
  const [showTechBeltDropdown, setShowTechBeltDropdown] = useState(false);
  const techProgramDropdownRef = useRef(null);
  const techBeltDropdownRef = useRef(null);

  // UI state
  const [activeTab, setActiveTab] = useState('techniques'); // 'categories' | 'techniques'
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterTechProgram, setFilterTechProgram] = useState('All');
  const [expandedCats, setExpandedCats] = useState({});

  // Search + pagination state
  const [catSearch, setCatSearch] = useState('');
  const [catPage, setCatPage] = useState(1);
  const [techSearch, setTechSearch] = useState('');
  const [techPage, setTechPage] = useState(1);
  const [techFilterBelt, setTechFilterBelt] = useState('All');
  const [techFilterLevel, setTechFilterLevel] = useState('All');
  const [warmupSearch, setWarmupSearch] = useState('');
  const [warmupPage, setWarmupPage] = useState(1);
  const [warmupFilterBelt, setWarmupFilterBelt] = useState('All');
  const [warmupFilterProgram, setWarmupFilterProgram] = useState('All');
  const [warmupFilterLevel, setWarmupFilterLevel] = useState('All');
  const [stretchSearch, setStretchSearch] = useState('');
  const [stretchPage, setStretchPage] = useState(1);
  const [stretchFilterBelt, setStretchFilterBelt] = useState('All');
  const [stretchFilterProgram, setStretchFilterProgram] = useState('All');
  const [stretchFilterLevel, setStretchFilterLevel] = useState('All');

  // Exercise (warmup / stretching) state
  const [exercises, setExercises] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showExForm, setShowExForm] = useState(false);
  const [editingEx, setEditingEx] = useState(null);
  const [exForm, setExForm] = useState(EMPTY_EXERCISE);
  const [exImageFile, setExImageFile] = useState(null);
  const [exImagePreview, setExImagePreview] = useState(null);
  const [exVideoFile, setExVideoFile] = useState(null);
  const [exVideoName, setExVideoName] = useState('');
  const [exUploadProgress, setExUploadProgress] = useState(0);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showBeltDropdown, setShowBeltDropdown] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const levelDropdownRef = useRef(null);
  const beltDropdownRef = useRef(null);
  const programDropdownRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(e.target)) setShowLevelDropdown(false);
      if (beltDropdownRef.current && !beltDropdownRef.current.contains(e.target)) setShowBeltDropdown(false);
      if (programDropdownRef.current && !programDropdownRef.current.contains(e.target)) setShowProgramDropdown(false);
      if (techProgramDropdownRef.current && !techProgramDropdownRef.current.contains(e.target)) setShowTechProgramDropdown(false);
      if (techBeltDropdownRef.current && !techBeltDropdownRef.current.contains(e.target)) setShowTechBeltDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [catRes, techRes, beltRes, exRes, progRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/techniques/categories`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/techniques`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/belt-content`),
        axios.get(`${API_BASE_URL}/exercises`),
        axios.get(`${API_BASE_URL}/programs`),
      ]);
      setCategories(catRes.data || []);
      setTechniques(techRes.data || []);
      setBelts(beltRes.data?.data?.belts || []);
      setExercises(exRes.data?.data?.exercises || []);
      setPrograms(progRes.data?.data?.programs || []);
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
      beltNames: Array.isArray(tech.beltNames) && tech.beltNames.length ? tech.beltNames : (tech.beltName ? [tech.beltName] : []),
      programIds: Array.isArray(tech.programIds) && tech.programIds.length ? tech.programIds : (tech.programId ? [tech.programId] : []),
      programTitles: Array.isArray(tech.programTitles) && tech.programTitles.length ? tech.programTitles : (tech.programTitle ? [tech.programTitle] : []),
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
      data.append('beltNamesJson', JSON.stringify(form.beltNames || []));
      data.append('programIdsJson', JSON.stringify(form.programIds || []));
      data.append('programTitlesJson', JSON.stringify(form.programTitles || []));
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

  // ── EXERCISE (WARMUP / STRETCHING) CRUD ───────────────────
  const openAddEx = (section = 'warmUp') => {
    setEditingEx(null);
    setExForm({ ...EMPTY_EXERCISE, section });
    setExImageFile(null); setExImagePreview(null);
    setExVideoFile(null); setExVideoName('');
    setExUploadProgress(0);
    setShowExForm(true); setError('');
  };

  const openEditEx = (ex) => {
    setEditingEx(ex);
    setExForm({
      name: ex.name || '',
      section: ex.section || 'warmUp',
      equipment: ex.equipment || 'chair',
      level: Array.isArray(ex.level) ? ex.level : (ex.level ? [ex.level] : []),
      beltNames: Array.isArray(ex.beltNames) && ex.beltNames.length ? ex.beltNames : (ex.beltName ? [ex.beltName] : []),
      programIds: Array.isArray(ex.programIds) && ex.programIds.length ? ex.programIds : (ex.programId ? [ex.programId] : []),
      programTitles: Array.isArray(ex.programTitles) && ex.programTitles.length ? ex.programTitles : (ex.programTitle ? [ex.programTitle] : []),
      steps: ex.steps?.length ? ex.steps : [''],
      tips: ex.tips?.length ? ex.tips : [''],
    });
    setExImagePreview(ex.image ? getMediaUrl(ex.image) : null);
    setExImageFile(null);
    setExVideoFile(null);
    setExVideoName(ex.videoUrl ? 'Existing video uploaded' : '');
    setExUploadProgress(0);
    setShowExForm(true); setError('');
  };

  const closeExForm = () => {
    setShowExForm(false); setEditingEx(null);
    setExForm(EMPTY_EXERCISE); setExImageFile(null); setExImagePreview(null);
    setExVideoFile(null); setExVideoName(''); setExUploadProgress(0); setError('');
  };

  const handleExImageChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setExImageFile(file);
    setExImagePreview(URL.createObjectURL(file));
  };

  const toggleLevel = (lvl) => {
    setExForm(f => ({
      ...f,
      level: f.level.includes(lvl) ? f.level.filter(l => l !== lvl) : [...f.level, lvl],
    }));
  };

  const toggleBeltName = (name) => {
    setExForm(f => ({
      ...f,
      beltNames: f.beltNames.includes(name) ? f.beltNames.filter(b => b !== name) : [...f.beltNames, name],
    }));
  };

  const toggleProgram = (prog) => {
    setExForm(f => {
      const ids = f.programIds || [];
      const titles = f.programTitles || [];
      if (ids.includes(prog._id)) {
        return { ...f, programIds: ids.filter(id => id !== prog._id), programTitles: titles.filter(t => t !== prog.title) };
      }
      return { ...f, programIds: [...ids, prog._id], programTitles: [...titles, prog.title] };
    });
  };

  const toggleTechProgram = (prog) => {
    setForm(f => {
      const ids = f.programIds || [];
      const titles = f.programTitles || [];
      if (ids.includes(prog._id)) {
        return { ...f, programIds: ids.filter(id => id !== prog._id), programTitles: titles.filter(t => t !== prog.title) };
      }
      return { ...f, programIds: [...ids, prog._id], programTitles: [...titles, prog.title] };
    });
  };

  const toggleTechBelt = (beltName) => {
    setForm(f => {
      const current = f.beltNames || [];
      return {
        ...f,
        beltNames: current.includes(beltName) ? current.filter(b => b !== beltName) : [...current, beltName],
      };
    });
  };

  const updateExList = (field, index, value) => {
    const updated = [...exForm[field]];
    updated[index] = value;
    setExForm({ ...exForm, [field]: updated });
  };

  const addExListItem = (field) => setExForm({ ...exForm, [field]: [...exForm[field], ''] });

  const removeExListItem = (field, index) => {
    const updated = exForm[field].filter((_, i) => i !== index);
    setExForm({ ...exForm, [field]: updated.length ? updated : [''] });
  };

  const saveEx = async (e) => {
    e.preventDefault();
    if (!exForm.name.trim()) return setError('Exercise name is required.');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', exForm.name);
      fd.append('section', exForm.section);
      fd.append('equipment', exForm.equipment);
      fd.append('levelJson', JSON.stringify(exForm.level));
      fd.append('beltNamesJson', JSON.stringify(exForm.beltNames));
      fd.append('programIdsJson', JSON.stringify(exForm.programIds || []));
      fd.append('programTitlesJson', JSON.stringify(exForm.programTitles || []));
      fd.append('stepsJson', JSON.stringify(exForm.steps.filter(s => s.trim())));
      fd.append('tipsJson', JSON.stringify(exForm.tips.filter(t => t.trim())));
      if (exImageFile) fd.append('image', exImageFile);
      if (exVideoFile) fd.append('video', exVideoFile);

      if (editingEx) {
        await axios.put(`${API_BASE_URL}/exercises/${editingEx._id}`, fd, {
          headers: getAuthHeadersMultipart(),
          timeout: 5 * 60 * 1000,
          onUploadProgress: (ev) => setExUploadProgress(Math.round((ev.loaded * 100) / ev.total)),
        });
        setSuccess('Exercise updated.');
      } else {
        await axios.post(`${API_BASE_URL}/exercises`, fd, {
          headers: getAuthHeadersMultipart(),
          timeout: 5 * 60 * 1000,
          onUploadProgress: (ev) => setExUploadProgress(Math.round((ev.loaded * 100) / ev.total)),
        });
        setSuccess('Exercise created.');
      }
      setExUploadProgress(0);
      await fetchAll();
      closeExForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exercise.');
    } finally {
      setSaving(false);
    }
  };

  const deleteEx = async (ex) => {
    if (!window.confirm(`Delete "${ex.name}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/exercises/${ex._id}`, { headers: getAuthHeaders() });
      setSuccess('Exercise deleted.');
      fetchAll();
    } catch { setError('Failed to delete.'); }
  };

  // ── FILTERED TECHNIQUES ────────────────────────────────────
  const filteredTechniques = (filterCategory === 'All'
    ? techniques
    : techniques.filter(t => t.category === filterCategory)
  ).filter(t => {
    const matchProgram = filterTechProgram === 'All' ||
      (Array.isArray(t.programTitles) && t.programTitles.includes(filterTechProgram)) ||
      t.programTitle === filterTechProgram;
    const tBelts = Array.isArray(t.beltNames) && t.beltNames.length ? t.beltNames : (t.beltName ? [t.beltName] : []);
    const matchBelt = techFilterBelt === 'All' || tBelts.includes(techFilterBelt);
    const matchLevel = techFilterLevel === 'All' || t.difficulty === techFilterLevel;
    const matchSearch = techSearch.trim() === '' ||
      t.name?.toLowerCase().includes(techSearch.trim().toLowerCase()) ||
      t.category?.toLowerCase().includes(techSearch.trim().toLowerCase());
    return matchProgram && matchBelt && matchLevel && matchSearch;
  });

  const techTotalPages = Math.ceil(filteredTechniques.length / PAGE_SIZE);
  const pagedTechniques = filteredTechniques.slice((techPage - 1) * PAGE_SIZE, techPage * PAGE_SIZE);

  const filteredCategories = categories.filter(cat =>
    catSearch.trim() === '' || cat.name?.toLowerCase().includes(catSearch.trim().toLowerCase())
  );
  const catTotalPages = Math.ceil(filteredCategories.length / PAGE_SIZE);
  const pagedCategories = filteredCategories.slice((catPage - 1) * PAGE_SIZE, catPage * PAGE_SIZE);

  const groupedByCategory = categories.map(cat => ({
    ...cat,
    techniques: techniques.filter(t => t.category === cat.name),
  }));

  // Warm-Up tab data
  const filteredWarmup = exercises.filter(e => {
    if (e.section !== 'warmUp') return false;
    const exBelts = Array.isArray(e.beltNames) && e.beltNames.length ? e.beltNames : (e.beltName ? [e.beltName] : []);
    const exLevels = Array.isArray(e.level) ? e.level : (e.level ? [e.level] : []);
    const exPrograms = Array.isArray(e.programTitles) && e.programTitles.length ? e.programTitles : (e.programTitle ? [e.programTitle] : []);
    return (warmupFilterBelt === 'All' || exBelts.includes(warmupFilterBelt)) &&
      (warmupFilterProgram === 'All' || exPrograms.includes(warmupFilterProgram)) &&
      (warmupFilterLevel === 'All' || exLevels.includes(warmupFilterLevel)) &&
      (warmupSearch.trim() === '' || e.name?.toLowerCase().includes(warmupSearch.trim().toLowerCase()));
  });
  const pagedWarmup = filteredWarmup.slice((warmupPage - 1) * PAGE_SIZE, warmupPage * PAGE_SIZE);

  // Stretching tab data
  const filteredStretch = exercises.filter(e => {
    if (e.section !== 'stretching') return false;
    const exBelts = Array.isArray(e.beltNames) && e.beltNames.length ? e.beltNames : (e.beltName ? [e.beltName] : []);
    const exLevels = Array.isArray(e.level) ? e.level : (e.level ? [e.level] : []);
    const exPrograms = Array.isArray(e.programTitles) && e.programTitles.length ? e.programTitles : (e.programTitle ? [e.programTitle] : []);
    return (stretchFilterBelt === 'All' || exBelts.includes(stretchFilterBelt)) &&
      (stretchFilterProgram === 'All' || exPrograms.includes(stretchFilterProgram)) &&
      (stretchFilterLevel === 'All' || exLevels.includes(stretchFilterLevel)) &&
      (stretchSearch.trim() === '' || e.name?.toLowerCase().includes(stretchSearch.trim().toLowerCase()));
  });
  const pagedStretch = filteredStretch.slice((stretchPage - 1) * PAGE_SIZE, stretchPage * PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Techniques Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage training techniques, warm-ups and stretching shown in the app</p>
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
            onClick={() => openAddEx('warmUp')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition hover:opacity-80"
            style={{ borderColor: '#f97316', color: '#f97316' }}
          >
            <FaPlus className="w-3 h-3" /> Add Warm-Up
          </button>
          <button
            onClick={() => openAddEx('stretching')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition hover:opacity-80"
            style={{ borderColor: '#10b981', color: '#10b981' }}
          >
            <FaPlus className="w-3 h-3" /> Add Stretching
          </button>
          <button
            onClick={() => openAddTech()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm shadow transition hover:opacity-90"
            style={{ backgroundColor: '#006CB5' }}
          >
            <FaPlus className="w-3 h-3" /> Add Training
          </button>
        </div>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error && !showCatForm && !showTechForm && !showExForm && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('techniques')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'techniques' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Training ({techniques.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'categories' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('warmup')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'warmup' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Warm-Up ({exercises.filter(e => e.section === 'warmUp').length})
        </button>
        <button
          onClick={() => setActiveTab('stretching')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'stretching' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Stretching ({exercises.filter(e => e.section === 'stretching').length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : activeTab === 'categories' ? (
        /* ── CATEGORIES TAB ── */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              value={catSearch}
              onChange={e => { setCatSearch(e.target.value); setCatPage(1); }}
              placeholder="Search..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full max-w-xs"
            />
          </div>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No categories found.</div>
          ) : (
            <>
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
                  {pagedCategories.map((cat, idx) => (
                    <tr key={cat._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500">{(catPage - 1) * PAGE_SIZE + idx + 1}</td>
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
              <div className="px-4 pb-4">
                <Pagination page={catPage} total={filteredCategories.length} onPageChange={setCatPage} />
              </div>
            </>
          )}
        </div>
      ) : activeTab === 'warmup' ? (
        /* ── WARM-UP TAB ── */
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select
              value={warmupFilterBelt}
              onChange={e => { setWarmupFilterBelt(e.target.value); setWarmupPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Belts</option>
              {belts.map(b => <option key={b._id} value={b.beltName}>{b.beltName}</option>)}
            </select>
            <select
              value={warmupFilterProgram}
              onChange={e => { setWarmupFilterProgram(e.target.value); setWarmupPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Programs</option>
              {programs.map(p => <option key={p._id} value={p.title}>{p.title}</option>)}
            </select>
            <select
              value={warmupFilterLevel}
              onChange={e => { setWarmupFilterLevel(e.target.value); setWarmupPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Levels</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input
              type="text"
              value={warmupSearch}
              onChange={e => { setWarmupSearch(e.target.value); setWarmupPage(1); }}
              placeholder="Search warm-ups..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm ml-auto"
            />
          </div>
          {filteredWarmup.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              {warmupSearch || warmupFilterBelt !== 'All' || warmupFilterProgram !== 'All' || warmupFilterLevel !== 'All'
                ? 'No warm-ups match your search/filters.'
                : 'No warm-ups found.'}
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
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Program</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Equipment</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Level</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedWarmup.map((ex, idx) => (
                    <tr key={ex._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500">{(warmupPage - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          {ex.image
                            ? <img src={getMediaUrl(ex.image)} alt={ex.name} className="w-full h-full object-cover" />
                            : <FaImage className="w-4 h-4 text-gray-300" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{ex.name}</td>
                      <td className="px-4 py-3">
                        {Array.isArray(ex.beltNames) && ex.beltNames.length
                          ? <div className="flex flex-wrap gap-1">{ex.beltNames.map(b => <span key={b} className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{b}</span>)}</div>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {Array.isArray(ex.programTitles) && ex.programTitles.length
                          ? <div className="flex flex-wrap gap-1">{ex.programTitles.map(p => <span key={p} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{p}</span>)}</div>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {ex.equipment === 'chair' ? 'With Chair' : ex.equipment === 'noChair' ? 'No Chair' : ex.equipment || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const lvls = Array.isArray(ex.level) ? ex.level : (ex.level ? [ex.level] : []);
                          return lvls.length
                            ? <div className="flex flex-wrap gap-1">{lvls.map(l => <span key={l} className={`px-2 py-0.5 rounded-full text-xs font-medium ${l === 'Easy' ? 'bg-green-50 text-green-700' : l === 'Advance' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{l}</span>)}</div>
                            : <span className="text-gray-300 text-xs">—</span>;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
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
              <div className="px-4 pb-4">
                <Pagination page={warmupPage} total={filteredWarmup.length} onPageChange={setWarmupPage} />
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'stretching' ? (
        /* ── STRETCHING TAB ── */
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select
              value={stretchFilterBelt}
              onChange={e => { setStretchFilterBelt(e.target.value); setStretchPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Belts</option>
              {belts.map(b => <option key={b._id} value={b.beltName}>{b.beltName}</option>)}
            </select>
            <select
              value={stretchFilterProgram}
              onChange={e => { setStretchFilterProgram(e.target.value); setStretchPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Programs</option>
              {programs.map(p => <option key={p._id} value={p.title}>{p.title}</option>)}
            </select>
            <select
              value={stretchFilterLevel}
              onChange={e => { setStretchFilterLevel(e.target.value); setStretchPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Levels</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input
              type="text"
              value={stretchSearch}
              onChange={e => { setStretchSearch(e.target.value); setStretchPage(1); }}
              placeholder="Search stretching..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm ml-auto"
            />
          </div>
          {filteredStretch.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              {stretchSearch || stretchFilterBelt !== 'All' || stretchFilterProgram !== 'All' || stretchFilterLevel !== 'All'
                ? 'No stretching exercises match your search/filters.'
                : 'No stretching exercises found.'}
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
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Program</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Equipment</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Level</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedStretch.map((ex, idx) => (
                    <tr key={ex._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500">{(stretchPage - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          {ex.image
                            ? <img src={getMediaUrl(ex.image)} alt={ex.name} className="w-full h-full object-cover" />
                            : <FaImage className="w-4 h-4 text-gray-300" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{ex.name}</td>
                      <td className="px-4 py-3">
                        {Array.isArray(ex.beltNames) && ex.beltNames.length
                          ? <div className="flex flex-wrap gap-1">{ex.beltNames.map(b => <span key={b} className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{b}</span>)}</div>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {Array.isArray(ex.programTitles) && ex.programTitles.length
                          ? <div className="flex flex-wrap gap-1">{ex.programTitles.map(p => <span key={p} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{p}</span>)}</div>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {ex.equipment === 'chair' ? 'With Chair' : ex.equipment === 'noChair' ? 'No Chair' : ex.equipment || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const lvls = Array.isArray(ex.level) ? ex.level : (ex.level ? [ex.level] : []);
                          return lvls.length
                            ? <div className="flex flex-wrap gap-1">{lvls.map(l => <span key={l} className={`px-2 py-0.5 rounded-full text-xs font-medium ${l === 'Easy' ? 'bg-green-50 text-green-700' : l === 'Advance' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{l}</span>)}</div>
                            : <span className="text-gray-300 text-xs">—</span>;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
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
              <div className="px-4 pb-4">
                <Pagination page={stretchPage} total={filteredStretch.length} onPageChange={setStretchPage} />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── TECHNIQUES TAB ── */
        <div>
          {/* Category filter + search */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex gap-2 flex-wrap">
              {['All', ...categories.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setFilterCategory(cat); setTechPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${filterCategory === cat ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  style={filterCategory === cat ? { backgroundColor: '#006CB5' } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
            <select
              value={filterTechProgram}
              onChange={e => { setFilterTechProgram(e.target.value); setTechPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Programs</option>
              {programs.map(p => <option key={p._id} value={p.title}>{p.title}</option>)}
            </select>
            <select
              value={techFilterBelt}
              onChange={e => { setTechFilterBelt(e.target.value); setTechPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Belts</option>
              {belts.map(b => <option key={b._id} value={b.beltName}>{b.beltName}</option>)}
            </select>
            <select
              value={techFilterLevel}
              onChange={e => { setTechFilterLevel(e.target.value); setTechPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Levels</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input
              type="text"
              value={techSearch}
              onChange={e => { setTechSearch(e.target.value); setTechPage(1); }}
              placeholder="Search..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm ml-auto"
            />
          </div>

          {filteredTechniques.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              No techniques found.
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
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Level</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Belt</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Program</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Steps</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedTechniques.map((tech, idx) => (
                    <tr key={tech._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500">{(techPage - 1) * PAGE_SIZE + idx + 1}</td>
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
                          tech.difficulty === 'Advance' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'}`}>
                          {tech.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const bNames = Array.isArray(tech.beltNames) && tech.beltNames.length
                            ? tech.beltNames
                            : (tech.beltName ? [tech.beltName] : []);
                          return bNames.length
                            ? <div className="flex flex-wrap gap-1">{bNames.map(b => <span key={b} className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{b}</span>)}</div>
                            : <span className="text-gray-300 text-xs">—</span>;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const titles = Array.isArray(tech.programTitles) && tech.programTitles.length
                            ? tech.programTitles
                            : (tech.programTitle ? [tech.programTitle] : []);
                          return titles.length
                            ? <div className="flex flex-wrap gap-1">{titles.map(t => <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">{t}</span>)}</div>
                            : <span className="text-gray-300 text-xs">—</span>;
                        })()}
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
              <div className="px-4 pb-4">
                <Pagination page={techPage} total={filteredTechniques.length} onPageChange={setTechPage} />
              </div>
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

              {/* Category + Level row */}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Level</label>
                  <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Belt multi-select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Belt</label>
                <div className="relative" ref={techBeltDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowTechBeltDropdown(v => !v)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <span className={form.beltNames?.length ? 'text-gray-900 truncate' : 'text-gray-400'}>
                      {form.beltNames?.length ? form.beltNames.join(', ') : 'Select belts'}
                    </span>
                    <FaChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2" />
                  </button>
                  {showTechBeltDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {belts.length === 0
                        ? <div className="px-4 py-3 text-sm text-gray-400">No belts available</div>
                        : belts.map(b => (
                          <label key={b._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(form.beltNames || []).includes(b.beltName)}
                              onChange={() => toggleTechBelt(b.beltName)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">{b.beltName}</span>
                          </label>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Program */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Program</label>
                <div className="relative" ref={techProgramDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowTechProgramDropdown(v => !v)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <span className={form.programTitles?.length ? 'text-gray-900 truncate' : 'text-gray-400'}>
                      {form.programTitles?.length ? form.programTitles.join(', ') : 'Select programs'}
                    </span>
                    <FaChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2" />
                  </button>
                  {showTechProgramDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {programs.length === 0
                        ? <div className="px-4 py-3 text-sm text-gray-400">No programs available</div>
                        : programs.map(p => (
                          <label key={p._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(form.programIds || []).includes(p._id)}
                              onChange={() => toggleTechProgram(p)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">{p.title}</span>
                          </label>
                        ))}
                    </div>
                  )}
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

      {/* ── EXERCISE (WARM-UP / STRETCHING) FORM MODAL ── */}
      {showExForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                {editingEx
                  ? `Edit ${SECTION_LABELS[exForm.section]}`
                  : `Add ${SECTION_LABELS[exForm.section]}`}
              </h2>
              <button onClick={closeExForm} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>

            <form onSubmit={saveEx} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

              {/* Image + Name row */}
              <div className="flex items-start gap-4">
                {/* Image picker */}
                <div className="flex-shrink-0">
                  <div
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 transition"
                    onClick={() => document.getElementById('ex-image-input').click()}
                  >
                    {exImagePreview
                      ? <img src={exImagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                      : <>
                          <FaImage className="w-6 h-6 text-gray-300 mb-1" />
                          <span className="text-xs text-gray-400">Image</span>
                        </>}
                  </div>
                  <input id="ex-image-input" type="file" accept="image/*" className="hidden" onChange={handleExImageChange} />
                  <button type="button" onClick={() => document.getElementById('ex-image-input').click()}
                    className="mt-1 text-xs font-medium w-full text-center hover:opacity-80" style={{ color: '#006CB5' }}>
                    Change image
                  </button>
                </div>

                {/* Name */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {exForm.section === 'warmUp' ? 'Warm-Up Name' : exForm.section === 'stretching' ? 'Stretching Name' : 'Exercise Name'}
                    <span className="text-red-500"> *</span>
                  </label>
                  <input
                    type="text"
                    value={exForm.name}
                    onChange={e => setExForm({ ...exForm, name: e.target.value })}
                    placeholder={exForm.section === 'warmUp' ? 'e.g. Jumping Jacks' : exForm.section === 'stretching' ? 'e.g. Hamstring Stretch' : 'e.g. Front Kick'}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Belt + Program row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Belt multi-select dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Belt</label>
                  <div className="relative" ref={beltDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowBeltDropdown(v => !v)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <span className={exForm.beltNames.length ? 'text-gray-900 truncate' : 'text-gray-400'}>
                        {exForm.beltNames.length ? exForm.beltNames.join(', ') : 'Select belts'}
                      </span>
                      <FaChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2" />
                    </button>
                    {showBeltDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {belts.length === 0
                          ? <div className="px-4 py-3 text-sm text-gray-400">No belts available</div>
                          : belts.map(b => (
                            <label key={b._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={exForm.beltNames.includes(b.beltName)}
                                onChange={() => toggleBeltName(b.beltName)}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">{b.beltName}</span>
                            </label>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Program multi-select dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Program</label>
                  <div className="relative" ref={programDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowProgramDropdown(v => !v)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <span className={exForm.programTitles.length ? 'text-gray-900 truncate' : 'text-gray-400'}>
                        {exForm.programTitles.length ? exForm.programTitles.join(', ') : 'Select programs'}
                      </span>
                      <FaChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2" />
                    </button>
                    {showProgramDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {programs.length === 0
                          ? <div className="px-4 py-3 text-sm text-gray-400">No programs available</div>
                          : programs.map(p => (
                            <label key={p._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={exForm.programIds.includes(p._id)}
                                onChange={() => toggleProgram(p)}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">{p.title}</span>
                            </label>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Equipment + Level row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Equipment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Equipment</label>
                  <select
                    value={exForm.equipment}
                    onChange={e => setExForm({ ...exForm, equipment: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {EQUIPMENT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Level multi-select dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Level</label>
                  <div className="relative" ref={levelDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowLevelDropdown(v => !v)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <span className={exForm.level.length ? 'text-gray-900' : 'text-gray-400'}>
                        {exForm.level.length ? exForm.level.join(', ') : 'Select levels'}
                      </span>
                      <FaChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {showLevelDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg">
                        {LEVELS.map(lvl => (
                          <label key={lvl} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exForm.level.includes(lvl)}
                              onChange={() => toggleLevel(lvl)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">{lvl}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Video</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition cursor-pointer">
                    <FaVideo className="w-4 h-4" />
                    {exVideoName ? 'Change Video' : 'Upload Video'}
                    <input
                      id="ex-video-input"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setExVideoFile(file);
                        setExVideoName(file.name);
                      }}
                    />
                  </label>
                  {exVideoName && <span className="text-xs text-gray-500 truncate max-w-[180px]">{exVideoName}</span>}
                  {exVideoName && (
                    <button type="button" onClick={() => { setExVideoFile(null); setExVideoName(''); }}
                      className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">MP4, MOV up to 100MB</p>
                {exUploadProgress > 0 && exUploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Uploading...</span><span>{exUploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${exUploadProgress}%`, backgroundColor: '#006CB5' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Steps */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Steps</label>
                <div className="space-y-2">
                  {exForm.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0">{i + 1}.</span>
                      <input
                        type="text"
                        value={step}
                        onChange={e => updateExList('steps', i, e.target.value)}
                        placeholder={`Step ${i + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button type="button" onClick={() => removeExListItem('steps', i)} className="text-red-400 hover:text-red-600">
                        <FaTimes className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addExListItem('steps')}
                  className="mt-2 text-sm font-medium flex items-center gap-1 hover:opacity-80" style={{ color: '#006CB5' }}>
                  <FaPlus className="w-3 h-3" /> Add Step
                </button>
              </div>

              {/* Tips */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tips</label>
                <div className="space-y-2">
                  {exForm.tips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0">{i + 1}.</span>
                      <input
                        type="text"
                        value={tip}
                        onChange={e => updateExList('tips', i, e.target.value)}
                        placeholder={`Tip ${i + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button type="button" onClick={() => removeExListItem('tips', i)} className="text-red-400 hover:text-red-600">
                        <FaTimes className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addExListItem('tips')}
                  className="mt-2 text-sm font-medium flex items-center gap-1 hover:opacity-80" style={{ color: '#006CB5' }}>
                  <FaPlus className="w-3 h-3" /> Add Tip
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold shadow transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#006CB5' }}
                >
                  <FaSave className="w-4 h-4" /> {saving ? 'Saving...' : editingEx ? 'Update' : 'Save'}
                </button>
                <button type="button" onClick={closeExForm}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition">
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
