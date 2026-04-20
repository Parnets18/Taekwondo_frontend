import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';
const getToken = () => localStorage.getItem('token');
const authH = () => ({ Authorization: `Bearer ${getToken()}` });

const TABS = [
  { key: 'attacking', label: 'Attacking Tools' },
  { key: 'blocking',  label: 'Blocking Tools' },
  { key: 'vital',     label: 'Vital Points' },
  { key: 'levels',    label: 'Levels & Lines' },
];

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

// ─── ATTACKING TOOLS TAB ─────────────────────────────────────────────────────
function AttackingTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState({ name: '', korean: '', description: '', order: 0 });
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);

  useEffect(() => { fetch_(); }, []);
  const fetch_ = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/body-parts?category=attacking`);
    const d = await res.json();
    setItems(d.data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null); setForm({ name: '', korean: '', description: '', order: items.length });
    setImgFile(null); setImgPreview(null); setShowModal(true);
  };
  const openEdit = (item) => {
    setEditing(item); setForm({ name: item.name, korean: item.korean || '', description: item.description || '', order: item.order });
    setImgFile(null); setImgPreview(item.image ? `${BASE_URL}${item.image}` : null); setShowModal(true);
  };
  const save = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('category', 'attacking');
    if (imgFile) fd.append('image', imgFile);
    const url = editing ? `${API_BASE}/body-parts/${editing._id}` : `${API_BASE}/body-parts`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: fd });
    setShowModal(false); fetch_();
  };
  const del = async () => {
    await fetch(`${API_BASE}/body-parts/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null); fetch_();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Manage attacking tools — each item shows as a card with image in the app.</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
          <FaPlus /> Add Tool
        </button>
      </div>
      {loading ? <p className="text-gray-400 text-center py-8 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs uppercase bg-gray-50 border-b">
              <th className="px-4 py-3">#</th><th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th><th className="px-4 py-3">Korean</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">{item.image ? <img src={`${BASE_URL}${item.image}`} className="w-10 h-10 object-cover rounded border border-gray-200" /> : <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded text-gray-300 text-xs">—</span>}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.korean || '—'}</td>
                  <td className="px-4 py-3 text-right"><div className="flex gap-1.5 justify-end">
                    <button onClick={() => setViewItem(item)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><FaEye size={13} /></button>
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={13} /></button>
                    <button onClick={() => setDeleteId(item._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FaTrash size={13} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No items yet.</p>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit' : 'Add'} Attacking Tool</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-semibold text-gray-700 block mb-1">Name *</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Forefist" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><label className="text-sm font-semibold text-gray-700 block mb-1">Korean</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Ap Joomuk" value={form.korean} onChange={e => setForm({ ...form, korean: e.target.value })} /></div>
              </div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Order</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} /></div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Image</label>
                {imgPreview && <img src={imgPreview} className="w-full h-40 object-contain rounded-lg border border-gray-200 bg-gray-50 mb-2" />}
                <label className="cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs text-center block hover:border-[#006CB5] hover:text-[#006CB5]">
                  {imgPreview ? 'Change Image' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { setImgFile(f); setImgPreview(URL.createObjectURL(f)); } }} />
                </label>
                {imgPreview && <button onClick={() => { setImgFile(null); setImgPreview(null); }} className="text-red-400 text-xs mt-1">Remove</button>}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>{editing ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Attacking Tool</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Name</p>
                <p className="text-sm text-gray-800">{viewItem.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Korean</p>
                <p className="text-sm text-gray-800">{viewItem.korean || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{viewItem.description || '—'}</p>
              </div>
              {viewItem.image && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Image</p>
                  <img src={`${BASE_URL}${viewItem.image}`} className="w-full h-48 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                </div>
              )}
              {(viewItem.points || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Points</p>
                  <ul className="space-y-1">
                    {viewItem.points.map((pt, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-gray-400">{i + 1}.</span> {pt.label || pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setViewItem(null)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Close</button>
              <button onClick={() => { openEdit(viewItem); setViewItem(null); }} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>Edit</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && <ConfirmModal message="Delete this tool?" onConfirm={del} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

// ─── BLOCKING TOOLS TAB ──────────────────────────────────────────────────────
function BlockingTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState({ name: '', order: 0 });
  // Hierarchical structure: directions -> parts -> methods -> tools
  const [hierarchicalData, setHierarchicalData] = useState([{
    direction: '',
    parts: [{
      part: '',
      methods: [{
        method: '',
        tools: ['']
      }]
    }]
  }]);

  useEffect(() => { fetch_(); }, []);
  const fetch_ = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/body-parts?category=blocking`);
    const d = await res.json(); setItems(d.data || []); setLoading(false);
  };

  const openAdd = () => {
    setEditing(null); setForm({ name: '', order: items.length });
    setHierarchicalData([{
      direction: '',
      parts: [{
        part: '',
        methods: [{
          method: '',
          tools: ['']
        }]
      }]
    }]);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, order: item.order });
    
    // Convert old format to new hierarchical format if needed
    if (item.hierarchicalData) {
      setHierarchicalData(item.hierarchicalData);
    } else {
      // Convert legacy format
      const directions = item.directions || [''];
      const parts = item.parts || [{ part: '', methods: [{ method: '', tools: [''] }] }];
      
      const converted = directions.map(direction => ({
        direction: direction || '',
        parts: parts.map(p => ({
          part: p.part || '',
          methods: (p.methods || [{ method: '', tools: [''] }]).map(m => ({
            method: m.method || '',
            tools: Array.isArray(m.tools) ? m.tools.filter(Boolean) : (m.tools ? [m.tools] : [''])
          }))
        }))
      }));
      
      setHierarchicalData(converted.length ? converted : [{
        direction: '',
        parts: [{
          part: '',
          methods: [{
            method: '',
            tools: ['']
          }]
        }]
      }]);
    }
    setShowModal(true);
  };

  const save = async () => {
    const fd = new FormData();
    fd.append('name', form.name); 
    fd.append('order', form.order); 
    fd.append('category', 'blocking');
    
    // Save hierarchical data
    const cleanedData = hierarchicalData.map(dir => ({
      direction: dir.direction,
      parts: dir.parts.map(part => ({
        part: part.part,
        methods: part.methods.map(method => ({
          method: method.method,
          tools: method.tools.filter(Boolean)
        }))
      }))
    })).filter(dir => dir.direction || dir.parts.some(p => p.part || p.methods.some(m => m.method || m.tools.length)));
    
    fd.append('hierarchicalData', JSON.stringify(cleanedData));
    
    // Also maintain backward compatibility
    const directions = [...new Set(cleanedData.map(d => d.direction).filter(Boolean))];
    const allParts = cleanedData.flatMap(d => d.parts);
    fd.append('directions', JSON.stringify(directions));
    fd.append('parts', JSON.stringify(allParts));
    
    const url = editing ? `${API_BASE}/body-parts/${editing._id}` : `${API_BASE}/body-parts`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: fd });
    setShowModal(false); fetch_();
  };

  const del = async () => {
    await fetch(`${API_BASE}/body-parts/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null); fetch_();
  };

  // Direction management
  const addDirection = () => setHierarchicalData([...hierarchicalData, {
    direction: '',
    parts: [{ part: '', methods: [{ method: '', tools: [''] }] }]
  }]);
  const removeDirection = (di) => setHierarchicalData(hierarchicalData.filter((_, i) => i !== di));
  const updateDirection = (di, value) => setHierarchicalData(hierarchicalData.map((d, i) => 
    i === di ? { ...d, direction: value } : d
  ));

  // Part management
  const addPart = (di) => setHierarchicalData(hierarchicalData.map((d, i) => 
    i === di ? { ...d, parts: [...d.parts, { part: '', methods: [{ method: '', tools: [''] }] }] } : d
  ));
  const removePart = (di, pi) => setHierarchicalData(hierarchicalData.map((d, i) => 
    i === di ? { ...d, parts: d.parts.filter((_, j) => j !== pi) } : d
  ));
  const updatePart = (di, pi, value) => setHierarchicalData(hierarchicalData.map((d, i) => 
    i === di ? { ...d, parts: d.parts.map((p, j) => j === pi ? { ...p, part: value } : p) } : d
  ));

  // Method management
  const addMethod = (di, pi) => setHierarchicalData(hierarchicalData.map((d, i) => 
    i === di ? { ...d, parts: d.parts.map((p, j) => 
      j === pi ? { ...p, methods: [...p.methods, { method: '', tools: [''] }] } : p
    ) } : d
  ));
  const removeMethod = (di, pi, mi) => setHierarchicalData(hierarchicalData.map((d, i) => 
    i === di ? { ...d, parts: d.parts.map((p, j) => 
      j === pi ? { ...p, methods: p.methods.filter((_, k) => k !== mi) } : p
    ) } : d
  ));
  const updateMethod = (di, pi, mi, value) => setHierarchicalData(hierarchicalData.map((d, i) => 
    i === di ? { ...d, parts: d.parts.map((p, j) => 
      j === pi ? { ...p, methods: p.methods.map((m, k) => k === mi ? { ...m, method: value } : m) } : p
    ) } : d
  ));

  // Tool management
  const addTool = (di, pi, mi) => setHierarchicalData(hierarchicalData.map((d, i) => 
    i === di ? { ...d, parts: d.parts.map((p, j) => 
      j === pi ? { ...p, methods: p.methods.map((m, k) => 
        k === mi ? { ...m, tools: [...m.tools, ''] } : m
      ) } : p
    ) } : d
  ));
  const removeTool = (di, pi, mi, ti) => setHierarchicalData(hierarchicalData.map((d, i) => 
    i === di ? { ...d, parts: d.parts.map((p, j) => 
      j === pi ? { ...p, methods: p.methods.map((m, k) => 
        k === mi ? { ...m, tools: m.tools.filter((_, l) => l !== ti) } : m
      ) } : p
    ) } : d
  ));
  const updateTool = (di, pi, mi, ti, value) => setHierarchicalData(hierarchicalData.map((d, i) => 
    i === di ? { ...d, parts: d.parts.map((p, j) => 
      j === pi ? { ...p, methods: p.methods.map((m, k) => 
        k === mi ? { ...m, tools: m.tools.map((t, l) => l === ti ? value : t) } : m
      ) } : p
    ) } : d
  ));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Manage blocking tools with hierarchical structure: Tool → Direction → Part → Method → Tool.</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}><FaPlus /> Add Tool</button>
      </div>
      {loading ? <p className="text-gray-400 text-center py-8 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs uppercase bg-gray-50 border-b">
              <th className="px-4 py-3">#</th><th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Directions</th><th className="px-4 py-3">Structure</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((item, i) => {
                const hierarchical = item.hierarchicalData || [];
                const totalDirections = hierarchical.length;
                const totalParts = hierarchical.reduce((sum, d) => sum + d.parts.length, 0);
                const totalMethods = hierarchical.reduce((sum, d) => sum + d.parts.reduce((pSum, p) => pSum + p.methods.length, 0), 0);
                const totalTools = hierarchical.reduce((sum, d) => sum + d.parts.reduce((pSum, p) => pSum + p.methods.reduce((mSum, m) => mSum + m.tools.length, 0), 0), 0);
                
                return (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{totalDirections} direction(s)</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{totalParts} parts, {totalMethods} methods, {totalTools} tools</td>
                    <td className="px-4 py-3 text-right"><div className="flex gap-1.5 justify-end">
                      <button onClick={() => setViewItem(item)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><FaEye size={13} /></button>
                      <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={13} /></button>
                      <button onClick={() => setDeleteId(item._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FaTrash size={13} /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No items yet.</p>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit' : 'Add'} Blocking Tool</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Blocking Tool Name *</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Knifehand" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Order</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">Hierarchical Structure</label>
                  <button onClick={addDirection} className="text-xs text-blue-600 hover:underline">+ Add Direction</button>
                </div>
                
                <div className="space-y-4">
                  {hierarchicalData.map((direction, di) => (
                    <div key={di} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      {/* Direction Level */}
                      <div className="flex gap-2 items-center mb-3">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-600 block mb-1">Direction {di + 1}</label>
                          <input 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" 
                            placeholder="e.g. Inward, Outward, Rising" 
                            value={direction.direction} 
                            onChange={e => updateDirection(di, e.target.value)} 
                          />
                        </div>
                        {hierarchicalData.length > 1 && (
                          <button onClick={() => removeDirection(di)} className="text-red-400 text-xs px-2 py-1 mt-5">Remove Direction</button>
                        )}
                      </div>

                      {/* Parts Level */}
                      <div className="ml-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-semibold text-gray-600">Parts Blocked</label>
                          <button onClick={() => addPart(di)} className="text-xs text-blue-600 hover:underline">+ Add Part</button>
                        </div>
                        
                        <div className="space-y-3">
                          {direction.parts.map((part, pi) => (
                            <div key={pi} className="border border-gray-300 rounded-lg p-3 bg-white">
                              <div className="flex gap-2 items-center mb-3">
                                <div className="flex-1">
                                  <label className="text-xs font-semibold text-gray-500 block mb-1">Part {pi + 1}</label>
                                  <input 
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                                    placeholder="e.g. Outer Forearm, Inner Forearm" 
                                    value={part.part} 
                                    onChange={e => updatePart(di, pi, e.target.value)} 
                                  />
                                </div>
                                {direction.parts.length > 1 && (
                                  <button onClick={() => removePart(di, pi)} className="text-red-400 text-xs px-2 py-1 mt-5">Remove Part</button>
                                )}
                              </div>

                              {/* Methods Level */}
                              <div className="ml-4">
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-xs font-semibold text-gray-500">Attacking Methods</label>
                                  <button onClick={() => addMethod(di, pi)} className="text-xs text-blue-600 hover:underline">+ Add Method</button>
                                </div>
                                
                                <div className="space-y-2">
                                  {part.methods.map((method, mi) => (
                                    <div key={mi} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                      <div className="flex gap-2 items-center mb-2">
                                        <div className="flex-1">
                                          <label className="text-xs font-semibold text-gray-400 block mb-1">Method {mi + 1}</label>
                                          <input 
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" 
                                            placeholder="e.g. Punch, Kick, Strike" 
                                            value={method.method} 
                                            onChange={e => updateMethod(di, pi, mi, e.target.value)} 
                                          />
                                        </div>
                                        {part.methods.length > 1 && (
                                          <button onClick={() => removeMethod(di, pi, mi)} className="text-red-400 text-xs px-2 py-1 mt-5">Remove Method</button>
                                        )}
                                      </div>

                                      {/* Tools Level */}
                                      <div className="ml-4">
                                        <div className="flex justify-between items-center mb-2">
                                          <label className="text-xs font-semibold text-gray-400">Attacking Tools</label>
                                          <button onClick={() => addTool(di, pi, mi)} className="text-xs text-blue-600 hover:underline">+ Add Tool</button>
                                        </div>
                                        
                                        <div className="space-y-1">
                                          {method.tools.map((tool, ti) => (
                                            <div key={ti} className="flex gap-2">
                                              <input 
                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" 
                                                placeholder="e.g. Forefist, Backfist, Knife-hand" 
                                                value={tool} 
                                                onChange={e => updateTool(di, pi, mi, ti, e.target.value)} 
                                              />
                                              {method.tools.length > 1 && (
                                                <button onClick={() => removeTool(di, pi, mi, ti)} className="text-red-400 text-xs px-2 py-1">✕</button>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>{editing ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Blocking Tool</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Name</p>
                <p className="text-sm text-gray-800">{viewItem.name || '—'}</p>
              </div>
              
              {viewItem.hierarchicalData && viewItem.hierarchicalData.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Hierarchical Structure</p>
                  <div className="space-y-3">
                    {viewItem.hierarchicalData.map((direction, di) => (
                      <div key={di} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="font-semibold text-sm text-gray-700 mb-2">
                          Direction: {direction.direction || 'Unnamed'}
                        </div>
                        
                        {direction.parts.map((part, pi) => (
                          <div key={pi} className="ml-4 mb-3 border-l-2 border-blue-200 pl-3">
                            <div className="font-medium text-sm text-gray-600 mb-1">
                              Part: {part.part || 'Unnamed'}
                            </div>
                            
                            {part.methods.map((method, mi) => (
                              <div key={mi} className="ml-4 mb-2 border-l-2 border-green-200 pl-3">
                                <div className="font-medium text-xs text-gray-500 mb-1">
                                  Method: {method.method || 'Unnamed'}
                                </div>
                                
                                {method.tools.length > 0 && (
                                  <div className="ml-4">
                                    <div className="text-xs text-gray-400 mb-1">Tools:</div>
                                    <ul className="list-disc list-inside text-xs text-gray-600">
                                      {method.tools.map((tool, ti) => (
                                        <li key={ti}>{tool || 'Unnamed'}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Fallback for legacy data
                <>
                  {(viewItem.directions || []).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Directions</p>
                      <p className="text-sm text-gray-800">{viewItem.directions.join(', ')}</p>
                    </div>
                  )}
                  {(viewItem.parts || []).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Parts Blocked</p>
                      <ul className="space-y-1">
                        {viewItem.parts.map((p, i) => (
                          <li key={i} className="text-sm text-gray-700">{p.part}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setViewItem(null)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Close</button>
              <button onClick={() => { openEdit(viewItem); setViewItem(null); }} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>Edit</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && <ConfirmModal message="Delete this tool?" onConfirm={del} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

// ─── VITAL POINTS TAB ────────────────────────────────────────────────────────
function VitalTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState({ name: '', order: 0 });
  const [points, setPoints] = useState([{ label: '' }]);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);

  useEffect(() => { fetch_(); }, []);
  const fetch_ = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/body-parts?category=vital`);
    const d = await res.json(); setItems(d.data || []); setLoading(false);
  };

  const openAdd = () => {
    setEditing(null); setForm({ name: '', order: items.length });
    setPoints([{ label: '' }]); setImgFile(null); setImgPreview(null); setShowModal(true);
  };
  const openEdit = (item) => {
    setEditing(item); setForm({ name: item.name, order: item.order });
    setPoints(item.points?.length ? item.points.map(p => ({ label: p.label })) : [{ label: '' }]);
    setImgFile(null); setImgPreview(item.image ? `${BASE_URL}${item.image}` : null); setShowModal(true);
  };
  const save = async () => {
    const fd = new FormData();
    fd.append('name', form.name); fd.append('order', form.order); fd.append('category', 'vital');
    fd.append('points', JSON.stringify(points.map((p, i) => ({ n: i + 1, label: p.label }))));
    if (imgFile) fd.append('image', imgFile);
    const url = editing ? `${API_BASE}/body-parts/${editing._id}` : `${API_BASE}/body-parts`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: fd });
    setShowModal(false); fetch_();
  };
  const del = async () => {
    await fetch(`${API_BASE}/body-parts/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null); fetch_();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Manage vital points — each item has a name, image, and numbered point list.</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}><FaPlus /> Add Vital Point</button>
      </div>
      {loading ? <p className="text-gray-400 text-center py-8 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs uppercase bg-gray-50 border-b">
              <th className="px-4 py-3">#</th><th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th><th className="px-4 py-3">Points</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">{item.image ? <img src={`${BASE_URL}${item.image}`} className="w-10 h-10 object-cover rounded border border-gray-200" /> : <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded text-gray-300 text-xs">—</span>}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{(item.points || []).length} point(s)</td>
                  <td className="px-4 py-3 text-right"><div className="flex gap-1.5 justify-end">
                    <button onClick={() => setViewItem(item)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><FaEye size={13} /></button>
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={13} /></button>
                    <button onClick={() => setDeleteId(item._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FaTrash size={13} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No items yet.</p>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit' : 'Add'} Vital Point</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-semibold text-gray-700 block mb-1">Name *</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Forefist" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><label className="text-sm font-semibold text-gray-700 block mb-1">Order</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} /></div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Image</label>
                {imgPreview && <img src={imgPreview} className="w-full h-40 object-contain rounded-lg border border-gray-200 bg-gray-50 mb-2" />}
                <label className="cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs text-center block hover:border-[#006CB5] hover:text-[#006CB5]">
                  {imgPreview ? 'Change Image' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { setImgFile(f); setImgPreview(URL.createObjectURL(f)); } }} />
                </label>
                {imgPreview && <button onClick={() => { setImgFile(null); setImgPreview(null); }} className="text-red-400 text-xs mt-1">Remove</button>}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Vital Points (numbered list)</label>
                  <button onClick={() => setPoints([...points, { label: '' }])} className="text-xs text-blue-600 hover:underline">+ Add Point</button>
                </div>
                {points.map((p, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <span className="text-xs text-gray-400 w-6 pt-2">{i + 1}.</span>
                    <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Solar Plexus" value={p.label} onChange={e => setPoints(points.map((pt, j) => j === i ? { label: e.target.value } : pt))} />
                    {points.length > 1 && <button onClick={() => setPoints(points.filter((_, j) => j !== i))} className="text-red-400 text-xs">✕</button>}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>{editing ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Vital Point</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Name</p>
                <p className="text-sm text-gray-800">{viewItem.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Korean</p>
                <p className="text-sm text-gray-800">{viewItem.korean || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{viewItem.description || '—'}</p>
              </div>
              {viewItem.image && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Image</p>
                  <img src={`${BASE_URL}${viewItem.image}`} className="w-full h-48 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                </div>
              )}
              {(viewItem.points || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Points</p>
                  <ul className="space-y-1">
                    {viewItem.points.map((pt, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-gray-400">{pt.n || (i + 1)}.</span> {pt.label || pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setViewItem(null)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Close</button>
              <button onClick={() => { openEdit(viewItem); setViewItem(null); }} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>Edit</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && <ConfirmModal message="Delete this vital point?" onConfirm={del} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

// ─── LEVELS & LINES TAB ──────────────────────────────────────────────────────
const LEVEL_TABS = ['Vertical', 'Horizontal', 'By Rotation'];

function LevelsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState({ name: '', tab: 'Vertical', title: '', subtitle: '', description: '', order: 0 });
  const [levelPoints, setLevelPoints] = useState(['']);
  const [imgFiles, setImgFiles] = useState([]);
  const [imgPreviews, setImgPreviews] = useState([]);

  useEffect(() => { fetch_(); }, []);
  const fetch_ = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/body-parts?category=levels`);
    const d = await res.json(); setItems(d.data || []); setLoading(false);
  };

  const openAdd = () => {
    setEditing(null); setForm({ name: '', tab: 'Vertical', title: '', subtitle: '', description: '', order: items.length });
    setLevelPoints(['']); setImgFiles([]); setImgPreviews([]); setShowModal(true);
  };
  const openEdit = (item) => {
    setEditing(item); setForm({ name: item.name || '', tab: item.tab || 'Vertical', title: item.title || '', subtitle: item.subtitle || '', description: item.description || '', order: item.order });
    setLevelPoints(item.points?.length ? item.points.map(p => p.label || p) : ['']);
    setImgFiles([]);
    setImgPreviews((item.images || []).map(url => ({ url: `${BASE_URL}${url}`, isExisting: true, path: url })));
    setShowModal(true);
  };
  const save = async () => {
    const fd = new FormData();
    // Don't use Object.entries to avoid conflicts, set fields explicitly
    fd.append('name', form.tab); // use tab as name for levels
    fd.append('tab', form.tab);
    fd.append('title', form.title);
    fd.append('subtitle', form.subtitle);
    fd.append('description', form.description);
    fd.append('order', form.order);
    fd.append('category', 'levels');
    fd.append('points', JSON.stringify(levelPoints.filter(Boolean).map((p, i) => ({ n: i + 1, label: p }))));
    const existingPaths = imgPreviews.filter(p => p.isExisting).map(p => p.path);
    fd.append('existingImages', JSON.stringify(existingPaths));
    imgFiles.forEach(f => fd.append('images', f));
    const url = editing ? `${API_BASE}/body-parts/${editing._id}` : `${API_BASE}/body-parts`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: fd });
    setShowModal(false); fetch_();
  };
  const del = async () => {
    await fetch(`${API_BASE}/body-parts/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null); fetch_();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Manage content for Vertical, Horizontal, and By Rotation tabs.</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}><FaPlus /> Add Section</button>
      </div>
      {loading ? <p className="text-gray-400 text-center py-8 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs uppercase bg-gray-50 border-b">
              <th className="px-4 py-3">#</th><th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Tab</th><th className="px-4 py-3">Images</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">{item.tab || '—'}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{(item.images || []).length} image(s)</td>
                  <td className="px-4 py-3 text-right"><div className="flex gap-1.5 justify-end">
                    <button onClick={() => setViewItem(item)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><FaEye size={13} /></button>
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={13} /></button>
                    <button onClick={() => setDeleteId(item._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FaTrash size={13} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No items yet.</p>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit' : 'Add'} Level Section</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Tab</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.tab} onChange={e => setForm({ ...form, tab: e.target.value })}>
                  {LEVEL_TABS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Vertical division - Section" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Subtitle</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. High Section (Nopun bubun)" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} /></div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Points</label>
                  <button onClick={() => setLevelPoints([...levelPoints, ''])} className="text-xs text-blue-600 hover:underline">+ Add Point</button>
                </div>
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                  {levelPoints.map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" placeholder={`Point ${i + 1}`}
                        value={p} onChange={e => setLevelPoints(levelPoints.map((v, j) => j === i ? e.target.value : v))} />
                      {levelPoints.length > 1 && <button onClick={() => setLevelPoints(levelPoints.filter((_, j) => j !== i))} className="text-red-400 text-xs px-1">✕</button>}
                    </div>
                  ))}
                </div>
              </div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Content shown in the app..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Images</label>
                <div className="flex flex-col gap-2">
                  {imgPreviews.map((p, i) => (
                    <div key={i} className="relative">
                      <img src={p.url} className="w-full h-32 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                      <button onClick={() => setImgPreviews(imgPreviews.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                  <label className="cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs text-center block hover:border-[#006CB5] hover:text-[#006CB5]">
                    + Add Image
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                      const files = Array.from(e.target.files);
                      setImgFiles(prev => [...prev, ...files]);
                      setImgPreviews(prev => [...prev, ...files.map(f => ({ url: URL.createObjectURL(f), isExisting: false }))]);
                      e.target.value = '';
                    }} />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>{editing ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Level Section</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Name</p>
                <p className="text-sm text-gray-800">{viewItem.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Korean</p>
                <p className="text-sm text-gray-800">{viewItem.korean || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{viewItem.description || '—'}</p>
              </div>
              {(viewItem.images || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Images</p>
                  <div className="flex flex-col gap-2">
                    {viewItem.images.map((url, i) => (
                      <img key={i} src={`${BASE_URL}${url}`} className="w-full h-40 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                    ))}
                  </div>
                </div>
              )}
              {(viewItem.points || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Points</p>
                  <ul className="space-y-1">
                    {viewItem.points.map((pt, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-gray-400">{pt.n || (i + 1)}.</span> {pt.label || pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setViewItem(null)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Close</button>
              <button onClick={() => { openEdit(viewItem); setViewItem(null); }} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>Edit</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && <ConfirmModal message="Delete this section?" onConfirm={del} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BodyPartsManagement() {
  const [activeTab, setActiveTab] = useState('attacking');

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800">Body Parts</h3>
        <p className="text-sm text-gray-500 mt-0.5">Manage content for the Body Parts screen in the mobile app.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.key ? 'border-[#006CB5] text-[#006CB5]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'attacking' && <AttackingTab />}
      {activeTab === 'blocking'  && <BlockingTab />}
      {activeTab === 'vital'     && <VitalTab />}
      {activeTab === 'levels'    && <LevelsTab />}
    </div>
  );
}

