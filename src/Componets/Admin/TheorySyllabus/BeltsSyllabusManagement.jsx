import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaChevronDown, FaChevronUp, FaCog, FaEye } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';
const getToken = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

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

// ── Manage Belt Names Modal ───────────────────────────────────────────────────
function ManageBeltNamesModal({ onClose, onUpdated }) {
  const [names, setNames] = useState([]);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchNames(); }, []);

  const fetchNames = async () => {
    const res = await fetch(`${API_BASE}/belt-names`);
    const data = await res.json();
    setNames(data.data || []);
  };

  const handleAdd = async () => {
    if (!input.trim()) return;
    await fetch(`${API_BASE}/belt-names`, {
      method: 'POST', headers: authH(),
      body: JSON.stringify({ label: input.trim(), order: names.length }),
    });
    setInput(''); fetchNames(); onUpdated();
  };

  const handleEdit = async (id) => {
    if (!editVal.trim()) return;
    await fetch(`${API_BASE}/belt-names/${id}`, {
      method: 'PUT', headers: authH(),
      body: JSON.stringify({ label: editVal.trim() }),
    });
    setEditId(null); fetchNames(); onUpdated();
  };

  const handleDelete = async () => {
    await fetch(`${API_BASE}/belt-names/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null); fetchNames(); onUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h4 className="font-bold text-gray-800 text-lg">Manage Belt Names</h4>
          <button onClick={onClose}><FaTimes className="text-gray-500" /></button>
        </div>
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. 10th Kup, 1st Dan..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-white text-sm font-semibold flex items-center gap-1" style={{ backgroundColor: '#006CB5' }}>
              <FaPlus size={11} /> Add
            </button>
          </div>
          {names.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No belt names yet. Add one above.</p>}
          <div className="space-y-2">
            {names.map((n, idx) => (
              <div key={n._id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-400 w-5">{idx + 1}.</span>
                {editId === n._id ? (
                  <>
                    <input autoFocus className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                      value={editVal} onChange={e => setEditVal(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleEdit(n._id)} />
                    <button onClick={() => handleEdit(n._id)} className="text-xs text-green-600 font-semibold px-2">Save</button>
                    <button onClick={() => setEditId(null)} className="text-xs text-gray-400 px-1">Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-800 font-medium">{n.label}</span>
                    <button onClick={() => { setEditId(n._id); setEditVal(n.label); }} className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={12} /></button>
                    <button onClick={() => setDeleteId(n._id)} className="p-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100"><FaTrash size={12} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t">
          <button onClick={onClose} className="w-full py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Close</button>
        </div>
      </div>
      {deleteId && <ConfirmModal message="Delete this belt name?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

const emptyPattern = () => ({ number: 1, name: '', meaning: '', movements: '', youtubeUrl: '', horizontal: false, vertical: false, technique: '', moves: '', diagramImage: '', _diagramPreview: '', _diagramFile: null });
const emptyMove = () => ({ korean: '', english: '' });
const emptySection = () => ({ heading: '', points: [''] });
const emptyForm = () => ({ beltName: '', recommendedDuration: '', colourMeaning: '', patterns: [], sparring: '', technique: '', fundamentalMoves: [], extraSections: [] });

// ── Main Component ────────────────────────────────────────────────────────────
export default function BeltsSyllabusManagement() {
  const [items, setItems] = useState([]);
  const [beltNames, setBeltNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showManageNames, setShowManageNames] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [expandedPatterns, setExpandedPatterns] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchItems(); fetchBeltNames(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/belt-syllabus`);
      const data = await res.json();
      setItems(data.data || []);
    } finally { setLoading(false); }
  };

  const fetchBeltNames = async () => {
    const res = await fetch(`${API_BASE}/belt-names`);
    const data = await res.json();
    setBeltNames(data.data || []);
  };

  const openAdd = () => {
    setEditing(null); setForm(emptyForm()); setExpandedPatterns({}); setError(''); setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      beltName: item.beltName || '',
      recommendedDuration: item.recommendedDuration || '',
      colourMeaning: item.colourMeaning || '',
      patterns: (item.patterns || []).map(p => ({
        number: p.number, name: p.name || '', meaning: p.meaning || '',
        movements: p.movements || '', youtubeUrl: p.youtubeUrl || '',
        horizontal: !!p.horizontal, vertical: !!p.vertical, technique: p.technique || '',
        moves: p.moves || '',
        diagramImage: p.diagramImage || '',
        _diagramPreview: p.diagramImage ? `${BASE_URL}${p.diagramImage}` : '',
        _diagramFile: null,
      })),
      sparring: item.sparring || '',
      technique: item.technique || '',
      fundamentalMoves: (item.fundamentalMoves || []).map(m => ({ korean: m.korean || '', english: m.english || '' })),
      extraSections: (item.extraSections || []).map(s => ({
        heading: s.heading || '',
        points: s.points?.length ? s.points : [''],
      })),
    });
    setExpandedPatterns({}); setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.beltName) { setError('Please select a belt level.'); return; }
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('beltName', form.beltName);
      fd.append('recommendedDuration', form.recommendedDuration || '');
      fd.append('colourMeaning', form.colourMeaning || '');
      fd.append('sparring', form.sparring || '');
      fd.append('fundamentalMoves', JSON.stringify(form.fundamentalMoves.filter(m => m.korean || m.english)));
      fd.append('extraSections', JSON.stringify(
        (form.extraSections || [])
          .filter(s => s.heading.trim())
          .map(s => ({ heading: s.heading.trim(), points: s.points.filter(p => p.trim()) }))
      ));

      // Strip internal UI fields before sending patterns
      const patternsPayload = form.patterns.map(p => ({
        number: p.number,
        name: p.name,
        meaning: p.meaning,
        movements: p.movements ? Number(p.movements) : undefined,
        youtubeUrl: p.youtubeUrl,
        technique: p.technique,
        moves: p.moves,
        diagramImage: p.diagramImage, // keep existing path
      }));
      fd.append('patterns', JSON.stringify(patternsPayload));

      // Attach new diagram image files: diagramImage_<index>
      form.patterns.forEach((p, i) => {
        if (p._diagramFile) fd.append(`diagramImage_${i}`, p._diagramFile);
      });

      const url = editing ? `${API_BASE}/belt-syllabus/${editing._id}` : `${API_BASE}/belt-syllabus`;
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (data.status !== 'success') { setError(data.message || 'Save failed'); return; }
      setShowModal(false); fetchItems();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await fetch(`${API_BASE}/belt-syllabus/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null); fetchItems();
  };

  const addPattern = () => setForm(f => ({ ...f, patterns: [...f.patterns, emptyPattern()] }));
  const removePattern = (i) => setForm(f => ({ ...f, patterns: f.patterns.filter((_, idx) => idx !== i) }));
  const updatePattern = (i, key, val) => setForm(f => { const arr = [...f.patterns]; arr[i] = { ...arr[i], [key]: val }; return { ...f, patterns: arr }; });
  const addMove = () => setForm(f => ({ ...f, fundamentalMoves: [...f.fundamentalMoves, emptyMove()] }));
  const removeMove = (i) => setForm(f => ({ ...f, fundamentalMoves: f.fundamentalMoves.filter((_, idx) => idx !== i) }));
  const updateMove = (i, key, val) => setForm(f => { const arr = [...f.fundamentalMoves]; arr[i] = { ...arr[i], [key]: val }; return { ...f, fundamentalMoves: arr }; });

  const addSection = () => setForm(f => ({ ...f, extraSections: [...f.extraSections, emptySection()] }));
  const removeSection = (i) => setForm(f => ({ ...f, extraSections: f.extraSections.filter((_, idx) => idx !== i) }));
  const updateSection = (i, key, val) => setForm(f => { const arr = [...f.extraSections]; arr[i] = { ...arr[i], [key]: val }; return { ...f, extraSections: arr }; });
  const addSectionPoint = (si) => setForm(f => { const arr = [...f.extraSections]; arr[si].points = [...arr[si].points, '']; return { ...f, extraSections: arr }; });
  const removeSectionPoint = (si, pi) => setForm(f => { const arr = [...f.extraSections]; arr[si].points = arr[si].points.filter((_, idx) => idx !== pi); return { ...f, extraSections: arr }; });
  const updateSectionPoint = (si, pi, val) => setForm(f => { const arr = [...f.extraSections]; arr[si].points[pi] = val; return { ...f, extraSections: arr }; });

  const usedNames = items.map(i => i.beltName);
  const availableNames = editing ? beltNames : beltNames.filter(n => !usedNames.includes(n.label));

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Belts Syllabus Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage belt levels, patterns, sparring, and fundamental moves.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManageNames(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <FaCog size={14} /> Manage Belt Names
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ backgroundColor: '#006CB5' }}
          >
            <FaPlus /> Add Belt Level
          </button>
        </div>
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
                <th className="px-4 py-3">Belt Name</th>
                <th className="px-4 py-3">Colour Meaning</th>
                <th className="px-4 py-3">Patterns</th>
                <th className="px-4 py-3">Moves</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.beltName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[220px] truncate">{item.colourMeaning || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{item.patterns?.length || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">{item.fundamentalMoves?.length || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => setViewItem(item)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><FaEye size={13} /></button>
                      <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={13} /></button>
                      <button onClick={() => setDeleteId(item._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FaTrash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-gray-400 text-center py-10 text-sm">No belt levels added yet.</p>}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
              <h4 className="font-bold text-gray-800 text-lg">{editing ? 'Edit Belt Level' : 'Add Belt Level'}</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-5">
              {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              {/* Belt Name dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">Belt Level</label>
                  <button
                    type="button"
                    onClick={() => setShowManageNames(true)}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FaCog size={11} /> Manage belt names
                  </button>
                </div>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.beltName}
                  onChange={e => setForm(f => ({ ...f, beltName: e.target.value }))}
                  disabled={!!editing}
                >
                  <option value="">Select belt level...</option>
                  {availableNames.map(n => (
                    <option key={n._id} value={n.label}>{n.label}</option>
                  ))}
                </select>
                {beltNames.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No belt names found. Click "Manage belt names" to add some first.</p>
                )}
              </div>

              {/* Recommended Duration */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Recommended Duration <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  placeholder="e.g. 6 months, 1 year..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.recommendedDuration}
                  onChange={e => setForm(f => ({ ...f, recommendedDuration: e.target.value }))}
                />
              </div>

              {/* Colour Meaning */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Colour Meaning</label>
                <textarea rows={3} placeholder="e.g. White signifies innocence..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.colourMeaning} onChange={e => setForm(f => ({ ...f, colourMeaning: e.target.value }))} />
              </div>

              {/* Patterns */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Patterns</label>
                  <button type="button" onClick={addPattern}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Pattern
                  </button>
                </div>
                {form.patterns.length === 0 && <p className="text-gray-400 text-xs py-1">No patterns yet.</p>}
                <div className="space-y-3">
                  {form.patterns.map((p, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer"
                        onClick={() => setExpandedPatterns(prev => ({ ...prev, [i]: !prev[i] }))}>
                        <span className="text-sm font-semibold text-gray-700">Pattern {i + 1}{p.name ? `: ${p.name}` : ''}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={e => { e.stopPropagation(); removePattern(i); }} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                          {expandedPatterns[i] ? <FaChevronUp size={12} className="text-gray-400" /> : <FaChevronDown size={12} className="text-gray-400" />}
                        </div>
                      </div>
                      {expandedPatterns[i] && (
                        <div className="p-3 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Pattern Number</label>
                              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                value={p.number} onChange={e => updatePattern(i, 'number', e.target.value)} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Name</label>
                              <input placeholder="e.g. Chon-Ji" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                value={p.name} onChange={e => updatePattern(i, 'name', e.target.value)} />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">Meaning</label>
                            <input placeholder="e.g. Heaven and Earth" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              value={p.meaning} onChange={e => updatePattern(i, 'meaning', e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Movements</label>
                              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                value={p.movements} onChange={e => updatePattern(i, 'movements', e.target.value)} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">YouTube URL</label>
                              <input placeholder="https://youtube.com/..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                value={p.youtubeUrl} onChange={e => updatePattern(i, 'youtubeUrl', e.target.value)} />
                            </div>
                          </div>
                          <div className="flex gap-6">
                            <label className="text-xs font-semibold text-gray-600 block mb-1">Diagram Image <span className="text-gray-400 font-normal">(optional)</span></label>
                            <div className="flex items-center gap-3 mt-1">
                              {(p._diagramPreview || p.diagramImage) && (
                                <img src={p._diagramPreview || `${BASE_URL}${p.diagramImage}`} alt="diagram"
                                  className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                              )}
                              <label className="cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs hover:border-blue-400 hover:text-blue-500 transition-colors">
                                {p._diagramPreview || p.diagramImage ? 'Change Image' : 'Upload Image'}
                                <input type="file" accept="image/*" className="hidden" onChange={e => {
                                  const f = e.target.files[0]; if (!f) return;
                                  updatePattern(i, '_diagramFile', f);
                                  updatePattern(i, '_diagramPreview', URL.createObjectURL(f));
                                }} />
                              </label>
                              {(p._diagramPreview || p.diagramImage) && (
                                <button type="button" onClick={() => {
                                  updatePattern(i, '_diagramFile', null);
                                  updatePattern(i, '_diagramPreview', '');
                                  updatePattern(i, 'diagramImage', '');
                                }} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">Technique Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                            <textarea rows={3} placeholder="e.g. Slow Motion: Movement 1, 2..."
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              value={p.technique} onChange={e => updatePattern(i, 'technique', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">Moves <span className="text-gray-400 font-normal">(shown on READ MORE — one move per line)</span></label>
                            <textarea rows={5} placeholder={"1: Step forward, punch\n2: Block and counter..."}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              value={p.moves} onChange={e => updatePattern(i, 'moves', e.target.value)} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sparring */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">New Step Sparring <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea rows={3} placeholder="e.g. 3-step: 1, 2, 3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.sparring} onChange={e => setForm(f => ({ ...f, sparring: e.target.value }))} />
              </div>

              {/* Fundamental Moves */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Fundamental Moves</label>
                  <button type="button" onClick={addMove}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Move
                  </button>
                </div>
                {form.fundamentalMoves.length === 0 && <p className="text-gray-400 text-xs py-1">No moves yet.</p>}
                <div className="space-y-2">
                  {form.fundamentalMoves.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5 flex-shrink-0">{i + 1}.</span>
                      <input placeholder="Korean name..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={m.korean} onChange={e => updateMove(i, 'korean', e.target.value)} />
                      <input placeholder="English translation..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={m.english} onChange={e => updateMove(i, 'english', e.target.value)} />
                      <button type="button" onClick={() => removeMove(i)} className="text-red-400 hover:text-red-600 flex-shrink-0"><FaTimes size={13} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Sections */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Additional Sections</label>
                  <button type="button" onClick={addSection}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Section
                  </button>
                </div>
                {form.extraSections.length === 0 && <p className="text-gray-400 text-xs py-1">No extra sections yet.</p>}
                <div className="space-y-3">
                  {form.extraSections.map((sec, si) => (
                    <div key={si} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <input
                          placeholder="Section heading e.g. Self Defence, Theory..."
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold"
                          value={sec.heading}
                          onChange={e => updateSection(si, 'heading', e.target.value)}
                        />
                        <button type="button" onClick={() => removeSection(si)} className="text-red-400 hover:text-red-600"><FaTimes size={13} /></button>
                      </div>
                      <div className="space-y-1.5 pl-2">
                        {sec.points.map((pt, pi) => (
                          <div key={pi} className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-4">{pi + 1}.</span>
                            <input
                              placeholder="Point text..."
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                              value={pt}
                              onChange={e => updateSectionPoint(si, pi, e.target.value)}
                            />
                            <button type="button" onClick={() => removeSectionPoint(si, pi)} className="text-red-300 hover:text-red-500"><FaTimes size={11} /></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addSectionPoint(si)}
                          className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1">
                          <FaPlus size={9} /> Add point
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: '#006CB5' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && <ConfirmModal message="Delete this belt level?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Belt Level</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-xs font-bold text-gray-400 uppercase">Belt Name</span><p className="font-semibold text-gray-800 mt-0.5">{viewItem.beltName || '—'}</p></div>
                <div><span className="text-xs font-bold text-gray-400 uppercase">Duration</span><p className="text-gray-600 mt-0.5">{viewItem.recommendedDuration || '—'}</p></div>
              </div>
              {viewItem.colourMeaning && (
                <div><span className="text-xs font-bold text-gray-400 uppercase">Colour Meaning</span><p className="text-gray-600 mt-0.5">{viewItem.colourMeaning}</p></div>
              )}
              {viewItem.sparring && (
                <div><span className="text-xs font-bold text-gray-400 uppercase">Sparring</span><p className="text-gray-600 mt-0.5">{viewItem.sparring}</p></div>
              )}
              {viewItem.technique && (
                <div><span className="text-xs font-bold text-gray-400 uppercase">Technique</span><p className="text-gray-600 mt-0.5">{viewItem.technique}</p></div>
              )}
              {(viewItem.patterns || []).length > 0 && (
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Patterns ({viewItem.patterns.length})</span>
                  <div className="mt-1 space-y-1">
                    {viewItem.patterns.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-400 w-5">{p.number}.</span>
                        <span className="font-semibold text-gray-700 text-xs">{p.name}</span>
                        {p.movements && <span className="text-gray-400 text-xs ml-auto">{p.movements} mov.</span>}
                        {p.meaning && <span className="text-gray-400 text-xs truncate max-w-[120px]">{p.meaning}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(viewItem.fundamentalMoves || []).length > 0 && (
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Fundamental Moves ({viewItem.fundamentalMoves.length})</span>
                  <div className="mt-1 space-y-1">
                    {viewItem.fundamentalMoves.map((m, i) => (
                      <div key={i} className="flex gap-3 p-2 bg-gray-50 rounded-lg text-xs">
                        <span className="font-semibold text-gray-700">{m.korean}</span>
                        {m.english && <span className="text-gray-400">— {m.english}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(viewItem.extraSections || []).length > 0 && (
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Extra Sections</span>
                  {viewItem.extraSections.map((s, i) => (
                    <div key={i} className="mt-2">
                      {s.heading && <p className="font-semibold text-gray-700 text-xs">{s.heading}</p>}
                      {(s.points || []).map((pt, pi) => <p key={pi} className="text-gray-500 text-xs ml-2">• {pt}</p>)}
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

      {showManageNames && <ManageBeltNamesModal onClose={() => setShowManageNames(false)} onUpdated={fetchBeltNames} />}
    </div>
  );
}

