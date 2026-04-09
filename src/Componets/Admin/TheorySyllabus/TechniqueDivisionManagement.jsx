import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';
const getToken = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const EMPTY_FORM = { category: '', title: '', subtitle: '', description: '', headings: [], points: [], order: 0 };
const emptyPoint = () => ({ text: '', subPoints: [] });
const emptySubPoint = () => ({ text: '', subPoints: [] });

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

export default function TechniqueDivisionManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Category management
  const [categories, setCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('techniqueDivisionCategories')) || []; } catch { return []; }
  });
  const [showCatInput, setShowCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const saveCategories = (cats) => {
    setCategories(cats);
    localStorage.setItem('techniqueDivisionCategories', JSON.stringify(cats));
  };
  const addCategory = () => {
    const name = newCatName.trim();
    if (!name || categories.includes(name)) return;
    saveCategories([...categories, name]);
    setNewCatName('');
    setShowCatInput(false);
  };
  const removeCategory = (c) => saveCategories(categories.filter(x => x !== c));

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/technique-divisions`);
      const data = await res.json();
      setItems(data.data || []);
    } finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category: categories[0] || '', order: items.length });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      category: item.category,
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description || '',
      headings: [...(item.headings || [])],
      points: JSON.parse(JSON.stringify(item.points || [])),
      order: item.order || 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const url = editing ? `${API_BASE}/technique-divisions/${editing._id}` : `${API_BASE}/technique-divisions`;
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, { method, headers: authH(), body: JSON.stringify(form) });
    setShowModal(false);
    fetchItems();
  };

  const handleDelete = async () => {
    await fetch(`${API_BASE}/technique-divisions/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null);
    fetchItems();
  };

  const upd = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Headings (simple string array) ──────────────────────────────────────
  const addHeading = () => upd('headings', [...form.headings, '']);
  const updHeading = (i, val) => {
    const arr = [...form.headings]; arr[i] = val; upd('headings', arr);
  };
  const removeHeading = (i) => upd('headings', form.headings.filter((_, idx) => idx !== i));

  // ── Points ────────────────────────────────────────────────────────────────
  const addPoint = () => upd('points', [...form.points, emptyPoint()]);
  const updPoint = (i, val) => {
    const arr = [...form.points]; arr[i] = { ...arr[i], text: val }; upd('points', arr);
  };
  const removePoint = (i) => upd('points', form.points.filter((_, idx) => idx !== i));

  // ── Sub-points ────────────────────────────────────────────────────────────
  const addSubPoint = (pi) => {
    const arr = [...form.points];
    arr[pi].subPoints = [...(arr[pi].subPoints || []), emptySubPoint()];
    upd('points', arr);
  };
  const updSubPoint = (pi, si, val) => {
    const arr = [...form.points];
    arr[pi].subPoints[si] = { ...arr[pi].subPoints[si], text: val };
    upd('points', arr);
  };
  const removeSubPoint = (pi, si) => {
    const arr = [...form.points];
    arr[pi].subPoints = arr[pi].subPoints.filter((_, idx) => idx !== si);
    upd('points', arr);
  };

  // ── Sub-sub-points ────────────────────────────────────────────────────────
  const addSubSubPoint = (pi, si) => {
    const arr = [...form.points];
    arr[pi].subPoints[si].subPoints = [...(arr[pi].subPoints[si].subPoints || []), emptySubPoint()];
    upd('points', arr);
  };
  const updSubSubPoint = (pi, si, ssi, val) => {
    const arr = [...form.points];
    arr[pi].subPoints[si].subPoints[ssi] = { ...arr[pi].subPoints[si].subPoints[ssi], text: val };
    upd('points', arr);
  };
  const removeSubSubPoint = (pi, si, ssi) => {
    const arr = [...form.points];
    arr[pi].subPoints[si].subPoints = arr[pi].subPoints[si].subPoints.filter((_, idx) => idx !== ssi);
    upd('points', arr);
  };

  // Group items by category for display
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Division of Techniques</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage technique categories and their content shown in the mobile app.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCatInput(v => !v)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-sm font-semibold hover:border-[#006CB5] hover:text-[#006CB5] transition-colors"
          >
            <FaPlus size={11} /> Add Category
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
            <FaPlus /> Add Item
          </button>
        </div>
      </div>

      {/* Inline category input */}
      {showCatInput && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">Manage Categories</p>
          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Hand techniques"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              autoFocus
            />
            <button onClick={addCategory}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
              Add
            </button>
            <button onClick={() => { setShowCatInput(false); setNewCatName(''); }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 text-sm">
              <FaTimes size={12} />
            </button>
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <span key={c} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-600">
                  {c}
                  <button onClick={() => removeCategory(c)} className="text-gray-400 hover:text-red-500">
                    <FaTimes size={9} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {categories.length === 0 && <p className="text-gray-400 text-xs">No categories yet.</p>}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-gray-400 text-center py-10 text-sm">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Subtitle</th>
                <th className="px-4 py-3">Headings</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.subtitle || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {item.headings?.length > 0
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600">{item.headings.length}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
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
          {items.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No items yet.</p>}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit Item' : 'Add Item'}</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">

              {/* Category + Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Category <span className="text-red-500">*</span></label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={form.category}
                    onChange={e => upd('category', e.target.value)}
                  >
                    {categories.length === 0 && <option value="">— Add a category first —</option>}
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Title <span className="text-red-500">*</span></label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. Attack techniques"
                    value={form.title} onChange={e => upd('title', e.target.value)} />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Subtitle</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Optional subtitle..."
                  value={form.subtitle} onChange={e => upd('subtitle', e.target.value)} />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Description shown at the top of the detail screen..."
                  value={form.description} onChange={e => upd('description', e.target.value)} />
              </div>

              {/* Headings + Points */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Headings & Points</label>
                  <button type="button" onClick={addHeading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Heading
                  </button>
                </div>
                {form.headings.length === 0 && <p className="text-gray-400 text-xs py-1">No headings yet.</p>}
                <div className="space-y-4">
                  {form.headings.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold bg-white"
                        placeholder="e.g. Types of hand attacks..."
                        value={h}
                        onChange={e => updHeading(i, e.target.value)}
                      />
                      <button type="button" onClick={() => removeHeading(i)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex-shrink-0"><FaTimes size={10} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Points — separate from headings */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Points</label>
                  <button type="button" onClick={addPoint}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Point
                  </button>
                </div>
                {form.points.length === 0 && <p className="text-gray-400 text-xs py-1">No points yet.</p>}
                <div className="space-y-2">
                  {form.points.map((pt, pi) => (
                    <div key={pi} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs w-3 flex-shrink-0">•</span>
                        <input className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                          placeholder="Point text..."
                          value={pt.text} onChange={e => updPoint(pi, e.target.value)} />
                        <button type="button" onClick={() => addSubPoint(pi)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex-shrink-0" title="Add sub-point">
                          <FaPlus size={9} />
                        </button>
                        <button type="button" onClick={() => removePoint(pi)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex-shrink-0"><FaTimes size={9} /></button>
                      </div>

                      {/* Sub-points */}
                      {(pt.subPoints || []).map((sp, si) => (
                        <div key={si} className="space-y-1 ml-6">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 text-xs w-3 flex-shrink-0">◦</span>
                            <input className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50"
                              placeholder="Sub-point text..."
                              value={sp.text} onChange={e => updSubPoint(pi, si, e.target.value)} />
                            <button type="button" onClick={() => addSubSubPoint(pi, si)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 flex-shrink-0" title="Add nested point">
                              <FaPlus size={8} />
                            </button>
                            <button type="button" onClick={() => removeSubPoint(pi, si)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-300 hover:bg-red-100 flex-shrink-0"><FaTimes size={8} /></button>
                          </div>

                          {/* Sub-sub-points */}
                          {(sp.subPoints || []).map((ssp, ssi) => (
                            <div key={ssi} className="flex items-center gap-2 ml-6">
                              <span className="text-gray-200 text-xs w-3 flex-shrink-0">▸</span>
                              <input className="flex-1 border border-gray-100 rounded-lg px-3 py-1.5 text-sm bg-gray-50"
                                placeholder="Nested point text..."
                                value={ssp.text} onChange={e => updSubSubPoint(pi, si, ssi, e.target.value)} />
                              <button type="button" onClick={() => removeSubSubPoint(pi, si, ssi)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-200 hover:bg-red-100 flex-shrink-0"><FaTimes size={8} /></button>
                            </div>
                          ))}
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
                  value={form.order} onChange={e => upd('order', e.target.value)} />
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
              <h4 className="font-bold text-gray-800">View Item</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{viewItem.category}</span>
              <p className="text-xl font-bold text-gray-800">{viewItem.title}</p>
              {viewItem.subtitle && <p className="text-gray-500 text-sm">{viewItem.subtitle}</p>}
              {viewItem.description && <p className="text-gray-600 text-sm leading-relaxed">{viewItem.description}</p>}
              {(viewItem.headings || []).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Headings</p>
                  {viewItem.headings.map((h, i) => (
                    <p key={i} className="text-sm font-semibold text-gray-800">• {h}</p>
                  ))}
                </div>
              )}
              {(viewItem.points || []).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Points</p>
                  {viewItem.points.map((pt, pi) => (
                    <div key={pi} className="ml-2 mt-1">
                      <p className="text-sm text-gray-600">• {pt.text}</p>
                      {(pt.subPoints || []).map((sp, si) => (
                        <div key={si} className="ml-4">
                          <p className="text-xs text-gray-500">◦ {sp.text}</p>
                          {(sp.subPoints || []).map((ssp, ssi) => (
                            <p key={ssi} className="text-xs text-gray-400 ml-4">▸ {ssp.text}</p>
                          ))}
                        </div>
                      ))}
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

      {deleteId && <ConfirmModal message="Delete this item?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

