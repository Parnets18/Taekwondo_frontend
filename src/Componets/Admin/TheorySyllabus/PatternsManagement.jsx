import { useState, useEffect } from 'react';
import React from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye, FaArrowUp, FaArrowDown, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:9000';
const getToken = () => localStorage.getItem('token');
const authH = () => ({ Authorization: `Bearer ${getToken()}` });
const jsonH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const TABS = ['list-of-techniques', 'information', 'new-techniques', 'description', 'modified-techniques'];
const TAB_LABELS = {
  'list-of-techniques': 'List of Techniques',
  'information': 'Information',
  'new-techniques': 'New Techniques',
  'description': 'Description',
  'modified-techniques': 'Modified Techniques',
};

const emptyPoint = () => ({ text: '', subPoints: [] });

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <p className="text-gray-800 font-semibold mb-6 text-center">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: '#dc2626' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function PatternsManagement() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [patternForm, setPatternForm] = useState({ name: '', moves: '', order: 0 });
  const [patternImgFile, setPatternImgFile] = useState(null);
  const [patternImgPreview, setPatternImgPreview] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [patternTabs, setPatternTabs] = useState({});
  const [viewItem, setViewItem] = useState(null);

  // Item modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemPatternId, setItemPatternId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [itemTab, setItemTab] = useState('list-of-techniques');

  // list-of-techniques fields
  const [lotTitle, setLotTitle] = useState('');
  const [lotName, setLotName] = useState('');
  const [lotKorean, setLotKorean] = useState('');
  const [techPoints, setTechPoints] = useState([]); // { text, title, subtitle, description, heading, points[] }

  // information fields
  const [infoTitle, setInfoTitle] = useState('');
  const [diagramFile, setDiagramFile] = useState(null);
  const [diagramPreview, setDiagramPreview] = useState(null);
  const [infoPoints, setInfoPoints] = useState([]);

  // description fields
  const [descHeading, setDescHeading] = useState('');
  const [descSubHeading, setDescSubHeading] = useState('');
  const [descDiagramFile, setDescDiagramFile] = useState(null);
  const [descDiagramPreview, setDescDiagramPreview] = useState(null);
  const [descText, setDescText] = useState('');

  // new-techniques / modified-techniques fields
  const [ntTitle, setNtTitle] = useState('');
  const [ntPoints, setNtPoints] = useState([]);

  useEffect(() => { fetchPatterns(); }, []);

  const fetchPatterns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/patterns`);
      const d = await res.json();
      setPatterns(d.data || []);
    } finally { setLoading(false); }
  };

  // ── Pattern CRUD ─────────────────────────────────────────────────────────
  const openAddPattern = () => {
    setEditingPattern(null);
    setPatternForm({ name: '', moves: '', order: patterns.length });
    setPatternImgFile(null); setPatternImgPreview(null);
    setShowPatternModal(true);
  };

  const openEditPattern = (p) => {
    setEditingPattern(p);
    setPatternForm({ name: p.name, moves: p.moves, order: p.order });
    setPatternImgFile(null);
    setPatternImgPreview(p.image ? `${BASE_URL}${p.image}` : null);
    setShowPatternModal(true);
  };

  const savePattern = async () => {
    const fd = new FormData();
    Object.entries(patternForm).forEach(([k, v]) => fd.append(k, v));
    if (patternImgFile) fd.append('image', patternImgFile);
    // preserve existing image when editing without uploading a new one
    if (editingPattern && !patternImgFile && editingPattern.image) {
      fd.append('existingImage', editingPattern.image);
    }
    const url = editingPattern ? `${API_BASE}/patterns/${editingPattern._id}` : `${API_BASE}/patterns`;
    await fetch(url, { method: editingPattern ? 'PUT' : 'POST', headers: authH(), body: fd });
    setShowPatternModal(false);
    fetchPatterns();
  };

  const deletePattern = async () => {
    await fetch(`${API_BASE}/patterns/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null); fetchPatterns();
  };

  const movePattern = async (p, dir) => {
    const sorted = [...patterns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(x => x._id === p._id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    setPatterns(prev => prev.map(x => {
      if (x._id === sorted[idx]._id) return { ...x, order: swapIdx };
      if (x._id === sorted[swapIdx]._id) return { ...x, order: idx };
      return x;
    }));
    await Promise.all([
      fetch(`${API_BASE}/patterns/${sorted[idx]._id}/order`, { method: 'PATCH', headers: jsonH(), body: JSON.stringify({ order: swapIdx }) }),
      fetch(`${API_BASE}/patterns/${sorted[swapIdx]._id}/order`, { method: 'PATCH', headers: jsonH(), body: JSON.stringify({ order: idx }) }),
    ]);
    fetchPatterns();
  };

  // ── Item CRUD ─────────────────────────────────────────────────────────────
  const resetItemForm = (tab = 'list-of-techniques') => {
    setItemTab(tab);
    setLotTitle(''); setLotName(''); setLotKorean(''); setTechPoints([]);
    setInfoTitle(''); setDiagramFile(null); setDiagramPreview(null); setInfoPoints([]);
    setDescHeading(''); setDescSubHeading(''); setDescDiagramFile(null); setDescDiagramPreview(null); setDescText('');
    setNtTitle(''); setNtPoints([]);
  };

  const openAddItem = (patternId) => {
    const tab = patternTabs[patternId] || 'list-of-techniques';
    setItemPatternId(patternId);
    setEditingItem(null);
    resetItemForm(tab);
    setShowItemModal(true);
  };

  const openEditItem = (patternId, item) => {
    setItemPatternId(patternId);
    setEditingItem(item);
    resetItemForm(item.tab);
    setItemTab(item.tab);
    if (item.tab === 'list-of-techniques') {
      setLotTitle(item.title || '');
      setLotName(item.name || '');
      setLotKorean(item.koreanName || '');
      setTechPoints(JSON.parse(JSON.stringify(item.techPoints || [])));    } else if (item.tab === 'information') {
      setInfoTitle(item.infoTitle || '');
      setDiagramPreview(item.diagram ? `${BASE_URL}${item.diagram}` : null);
      setInfoPoints(JSON.parse(JSON.stringify(item.points || [])));
    } else if (item.tab === 'description') {
      setDescHeading(item.descHeading || '');
      setDescSubHeading(item.descSubHeading || '');
      setDescDiagramPreview(item.descDiagram ? `${BASE_URL}${item.descDiagram}` : null);
      setDescText(item.description || '');
    } else {
      setNtTitle(item.ntTitle || '');
      setNtPoints(JSON.parse(JSON.stringify(item.ntPoints || [])));
    }
    setShowItemModal(true);
  };

  const saveItem = async () => {
    const fd = new FormData();
    fd.append('tab', itemTab);
    if (itemTab === 'list-of-techniques') {
      fd.append('title', lotTitle);
      fd.append('name', lotName);
      fd.append('koreanName', lotKorean);
      fd.append('techPoints', JSON.stringify(techPoints));
    } else if (itemTab === 'information') {
      fd.append('infoTitle', infoTitle);
      fd.append('points', JSON.stringify(infoPoints));
      if (diagramFile) fd.append('diagram', diagramFile);
    } else if (itemTab === 'description') {
      fd.append('descHeading', descHeading);
      fd.append('descSubHeading', descSubHeading);
      fd.append('description', descText);
      if (descDiagramFile) fd.append('descDiagram', descDiagramFile);
    } else {
      fd.append('ntTitle', ntTitle);
      fd.append('ntPoints', JSON.stringify(ntPoints));
    }
    const url = editingItem
      ? `${API_BASE}/patterns/${itemPatternId}/items/${editingItem._id}`
      : `${API_BASE}/patterns/${itemPatternId}/items`;
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: authH(), body: fd });
    setShowItemModal(false);
    fetchPatterns();
  };

  const delItem = async () => {
    await fetch(`${API_BASE}/patterns/${deleteItem.patternId}/items/${deleteItem.itemId}`, { method: 'DELETE', headers: authH() });
    setDeleteItem(null); fetchPatterns();
  };

  // ── Simple points helpers (information / new / modified tabs) ────────────
  const addPt = (setter) => setter(p => [...p, { text: '' }]);
  const updPt = (setter, i, val) => setter(p => p.map((pt, idx) => idx === i ? { ...pt, text: val } : pt));
  const remPt = (setter, i) => setter(p => p.filter((_, idx) => idx !== i));

  const sorted = [...patterns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const [activeView, setActiveView] = useState('patterns');

  const SLIDE_VIEWS = [
    { key: 'patterns',             label: 'Patterns' },
    { key: 'non-standard-desc',    label: 'Non-standard Speeds - Description' },
    { key: 'non-standard-list',    label: 'Non-standard Speeds - List' },
    { key: 'kicks-in-patterns',    label: 'Kicks in Patterns' },
    { key: 'number-of-movements',  label: 'Number of Movements' },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Pattern Management</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage patterns and all related slide content shown in the mobile app.</p>
        </div>
      </div>

      {/* Top view switcher */}
      <div className="flex gap-1 flex-wrap mb-5 bg-gray-100 p-1 rounded-xl">
        {SLIDE_VIEWS.map(v => (
          <button key={v.key} onClick={() => setActiveView(v.key)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeView === v.key ? 'bg-white text-[#006CB5] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Patterns view */}
      {activeView === 'patterns' && (<>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-base font-bold text-gray-800">Patterns</h4>
          <p className="text-xs text-gray-500 mt-0.5">Add and manage individual patterns with their tab content.</p>
        </div>
        <button onClick={openAddPattern} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
          <FaPlus /> Add Pattern
        </button>
      </div>

      {/* Patterns table */}
      {loading ? <p className="text-gray-400 text-center py-10 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-8">#</th>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Moves</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <React.Fragment key={p._id}>
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => movePattern(p, -1)} className="p-0.5 text-gray-400 hover:text-[#006CB5]"><FaArrowUp size={9} /></button>
                        <button onClick={() => movePattern(p, 1)} className="p-0.5 text-gray-400 hover:text-[#006CB5]"><FaArrowDown size={9} /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.image && <img src={`${BASE_URL}${p.image}`} className="w-8 h-8 rounded object-cover border border-gray-200 flex-shrink-0" alt="" />}
                        <span className="font-semibold text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.moves} mov.</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{(p.items || []).length}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1.5 justify-end items-center">
                        <button onClick={() => openAddItem(p._id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                          <FaPlus size={9} /> Add Item
                        </button>
                        <button onClick={() => openEditPattern(p)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={13} /></button>
                        <button onClick={() => setDeleteId(p._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FaTrash size={13} /></button>
                        <button onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}
                          className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100">
                          {expandedId === p._id ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded tab items */}
                  {expandedId === p._id && (
                    <tr key={`${p._id}-items`}>
                      <td colSpan={6} className="px-0 py-0 bg-gray-50">
                        {(p.items || []).length > 0 ? (
                          <table className="w-full text-xs border-t border-gray-100">
                            <thead>
                              <tr className="text-gray-400 uppercase bg-gray-100">
                                <th className="px-6 py-2 text-left w-8">#</th>
                                <th className="px-4 py-2 text-left">Tab</th>
                                <th className="px-4 py-2 text-left">Title / Name</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(p.items || []).map((item, idx) => (
                                <tr key={item._id} className="border-t border-gray-100 hover:bg-white">
                                  <td className="px-6 py-2 text-gray-400">{idx + 1}</td>
                                  <td className="px-4 py-2">
                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold">{TAB_LABELS[item.tab] || item.tab}</span>
                                  </td>
                                  <td className="px-4 py-2 text-gray-700">
                                    {item.title || item.name || item.infoTitle || item.descHeading || item.ntTitle || '—'}
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <div className="flex gap-1.5 justify-end">
                                      <button onClick={() => setViewItem(item)} className="p-1.5 rounded bg-gray-50 text-gray-600 hover:bg-gray-100"><FaEye size={11} /></button>
                                      <button onClick={() => openEditItem(p._id, item)} className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={11} /></button>
                                      <button onClick={() => setDeleteItem({ patternId: p._id, itemId: item._id })} className="p-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100"><FaTrash size={11} /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-gray-400 text-xs text-center py-4">No tab items yet. Click "Add Item".</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No patterns yet.</p>}
        </div>
      )}
      </>)}

      {/* Slide views */}
      {activeView !== 'patterns' && (
        <SlideSection slideKey={activeView} />
      )}

      {/* Add/Edit Pattern Modal */}
      {showPatternModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">{editingPattern ? 'Edit Pattern' : 'Add Pattern'}</h4>
              <button onClick={() => setShowPatternModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Name <span className="text-red-500">*</span></label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Chon-Ji"
                    value={patternForm.name} onChange={e => setPatternForm({ ...patternForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Moves</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="19"
                    value={patternForm.moves} onChange={e => setPatternForm({ ...patternForm, moves: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Image <span className="text-gray-400 font-normal text-xs">(small thumbnail)</span></label>
                <div className="flex items-center gap-3">
                  {patternImgPreview && <img src={patternImgPreview} className="w-16 h-16 object-cover rounded-lg border border-gray-200" alt="" />}
                  <label className="cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs hover:border-[#006CB5] hover:text-[#006CB5]">
                    {patternImgPreview ? 'Change' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const f = e.target.files[0]; if (!f) return;
                      setPatternImgFile(f); setPatternImgPreview(URL.createObjectURL(f));
                    }} />
                  </label>
                  {patternImgPreview && <button onClick={() => { setPatternImgFile(null); setPatternImgPreview(null); }} className="text-red-400 text-xs">Remove</button>}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowPatternModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={savePattern} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
                {editingPattern ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
              <h4 className="font-bold text-gray-800">{editingItem ? 'Edit Tab Item' : 'Add Tab Item'}</h4>
              <button onClick={() => setShowItemModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">

              {/* Tab */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Tab <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={itemTab} onChange={e => setItemTab(e.target.value)}>
                  {TABS.map(t => <option key={t} value={t}>{TAB_LABELS[t]}</option>)}
                </select>
              </div>

              {/* ── List of Techniques: title, name, korean name, points (each tappable) ── */}
              {itemTab === 'list-of-techniques' && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Hand Techniques"
                      value={lotTitle} onChange={e => setLotTitle(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Name</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Front Kick"
                        value={lotName} onChange={e => setLotName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Korean Name</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Ap Chagi"
                        value={lotKorean} onChange={e => setLotKorean(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">Points <span className="text-gray-400 font-normal text-xs">(tap in app → opens detail page)</span></label>
                      <button type="button"
                        onClick={() => setTechPoints(p => [...p, { text: '', details: [] }])}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                        <FaPlus size={10} /> Add Point
                      </button>
                    </div>
                    {techPoints.length === 0 && <p className="text-gray-400 text-xs">No points yet.</p>}
                    <div className="space-y-3">
                      {techPoints.map((tp, ti) => (
                        <div key={ti} className="border border-gray-200 rounded-xl overflow-hidden">
                          {/* Point label row */}
                          <div className="flex items-center gap-2 p-3 bg-gray-50">
                            <span className="text-xs font-bold text-[#006CB5] flex-shrink-0">• {ti + 1}</span>
                            <input className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white"
                              placeholder="Point label (shown in list)"
                              value={tp.text}
                              onChange={e => setTechPoints(arr => arr.map((t, i) => i === ti ? { ...t, text: e.target.value } : t))} />
                            {/* + button to add a detail section */}
                            <button type="button" title="Add detail section"
                              onClick={() => setTechPoints(arr => arr.map((t, i) => i === ti
                                ? { ...t, details: [...(t.details || []), { title: '', subtitle: '', description: '', heading: '', points: [] }] }
                                : t))}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex-shrink-0"><FaPlus size={10} /></button>
                            <button type="button" onClick={() => setTechPoints(arr => arr.filter((_, i) => i !== ti))}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 flex-shrink-0"><FaTimes size={10} /></button>
                          </div>

                          {/* Detail sections */}
                          {(tp.details || []).map((det, di) => (
                            <div key={di} className="border-t border-gray-100 p-3 space-y-2 bg-white">
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-[#006CB5] font-bold uppercase tracking-wide">Detail Section {di + 1}</p>
                                <button type="button"
                                  onClick={() => setTechPoints(arr => arr.map((t, i) => i !== ti ? t : { ...t, details: t.details.filter((_, j) => j !== di) }))}
                                  className="text-xs text-red-400 hover:text-red-600">Remove</button>
                              </div>
                              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Title"
                                value={det.title}
                                onChange={e => setTechPoints(arr => arr.map((t, i) => i !== ti ? t : { ...t, details: t.details.map((d, j) => j === di ? { ...d, title: e.target.value } : d) }))} />
                              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Subtitle"
                                value={det.subtitle}
                                onChange={e => setTechPoints(arr => arr.map((t, i) => i !== ti ? t : { ...t, details: t.details.map((d, j) => j === di ? { ...d, subtitle: e.target.value } : d) }))} />
                              <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Description"
                                value={det.description}
                                onChange={e => setTechPoints(arr => arr.map((t, i) => i !== ti ? t : { ...t, details: t.details.map((d, j) => j === di ? { ...d, description: e.target.value } : d) }))} />
                              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold" placeholder="Heading (bold)"
                                value={det.heading}
                                onChange={e => setTechPoints(arr => arr.map((t, i) => i !== ti ? t : { ...t, details: t.details.map((d, j) => j === di ? { ...d, heading: e.target.value } : d) }))} />
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-gray-500 font-semibold">Points</span>
                                  <button type="button"
                                    onClick={() => setTechPoints(arr => arr.map((t, i) => i !== ti ? t : { ...t, details: t.details.map((d, j) => j !== di ? d : { ...d, points: [...(d.points || []), { text: '' }] }) }))}
                                    className="text-xs text-[#006CB5] hover:underline">+ Add</button>
                                </div>
                                {(det.points || []).map((pt, pi) => (
                                  <div key={pi} className="flex items-center gap-2 mb-1">
                                    <span className="text-gray-400 text-xs">•</span>
                                    <input className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-gray-50"
                                      placeholder="Point..." value={pt.text}
                                      onChange={e => setTechPoints(arr => arr.map((t, i) => i !== ti ? t : { ...t, details: t.details.map((d, j) => j !== di ? d : { ...d, points: d.points.map((p, k) => k === pi ? { ...p, text: e.target.value } : p) }) }))} />
                                    <button type="button"
                                      onClick={() => setTechPoints(arr => arr.map((t, i) => i !== ti ? t : { ...t, details: t.details.map((d, j) => j !== di ? d : { ...d, points: d.points.filter((_, k) => k !== pi) }) }))}
                                      className="p-1 rounded bg-red-50 text-red-400"><FaTimes size={8} /></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Information ── */}
              {itemTab === 'information' && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Section title..."
                      value={infoTitle} onChange={e => setInfoTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Diagram Image</label>
                    <div className="flex items-center gap-3">
                      {diagramPreview && <img src={diagramPreview} className="w-24 h-24 object-contain rounded-lg border border-gray-200 bg-gray-50" alt="" />}
                      <label className="cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs hover:border-[#006CB5] hover:text-[#006CB5]">
                        {diagramPreview ? 'Change' : 'Upload Diagram'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (!f) return; setDiagramFile(f); setDiagramPreview(URL.createObjectURL(f)); }} />
                      </label>
                      {diagramPreview && <button onClick={() => { setDiagramFile(null); setDiagramPreview(null); }} className="text-red-400 text-xs">Remove</button>}
                    </div>
                  </div>
                  <SimplePointsEditor label="Points" points={infoPoints} setPoints={setInfoPoints} />
                </>
              )}

              {/* ── Description ── */}
              {itemTab === 'description' && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Heading <span className="text-gray-400 font-normal text-xs">(bold)</span></label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold" placeholder="e.g. Sine Wave"
                      value={descHeading} onChange={e => setDescHeading(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Sub-heading</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Down-Up-Down"
                      value={descSubHeading} onChange={e => setDescSubHeading(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Diagram Image <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                    <div className="flex items-center gap-3">
                      {descDiagramPreview && <img src={descDiagramPreview} className="w-24 h-24 object-contain rounded-lg border border-gray-200 bg-gray-50" alt="" />}
                      <label className="cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs hover:border-[#006CB5] hover:text-[#006CB5]">
                        {descDiagramPreview ? 'Change' : 'Upload Diagram'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (!f) return; setDescDiagramFile(f); setDescDiagramPreview(URL.createObjectURL(f)); }} />
                      </label>
                      {descDiagramPreview && <button onClick={() => { setDescDiagramFile(null); setDescDiagramPreview(null); }} className="text-red-400 text-xs">Remove</button>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                    <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Description text..."
                      value={descText} onChange={e => setDescText(e.target.value)} />
                  </div>
                </>
              )}

              {/* ── New Techniques / Modified Techniques ── */}
              {['new-techniques', 'modified-techniques'].includes(itemTab) && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Title..."
                      value={ntTitle} onChange={e => setNtTitle(e.target.value)} />
                  </div>
                  <SimplePointsEditor label="Points" points={ntPoints} setPoints={setNtPoints} />
                </>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowItemModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={saveItem} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
                {editingItem ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && <ConfirmModal message="Delete this pattern and all its content?" onConfirm={deletePattern} onCancel={() => setDeleteId(null)} />}
      {deleteItem && <ConfirmModal message="Delete this tab item?" onConfirm={delItem} onCancel={() => setDeleteItem(null)} />}

      {/* View Item Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Item</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{TAB_LABELS[viewItem.tab] || viewItem.tab}</span>

              {/* List of Techniques */}
              {viewItem.tab === 'list-of-techniques' && (
                <>
                  {viewItem.title && <p><span className="font-semibold text-gray-700">Title: </span>{viewItem.title}</p>}
                  {viewItem.name && <p><span className="font-semibold text-gray-700">Name: </span>{viewItem.name} {viewItem.koreanName && <span className="text-gray-400">({viewItem.koreanName})</span>}</p>}
                  {(viewItem.techPoints || []).length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Points ({viewItem.techPoints.length}):</p>
                      {viewItem.techPoints.map((tp, i) => (
                        <div key={i} className="ml-2 mb-2">
                          <p className="text-gray-700">• {tp.text} {(tp.details || []).length > 0 && <span className="text-[#006CB5] text-xs">({tp.details.length} detail section{tp.details.length > 1 ? 's' : ''})</span>}</p>
                          {(tp.details || []).map((det, di) => (
                            <div key={di} className="ml-4 mt-1 p-2 bg-gray-50 rounded-lg text-xs space-y-0.5">
                              {det.title && <p><span className="font-semibold">Title:</span> {det.title}</p>}
                              {det.subtitle && <p><span className="font-semibold">Subtitle:</span> {det.subtitle}</p>}
                              {det.description && <p><span className="font-semibold">Description:</span> {det.description}</p>}
                              {det.heading && <p><span className="font-semibold">Heading:</span> {det.heading}</p>}
                              {(det.points || []).length > 0 && <p><span className="font-semibold">Points:</span> {det.points.map(p => p.text).join(', ')}</p>}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Information */}
              {viewItem.tab === 'information' && (
                <>
                  {viewItem.infoTitle && <p><span className="font-semibold text-gray-700">Title: </span>{viewItem.infoTitle}</p>}
                  {viewItem.diagram && <img src={`${BASE_URL}${viewItem.diagram}`} className="w-full h-40 object-contain rounded-lg border border-gray-200 bg-gray-50 mt-2" alt="" />}
                  {(viewItem.points || []).length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Points:</p>
                      {viewItem.points.map((pt, i) => <p key={i} className="ml-2 text-gray-600">• {pt.text}</p>)}
                    </div>
                  )}
                </>
              )}

              {/* Description */}
              {viewItem.tab === 'description' && (
                <>
                  {viewItem.descHeading && <p className="text-lg font-bold text-gray-800">{viewItem.descHeading}</p>}
                  {viewItem.descSubHeading && <p className="text-gray-500">{viewItem.descSubHeading}</p>}
                  {viewItem.descDiagram && <img src={`${BASE_URL}${viewItem.descDiagram}`} className="w-full h-40 object-contain rounded-lg border border-gray-200 bg-gray-50 mt-2" alt="" />}
                  {viewItem.description && <p className="text-gray-600 leading-relaxed">{viewItem.description}</p>}
                </>
              )}

              {/* New / Modified Techniques */}
              {['new-techniques', 'modified-techniques'].includes(viewItem.tab) && (
                <>
                  {viewItem.ntTitle && <p><span className="font-semibold text-gray-700">Title: </span>{viewItem.ntTitle}</p>}
                  {(viewItem.ntPoints || []).length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Points:</p>
                      {viewItem.ntPoints.map((pt, i) => <p key={i} className="ml-2 text-gray-600">• {pt.text}</p>)}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="p-5 border-t flex justify-end gap-2">
              <button onClick={() => { const pid = patterns.find(p => (p.items || []).some(it => it._id === viewItem._id))?._id; setViewItem(null); if (pid) openEditItem(pid, viewItem); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
                <FaEdit size={12} /> Edit
              </button>
              <button onClick={() => setViewItem(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable simple points editor (no sub-points)
function SimplePointsEditor({ label, points, setPoints }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <button type="button" onClick={() => setPoints(p => [...p, { text: '' }])}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
          <FaPlus size={10} /> Add Point
        </button>
      </div>
      {points.length === 0 && <p className="text-gray-400 text-xs">No points yet.</p>}
      <div className="space-y-2">
        {points.map((pt, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-gray-400 text-xs w-3 flex-shrink-0">•</span>
            <input className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              placeholder="Point text..." value={pt.text}
              onChange={e => setPoints(p => p.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x))} />
            <button type="button" onClick={() => setPoints(p => p.filter((_, idx) => idx !== i))}
              className="p-1.5 rounded-lg bg-red-50 text-red-400 flex-shrink-0"><FaTimes size={9} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide Section Component ───────────────────────────────────────────────────
const SLIDE_LABELS = {
  'non-standard-desc':   'Non-standard Speeds - Description',
  'non-standard-list':   'Non-standard Speeds - List',
  'kicks-in-patterns':   'Kicks in Patterns',
  'number-of-movements': 'Number of Movements',
};

function SlideSection({ slideKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', name: '', moves: '' });
  const [headings, setHeadings] = useState([]);
  const [points, setPoints] = useState([]);
  const [imgFiles, setImgFiles] = useState([]);
  const [imgPreviews, setImgPreviews] = useState([]);

  const isListType = ['non-standard-list', 'number-of-movements'].includes(slideKey);

  useEffect(() => { fetchItems(); }, [slideKey]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pattern-slides?slide=${slideKey}`);
      const d = await res.json();
      setItems(d.data || []);
    } finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', subtitle: '', description: '', name: '', moves: '' });
    setHeadings([]); setPoints([]);
    setImgFiles([]); setImgPreviews([]);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title || '', subtitle: item.subtitle || '', description: item.description || '', name: item.name || '', moves: item.moves || '', number: item.number || '' });
    setHeadings([...(item.headings || [])]);
    setPoints(JSON.parse(JSON.stringify(item.points || [])));
    setImgFiles([]);
    setImgPreviews((item.images || []).map(url => ({ url: `${BASE_URL}${url}`, isExisting: true, path: url })));
    setShowModal(true);
  };

  const save = async () => {
    const fd = new FormData();
    fd.append('slide', slideKey);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('headings', JSON.stringify(headings.filter(Boolean)));
    fd.append('points', JSON.stringify(points));
    const existingPaths = imgPreviews.filter(p => p.isExisting).map(p => p.path);
    fd.append('existingImages', JSON.stringify(existingPaths));
    imgFiles.forEach(f => fd.append('images', f));
    const url = editing ? `${API_BASE}/pattern-slides/${editing._id}` : `${API_BASE}/pattern-slides`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: fd });
    setShowModal(false); fetchItems();
  };

  const del = async () => {
    await fetch(`${API_BASE}/pattern-slides/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null); fetchItems();
  };

  const moveItem = async (item, dir) => {
    const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(x => x._id === item._id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    setItems(prev => prev.map(x => {
      if (x._id === sorted[idx]._id) return { ...x, order: swapIdx };
      if (x._id === sorted[swapIdx]._id) return { ...x, order: idx };
      return x;
    }));
    await Promise.all([
      fetch(`${API_BASE}/pattern-slides/${sorted[idx]._id}/order`, { method: 'PATCH', headers: jsonH(), body: JSON.stringify({ order: swapIdx }) }),
      fetch(`${API_BASE}/pattern-slides/${sorted[swapIdx]._id}/order`, { method: 'PATCH', headers: jsonH(), body: JSON.stringify({ order: idx }) }),
    ]);
    fetchItems();
  };

  const addPt = () => setPoints(p => [...p, { text: '', subPoints: [] }]);
  const updPt = (i, v) => setPoints(p => p.map((pt, idx) => idx === i ? { ...pt, text: v } : pt));
  const remPt = (i) => setPoints(p => p.filter((_, idx) => idx !== i));
  const addSub = (i) => setPoints(p => p.map((pt, idx) => idx === i ? { ...pt, subPoints: [...(pt.subPoints || []), { text: '' }] } : pt));
  const updSub = (i, si, v) => setPoints(p => p.map((pt, idx) => idx !== i ? pt : { ...pt, subPoints: pt.subPoints.map((sp, sidx) => sidx === si ? { ...sp, text: v } : sp) }));
  const remSub = (i, si) => setPoints(p => p.map((pt, idx) => idx !== i ? pt : { ...pt, subPoints: pt.subPoints.filter((_, sidx) => sidx !== si) }));

  const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-base font-bold text-gray-800">{SLIDE_LABELS[slideKey]}</h4>
          <p className="text-xs text-gray-500 mt-0.5">Manage content for this slide.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
          <FaPlus /> Add Section
        </button>
      </div>

      {loading ? <p className="text-gray-400 text-center py-8 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-8">#</th>
                <th className="px-4 py-3 w-8"></th>
                {/* non-standard-desc */}
                {slideKey === 'non-standard-desc' && <><th className="px-4 py-3">Title</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Points</th></>}
                {/* non-standard-list */}
                {slideKey === 'non-standard-list' && <><th className="px-4 py-3">Title</th><th className="px-4 py-3">Points</th></>}
                {/* kicks-in-patterns */}
                {slideKey === 'kicks-in-patterns' && <><th className="px-4 py-3">Title</th><th className="px-4 py-3">Points</th></>}
                {/* number-of-movements */}
                {slideKey === 'number-of-movements' && <><th className="px-4 py-3">Title</th><th className="px-4 py-3">Number</th><th className="px-4 py-3">Description</th></>}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, i) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveItem(item, -1)} className="p-0.5 text-gray-400 hover:text-[#006CB5]"><FaArrowUp size={9} /></button>
                      <button onClick={() => moveItem(item, 1)} className="p-0.5 text-gray-400 hover:text-[#006CB5]"><FaArrowDown size={9} /></button>
                    </div>
                  </td>
                  {slideKey === 'non-standard-desc' && (
                    <>
                      <td className="px-4 py-3 font-semibold text-gray-800">{item.title || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{item.description || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {(item.points || []).length > 0
                          ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600">{item.points.length}</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    </>
                  )}
                  {slideKey === 'non-standard-list' && (
                    <>
                      <td className="px-4 py-3 font-semibold text-gray-800">{item.title || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {(item.points || []).length > 0
                          ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{item.points.length}</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    </>
                  )}
                  {slideKey === 'kicks-in-patterns' && (
                    <>
                      <td className="px-4 py-3 font-semibold text-gray-800">{item.title || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {(item.points || []).length > 0
                          ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600">{item.points.length}</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    </>
                  )}
                  {slideKey === 'number-of-movements' && (
                    <>
                      <td className="px-4 py-3 font-semibold text-gray-800">{item.title || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.number || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{item.description || '—'}</td>
                    </>
                  )}
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
          {sorted.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No sections yet.</p>}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit Section' : 'Add Section'}</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">

              {/* List types */}
              {isListType && (
                slideKey === 'non-standard-list' ? (
                  /* Non-standard speeds list: same structure as kicks-in-patterns */
                  <>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Normal Motion"
                        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-700">Points <span className="text-gray-400 font-normal text-xs">(+ to add entries)</span></label>
                        <button type="button" onClick={() => setPoints(p => [...p, { text: '', kickEntries: [] }])}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                          <FaPlus size={10} /> Add Point
                        </button>
                      </div>
                      {points.length === 0 && <p className="text-gray-400 text-xs">No points yet.</p>}
                      <div className="space-y-3">
                        {points.map((pt, i) => (
                          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="flex items-center gap-2 p-3 bg-gray-50">
                              <span className="text-xs font-bold text-[#006CB5] flex-shrink-0">• {i + 1}</span>
                              <input className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white"
                                placeholder="Point label (shown in list)"
                                value={pt.text}
                                onChange={e => setPoints(arr => arr.map((p, idx) => idx === i ? { ...p, text: e.target.value } : p))} />
                              <button type="button" title="Add entry"
                                onClick={() => setPoints(arr => arr.map((p, idx) => idx === i
                                  ? { ...p, kickEntries: [...(p.kickEntries || []), { patternName: '', number: '', rows: [] }] }
                                  : p))}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex-shrink-0"><FaPlus size={10} /></button>
                              <button type="button" onClick={() => setPoints(arr => arr.filter((_, idx) => idx !== i))}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 flex-shrink-0"><FaTimes size={10} /></button>
                            </div>
                            {(pt.kickEntries || []).map((ke, ki) => (
                              <div key={ki} className="border-t border-gray-100 p-3 space-y-2 bg-white">
                                <div className="flex justify-between items-center">
                                  <p className="text-xs text-[#006CB5] font-bold uppercase tracking-wide">Entry {ki + 1}</p>
                                  <button type="button"
                                    onClick={() => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.filter((_, j) => j !== ki) }))}
                                    className="text-xs text-red-400 hover:text-red-600">Remove</button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-gray-500 block mb-1">Pattern Name</label>
                                    <input className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" placeholder="e.g. Do-San"
                                      value={ke.patternName}
                                      onChange={e => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j === ki ? { ...k, patternName: e.target.value } : k) }))} />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-500 block mb-1">Number</label>
                                    <input className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" placeholder="e.g. 14."
                                      value={ke.number}
                                      onChange={e => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j === ki ? { ...k, number: e.target.value } : k) }))} />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500 font-semibold">Korean Term + Description rows</span>
                                    <button type="button"
                                      onClick={() => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j !== ki ? k : { ...k, rows: [...(k.rows || []), { koreanTerm: '', description: '' }] }) }))}
                                      className="text-xs text-[#006CB5] hover:underline">+ Add Row</button>
                                  </div>
                                  {(ke.rows || []).length === 0 && <p className="text-gray-400 text-xs">No rows yet. Click + Add Row.</p>}
                                  {(ke.rows || []).map((row, ri) => (
                                    <div key={ri} className="border border-gray-100 rounded-lg p-2 mb-2 bg-gray-50 space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Row {ri + 1}</span>
                                        <button type="button"
                                          onClick={() => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j !== ki ? k : { ...k, rows: k.rows.filter((_, r) => r !== ri) }) }))}
                                          className="text-xs text-red-400">Remove</button>
                                      </div>
                                      <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs" placeholder="Korean term"
                                        value={row.koreanTerm}
                                        onChange={e => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j !== ki ? k : { ...k, rows: k.rows.map((r, ri2) => ri2 === ri ? { ...r, koreanTerm: e.target.value } : r) }) }))} />
                                      <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs" placeholder="Description"
                                        value={row.description}
                                        onChange={e => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j !== ki ? k : { ...k, rows: k.rows.map((r, ri2) => ri2 === ri ? { ...r, description: e.target.value } : r) }) }))} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* number-of-movements: title, number, description */
                  <>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Chon-Ji"
                        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Number</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 19"
                        value={form.number || ''} onChange={e => setForm({ ...form, number: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                      <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Description..."
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                  </>
                )
              )}

              {/* Rich content types */}
              {!isListType && (
                slideKey === 'kicks-in-patterns' ? (
                  /* Kicks in Patterns: title + points with kick entries */
                  <>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Front Snap Kick"
                        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-700">Points <span className="text-gray-400 font-normal text-xs">(+ to add kick entries)</span></label>
                        <button type="button" onClick={() => setPoints(p => [...p, { text: '', kickEntries: [] }])}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                          <FaPlus size={10} /> Add Point
                        </button>
                      </div>
                      {points.length === 0 && <p className="text-gray-400 text-xs">No points yet.</p>}
                      <div className="space-y-3">
                        {points.map((pt, i) => (
                          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="flex items-center gap-2 p-3 bg-gray-50">
                              <span className="text-xs font-bold text-[#006CB5] flex-shrink-0">• {i + 1}</span>
                              <input className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white"
                                placeholder="Point label (e.g. Do-San)"
                                value={pt.text}
                                onChange={e => setPoints(arr => arr.map((p, idx) => idx === i ? { ...p, text: e.target.value } : p))} />
                              <button type="button" title="Add kick entry"
                                onClick={() => setPoints(arr => arr.map((p, idx) => idx === i
                                  ? { ...p, kickEntries: [...(p.kickEntries || []), { patternName: '', number: '', koreanTerm: '', level: '', description: '' }] }
                                  : p))}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex-shrink-0"><FaPlus size={10} /></button>
                              <button type="button" onClick={() => setPoints(arr => arr.filter((_, idx) => idx !== i))}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 flex-shrink-0"><FaTimes size={10} /></button>
                            </div>
                            {/* Kick entries */}
                            {(pt.kickEntries || []).map((ke, ki) => (
                              <div key={ki} className="border-t border-gray-100 p-3 space-y-2 bg-white">
                                <div className="flex justify-between items-center">
                                  <p className="text-xs text-[#006CB5] font-bold uppercase tracking-wide">Entry {ki + 1}</p>
                                  <button type="button"
                                    onClick={() => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.filter((_, j) => j !== ki) }))}
                                    className="text-xs text-red-400 hover:text-red-600">Remove</button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-gray-500 block mb-1">Pattern Name</label>
                                    <input className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" placeholder="e.g. Do-San"
                                      value={ke.patternName}
                                      onChange={e => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j === ki ? { ...k, patternName: e.target.value } : k) }))} />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-500 block mb-1">Number</label>
                                    <input className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" placeholder="e.g. 14."
                                      value={ke.number}
                                      onChange={e => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j === ki ? { ...k, number: e.target.value } : k) }))} />
                                  </div>
                                </div>
                                {/* Rows: korean term + description */}
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500 font-semibold">Korean Term + Description rows</span>
                                    <button type="button"
                                      onClick={() => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j !== ki ? k : { ...k, rows: [...(k.rows || []), { koreanTerm: '', description: '' }] }) }))}
                                      className="text-xs text-[#006CB5] hover:underline">+ Add Row</button>
                                  </div>
                                  {(ke.rows || []).length === 0 && <p className="text-gray-400 text-xs">No rows yet. Click + Add Row.</p>}
                                  {(ke.rows || []).map((row, ri) => (
                                    <div key={ri} className="border border-gray-100 rounded-lg p-2 mb-2 bg-gray-50 space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Row {ri + 1}</span>
                                        <button type="button"
                                          onClick={() => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j !== ki ? k : { ...k, rows: k.rows.filter((_, r) => r !== ri) }) }))}
                                          className="text-xs text-red-400">Remove</button>
                                      </div>
                                      <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs" placeholder="Korean term (e.g. kaunde)"
                                        value={row.koreanTerm}
                                        onChange={e => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j !== ki ? k : { ...k, rows: k.rows.map((r, ri2) => ri2 === ri ? { ...r, koreanTerm: e.target.value } : r) }) }))} />
                                      <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs" placeholder="Description (e.g. As in the previous technique...)"
                                        value={row.description}
                                        onChange={e => setPoints(arr => arr.map((p, idx) => idx !== i ? p : { ...p, kickEntries: p.kickEntries.map((k, j) => j !== ki ? k : { ...k, rows: k.rows.map((r, ri2) => ri2 === ri ? { ...r, description: e.target.value } : r) }) }))} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* non-standard-desc: title, description, points */
                  <>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Title..."
                        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                      <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Description..."
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-700">Points</label>
                        <button type="button" onClick={addPt}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                          <FaPlus size={10} /> Add Point
                        </button>
                      </div>
                      {points.length === 0 && <p className="text-gray-400 text-xs">No points yet.</p>}
                      <div className="space-y-2">
                        {points.map((pt, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-xs w-3 flex-shrink-0">•</span>
                              <input className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                                placeholder="Point text..." value={pt.text} onChange={e => updPt(i, e.target.value)} />
                              <button type="button" onClick={() => addSub(i)} className="p-1.5 rounded-lg bg-blue-50 text-blue-500 flex-shrink-0"><FaPlus size={9} /></button>
                              <button type="button" onClick={() => remPt(i)} className="p-1.5 rounded-lg bg-red-50 text-red-400 flex-shrink-0"><FaTimes size={9} /></button>
                            </div>
                            {(pt.subPoints || []).map((sp, si) => (
                              <div key={si} className="flex items-center gap-2 ml-6">
                                <span className="text-gray-300 text-xs w-3 flex-shrink-0">◦</span>
                                <input className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50"
                                  placeholder="Sub-point..." value={sp.text} onChange={e => updSub(i, si, e.target.value)} />
                                <button type="button" onClick={() => remSub(i, si)} className="p-1.5 rounded-lg bg-red-50 text-red-300 flex-shrink-0"><FaTimes size={8} /></button>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
            <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
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
              <h4 className="font-bold text-gray-800">View Section</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {viewItem.name && <p><span className="font-semibold text-gray-700">Name: </span>{viewItem.name}</p>}
              {viewItem.moves && <p><span className="font-semibold text-gray-700">Moves: </span>{viewItem.moves} mov.</p>}
              {viewItem.title && <p className="text-lg font-bold text-gray-800">{viewItem.title}</p>}
              {viewItem.subtitle && <p className="text-gray-500">{viewItem.subtitle}</p>}
              {viewItem.description && <p className="text-gray-600 leading-relaxed">{viewItem.description}</p>}
              {(viewItem.headings || []).length > 0 && (
                <div><p className="font-semibold text-gray-700 mb-1">Headings:</p>
                  {viewItem.headings.map((h, i) => <p key={i} className="ml-2 text-gray-600 font-semibold">• {h}</p>)}
                </div>
              )}
              {(viewItem.points || []).length > 0 && (
                <div><p className="font-semibold text-gray-700 mb-1">Points:</p>
                  {viewItem.points.map((pt, i) => (
                    <div key={i} className="ml-2">
                      <p className="text-gray-600">• {pt.text}</p>
                      {(pt.subPoints || []).map((sp, si) => <p key={si} className="ml-4 text-gray-400 text-xs">◦ {sp.text}</p>)}
                    </div>
                  ))}
                </div>
              )}
              {(viewItem.images || []).length > 0 && (
                <div className="space-y-2">
                  {viewItem.images.map((img, i) => (
                    <img key={i} src={`${BASE_URL}${img}`} className="w-full h-40 object-contain rounded-lg border border-gray-200 bg-gray-50" alt="" />
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

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-gray-800 font-semibold mb-6 text-center">Delete this section?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600">Cancel</button>
              <button onClick={del} className="flex-1 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: '#dc2626' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
