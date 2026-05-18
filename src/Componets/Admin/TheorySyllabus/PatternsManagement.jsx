import { useState, useEffect } from 'react';
import React from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye, FaArrowUp, FaArrowDown, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';
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
  const [entries, setEntries] = useState({}); // { patternId: [entries] }
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

  // Pattern Group Manager state
  const [showPatternGroupManager, setShowPatternGroupManager] = useState(false);
  const [managingPointIndex, setManagingPointIndex] = useState(null);
  const [managingPoint, setManagingPoint] = useState(null);
  const [patternGroups, setPatternGroups] = useState([]);

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

  const [patternError, setPatternError] = useState('');

  useEffect(() => { fetchPatterns(); }, []);

  const fetchPatterns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/patterns`);
      const d = await res.json();
      const patternsData = d.data || [];
      setPatterns(patternsData);
      
      console.log('📋 All patterns:', patternsData.map(p => ({ id: p._id.slice(-6), name: p.name })));
      
      // Fetch entries for each pattern
      const entriesMap = {};
      for (const pattern of patternsData) {
        try {
          const entriesRes = await fetch(`${API_BASE}/patterns/${pattern._id}/entries`);
          const entriesData = await entriesRes.json();
          entriesMap[pattern._id] = entriesData.data || [];
          console.log(`✅ Pattern "${pattern.name}" (${pattern._id.slice(-6)}): ${entriesMap[pattern._id].length} entries`);
          if (entriesMap[pattern._id].length > 0) {
            console.log(`   Entries:`, entriesMap[pattern._id].map(e => ({ id: e._id.slice(-6), tab: e.tab, title: e.title || e.name })));
          }
        } catch (err) {
          console.error(`❌ Failed to fetch entries for pattern ${pattern._id}:`, err);
          entriesMap[pattern._id] = [];
        }
      }
      console.log('📊 Final entries map:', entriesMap);
      setEntries(entriesMap);
    } finally { setLoading(false); }
  };

  // ── Pattern CRUD ─────────────────────────────────────────────────────────
  const openAddPattern = () => {
    setEditingPattern(null);
    setPatternForm({ name: '', moves: '', order: patterns.length });
    setPatternImgFile(null); setPatternImgPreview(null);
    setPatternError('');
    setItemPatternId(null); // ← Clear itemPatternId when opening pattern modal
    setShowPatternModal(true);
  };

  const openEditPattern = (p) => {
    setEditingPattern(p);
    setPatternForm({ name: p.name, moves: p.moves, order: p.order });
    setPatternImgFile(null);
    setPatternImgPreview(p.image ? `${BASE_URL}${p.image}` : null);
    setPatternError('');
    setShowPatternModal(true);
  };

  const savePattern = async () => {
    setPatternError('');
    
    // Validation: Check if name is empty
    if (!patternForm.name.trim()) {
      setPatternError('Pattern name is required');
      return;
    }

    const fd = new FormData();
    Object.entries(patternForm).forEach(([k, v]) => fd.append(k, v));
    if (patternImgFile) fd.append('image', patternImgFile);
    // preserve existing image when editing without uploading a new one
    if (editingPattern && !patternImgFile && editingPattern.image) {
      fd.append('existingImage', editingPattern.image);
    }
    const url = editingPattern ? `${API_BASE}/patterns/${editingPattern._id}` : `${API_BASE}/patterns`;
    
    try {
      const res = await fetch(url, { method: editingPattern ? 'PUT' : 'POST', headers: authH(), body: fd });
      const data = await res.json();
      
      if (!res.ok) {
        setPatternError(data.message || 'Failed to save pattern');
        return;
      }
      
      // If creating new pattern, add it to state immediately with empty entries
      if (!editingPattern && data.data) {
        const newPattern = data.data;
        setPatterns(prev => [...prev, newPattern]);
        setEntries(prev => ({ ...prev, [newPattern._id]: [] })); // Empty entries for new pattern
        console.log(`✅ New pattern created: ${newPattern.name} (${newPattern._id}) with 0 entries`);
      }
      
      setShowPatternModal(false);
      // Only fetch if editing, not if creating (we already updated state)
      if (editingPattern) {
        fetchPatterns();
      }
    } catch (err) {
      setPatternError('Error saving pattern: ' + err.message);
    }
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
    console.log(`🔵 Opening Add Item modal for pattern: ${patternId}`);
    const pattern = patterns.find(p => p._id === patternId);
    console.log(`   Pattern name: ${pattern?.name}, ID: ${patternId.slice(-6)}`);
    
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
      ? `${API_BASE}/patterns/entries/${editingItem._id}`
      : `${API_BASE}/patterns/${itemPatternId}/entries`;
    
    const patternName = patterns.find(p => p._id === itemPatternId)?.name || 'Unknown';
    console.log(`\n📤 SAVING ENTRY:`);
    console.log(`   Pattern: ${patternName} (${itemPatternId.slice(-6)})`);
    console.log(`   URL: ${url}`);
    console.log(`   Tab: ${itemTab}`);
    
    try {
      const res = await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: authH(), body: fd });
      const data = await res.json();
      
      if (!res.ok) {
        console.error('❌ Failed to save entry:', data.message);
        return;
      }
      
      console.log(`✅ Entry saved successfully`);
      console.log(`   Response patternId: ${data.data.patternId.slice(-6)}`);
      console.log(`   Response patternName: ${data.data.patternName}`);
      
      // Update entries state immediately
      if (editingItem) {
        // Update existing entry
        setEntries(prev => ({
          ...prev,
          [itemPatternId]: prev[itemPatternId].map(e => e._id === editingItem._id ? data.data : e)
        }));
        console.log(`✅ Entry updated in pattern ${itemPatternId}`);
      } else {
        // Add new entry
        setEntries(prev => ({
          ...prev,
          [itemPatternId]: [...(prev[itemPatternId] || []), data.data]
        }));
        console.log(`✅ Entry added to pattern ${itemPatternId}. Total: ${(entries[itemPatternId] || []).length + 1}`);
      }
      
      setShowItemModal(false);
    } catch (err) {
      console.error('❌ Error saving entry:', err);
    }
  };

  const delItem = async () => {
    try {
      const res = await fetch(`${API_BASE}/patterns/entries/${deleteItem.itemId}`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      
      if (!res.ok) {
        console.error('❌ Failed to delete entry:', data.message);
        return;
      }
      
      // Update entries state immediately
      setEntries(prev => ({
        ...prev,
        [deleteItem.patternId]: prev[deleteItem.patternId].filter(e => e._id !== deleteItem.itemId)
      }));
      console.log(`✅ Entry deleted from pattern ${deleteItem.patternId}`);
      
      setDeleteItem(null);
    } catch (err) {
      console.error('❌ Error deleting entry:', err);
    }
  };

  // ── Simple points helpers (information / new / modified tabs) ────────────
  const addPt = (setter) => setter(p => [...p, { text: '' }]);
  const updPt = (setter, i, val) => setter(p => p.map((pt, idx) => idx === i ? { ...pt, text: val } : pt));
  const remPt = (setter, i) => setter(p => p.filter((_, idx) => idx !== i));

  const sorted = [...patterns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const [activeView, setActiveView] = useState('patterns');

  // ── Patterns tab search + pagination ──────────────────────
  const PAGE_SIZE = 10;
  const [patternSearch, setPatternSearch] = useState('');
  const [patternPage, setPatternPage] = useState(1);

  const filteredPatterns = sorted.filter(p =>
    patternSearch.trim() === '' ||
    p.name?.toLowerCase().includes(patternSearch.trim().toLowerCase())
  );
  const patternTotalPages = Math.max(1, Math.ceil(filteredPatterns.length / PAGE_SIZE));
  const patternPageSafe = Math.min(patternPage, patternTotalPages);
  const pagedPatterns = filteredPatterns.slice((patternPageSafe - 1) * PAGE_SIZE, patternPageSafe * PAGE_SIZE);

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
          {/* Search bar */}
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={patternSearch}
                onChange={e => { setPatternSearch(e.target.value); setPatternPage(1); }}
                placeholder="Search patterns..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
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
              {pagedPatterns.map((p, i) => (
                <React.Fragment key={p._id}>
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{(patternPageSafe - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => movePattern(p, -1)} className="p-0.5 text-gray-400 hover:text-[#006CB5]"><FaArrowUp size={9} /></button>
                        <button onClick={() => movePattern(p, 1)} className="p-0.5 text-gray-400 hover:text-[#006CB5]"><FaArrowDown size={9} /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.image && <img src={`${BASE_URL}${p.image}`} className="w-8 h-8 rounded object-cover border border-gray-200 flex-shrink-0" alt="" />}
                        <div>
                          <span className="font-semibold text-gray-800">{p.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.moves} mov.</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{(entries[p._id] || []).length}</span>
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
                        {(entries[p._id] || []).length > 0 ? (
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
                              {(entries[p._id] || []).map((item, idx) => (
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
          {filteredPatterns.length === 0 && (
            <p className="text-gray-400 text-center py-8 text-sm">
              {patternSearch ? 'No patterns match your search.' : 'No patterns yet.'}
            </p>
          )}
          {filteredPatterns.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-gray-500">
                Showing {filteredPatterns.length === 0 ? 0 : (patternPageSafe - 1) * PAGE_SIZE + 1}–{Math.min(patternPageSafe * PAGE_SIZE, filteredPatterns.length)} of {filteredPatterns.length}
              </span>
              {patternTotalPages > 1 && (
                <div className="flex gap-1 items-center">
                  <button onClick={() => setPatternPage(p => Math.max(1, p - 1))} disabled={patternPageSafe === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40"
                    style={{ borderColor: '#006CB5', color: '#006CB5' }}>Previous</button>
                  {Array.from({ length: patternTotalPages }, (_, i) => i + 1).map(pg => (
                    <button key={pg} onClick={() => setPatternPage(pg)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                      style={pg === patternPageSafe
                        ? { backgroundColor: '#006CB5', color: '#fff', borderColor: '#006CB5' }
                        : { borderColor: '#006CB5', color: '#006CB5' }}>
                      {pg}
                    </button>
                  ))}
                  <button onClick={() => setPatternPage(p => Math.min(patternTotalPages, p + 1))} disabled={patternPageSafe === patternTotalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40"
                    style={{ borderColor: '#006CB5', color: '#006CB5' }}>Next</button>
                </div>
              )}
            </div>
          )}
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
              {patternError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600 font-semibold">{patternError}</p>
                </div>
              )}
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
              <div>
                <h4 className="font-bold text-gray-800">{editingItem ? 'Edit Tab Item' : 'Add Tab Item'}</h4>
                <p className="text-xs text-gray-500 mt-1">Pattern: {patterns.find(p => p._id === itemPatternId)?.name}</p>
              </div>
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

  // Pattern Group Manager state
  const [showPatternGroupManager, setShowPatternGroupManager] = useState(false);
  const [managingPointIndex, setManagingPointIndex] = useState(null);
  const [managingPoint, setManagingPoint] = useState(null);
  const [patternGroups, setPatternGroups] = useState([]);

  // Single Pattern Entry form state (embedded in Pattern Group Manager)
  const [patternEntryForm, setPatternEntryForm] = useState({
    patternName: '',
    entries: [{ number: '', koreanTerm: '', description: '' }]
  });

  // Staging area — entries being built before "Save as Box"
  const [stagingEntries, setStagingEntries] = useState([]);
  // When set, "Save as Box" appends to this existing groupId instead of creating a new box
  const [stagingTargetGroupId, setStagingTargetGroupId] = useState(null);

  // Single entry editing state
  const [editingEntryIndex, setEditingEntryIndex] = useState(null);
  const [editingEntryData, setEditingEntryData] = useState({
    patternName: '',
    number: '',
    koreanTerm: '',
    description: ''
  });

  // Single entry editing functions
  const startEditingEntry = (entry, originalIndex) => {
    const number = entry.number || '';
    const koreanTerm = entry.rows?.[0]?.koreanTerm || entry.koreanTerm || '';
    const description = entry.rows?.[0]?.description || entry.description || '';
    const patternName = entry.patternName || '';
    
    setEditingEntryIndex(originalIndex);
    setEditingEntryData({
      patternName,
      number: number.toString().replace('.', ''),
      koreanTerm,
      description
    });
  };

  const saveEditingEntry = () => {
    // Update the entry in patternGroups
    setPatternGroups(prev => prev.map((group, index) => {
      if (index === editingEntryIndex) {
        return {
          ...group,
          patternName: editingEntryData.patternName,
          number: editingEntryData.number,
          rows: [{
            koreanTerm: editingEntryData.koreanTerm,
            description: editingEntryData.description
          }]
        };
      }
      return group;
    }));
    
    // Reset editing state
    setEditingEntryIndex(null);
    setEditingEntryData({
      patternName: '',
      number: '',
      koreanTerm: '',
      description: ''
    });
  };

  const cancelEditingEntry = () => {
    setEditingEntryIndex(null);
    setEditingEntryData({
      patternName: '',
      number: '',
      koreanTerm: '',
      description: ''
    });
  };

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
    // Set order to be higher than the highest existing order
    let maxOrder = 0;
    if (items.length > 0) {
      const orders = items.map(i => i.order || 0).filter(o => typeof o === 'number');
      maxOrder = orders.length > 0 ? Math.max(...orders) : 0;
    }
    setForm({ title: '', subtitle: '', description: '', name: '', moves: '', number: '', order: maxOrder + 1 });
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
    
    // Get the actual order values to swap
    const currentOrder = sorted[idx].order ?? idx;
    const swapOrder = sorted[swapIdx].order ?? swapIdx;
    
    // Update local state immediately for better UX
    setItems(prev => prev.map(x => {
      if (x._id === sorted[idx]._id) return { ...x, order: swapOrder };
      if (x._id === sorted[swapIdx]._id) return { ...x, order: currentOrder };
      return x;
    }));
    
    // Update backend
    await Promise.all([
      fetch(`${API_BASE}/pattern-slides/${sorted[idx]._id}/order`, { method: 'PATCH', headers: jsonH(), body: JSON.stringify({ order: swapOrder }) }),
      fetch(`${API_BASE}/pattern-slides/${sorted[swapIdx]._id}/order`, { method: 'PATCH', headers: jsonH(), body: JSON.stringify({ order: currentOrder }) }),
    ]);
    fetchItems();
  };

  const addPt = () => setPoints(p => [...p, { text: '', subPoints: [] }]);
  const updPt = (i, v) => setPoints(p => p.map((pt, idx) => idx === i ? { ...pt, text: v } : pt));
  const remPt = (i) => setPoints(p => p.filter((_, idx) => idx !== i));
  const addSub = (i) => setPoints(p => p.map((pt, idx) => idx === i ? { ...pt, subPoints: [...(pt.subPoints || []), { text: '' }] } : pt));
  const updSub = (i, si, v) => setPoints(p => p.map((pt, idx) => idx !== i ? pt : { ...pt, subPoints: pt.subPoints.map((sp, sidx) => sidx === si ? { ...sp, text: v } : sp) }));
  const remSub = (i, si) => setPoints(p => p.map((pt, idx) => idx !== i ? pt : { ...pt, subPoints: pt.subPoints.filter((_, sidx) => sidx !== si) }));

  // Pattern Group Manager functions
  const openPatternGroupManager = (pointIndex, point) => {
    setManagingPointIndex(pointIndex);
    setManagingPoint(point);
    let entries = [];
    if (point.kickEntries && point.kickEntries.length > 0) {
      // Preserve groupId. Legacy entries (no groupId) get grouped by consecutive patternName.
      let currentGroupId = null;
      let currentPatternName = null;
      entries = point.kickEntries.map(entry => {
        if (entry.groupId) {
          currentGroupId = entry.groupId;
          currentPatternName = entry.patternName;
        } else if (entry.patternName !== currentPatternName) {
          currentGroupId = `grp_legacy_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          currentPatternName = entry.patternName;
        }
        return {
          groupId: currentGroupId,
          patternName: entry.patternName || '',
          number: entry.number || '',
          rows: entry.rows || []
        };
      });
    } else if (point.patternEntries && point.patternEntries.length > 0) {
      let currentGroupId = null;
      let currentPatternName = null;
      entries = point.patternEntries.map(entry => {
        if (entry.groupId) {
          currentGroupId = entry.groupId;
          currentPatternName = entry.patternName;
        } else if (entry.patternName !== currentPatternName) {
          currentGroupId = `grp_legacy_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          currentPatternName = entry.patternName;
        }
        return {
          groupId: currentGroupId,
          patternName: entry.patternName || '',
          number: entry.number || '',
          rows: [{ koreanTerm: entry.koreanTerm || '', description: entry.description || '' }]
        };
      });
    }
    setPatternGroups(entries);
    setPatternEntryForm({ patternName: '', entries: [{ number: '', koreanTerm: '', description: '' }] });
    setStagingEntries([]);
    setStagingTargetGroupId(null);
    setEditingEntryIndex(null);
    setShowPatternGroupManager(true);
  };

  const [savingPatternGroups, setSavingPatternGroups] = useState(false);

  const savePatternGroups = async () => {
    // Convert the pattern groups to kickEntries format, preserving groupId
    const kickEntries = patternGroups.map(group => ({
      groupId: group.groupId || '',
      patternName: group.patternName || '',
      number: group.number || '',
      rows: group.rows || []
    }));

    // Build the updated points array synchronously so we can send it immediately
    // Strip patternEntries from the point so the backend uses kickEntries as the source of truth
    const updatedPoints = points.map((pt, idx) => {
      if (idx === managingPointIndex) {
        const { patternEntries, ...rest } = pt;
        return { ...rest, kickEntries };
      }
      return pt;
    });

    // Update local state
    setPoints(updatedPoints);
    setShowPatternGroupManager(false);

    // Persist to backend immediately — works for both new and existing items
    setSavingPatternGroups(true);
    try {
      const fd = new FormData();
      fd.append('slide', slideKey);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('headings', JSON.stringify(headings.filter(Boolean)));
      fd.append('points', JSON.stringify(updatedPoints));
      const existingPaths = imgPreviews.filter(p => p.isExisting).map(p => p.path);
      fd.append('existingImages', JSON.stringify(existingPaths));
      imgFiles.forEach(f => fd.append('images', f));

      if (editing) {
        // Update existing item
        await fetch(`${API_BASE}/pattern-slides/${editing._id}`, {
          method: 'PUT',
          headers: authH(),
          body: fd,
        });
      } else {
        // Create new item with the entries already included
        const res = await fetch(`${API_BASE}/pattern-slides`, {
          method: 'POST',
          headers: authH(),
          body: fd,
        });
        const data = await res.json();
        if (data.data) {
          // Switch to editing mode so subsequent saves update the same record
          setEditing(data.data);
        }
      }
      fetchItems();
    } finally {
      setSavingPatternGroups(false);
    }
  };

  const addPatternGroup = () => {
    setPatternGroups(prev => [...prev, { patternName: '', number: '', rows: [] }]);
  };

  const updatePatternGroup = (index, field, value) => {
    setPatternGroups(prev => prev.map((group, i) => i === index ? { ...group, [field]: value } : group));
  };

  const removePatternGroup = (index) => {
    setPatternGroups(prev => prev.filter((_, i) => i !== index));
  };

  // Single Pattern Entry form functions
  const addPatternEntryRow = () => {
    setPatternEntryForm(prev => ({
      ...prev,
      entries: [...prev.entries, { number: '', koreanTerm: '', description: '' }]
    }));
  };

  const updatePatternEntryRow = (index, field, value) => {
    setPatternEntryForm(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const removePatternEntryRow = (index) => {
    if (patternEntryForm.entries.length > 1) {
      setPatternEntryForm(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const savePatternEntry = () => {
    // Validate pattern name is provided
    if (!patternEntryForm.patternName.trim()) {
      return; // Don't save if pattern name is empty
    }

    // Each click of "Add All Entries" = one new independent box (unique groupId per click)
    const groupId = `grp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // All entries in this click share the same groupId → stored in one box
    const newEntries = patternEntryForm.entries
      .filter(entry => entry.number.trim() || entry.koreanTerm.trim())
      .map(entry => ({
        groupId,
        patternName: patternEntryForm.patternName,
        number: entry.number,
        rows: [{ koreanTerm: entry.koreanTerm, description: entry.description }]
      }));

    if (newEntries.length > 0) {
      setPatternGroups(prev => [...prev, ...newEntries]);
    }

    // Reset everything so next click creates a fresh box
    setPatternEntryForm({
      patternName: '',
      entries: [{ number: '', koreanTerm: '', description: '' }]
    });
  };

  const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // ── Search + pagination ────────────────────────────────────
  const SLIDE_PAGE_SIZE = 10;
  const [slideSearch, setSlideSearch] = useState('');
  const [slidePage, setSlidePage] = useState(1);

  const filteredItems = sorted.filter(item =>
    slideSearch.trim() === '' ||
    item.title?.toLowerCase().includes(slideSearch.trim().toLowerCase()) ||
    item.description?.toLowerCase().includes(slideSearch.trim().toLowerCase()) ||
    item.name?.toLowerCase().includes(slideSearch.trim().toLowerCase())
  );
  const slideTotalPages = Math.max(1, Math.ceil(filteredItems.length / SLIDE_PAGE_SIZE));
  const slidePageSafe = Math.min(slidePage, slideTotalPages);
  const pagedItems = filteredItems.slice((slidePageSafe - 1) * SLIDE_PAGE_SIZE, slidePageSafe * SLIDE_PAGE_SIZE);

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
          {/* Search bar */}
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={slideSearch}
                onChange={e => { setSlideSearch(e.target.value); setSlidePage(1); }}
                placeholder="Search..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
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
              {pagedItems.map((item, i) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{(slidePageSafe - 1) * SLIDE_PAGE_SIZE + i + 1}</td>
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
          {filteredItems.length === 0 && (
            <p className="text-gray-400 text-center py-8 text-sm">
              {slideSearch ? 'No sections match your search.' : 'No sections yet.'}
            </p>
          )}
          {filteredItems.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-gray-500">
                Showing {filteredItems.length === 0 ? 0 : (slidePageSafe - 1) * SLIDE_PAGE_SIZE + 1}–{Math.min(slidePageSafe * SLIDE_PAGE_SIZE, filteredItems.length)} of {filteredItems.length}
              </span>
              {slideTotalPages > 1 && (
                <div className="flex gap-1 items-center">
                  <button onClick={() => setSlidePage(p => Math.max(1, p - 1))} disabled={slidePageSafe === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40"
                    style={{ borderColor: '#006CB5', color: '#006CB5' }}>Previous</button>
                  {Array.from({ length: slideTotalPages }, (_, i) => i + 1).map(pg => (
                    <button key={pg} onClick={() => setSlidePage(pg)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                      style={pg === slidePageSafe
                        ? { backgroundColor: '#006CB5', color: '#fff', borderColor: '#006CB5' }
                        : { borderColor: '#006CB5', color: '#006CB5' }}>
                      {pg}
                    </button>
                  ))}
                  <button onClick={() => setSlidePage(p => Math.min(slideTotalPages, p + 1))} disabled={slidePageSafe === slideTotalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40"
                    style={{ borderColor: '#006CB5', color: '#006CB5' }}>Next</button>
                </div>
              )}
            </div>
          )}
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
                  /* Non-standard speeds list: simple title and points structure */
                  <>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Section Title</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Sort by patterns"
                        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-700">Points <span className="text-gray-400 font-normal text-xs">(clickable items in the list)</span></label>
                        <button type="button" onClick={() => setPoints(p => [...p, { text: '', patternEntries: [] }])}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                          <FaPlus size={10} /> Add Point
                        </button>
                      </div>
                      {points.length === 0 && <p className="text-gray-400 text-xs">No points yet.</p>}
                      <div className="space-y-2">
                        {points.map((pt, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#006CB5] flex-shrink-0">• {i + 1}</span>
                              <input className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                                placeholder="Point name (e.g. Dan-Gun, Continuous motion)"
                                value={pt.text}
                                onChange={e => setPoints(arr => arr.map((p, idx) => idx === i ? { ...p, text: e.target.value } : p))} />
                              <button type="button" title="Manage pattern groups for this point"
                                onClick={() => openPatternGroupManager(i, pt)}
                                className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-xs font-semibold">
                                Manage Groups ({(pt.kickEntries || pt.patternEntries || []).length})
                              </button>
                              <button type="button" onClick={() => setPoints(arr => arr.filter((_, idx) => idx !== i))}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 flex-shrink-0"><FaTimes size={10} /></button>
                            </div>
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

      {/* Pattern Group Manager Modal */}
      {showPatternGroupManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h4 className="font-bold text-gray-800 text-lg">Manage Pattern Entries</h4>
                <p className="text-xs text-gray-500 mt-0.5">Point: "{managingPoint?.text}"</p>
              </div>
              <button onClick={() => setShowPatternGroupManager(false)}><FaTimes className="text-gray-500" /></button>
            </div>

            <div className="p-5 space-y-5">

              {/* ── STEP 1: Single entry form ── */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">
                  Add entry — fill and click "+ Add to Box"
                </p>

                {/* Pattern name — locked once staging has entries */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-600">Pattern Name</label>
                    {stagingEntries.length > 0 && (
                      <button
                        onClick={() => {
                          setStagingEntries([]);
                          setStagingTargetGroupId(null);
                          setPatternEntryForm({ patternName: '', entries: [{ number: '', koreanTerm: '', description: '' }] });
                        }}
                        className="text-xs text-orange-500 hover:text-orange-700 font-semibold"
                      >
                        ✕ Clear &amp; Start New Box
                      </button>
                    )}
                  </div>
                  <input
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${stagingEntries.length > 0 ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-300'}`}
                    placeholder="e.g. Dan-Gun"
                    value={patternEntryForm.patternName}
                    readOnly={stagingEntries.length > 0}
                    onChange={e => {
                      if (stagingEntries.length > 0) return;
                      setPatternEntryForm(prev => ({ ...prev, patternName: e.target.value }));
                    }}
                  />
                  {stagingEntries.length > 0 && (
                    <p className="text-xs text-orange-500 mt-1">
                      🔒 Locked — all entries go into the same box. Click "Save as Box" when done, or "Clear &amp; Start New Box" to start fresh.
                    </p>
                  )}
                </div>

                {/* Single entry row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Number</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="e.g. 13"
                      value={patternEntryForm.entries[0]?.number || ''}
                      onChange={e => setPatternEntryForm(prev => ({
                        ...prev,
                        entries: [{ ...prev.entries[0], number: e.target.value }]
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Korean Term</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="e.g. Ap Chagi"
                      value={patternEntryForm.entries[0]?.koreanTerm || ''}
                      onChange={e => setPatternEntryForm(prev => ({
                        ...prev,
                        entries: [{ ...prev.entries[0], koreanTerm: e.target.value }]
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="e.g. Front snap kick"
                      value={patternEntryForm.entries[0]?.description || ''}
                      onChange={e => setPatternEntryForm(prev => ({
                        ...prev,
                        entries: [{ ...prev.entries[0], description: e.target.value }]
                      }))}
                    />
                  </div>
                </div>

                {/* Add to staging */}
                <button
                  onClick={() => {
                    const e = patternEntryForm.entries[0];
                    if (!patternEntryForm.patternName.trim()) return;
                    if (!e.number.trim() && !e.koreanTerm.trim()) return;
                    // Find existing staging group for this patternName (current open box being built)
                    // We use a special staging key stored in state
                    setStagingEntries(prev => [...prev, {
                      patternName: patternEntryForm.patternName,
                      number: e.number,
                      koreanTerm: e.koreanTerm,
                      description: e.description,
                    }]);
                    // Clear only the entry fields, keep pattern name
                    setPatternEntryForm(prev => ({
                      ...prev,
                      entries: [{ number: '', koreanTerm: '', description: '' }]
                    }));
                  }}
                  className="w-full py-2 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#006CB5' }}
                >
                  <FaPlus size={11} /> Add to Box
                </button>

                {/* Staging preview */}
                {stagingEntries.length > 0 && (
                  <div className="mt-3 border border-blue-200 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-blue-100">
                      <span className="text-xs font-bold text-blue-700">
                        {stagingTargetGroupId ? `Adding to: ${stagingEntries[0]?.patternName}` : `Staging: ${stagingEntries[0]?.patternName}`} — {stagingEntries.length} {stagingEntries.length === 1 ? 'entry' : 'entries'}
                      </span>
                      <button
                        onClick={() => {
                          if (stagingEntries.length === 0) return;
                          if (stagingTargetGroupId) {
                            // Append to existing box — reuse the same groupId
                            const newEntries = stagingEntries.map(e => ({
                              groupId: stagingTargetGroupId,
                              patternName: e.patternName,
                              number: e.number,
                              rows: [{ koreanTerm: e.koreanTerm, description: e.description }]
                            }));
                            setPatternGroups(prev => [...prev, ...newEntries]);
                          } else {
                            // Create a brand new box
                            const groupId = `grp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
                            const newEntries = stagingEntries.map(e => ({
                              groupId,
                              patternName: e.patternName,
                              number: e.number,
                              rows: [{ koreanTerm: e.koreanTerm, description: e.description }]
                            }));
                            setPatternGroups(prev => [...prev, ...newEntries]);
                          }
                          setStagingEntries([]);
                          setStagingTargetGroupId(null);
                          setPatternEntryForm({ patternName: '', entries: [{ number: '', koreanTerm: '', description: '' }] });
                        }}
                        className="px-3 py-1 rounded-lg text-white text-xs font-bold"
                        style={{ backgroundColor: '#16a34a' }}
                      >
                        {stagingTargetGroupId ? `✓ Add to Box (${stagingEntries.length})` : `✓ Save as Box (${stagingEntries.length})`}
                      </button>
                    </div>
                    <div className="divide-y divide-blue-100 max-h-40 overflow-y-auto">
                      {stagingEntries.map((e, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-white text-xs">
                          <span className="text-gray-700">
                            <span className="font-bold text-blue-600 mr-2">{e.number}.</span>
                            {e.koreanTerm}
                            {e.description && <span className="text-gray-400 ml-1">— {e.description}</span>}
                          </span>
                          <button onClick={() => setStagingEntries(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-600 ml-2"><FaTimes size={10} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Saved boxes ── */}
              {patternGroups.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-700 text-base mb-3">
                    Saved Entries ({patternGroups.length})
                    {' • '}
                    Boxes ({new Set(patternGroups.map(g => g.groupId || g.patternName)).size})
                  </h5>
                  <div className="space-y-3 max-h-80 overflow-y-auto"
                       style={{ scrollbarWidth: 'thin' }}>
                    {(() => {
                      // Group by groupId — each unique groupId = one box
                      const boxes = [];
                      const seen = {};
                      patternGroups.forEach((group, index) => {
                        const key = group.groupId || `__ungrouped_${index}`;
                        if (seen[key] === undefined) {
                          seen[key] = boxes.length;
                          boxes.push({ groupId: key, patternName: group.patternName, entries: [] });
                        }
                        boxes[seen[key]].entries.push({ ...group, _idx: index });
                      });

                      return boxes.map((box, bi) => (
                        <div key={bi} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                            <span className="font-bold text-blue-700 text-sm">{box.patternName || 'Unnamed'}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  // Pre-fill pattern name and target this box's groupId
                                  setStagingTargetGroupId(box.groupId);
                                  setStagingEntries([]);
                                  setPatternEntryForm(prev => ({
                                    ...prev,
                                    patternName: box.patternName,
                                    entries: [{ number: '', koreanTerm: '', description: '' }]
                                  }));
                                  // Scroll to top of modal
                                  document.querySelector('.max-h-\\[90vh\\]')?.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-blue-600 bg-white border border-blue-200 hover:bg-blue-100"
                              >
                                <FaPlus size={9} /> Add More
                              </button>
                              <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                {box.entries.length} {box.entries.length === 1 ? 'entry' : 'entries'}
                              </span>
                            </div>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {box.entries.map((entry, ei) => {
                              const idx = entry._idx;
                              const number = entry.number || (ei + 1);
                              const koreanTerm = entry.rows?.[0]?.koreanTerm || '';
                              const description = entry.rows?.[0]?.description || '';
                              return (
                                <div key={ei}>
                                  {editingEntryIndex === idx ? (
                                    <div className="p-3 space-y-2 bg-blue-50/40">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-blue-600">Editing</span>
                                        <div className="flex gap-2">
                                          <button onClick={saveEditingEntry} className="px-2 py-1 rounded bg-green-50 text-green-600 text-xs font-semibold">Save</button>
                                          <button onClick={cancelEditingEntry} className="px-2 py-1 rounded bg-gray-50 text-gray-600 text-xs">Cancel</button>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-xs text-gray-500 block mb-1">Number</label>
                                          <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                                            value={editingEntryData.number}
                                            onChange={e => setEditingEntryData(prev => ({ ...prev, number: e.target.value }))} />
                                        </div>
                                        <div>
                                          <label className="text-xs text-gray-500 block mb-1">Korean Term</label>
                                          <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                                            value={editingEntryData.koreanTerm}
                                            onChange={e => setEditingEntryData(prev => ({ ...prev, koreanTerm: e.target.value }))} />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 block mb-1">Description</label>
                                        <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                                          value={editingEntryData.description}
                                          onChange={e => setEditingEntryData(prev => ({ ...prev, description: e.target.value }))} />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start justify-between px-4 py-2 hover:bg-gray-50">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-blue-600 text-sm">{number}.</span>
                                          <span className="font-semibold text-gray-800 text-sm">{koreanTerm}</span>
                                        </div>
                                        {description && <p className="text-gray-400 text-xs ml-6">{description}</p>}
                                      </div>
                                      <div className="flex gap-1.5 ml-2 flex-shrink-0">
                                        <button onClick={() => startEditingEntry(entry, idx)}
                                          className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={10} /></button>
                                        <button onClick={() => { if (confirm(`Delete?`)) removePatternGroup(idx); }}
                                          className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"><FaTrash size={10} /></button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4 border-t">
              <button onClick={() => { setShowPatternGroupManager(false); setStagingEntries([]); setStagingTargetGroupId(null); }}
                className="flex-1 py-2 rounded border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={savePatternGroups} disabled={savingPatternGroups}
                className="flex-1 py-2 rounded text-white text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: '#006CB5' }}>
                {savingPatternGroups ? 'Saving...' : `Save All Entries (${patternGroups.length})`}
              </button>
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
