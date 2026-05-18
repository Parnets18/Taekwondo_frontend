import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaArrowUp, FaArrowDown, FaEye, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';
const getToken = () => localStorage.getItem('token');
const authH = () => ({ Authorization: `Bearer ${getToken()}` });
const jsonH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const EMPTY = { title: '', subtitle: '', description: '', order: 0 };

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

export default function DoJangManagement() {
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
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/do-jang`);
    const d = await res.json();
    setItems(d.data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, order: items.length });
    setHeadingPointGroups([{ heading: '', points: [''] }]);
    setImgFiles([]); setImgPreviews([]);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title || '', subtitle: item.subtitle || '', description: item.description || '', order: item.order });
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
    const url = editing ? `${API_BASE}/do-jang/${editing._id}` : `${API_BASE}/do-jang`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: fd });
    setShowModal(false);
    fetchItems();
  };

  const del = async () => {
    await fetch(`${API_BASE}/do-jang/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null);
    fetchItems();
  };

  const moveItem = async (item, dir) => {
    const idx = items.findIndex(i => i._id === item._id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const swap = items[swapIdx];
    await Promise.all([
      fetch(`${API_BASE}/do-jang/${item._id}`, { method: 'PUT', headers: jsonH(), body: JSON.stringify({ order: swap.order }) }),
      fetch(`${API_BASE}/do-jang/${swap._id}`, { method: 'PUT', headers: jsonH(), body: JSON.stringify({ order: item.order }) }),
    ]);
    fetchItems();
  };

  const filteredItems = items.filter(item =>
    search.trim() === '' ||
    item.title?.toLowerCase().includes(search.trim().toLowerCase()) ||
    item.subtitle?.toLowerCase().includes(search.trim().toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pageSafe = Math.min(currentPage, totalPages);
  const pagedItems = filteredItems.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Do Jang</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage content shown in the Do Jang screen of the mobile app.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
          <FaPlus /> Add Section
        </button>
      </div>

      {loading ? <p className="text-gray-400 text-center py-10 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Search */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </span>
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search by title or subtitle..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs uppercase bg-gray-50 border-b">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Subtitle</th>
              <th className="px-4 py-3">Groups</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {pagedItems.map((item, i) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{(pageSafe - 1) * PAGE_SIZE + i + 1}</td>
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
          {filteredItems.length === 0 && (
            <p className="text-gray-400 text-center py-8 text-sm">{search ? 'No sections match your search.' : 'No sections yet.'}</p>
          )}
          {filteredItems.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-gray-500">Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filteredItems.length)} of {filteredItems.length}</span>
              {totalPages > 1 && (
                <div className="flex gap-1 items-center">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={pageSafe === 1} className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40" style={{ borderColor: '#006CB5', color: '#006CB5' }}>Previous</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                    <button key={pg} onClick={() => setCurrentPage(pg)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition" style={pg === pageSafe ? { backgroundColor: '#006CB5', color: '#fff', borderColor: '#006CB5' } : { borderColor: '#006CB5', color: '#006CB5' }}>{pg}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={pageSafe === totalPages} className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40" style={{ borderColor: '#006CB5', color: '#006CB5' }}>Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit Section' : 'Add Section'}</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. What is a Do Jang?"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Subtitle</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Training Hall Rules"
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
      {deleteId && <ConfirmModal onConfirm={del} onCancel={() => setDeleteId(null)} />}

      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Section</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
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
    </>
  );
}

