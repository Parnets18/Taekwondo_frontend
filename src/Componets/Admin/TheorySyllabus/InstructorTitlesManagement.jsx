import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';
const getToken = () => localStorage.getItem('token');
const authH = () => ({ Authorization: `Bearer ${getToken()}` });
const jsonH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const EMPTY = { tab: '', title: '', subtitle: '', description: '', order: 0 };
const emptyPoint = () => ({ text: '', subPoints: [] });
// Each image entry has a name + file/url
const emptyImg = (url = '', name = '', isExisting = false, path = '', file = null) =>
  ({ url, name, isExisting, path, file });

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <p className="text-gray-800 font-semibold mb-6 text-center">Delete this section?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: '#dc2626' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function InstructorTitlesManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [headings, setHeadings] = useState([]);
  const [points, setPoints] = useState([]);
  const [imgFiles, setImgFiles] = useState([]);
  const [imgPreviews, setImgPreviews] = useState([]);

  // Tab management
  const [tabs, setTabs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('instructorTitleTabs')) || []; } catch { return []; }
  });
  const [showTabInput, setShowTabInput] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  const saveTabs = (t) => { setTabs(t); localStorage.setItem('instructorTitleTabs', JSON.stringify(t)); };
  const addTab = () => {
    const name = newTabName.trim();
    if (!name || tabs.includes(name)) return;
    saveTabs([...tabs, name]);
    setNewTabName(''); setShowTabInput(false);
  };
  const removeTab = (t) => saveTabs(tabs.filter(x => x !== t));

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/instructor-titles`);
      const d = await res.json();
      setItems(d.data || []);
    } finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, tab: tabs[0] || '', order: items.length });
    setHeadings([]); setPoints([]);
    setImgFiles([]); setImgPreviews([]);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ tab: item.tab, title: item.title || '', subtitle: item.subtitle || '', description: item.description || '', order: item.order || 0 });
    setHeadings([...(item.headings || [])]);
    setPoints(JSON.parse(JSON.stringify(item.points || [])));
    setImgFiles([]);
    // images stored as { path, name } objects or plain strings (legacy)
    setImgPreviews((item.images || []).map((img) => {
      if (typeof img === 'string') return emptyImg(`${BASE_URL}${img}`, '', true, img);
      return emptyImg(`${BASE_URL}${img.path}`, img.name || '', true, img.path);
    }));
    setShowModal(true);
  };

  const save = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('headings', JSON.stringify(headings.filter(Boolean)));
    fd.append('points', JSON.stringify(points));
    // Send image metadata as JSON (name + existing path)
    const imageMeta = imgPreviews.map(p => ({ name: p.name || '', path: p.isExisting ? p.path : '' }));
    fd.append('imageMeta', JSON.stringify(imageMeta));
    // Attach new files in order
    imgPreviews.forEach((p, i) => { if (!p.isExisting && p.file) fd.append(`imageFile_${i}`, p.file); });
    const url = editing ? `${API_BASE}/instructor-titles/${editing._id}` : `${API_BASE}/instructor-titles`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: fd });
    setShowModal(false);
    fetchItems();
  };

  const del = async () => {
    await fetch(`${API_BASE}/instructor-titles/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null); fetchItems();
  };

  const moveItem = async (item, dir) => {
    const tabList = [...items]
      .filter(i => i.tab === item.tab)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const idx = tabList.findIndex(i => i._id === item._id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= tabList.length) return;

    // Assign clean sequential orders, then swap the two positions
    const updates = tabList.map((it, i) => ({ id: it._id, order: i }));
    updates[idx].order = swapIdx;
    updates[swapIdx].order = idx;

    // Optimistic UI
    const orderMap = Object.fromEntries(updates.map(u => [u.id, u.order]));
    setItems(prev => prev.map(it => orderMap[it._id] !== undefined ? { ...it, order: orderMap[it._id] } : it));

    try {
      await Promise.all(
        updates.map(u =>
          fetch(`${API_BASE}/instructor-titles/${u.id}/order`, {
            method: 'PATCH',
            headers: jsonH(),
            body: JSON.stringify({ order: u.order }),
          })
        )
      );
      fetchItems();
    } catch (e) {
      console.error('moveItem error:', e);
      fetchItems();
    }
  };

  // ── Points helpers ────────────────────────────────────────────────────────
  const addPoint = () => setPoints(prev => [...prev, emptyPoint()]);
  const updPoint = (i, val) => setPoints(prev => { const a = prev.map(p => ({...p, subPoints: [...p.subPoints]})); a[i].text = val; return a; });
  const removePoint = (i) => setPoints(prev => prev.filter((_, idx) => idx !== i));
  const addSubPoint = (i) => {
    setPoints(prev => {
      const a = prev.map((p, idx) => idx === i
        ? { ...p, subPoints: [...p.subPoints, { text: '', subPoints: [] }] }
        : p
      );
      return a;
    });
  };
  const updSubPoint = (i, si, val) => setPoints(prev => {
    const a = prev.map((p, idx) => idx !== i ? p : { ...p, subPoints: p.subPoints.map((sp, sidx) => sidx === si ? { ...sp, text: val } : sp) });
    return a;
  });
  const removeSubPoint = (i, si) => setPoints(prev => {
    const a = prev.map((p, idx) => idx !== i ? p : { ...p, subPoints: p.subPoints.filter((_, sidx) => sidx !== si) });
    return a;
  });

  const filtered = activeTab === 'all' ? items : items.filter(i => i.tab === activeTab);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Instructor Titles & Stripes</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage tabs and content shown in the mobile app.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTabInput(v => !v)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-sm font-semibold hover:border-[#006CB5] hover:text-[#006CB5] transition-colors">
            <FaPlus size={11} /> Add Tab
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
            <FaPlus /> Add Section
          </button>
        </div>
      </div>

      {/* Tab manager */}
      {showTabInput && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">Manage Tabs</p>
          <div className="flex gap-2 mb-3">
            <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Instructor Titles"
              value={newTabName} onChange={e => setNewTabName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTab()} autoFocus />
            <button onClick={addTab} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>Add</button>
            <button onClick={() => { setShowTabInput(false); setNewTabName(''); }} className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 text-sm"><FaTimes size={12} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map(t => (
              <span key={t} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-600">
                {t} <button onClick={() => removeTab(t)} className="text-gray-400 hover:text-red-500"><FaTimes size={9} /></button>
              </span>
            ))}
            {tabs.length === 0 && <p className="text-gray-400 text-xs">No tabs yet.</p>}
          </div>
        </div>
      )}

      {/* Tab filter bar */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeTab === 'all' ? 'text-white border-[#006CB5]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#006CB5]'}`}
          style={activeTab === 'all' ? { backgroundColor: '#006CB5' } : {}}>
          All ({items.length})
        </button>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeTab === t ? 'text-white border-[#006CB5]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#006CB5]'}`}
            style={activeTab === t ? { backgroundColor: '#006CB5' } : {}}>
            {t} ({items.filter(i => i.tab === t).length})
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? <p className="text-gray-400 text-center py-10 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs uppercase bg-gray-50 border-b">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Tab</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Subtitle</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{item.tab}</span></td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.title || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.subtitle || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{(item.images || []).length}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1.5 justify-end items-center">
                      <button onClick={() => setViewItem(item)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><FaEye size={13} /></button>
                      <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={13} /></button>
                      <button onClick={() => setDeleteId(item._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FaTrash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No sections yet.</p>}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit Section' : 'Add Section'}</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">

              {/* Tab */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Tab <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.tab} onChange={e => setForm({ ...form, tab: e.target.value })}>
                  {tabs.length === 0 && <option value="">— Add a tab first —</option>}
                  {tabs.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Title + Subtitle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 1st Dan"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Subtitle</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Assistant Instructor"
                    value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Description..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              {/* Images — each with its own name */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Images</label>
                  <label className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Image
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                      const files = Array.from(e.target.files);
                      setImgPreviews(prev => [...prev, ...files.map(f => emptyImg(URL.createObjectURL(f), '', false, '', f))]);
                      e.target.value = '';
                    }} />
                  </label>
                </div>
                {imgPreviews.length === 0 && <p className="text-gray-400 text-xs py-1">No images yet.</p>}
                <div className="space-y-3">
                  {imgPreviews.map((p, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="relative">
                        <img src={p.url} className="w-full h-36 object-contain bg-gray-50" alt="" />
                        <button type="button" onClick={() => setImgPreviews(prev => prev.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                      </div>
                      <div className="p-2">
                        <input
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                          placeholder="Image name (e.g. Black Belt with 1 stripe)"
                          value={p.name}
                          onChange={e => setImgPreviews(prev => prev.map((img, j) => j === i ? { ...img, name: e.target.value } : img))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Headings */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Headings</label>
                  <button type="button" onClick={() => setHeadings(h => [...h, ''])}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Heading
                  </button>
                </div>
                {headings.length === 0 && <p className="text-gray-400 text-xs py-1">No headings yet.</p>}
                <div className="space-y-2">
                  {headings.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold"
                        placeholder="Heading text..." value={h}
                        onChange={e => setHeadings(arr => { const a = [...arr]; a[i] = e.target.value; return a; })} />
                      <button type="button" onClick={() => setHeadings(arr => arr.filter((_, idx) => idx !== i))}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><FaTimes size={10} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Points */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Points</label>
                  <button type="button" onClick={addPoint}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Point
                  </button>
                </div>
                {points.length === 0 && <p className="text-gray-400 text-xs py-1">No points yet.</p>}
                <div className="space-y-2">
                  {points.map((pt, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs w-3 flex-shrink-0">•</span>
                        <input className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                          placeholder="Point text..." value={pt.text} onChange={e => updPoint(i, e.target.value)} />
                        <button type="button" onClick={() => addSubPoint(i)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex-shrink-0" title="Add sub-point"><FaPlus size={9} /></button>
                        <button type="button" onClick={() => removePoint(i)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex-shrink-0"><FaTimes size={9} /></button>
                      </div>
                      {(pt.subPoints || []).map((sp, si) => (
                        <div key={si} className="flex items-center gap-2 ml-6">
                          <span className="text-gray-300 text-xs w-3 flex-shrink-0">◦</span>
                          <input className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50"
                            placeholder="Sub-point..." value={sp.text} onChange={e => updSubPoint(i, si, e.target.value)} />
                          <button type="button" onClick={() => removeSubPoint(i, si)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-300 hover:bg-red-100 flex-shrink-0"><FaTimes size={8} /></button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Order</label>
                <input type="number" className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
              </div>
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
            <div className="p-5 space-y-3">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{viewItem.tab}</span>
              {viewItem.title && <p className="text-xl font-bold text-gray-800">{viewItem.title}</p>}
              {viewItem.subtitle && <p className="text-gray-500 text-sm font-semibold">{viewItem.subtitle}</p>}
              {viewItem.description && <p className="text-gray-600 text-sm leading-relaxed">{viewItem.description}</p>}
              {(viewItem.headings || []).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Headings</p>
                  {viewItem.headings.map((h, i) => <p key={i} className="text-sm font-semibold text-gray-700">• {h}</p>)}
                </div>
              )}
              {(viewItem.points || []).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Points</p>
                  {viewItem.points.map((pt, i) => (
                    <div key={i} className="ml-2">
                      <p className="text-sm text-gray-600">• {pt.text}</p>
                      {(pt.subPoints || []).map((sp, si) => (
                        <p key={si} className="text-xs text-gray-400 ml-4">◦ {sp.text}</p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {(viewItem.images || []).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Images ({viewItem.images.length})</p>
                  <div className="space-y-3">
                    {viewItem.images.map((img, i) => (
                      <div key={i}>
                        {img.name && <p className="text-xs font-semibold text-[#006CB5] mb-1">{img.name}</p>}
                        <img src={`${BASE_URL}${img.path || img}`} alt="" className="w-full h-40 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                      </div>
                    ))}
                  </div>
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

      {deleteId && <ConfirmModal onConfirm={del} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
