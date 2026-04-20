import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaArrowUp, FaArrowDown, FaEye, FaTags } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';
const getToken = () => localStorage.getItem('token');
const authH = () => ({ Authorization: `Bearer ${getToken()}` });
const jsonH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const EMPTY = { tab: '', title: '', subtitle: '', description: '', order: 0 };

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <p className="text-gray-800 font-semibold mb-6 text-center">Delete this item?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: '#dc2626' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function MoralCultureManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [headingPointGroups, setHeadingPointGroups] = useState([{ heading: '', points: [''] }]);
  const [imgFiles, setImgFiles] = useState([]);
  const [imgPreviews, setImgPreviews] = useState([]);

  // Tab management
  const [showTabModal, setShowTabModal] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [newTabName, setNewTabName] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/moral-culture`);
    const d = await res.json();
    const data = d.data || [];
    setItems(data);
    // Derive unique tabs from data
    const uniqueTabs = [...new Set(data.map(i => i.tab).filter(Boolean))];
    setTabs(uniqueTabs);
    setLoading(false);
  };

  const addTab = () => {
    const name = newTabName.trim();
    if (!name || tabs.includes(name)) return;
    setTabs([...tabs, name]);
    setNewTabName('');
  };

  const removeTab = (tab) => {
    setTabs(tabs.filter(t => t !== tab));
    if (filterTab === tab) setFilterTab('all');
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, order: items.length, tab: tabs[0] || '' });
    setHeadingPointGroups([{ heading: '', points: [''] }]);
    setImgFiles([]); setImgPreviews([]);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ tab: item.tab || '', title: item.title || '', subtitle: item.subtitle || '', description: item.description || '', order: item.order });
    setHeadingPointGroups(item.headingPointGroups?.length ? item.headingPointGroups : [{ heading: '', points: [''] }]);
    setImgFiles([]);
    setImgPreviews((item.images || []).map(url => ({ url: `${BASE_URL}${url}`, isExisting: true, path: url })));
    setShowModal(true);
  };

  const save = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('headingPointGroups', JSON.stringify(headingPointGroups.filter(group => group.heading || group.points.some(Boolean))));
    const existingPaths = imgPreviews.filter(p => p.isExisting).map(p => p.path);
    fd.append('existingImages', JSON.stringify(existingPaths));
    imgFiles.forEach(f => fd.append('images', f));
    const url = editing ? `${API_BASE}/moral-culture/${editing._id}` : `${API_BASE}/moral-culture`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: fd });
    setShowModal(false);
    fetchItems();
  };

  const del = async () => {
    await fetch(`${API_BASE}/moral-culture/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null);
    fetchItems();
  };

  const moveItem = async (item, dir) => {
    const list = filtered;
    const idx = list.findIndex(i => i._id === item._id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const swap = list[swapIdx];
    await Promise.all([
      fetch(`${API_BASE}/moral-culture/${item._id}`, { method: 'PUT', headers: jsonH(), body: JSON.stringify({ order: swap.order }) }),
      fetch(`${API_BASE}/moral-culture/${swap._id}`, { method: 'PUT', headers: jsonH(), body: JSON.stringify({ order: item.order }) }),
    ]);
    fetchItems();
  };

  const filtered = filterTab === 'all' ? items : items.filter(i => i.tab === filterTab);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start mb-6 gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Moral Culture</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage content shown in the Moral Culture screen of the mobile app.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowTabModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#006CB5] text-[#006CB5] text-sm font-semibold hover:bg-blue-50">
            <FaTags size={13} /> Manage Tabs
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
            <FaPlus /> Add Section
          </button>
        </div>
      </div>

      {/* Tab filter pills */}
      {tabs.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filterTab === 'all' ? 'bg-[#006CB5] text-white border-[#006CB5]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#006CB5]'}`}>
            All ({items.length})
          </button>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filterTab === tab ? 'bg-[#006CB5] text-white border-[#006CB5]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#006CB5]'}`}>
              {tab} ({items.filter(i => i.tab === tab).length})
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? <p className="text-gray-400 text-center py-10 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs uppercase bg-gray-50 border-b">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Tab</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Subtitle</th>
              <th className="px-4 py-3">Groups</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    {item.tab
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{item.tab}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.title || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.subtitle || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{(item.headingPointGroups || []).length}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{(item.images || []).length}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1.5 justify-end items-center">
                      <button onClick={() => moveItem(item, -1)} className="p-1.5 rounded bg-gray-50 text-gray-400 hover:bg-gray-100"><FaArrowUp size={11} /></button>
                      <button onClick={() => moveItem(item, 1)}  className="p-1.5 rounded bg-gray-50 text-gray-400 hover:bg-gray-100"><FaArrowDown size={11} /></button>
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

      {/* Manage Tabs Modal */}
      {showTabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">Manage Tabs</h4>
              <button onClick={() => setShowTabModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500">Tabs appear as a horizontal swipeable bar in the mobile app. Each section is assigned to a tab.</p>
              <div className="flex gap-2">
                <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="New tab name..."
                  value={newTabName} onChange={e => setNewTabName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTab()} />
                <button onClick={addTab} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>Add</button>
              </div>
              <div className="space-y-2">
                {tabs.length === 0 && <p className="text-gray-400 text-xs text-center py-2">No tabs yet.</p>}
                {tabs.map((tab, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm font-semibold text-gray-700">{tab}</span>
                    <button onClick={() => removeTab(tab)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 border-t flex justify-end">
              <button onClick={() => setShowTabModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit Section' : 'Add Section'}</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">

              {/* Tab selector */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Tab</label>
                {tabs.length > 0 ? (
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={form.tab} onChange={e => setForm({ ...form, tab: e.target.value })}>
                    <option value="">— No tab —</option>
                    {tabs.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <p className="text-xs text-gray-400 py-1">No tabs yet. Click "Manage Tabs" to add tabs first.</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. What is Moral Culture?"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Subtitle</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Virtues of a Martial Artist"
                  value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Introductory text..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Heading & Points Groups</label>
                  <button onClick={() => setHeadingPointGroups([...headingPointGroups, { heading: '', points: [''] }])} 
                    className="text-xs text-blue-600 hover:underline">+ Add Group</button>
                </div>
                <div className="space-y-4">
                  {headingPointGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-600">Group {groupIdx + 1}</span>
                        {headingPointGroups.length > 1 && (
                          <button onClick={() => setHeadingPointGroups(headingPointGroups.filter((_, i) => i !== groupIdx))}
                            className="text-red-400 text-xs px-1">Remove Group</button>
                        )}
                      </div>
                      <div className="mb-3">
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" 
                          placeholder="Heading (optional)"
                          value={group.heading} 
                          onChange={e => setHeadingPointGroups(headingPointGroups.map((g, i) => 
                            i === groupIdx ? { ...g, heading: e.target.value } : g
                          ))} />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-500">Points</span>
                          <button onClick={() => setHeadingPointGroups(headingPointGroups.map((g, i) => 
                            i === groupIdx ? { ...g, points: [...g.points, ''] } : g
                          ))} className="text-xs text-blue-600 hover:underline">+ Add Point</button>
                        </div>
                        <div className="space-y-2">
                          {group.points.map((point, pointIdx) => (
                            <div key={pointIdx} className="flex gap-2">
                              <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" 
                                placeholder={`Point ${pointIdx + 1}`}
                                value={point} 
                                onChange={e => setHeadingPointGroups(headingPointGroups.map((g, i) => 
                                  i === groupIdx ? { ...g, points: g.points.map((p, j) => j === pointIdx ? e.target.value : p) } : g
                                ))} />
                              {group.points.length > 1 && (
                                <button onClick={() => setHeadingPointGroups(headingPointGroups.map((g, i) => 
                                  i === groupIdx ? { ...g, points: g.points.filter((_, j) => j !== pointIdx) } : g
                                ))} className="text-red-400 text-xs px-1">✕</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Images</label>
                <div className="flex flex-col gap-2">
                  {imgPreviews.map((p, i) => (
                    <div key={i} className="relative">
                      <img src={p.url} className="w-full h-36 object-contain rounded-lg border border-gray-200 bg-gray-50" alt="" />
                      <button onClick={() => setImgPreviews(imgPreviews.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
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
              {viewItem.tab && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{viewItem.tab}</span>}
              {viewItem.title    && <p className="text-xl font-bold text-gray-800">{viewItem.title}</p>}
              {viewItem.subtitle && <p className="text-base font-semibold text-[#006CB5]">{viewItem.subtitle}</p>}
              {viewItem.description && <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{viewItem.description}</p>}
              {viewItem.headingPointGroups?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Content Groups</p>
                  {viewItem.headingPointGroups.map((group, i) => (
                    <div key={i} className="mb-4">
                      {group.heading && <p className="text-sm font-bold text-gray-700 mb-2">{group.heading}</p>}
                      {group.points?.map((point, j) => (
                        <p key={j} className="text-sm text-gray-600 mb-1">• {point}</p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {viewItem.images?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Images ({viewItem.images.length})</p>
                  <div className="grid grid-cols-2 gap-2">
                    {viewItem.images.map((img, i) => (
                      <img key={i} src={`${BASE_URL}${img}`} alt="" className="w-full h-32 object-contain rounded-lg border border-gray-200 bg-gray-50" />
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

