import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';
const getToken = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const DEFAULT_TYPES = ['3-step', '2-step', '1-step', 'free'];

const EMPTY_FORM = {
  type: '',
  title: '',
  whatIs: '',
  attackingIntro: '',
  attacks: [],
  defending: '',
  routines: [],
  sections: [],
  order: 0,
};

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <p className="text-gray-800 font-semibold mb-6 text-center">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: '#dc2626' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function SparringManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedSections, setExpandedSections] = useState({});

  // Type management
  const [sparringTypes, setSparringTypes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sparringTypes')) || DEFAULT_TYPES; } catch { return DEFAULT_TYPES; }
  });
  const [newTypeName, setNewTypeName] = useState('');
  const [showTypeInput, setShowTypeInput] = useState(false);

  const saveTypes = (types) => {
    setSparringTypes(types);
    localStorage.setItem('sparringTypes', JSON.stringify(types));
  };

  const addType = () => {
    const name = newTypeName.trim().toLowerCase();
    if (!name || sparringTypes.includes(name)) return;
    saveTypes([...sparringTypes, name]);
    setNewTypeName('');
    setShowTypeInput(false);
  };

  const removeType = (t) => {
    saveTypes(sparringTypes.filter(x => x !== t));
  };

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sparring`);
      const data = await res.json();
      setItems(data.data || []);
    } finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, type: sparringTypes[0] || '', order: items.length });
    setExpandedSections({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      type: item.type,
      title: item.title,
      whatIs: item.whatIs || '',
      attackingIntro: item.attackingIntro || '',
      attacks: (item.attacks || []).map(a => ({ num: a.num, text: a.text })),
      defending: item.defending || '',
      routines: (item.routines || []).map(r => ({
        num: r.num,
        title: r.title,
        titleDetailPairs: r.titleDetailPairs || [{ 
          title: '', 
          details: Array.isArray(r.details) ? r.details.join('\n') : (r.details || '') 
        }]
      })),
      sections: (item.sections || []).map(s => ({
        title: s.title,
        content: s.content || '',
        points: (s.points || []).join('\n'),
        image: s.image || '',
        _imagePreview: s.image ? `${BASE_URL}${s.image}` : '',
        _imageFile: null,
      })),
      order: item.order || 0,
    });
    setExpandedSections({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const fd = new FormData();
    fd.append('type', form.type);
    fd.append('title', form.title);
    fd.append('whatIs', form.whatIs);
    fd.append('attackingIntro', form.attackingIntro);
    fd.append('defending', form.defending);
    fd.append('order', form.order);
    fd.append('attacks', JSON.stringify(form.attacks));
    fd.append('routines', JSON.stringify(
      (form.routines || []).map((r, i) => ({
        num: r.num || i + 1,
        title: r.title,
        titleDetailPairs: (r.titleDetailPairs || []).map(pair => ({
          title: pair.title || '',
          details: typeof pair.details === 'string'
            ? pair.details.split('\n').map(d => d.trim()).filter(Boolean)
            : pair.details || []
        }))
      }))
    ));
    // Sections — strip client-only fields before sending
    const sectionsPayload = (form.sections || []).map(s => ({
      title: s.title,
      content: s.content || '',
      points: typeof s.points === 'string'
        ? s.points.split('\n').map(p => p.trim()).filter(Boolean)
        : s.points,
      image: s.image || '', // existing path preserved
    }));
    fd.append('sections', JSON.stringify(sectionsPayload));
    // Attach new image files as sectionImage_0, sectionImage_1, ...
    (form.sections || []).forEach((s, i) => {
      if (s._imageFile) fd.append(`sectionImage_${i}`, s._imageFile);
    });

    const url = editing ? `${API_BASE}/sparring/${editing._id}` : `${API_BASE}/sparring`;
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
    setShowModal(false);
    fetchItems();
  };

  const handleDelete = async () => {
    await fetch(`${API_BASE}/sparring/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null);
    fetchItems();
  };

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Attacks helpers ──────────────────────────────────────────────────────
  const addAttack = () => updateForm('attacks', [...form.attacks, { num: `${form.attacks.length + 1}.`, text: '' }]);
  const updateAttack = (i, field, val) => {
    const arr = [...form.attacks]; arr[i] = { ...arr[i], [field]: val }; updateForm('attacks', arr);
  };
  const removeAttack = (i) => updateForm('attacks', form.attacks.filter((_, idx) => idx !== i));

  // ── Routines helpers ─────────────────────────────────────────────────────
  const addRoutine = () => updateForm('routines', [...form.routines, { 
    num: form.routines.length + 1, 
    title: '', 
    titleDetailPairs: [{ title: '', details: '' }] 
  }]);
  
  const updateRoutine = (i, field, val) => {
    const arr = [...form.routines]; 
    arr[i] = { ...arr[i], [field]: val }; 
    updateForm('routines', arr);
  };
  
  const removeRoutine = (i) => updateForm('routines', form.routines.filter((_, idx) => idx !== i));

  // Title-Detail pairs helpers
  const addTitleDetailPair = (routineIndex) => {
    const arr = [...form.routines];
    if (!arr[routineIndex].titleDetailPairs) {
      arr[routineIndex].titleDetailPairs = [];
    }
    arr[routineIndex].titleDetailPairs.push({ title: '', details: '' });
    updateForm('routines', arr);
  };

  const updateTitleDetailPair = (routineIndex, pairIndex, field, val) => {
    const arr = [...form.routines];
    arr[routineIndex].titleDetailPairs[pairIndex] = { 
      ...arr[routineIndex].titleDetailPairs[pairIndex], 
      [field]: val 
    };
    updateForm('routines', arr);
  };

  const removeTitleDetailPair = (routineIndex, pairIndex) => {
    const arr = [...form.routines];
    arr[routineIndex].titleDetailPairs = arr[routineIndex].titleDetailPairs.filter((_, idx) => idx !== pairIndex);
    updateForm('routines', arr);
  };

  // ── Sections helpers ─────────────────────────────────────────────────────
  const addSection = () => updateForm('sections', [...form.sections, { title: '', content: '', points: '', image: '', _imagePreview: '', _imageFile: null }]);
  const updateSection = (i, field, val) => {
    const arr = [...form.sections]; arr[i] = { ...arr[i], [field]: val }; updateForm('sections', arr);
  };
  const removeSection = (i) => updateForm('sections', form.sections.filter((_, idx) => idx !== i));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Sparring</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage sparring types shown in the Sparring screen of the mobile app.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
          <FaPlus /> Add Sparring Type
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-400 text-center py-10 text-sm">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Routines</th>
                <th className="px-4 py-3">Sections</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{item.type}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.title}</td>
                  <td className="px-4 py-3 text-center">
                    {item.routines?.length > 0
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600">{item.routines.length}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.sections?.length > 0
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">{item.sections.length}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1.5 justify-end items-center">
                      <button onClick={() => setViewItem(item)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100" title="View"><FaEye size={13} /></button>
                      <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit"><FaEdit size={13} /></button>
                      <button onClick={() => setDeleteId(item._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete"><FaTrash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No sparring types yet.</p>}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit Sparring Type' : 'Add Sparring Type'}</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-5">

              {/* Type + Title */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Type <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={form.type}
                      onChange={e => updateForm('type', e.target.value)}
                    >
                      {sparringTypes.length === 0 && <option value="">— Add a type first —</option>}
                      {sparringTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowTypeInput(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs font-semibold hover:border-[#006CB5] hover:text-[#006CB5] transition-colors whitespace-nowrap"
                    >
                      <FaPlus size={10} /> Add Type
                    </button>
                  </div>
                  {showTypeInput && (
                    <div className="flex gap-2 mt-2">
                      <input
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="e.g. semi-free"
                        value={newTypeName}
                        onChange={e => setNewTypeName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addType()}
                        autoFocus
                      />
                      <button type="button" onClick={addType}
                        className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
                        Add
                      </button>
                      <button type="button" onClick={() => { setShowTypeInput(false); setNewTypeName(''); }}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 text-sm">
                        <FaTimes size={12} />
                      </button>
                    </div>
                  )}
                  {/* Existing types with remove option */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {sparringTypes.map(t => (
                      <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        {t}
                        <button type="button" onClick={() => removeType(t)} className="text-gray-400 hover:text-red-500 ml-0.5">
                          <FaTimes size={9} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Display Title <span className="text-red-500">*</span></label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 3-STEP"
                    value={form.title} onChange={e => updateForm('title', e.target.value)} />
                </div>
              </div>

              {/* What Is */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">What Is It?</label>
                <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Description of this sparring type..."
                  value={form.whatIs} onChange={e => updateForm('whatIs', e.target.value)} />
              </div>

              {/* Attacking */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Attacking Intro</label>
                <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Introduction to the attacking section..."
                  value={form.attackingIntro} onChange={e => updateForm('attackingIntro', e.target.value)} />
              </div>

              {/* Attacks list */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Attacks</label>
                  <button type="button" onClick={addAttack}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Attack
                  </button>
                </div>
                {form.attacks.length === 0 && <p className="text-gray-400 text-xs py-1">No attacks yet.</p>}
                <div className="space-y-2">
                  {form.attacks.map((a, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center flex-shrink-0"
                        placeholder="i." value={a.num} onChange={e => updateAttack(i, 'num', e.target.value)} />
                      <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="Attack description..." value={a.text} onChange={e => updateAttack(i, 'text', e.target.value)} />
                      <button type="button" onClick={() => removeAttack(i)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex-shrink-0"><FaTimes size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Defending */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Defending</label>
                <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Description of the defending section..."
                  value={form.defending} onChange={e => updateForm('defending', e.target.value)} />
              </div>

              {/* Routines */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Routines</label>
                  <button type="button" onClick={addRoutine}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Routine
                  </button>
                </div>
                {form.routines.length === 0 && <p className="text-gray-400 text-xs py-1">No routines yet.</p>}
                <div className="space-y-4">
                  {form.routines.map((r, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex items-center gap-2 p-3 bg-gray-50">
                        <span className="text-xs font-bold text-gray-500 flex-shrink-0">No. {i + 1}</span>
                        <input className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                          placeholder="Routine title (e.g. Right foot back)"
                          value={r.title} onChange={e => updateRoutine(i, 'title', e.target.value)} />
                        <button type="button" onClick={() => removeRoutine(i)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex-shrink-0"><FaTimes size={10} /></button>
                      </div>
                      
                      {/* Title-Detail Pairs */}
                      <div className="p-3 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-gray-600">Title & Details Sections</label>
                          <button type="button" onClick={() => addTitleDetailPair(i)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                            <FaPlus size={8} /> Add Section
                          </button>
                        </div>
                        
                        {(!r.titleDetailPairs || r.titleDetailPairs.length === 0) && (
                          <p className="text-gray-400 text-xs py-2">No sections yet. Click "Add Section" to add title and details.</p>
                        )}
                        
                        {(r.titleDetailPairs || []).map((pair, pairIndex) => (
                          <div key={pairIndex} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-blue-600">Section {pairIndex + 1}</span>
                              <button type="button" onClick={() => removeTitleDetailPair(i, pairIndex)} 
                                className="p-1 rounded bg-red-50 text-red-400 hover:bg-red-100">
                                <FaTimes size={8} />
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">Title</label>
                                <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
                                  placeholder="e.g. Defending Techniques"
                                  value={pair.title || ''} 
                                  onChange={e => updateTitleDetailPair(i, pairIndex, 'title', e.target.value)} />
                              </div>
                              
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">Details (one per line)</label>
                                <textarea rows={3} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
                                  placeholder={"i. Left Walking Stance, left inner forearm middle block.\nii. Right Walking Stance..."}
                                  value={pair.details || ''} 
                                  onChange={e => updateTitleDetailPair(i, pairIndex, 'details', e.target.value)} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections (for Free Sparring rules etc.) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Rule Sections <span className="text-gray-400 font-normal text-xs">(for Free Sparring rules, warnings, fouls, etc.)</span></label>
                  <button type="button" onClick={addSection}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Section
                  </button>
                </div>
                {form.sections.length === 0 && <p className="text-gray-400 text-xs py-1">No sections yet.</p>}
                <div className="space-y-3">
                  {form.sections.map((s, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex items-center gap-2 p-3 bg-gray-50">
                        <input className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                          placeholder="Section title (e.g. Warnings:)"
                          value={s.title} onChange={e => updateSection(i, 'title', e.target.value)} />
                        <button type="button" onClick={() => removeSection(i)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex-shrink-0"><FaTimes size={10} /></button>
                      </div>
                      <div className="p-3 space-y-2">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Content (optional paragraph)</label>
                          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="Optional paragraph text..."
                            value={s.content} onChange={e => updateSection(i, 'content', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Points (one per line)</label>
                          <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder={"Most points wins the round.\nSingle Elimination..."}
                            value={s.points} onChange={e => updateSection(i, 'points', e.target.value)} />
                        </div>
                        {/* Image upload per section */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Image <span className="text-gray-400">(optional — shown below points in the app)</span></label>
                          <div className="flex items-center gap-3">
                            {(s._imagePreview || s.image) && (
                              <img
                                src={s._imagePreview || `${BASE_URL}${s.image}`}
                                alt="section"
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 bg-gray-50"
                              />
                            )}
                            <label className="cursor-pointer px-3 py-1.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs hover:border-[#006CB5] hover:text-[#006CB5] transition-colors">
                              {s._imagePreview || s.image ? 'Change Image' : 'Upload Image'}
                              <input type="file" accept="image/*" className="hidden" onChange={e => {
                                const f = e.target.files[0];
                                if (!f) return;
                                const arr = [...form.sections];
                                arr[i] = { ...arr[i], _imageFile: f, _imagePreview: URL.createObjectURL(f) };
                                updateForm('sections', arr);
                                e.target.value = '';
                              }} />
                            </label>
                            {(s._imagePreview || s.image) && (
                              <button type="button" onClick={() => {
                                const arr = [...form.sections];
                                arr[i] = { ...arr[i], _imageFile: null, _imagePreview: '', image: '' };
                                updateForm('sections', arr);
                              }} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Order</label>
                <input type="number" className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.order} onChange={e => updateForm('order', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
                {editing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Sparring</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{viewItem.type}</span>
                <p className="text-xl font-bold text-gray-800">{viewItem.title}</p>
              </div>
              {viewItem.whatIs && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">What Is It?</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{viewItem.whatIs}</p>
                </div>
              )}
              {viewItem.attackingIntro && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Attacking Intro</p>
                  <p className="text-sm text-gray-600">{viewItem.attackingIntro}</p>
                </div>
              )}
              {viewItem.attacks?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Attacks ({viewItem.attacks.length})</p>
                  {viewItem.attacks.map((a, i) => (
                    <p key={i} className="text-sm text-gray-600"><span className="font-semibold text-blue-600">{a.num}</span> {a.text}</p>
                  ))}
                </div>
              )}
              {viewItem.defending && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Defending</p>
                  <p className="text-sm text-gray-600">{viewItem.defending}</p>
                </div>
              )}
              {viewItem.routines?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Routines ({viewItem.routines.length})</p>
                  {viewItem.routines.map((r, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-3 mb-2">
                      <p className="font-semibold text-sm text-gray-800 mb-2">No. {r.num} — {r.title}</p>
                      
                      {/* Show title-detail pairs if available */}
                      {r.titleDetailPairs && r.titleDetailPairs.length > 0 ? (
                        r.titleDetailPairs.map((pair, pairIndex) => (
                          <div key={pairIndex} className="ml-2 mb-3 border-l-2 border-blue-200 pl-3">
                            {pair.title && <p className="font-medium text-sm text-blue-700 mb-1">{pair.title}</p>}
                            {Array.isArray(pair.details) ? (
                              pair.details.map((d, j) => <p key={j} className="text-xs text-gray-500 mt-1">• {d}</p>)
                            ) : (
                              pair.details && pair.details.split('\n').map((d, j) => (
                                d.trim() && <p key={j} className="text-xs text-gray-500 mt-1">• {d.trim()}</p>
                              ))
                            )}
                          </div>
                        ))
                      ) : (
                        /* Fallback for old structure */
                        r.details && (Array.isArray(r.details) ? (
                          r.details.map((d, j) => <p key={j} className="text-xs text-gray-500 mt-1">• {d}</p>)
                        ) : (
                          r.details.split('\n').map((d, j) => (
                            d.trim() && <p key={j} className="text-xs text-gray-500 mt-1">• {d.trim()}</p>
                          ))
                        ))
                      )}
                    </div>
                  ))}
                </div>
              )}
              {viewItem.sections?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Rule Sections ({viewItem.sections.length})</p>
                  {viewItem.sections.map((s, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-3 mb-2">
                      <p className="font-semibold text-sm text-gray-800">{s.title}</p>
                      {s.content && <p className="text-xs text-gray-500 mt-1">{s.content}</p>}
                      {s.points?.map((p, j) => <p key={j} className="text-xs text-gray-500 mt-1">• {p}</p>)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-5 border-t flex justify-end gap-2">
              <button onClick={() => { setViewItem(null); openEdit(viewItem); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
                <FaEdit size={12} /> Edit
              </button>
              <button onClick={() => setViewItem(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && <ConfirmModal message="Delete this sparring type?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

