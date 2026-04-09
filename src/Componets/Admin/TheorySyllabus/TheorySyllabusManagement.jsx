import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:9000';
const TABS = ['Basic Theory', 'History', 'Dynasties'];
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

// ─── BASIC THEORY CONTENT (free-form list) ───────────────────────────────────
function BasicTheoryContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const emptyForm = { title: '', subtitle: '', koreanName: '', description: '', points: [], fullDetails: [], order: 0 };
  const emptyPoint = () => ({ text: '', details: [], _showDetails: false });
  const emptyDetail = () => ({ title: '', subtitle: '', description: '', image: '', points: '', _imagePreview: '', _imageFile: null });
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/theory-syllabus/basic-theory`); const data = await res.json(); setItems(data.data || []); } finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, order: items.length }); setImageFile(null); setImagePreview(null); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      koreanName: item.koreanName || '',
      description: item.description || '',
      points: (item.points || []).map(p => {
        if (typeof p === 'string') return { text: p, details: [], _showDetails: false };
        return {
          text: p.text || '',
          details: (p.details || []).map(d => ({
            title: d.title || '',
            subtitle: d.subtitle || '',
            description: d.description || '',
            image: d.image || '',
            points: (d.points || []).join('\n'),
            _imagePreview: d.image ? `${BASE_URL}${d.image}` : '',
            _imageFile: null,
          })),
          _showDetails: (p.details || []).length > 0,
        };
      }),
      fullDetails: (item.fullDetails || []).map(fd => ({
        title: fd.title || '',
        subtitle: fd.subtitle || '',
        image: fd.image || '',
        paragraphs: (fd.paragraphs || []).join('\n\n'),
        points: (fd.points || []).join('\n'),
        _imagePreview: fd.image ? `${BASE_URL}${fd.image}` : '',
        _imageFile: null,
      })),
      showFullDetails: !!(item.fullDetails?.title || item.fullDetails?.paragraphs?.length || item.fullDetails?.points?.length),
      order: item.order || 0,
    });
    setImageFile(null);
    setImagePreview(item.image ? `${BASE_URL}${item.image}` : null);
    setShowModal(true);
  };

  const handleSave = async () => {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('subtitle', form.subtitle || '');
    fd.append('koreanName', form.koreanName);
    fd.append('description', form.description);
    fd.append('order', form.order);
    if (imageFile) fd.append('image', imageFile);

    const pointsPayload = (form.points || []).map((p, pi) => ({
      text: p.text,
      details: (p.details || []).map((d, si) => ({
        title: d.title || '',
        subtitle: d.subtitle || '',
        description: d.description || '',
        image: d.image || '',
        points: d.points ? d.points.split('\n').map(x => x.trim()).filter(Boolean) : [],
      })),
    }));
    fd.append('points', JSON.stringify(pointsPayload));

    // Attach detail section images: field name = pointDetail_pi_si
    (form.points || []).forEach((p, pi) => {
      (p.details || []).forEach((d, si) => {
        if (d._imageFile) fd.append(`pointDetail_${pi}_${si}`, d._imageFile);
      });
    });

    const fullDetails = (form.fullDetails || [])
      .filter(fd => fd.title || fd.paragraphs || fd.points)
      .map(fd => ({
        title: fd.title.trim(),
        subtitle: fd.subtitle?.trim() || '',
        image: fd.image || '',
        paragraphs: fd.paragraphs.split('\n\n').map(p => p.trim()).filter(Boolean),
        points: fd.points.split('\n').map(p => p.trim()).filter(Boolean),
      }));
    fd.append('fullDetails', JSON.stringify(fullDetails));

    // Attach fullDetails section images: field name = fullDetail_si
    (form.fullDetails || []).forEach((section, si) => {
      if (section._imageFile) fd.append(`fullDetail_${si}`, section._imageFile);
    });

    const url = editing ? `${API_BASE}/theory-syllabus/basic-theory/${editing._id}` : `${API_BASE}/theory-syllabus/basic-theory`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
    setShowModal(false); fetchItems();
  };

  const handleDelete = async () => { await fetch(`${API_BASE}/theory-syllabus/basic-theory/${deleteId}`, { method: 'DELETE', headers: authH() }); setDeleteId(null); fetchItems(); };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Basic Theory Content</h3>
          <p className="text-sm text-gray-500 mt-0.5">Add items — only what you fill in will show in the app.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
          <FaPlus /> Add
        </button>
      </div>

      {loading ? <p className="text-gray-400 text-center py-6 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Korean</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Full Details</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3">
                    {item.image
                      ? <img src={`${BASE_URL}${item.image}`} alt="" className="w-12 h-12 object-cover rounded-lg" />
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800 max-w-[140px] truncate">{item.title || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.koreanName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">{item.description || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {item.points?.length > 0
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{item.points.length}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.fullDetails?.length > 0
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">{item.fullDetails.length}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => setViewItem(item)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100" title="View"><FaEye size={13} /></button>
                      <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit"><FaEdit size={13} /></button>
                      <button onClick={() => setDeleteId(item._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete"><FaTrash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No items yet.</p>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit Item' : 'Add Item'}</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Korean Name <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input placeholder="e.g. ye ui" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.koreanName} onChange={e => setForm({ ...form, koreanName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Subtitle <span className="text-gray-400 font-normal">(optional)</span></label>
                <input placeholder="Subtitle shown below title..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Image <span className="text-gray-400 font-normal">(optional — shown in top-right corner)</span></label>
                <div className="flex items-center gap-4">
                  {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />}
                  <label className="cursor-pointer px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-sm hover:border-[#006CB5] hover:text-[#006CB5] transition-colors">
                    {imagePreview ? 'Change' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
                  </label>
                  {imagePreview && <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-red-400 text-xs">Remove</button>}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Points <span className="text-gray-400 font-normal">(optional)</span></label>
                  <button type="button" onClick={() => setForm({ ...form, points: [...(form.points || []), emptyPoint()] })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Point
                  </button>
                </div>
                {(form.points || []).length === 0 && <p className="text-gray-400 text-xs py-1">No points yet.</p>}
                <div className="space-y-3">
                  {(form.points || []).map((pt, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                      <div className="flex items-center gap-2 p-3">
                        <span className="text-xs font-bold text-gray-500 flex-shrink-0">{idx + 1}.</span>
                        <input placeholder="Point text..." className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                          value={pt.text} onChange={e => { const arr = [...form.points]; arr[idx] = { ...arr[idx], text: e.target.value }; setForm({ ...form, points: arr }); }} />
                        <button type="button" title="Add detail sections for this point"
                          onClick={() => { const arr = [...(form.points||[])]; arr[idx] = { ...arr[idx], _showDetails: !arr[idx]._showDetails }; setForm({ ...form, points: arr }); }}
                          className={`p-1.5 rounded-lg text-xs font-bold flex-shrink-0 ${pt._showDetails || pt.details?.length ? 'text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                          style={pt._showDetails || pt.details?.length ? { backgroundColor: '#006CB5' } : {}}>
                          <FaPlus size={10} />
                        </button>
                        <button type="button" onClick={() => setForm({ ...form, points: (form.points||[]).filter((_, i) => i !== idx) })}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex-shrink-0"><FaTimes size={10} /></button>
                      </div>
                      {(pt._showDetails || pt.details?.length > 0) && (
                        <div className="border-t border-gray-200 p-3 bg-white space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-[#006CB5]">Detail Sections for this point</p>
                            <button type="button" onClick={() => { const arr = [...(form.points||[])]; arr[idx] = { ...arr[idx], details: [...(arr[idx].details||[]), emptyDetail()] }; setForm({ ...form, points: arr }); }}
                              className="flex items-center gap-1 px-2 py-1 rounded text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                              <FaPlus size={8} /> Add Section
                            </button>
                          </div>
                          {(pt.details || []).length === 0 && <p className="text-xs text-gray-400">No sections yet. Click Add Section.</p>}
                          {(pt.details || []).map((d, si) => (
                            <div key={si} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500">Section {si + 1}</span>
                                <button type="button" onClick={() => { const arr = [...(form.points||[])]; arr[idx] = { ...arr[idx], details: arr[idx].details.filter((_,i)=>i!==si) }; setForm({ ...form, points: arr }); }}
                                  className="text-xs text-red-400 hover:text-red-600">Remove</button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs text-gray-600 block mb-1">Title</label>
                                  <input placeholder="Title..." className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                                    value={d.title} onChange={e => { const arr=[...(form.points||[])]; arr[idx].details[si]={...arr[idx].details[si],title:e.target.value}; setForm({...form,points:arr}); }} />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 block mb-1">Subtitle</label>
                                  <input placeholder="Subtitle..." className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                                    value={d.subtitle} onChange={e => { const arr=[...(form.points||[])]; arr[idx].details[si]={...arr[idx].details[si],subtitle:e.target.value}; setForm({...form,points:arr}); }} />
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 block mb-1">Description</label>
                                <textarea rows={2} placeholder="Description..." className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                                  value={d.description} onChange={e => { const arr=[...(form.points||[])]; arr[idx].details[si]={...arr[idx].details[si],description:e.target.value}; setForm({...form,points:arr}); }} />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 block mb-1">Image</label>
                                <div className="flex items-center gap-2">
                                  {(d._imagePreview || d.image) && <img src={d._imagePreview || `${BASE_URL}${d.image}`} alt="" className="w-10 h-10 object-cover rounded" />}
                                  <label className="cursor-pointer px-2 py-1 rounded border border-dashed border-gray-300 text-gray-500 text-xs hover:border-[#006CB5]">
                                    Upload
                                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                                      const f = e.target.files[0]; if (!f) return;
                                      const arr=[...(form.points||[])]; arr[idx].details[si]={...arr[idx].details[si],_imageFile:f,_imagePreview:URL.createObjectURL(f)}; setForm({...form,points:arr});
                                    }} />
                                  </label>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 block mb-1">Points <span className="text-gray-400">(one per line)</span></label>
                                <textarea rows={3} placeholder="Point one&#10;Point two" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                                  value={d.points} onChange={e => { const arr=[...(form.points||[])]; arr[idx].details[si]={...arr[idx].details[si],points:e.target.value}; setForm({...form,points:arr}); }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Full Details <span className="text-gray-400 font-normal">(optional — each section shows on detail page)</span></label>
                  <button type="button" onClick={() => setForm({ ...form, fullDetails: [...form.fullDetails, { title: '', subtitle: '', image: '', paragraphs: '', points: '', _imagePreview: '', _imageFile: null }] })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Section
                  </button>
                </div>
                {form.fullDetails.length === 0 && (
                  <p className="text-gray-400 text-xs py-2">No full detail sections yet. Click "Add Section" to add one.</p>
                )}
                {form.fullDetails.map((fd, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-600">Section {idx + 1}</span>
                      <button type="button" onClick={() => setForm({ ...form, fullDetails: form.fullDetails.filter((_, i) => i !== idx) })}
                        className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Title</label>
                      <input placeholder="Section title..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                        value={fd.title} onChange={e => { const arr = [...form.fullDetails]; arr[idx] = { ...arr[idx], title: e.target.value }; setForm({ ...form, fullDetails: arr }); }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Subtitle <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input placeholder="Section subtitle..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                        value={fd.subtitle} onChange={e => { const arr = [...form.fullDetails]; arr[idx] = { ...arr[idx], subtitle: e.target.value }; setForm({ ...form, fullDetails: arr }); }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Image <span className="text-gray-400 font-normal">(optional)</span></label>
                      <div className="flex items-center gap-3">
                        {(fd._imagePreview || fd.image) && (
                          <img src={fd._imagePreview || `${BASE_URL}${fd.image}`} alt="" className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                        )}
                        <label className="cursor-pointer px-3 py-1.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs hover:border-[#006CB5] hover:text-[#006CB5] transition-colors">
                          {fd._imagePreview || fd.image ? 'Change' : 'Upload Image'}
                          <input type="file" accept="image/*" className="hidden" onChange={e => {
                            const f = e.target.files[0]; if (!f) return;
                            const arr = [...form.fullDetails]; arr[idx] = { ...arr[idx], _imageFile: f, _imagePreview: URL.createObjectURL(f) }; setForm({ ...form, fullDetails: arr });
                          }} />
                        </label>
                        {(fd._imagePreview || fd.image) && (
                          <button type="button" onClick={() => { const arr = [...form.fullDetails]; arr[idx] = { ...arr[idx], _imageFile: null, _imagePreview: '', image: '' }; setForm({ ...form, fullDetails: arr }); }}
                            className="text-xs text-red-400 hover:text-red-600">Remove</button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Paragraphs <span className="text-gray-400 font-normal">(blank line between each)</span></label>
                      <textarea rows={4} placeholder={"First paragraph...\n\nSecond paragraph..."} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                        value={fd.paragraphs} onChange={e => { const arr = [...form.fullDetails]; arr[idx] = { ...arr[idx], paragraphs: e.target.value }; setForm({ ...form, fullDetails: arr }); }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Points <span className="text-gray-400 font-normal">(one per line)</span></label>
                      <textarea rows={3} placeholder={"Point one\nPoint two"} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                        value={fd.points} onChange={e => { const arr = [...form.fullDetails]; arr[idx] = { ...arr[idx], points: e.target.value }; setForm({ ...form, fullDetails: arr }); }} />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Order</label>
                <input type="number" className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>Save</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && <ConfirmModal message="Delete this item?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Item</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              {viewItem.image && <img src={`${BASE_URL}${viewItem.image}`} alt="" className="w-full h-48 object-cover rounded-xl" />}
              {viewItem.title && <p className="font-bold text-gray-800 text-lg">{viewItem.title} {viewItem.koreanName && <span className="text-gray-400 font-normal text-sm">({viewItem.koreanName})</span>}</p>}
              {viewItem.subtitle && <p className="text-gray-500 text-sm">{viewItem.subtitle}</p>}
              {viewItem.description && <p className="text-gray-600 text-sm leading-relaxed">{viewItem.description}</p>}
              {viewItem.points?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Points</p>
                  {viewItem.points.map((p, i) => (
                    <p key={i} className="text-sm text-gray-600">• {p.text} {p.details?.length > 0 && <span className="text-[#006CB5] text-xs">({p.details.length} detail section(s))</span>}</p>
                  ))}
                </div>
              )}
              {viewItem.fullDetails?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Full Details ({viewItem.fullDetails.length} section(s))</p>
                  {viewItem.fullDetails.map((fd, i) => (
                    <p key={i} className="text-sm text-gray-600">• {fd.title || '(no title)'} {fd.image && <span className="text-green-600 text-xs">📷</span>}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="p-5 border-t flex justify-end gap-2">
              <button onClick={() => { setViewItem(null); openEdit(viewItem); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
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

// ─── TENETS ──────────────────────────────────────────────────────────────────
function TenetsSection() {
  const [tenets, setTenets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', korean: '', intro: '', points: '', order: 0 });

  useEffect(() => { fetchTenets(); }, []);
  const fetchTenets = async () => { setLoading(true); try { const res = await fetch(`${API_BASE}/theory-syllabus/tenets`); const data = await res.json(); setTenets(data.data || []); } finally { setLoading(false); } };
  const openAdd = () => { setEditing(null); setForm({ name: '', korean: '', intro: '', points: '', order: tenets.length }); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, korean: t.korean, intro: t.intro, points: t.points.join('\n'), order: t.order }); setShowModal(true); };
  const handleSave = async () => {
    const payload = { ...form, points: form.points.split('\n').map(p => p.trim()).filter(Boolean), order: Number(form.order) };
    const url = editing ? `${API_BASE}/theory-syllabus/tenets/${editing._id}` : `${API_BASE}/theory-syllabus/tenets`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(payload) });
    setShowModal(false); fetchTenets();
  };
  const handleDelete = async () => { await fetch(`${API_BASE}/theory-syllabus/tenets/${deleteId}`, { method: 'DELETE', headers: authH() }); setDeleteId(null); fetchTenets(); };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Tenets of Taekwon-Do</h3>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}><FaPlus /> Add Tenet</button>
      </div>
      {loading ? <p className="text-gray-400 text-center py-4 text-sm">Loading...</p> : (
        <div className="space-y-2">
          {tenets.map(t => (
            <div key={t._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start shadow-sm">
              <div><p className="font-bold text-gray-800">{t.name} <span className="text-gray-400 font-normal text-sm">({t.korean})</span></p><p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{t.intro}</p><p className="text-xs text-gray-400 mt-1">{t.points.length} points</p></div>
              <div className="flex gap-2 ml-4 flex-shrink-0"><button onClick={() => openEdit(t)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit /></button><button onClick={() => setDeleteId(t._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FaTrash /></button></div>
            </div>
          ))}
          {tenets.length === 0 && <p className="text-gray-400 text-center py-6 text-sm">No tenets yet.</p>}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b"><h4 className="font-bold text-gray-800">{editing ? 'Edit Tenet' : 'Add Tenet'}</h4><button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button></div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-semibold text-gray-700 block mb-1">Name</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><label className="text-sm font-semibold text-gray-700 block mb-1">Korean</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.korean} onChange={e => setForm({ ...form, korean: e.target.value })} /></div>
              </div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Intro</label><textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.intro} onChange={e => setForm({ ...form, intro: e.target.value })} /></div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Points <span className="text-gray-400 font-normal">(one per line)</span></label><textarea rows={7} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.points} onChange={e => setForm({ ...form, points: e.target.value })} /></div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Order</label><input type="number" className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button><button onClick={handleSave} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>Save</button></div>
          </div>
        </div>
      )}
      {deleteId && <ConfirmModal message="Delete this tenet?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

// ─── THEORY OF POWER ─────────────────────────────────────────────────────────
function TheoryOfPowerSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ term: '', korean: '', desc: '', order: 0 });

  useEffect(() => { fetchItems(); }, []);
  const fetchItems = async () => { setLoading(true); try { const res = await fetch(`${API_BASE}/theory-syllabus/power`); const data = await res.json(); setItems(data.data || []); } finally { setLoading(false); } };
  const openAdd = () => { setEditing(null); setForm({ term: '', korean: '', desc: '', order: items.length }); setShowModal(true); };
  const openEdit = (i) => { setEditing(i); setForm({ term: i.term, korean: i.korean, desc: i.desc, order: i.order }); setShowModal(true); };
  const handleSave = async () => {
    const payload = { ...form, order: Number(form.order) };
    const url = editing ? `${API_BASE}/theory-syllabus/power/${editing._id}` : `${API_BASE}/theory-syllabus/power`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(payload) });
    setShowModal(false); fetchItems();
  };
  const handleDelete = async () => { await fetch(`${API_BASE}/theory-syllabus/power/${deleteId}`, { method: 'DELETE', headers: authH() }); setDeleteId(null); fetchItems(); };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Theory of Power</h3>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}><FaPlus /> Add Item</button>
      </div>
      {loading ? <p className="text-gray-400 text-center py-4 text-sm">Loading...</p> : (
        <div className="space-y-2">
          {items.map(i => (
            <div key={i._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start shadow-sm">
              <div><p className="font-bold text-gray-800">{i.term} <span className="text-gray-400 font-normal text-sm">({i.korean})</span></p><p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{i.desc}</p></div>
              <div className="flex gap-2 ml-4 flex-shrink-0"><button onClick={() => openEdit(i)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit /></button><button onClick={() => setDeleteId(i._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FaTrash /></button></div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-center py-6 text-sm">No items yet.</p>}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center p-5 border-b"><h4 className="font-bold text-gray-800">{editing ? 'Edit Item' : 'Add Item'}</h4><button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button></div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-semibold text-gray-700 block mb-1">Term</label><input placeholder="e.g. Reaction Force" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.term} onChange={e => setForm({ ...form, term: e.target.value })} /></div>
                <div><label className="text-sm font-semibold text-gray-700 block mb-1">Korean</label><input placeholder="e.g. Bandong Ryok" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.korean} onChange={e => setForm({ ...form, korean: e.target.value })} /></div>
              </div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Description</label><textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Order</label><input type="number" className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button><button onClick={handleSave} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>Save</button></div>
          </div>
        </div>
      )}
      {deleteId && <ConfirmModal message="Delete this item?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

// ─── HISTORY TAB ─────────────────────────────────────────────────────────────
function HistoryTab() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewSection, setViewSection] = useState(null);
  const [form, setForm] = useState({ period: '', description: '', order: 0 });

  useEffect(() => { fetchSections(); }, []);
  const fetchSections = async () => { setLoading(true); try { const res = await fetch(`${API_BASE}/theory-syllabus/history`); const data = await res.json(); setSections(data.data || []); } finally { setLoading(false); } };
  const openAdd = () => { setEditing(null); setForm({ period: '', description: '', order: sections.length }); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ period: s.period, description: s.description, order: s.order }); setShowModal(true); };
  const handleSave = async () => {
    const url = editing ? `${API_BASE}/theory-syllabus/history/${editing._id}` : `${API_BASE}/theory-syllabus/history`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify({ period: form.period, description: form.description, order: Number(form.order) }) });
    setShowModal(false); fetchSections();
  };
  const handleDelete = async () => { await fetch(`${API_BASE}/theory-syllabus/history/${deleteId}`, { method: 'DELETE', headers: authH() }); setDeleteId(null); fetchSections(); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div><h3 className="text-lg font-bold text-gray-800">History Sections</h3><p className="text-sm text-gray-500 mt-0.5">Period + description shown in the History tab.</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}><FaPlus /> Add Section</button>
      </div>
      {loading ? <p className="text-gray-400 text-center py-6 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50"><th className="px-5 py-3">#</th><th className="px-5 py-3">Period</th><th className="px-5 py-3">Description</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              {sections.map((s, idx) => (
                <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-5 py-3 italic text-[#006CB5] font-semibold whitespace-nowrap">{s.period}</td>
                  <td className="px-5 py-3 text-gray-700 max-w-xs truncate">{s.description}</td>
                  <td className="px-5 py-3 text-right"><div className="flex gap-1.5 justify-end"><button onClick={() => setViewSection(s)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100" title="View"><FaEye size={13} /></button><button onClick={() => openEdit(s)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit"><FaEdit size={13} /></button><button onClick={() => setDeleteId(s._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete"><FaTrash size={13} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {sections.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No history sections yet.</p>}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center p-5 border-b"><h4 className="font-bold text-gray-800">{editing ? 'Edit Section' : 'Add Section'}</h4><button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Period</label><input placeholder="e.g. 37 BC – AD 668" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} /></div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Description</label><textarea rows={5} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Order</label><input type="number" className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button><button onClick={handleSave} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>Save</button></div>
          </div>
        </div>
      )}
      {deleteId && <ConfirmModal message="Delete this section?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}

      {viewSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-5 border-b"><h4 className="font-bold text-gray-800">View History Section</h4><button onClick={() => setViewSection(null)}><FaTimes className="text-gray-500" /></button></div>
            <div className="p-5 space-y-3">
              <p className="text-[#006CB5] font-semibold italic">{viewSection.period}</p>
              <p className="text-gray-700 text-sm leading-relaxed">{viewSection.description}</p>
            </div>
            <div className="p-5 border-t flex justify-end gap-2">
              <button onClick={() => { setViewSection(null); openEdit(viewSection); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}><FaEdit size={12} /> Edit</button>
              <button onClick={() => setViewSection(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DYNASTIES TAB ───────────────────────────────────────────────────────────
function DynastiesTab() {
  const [dynasties, setDynasties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewDynasty, setViewDynasty] = useState(null);
  const [form, setForm] = useState({ period: '', name: '', order: 0 });

  useEffect(() => { fetchDynasties(); }, []);
  const fetchDynasties = async () => { setLoading(true); try { const res = await fetch(`${API_BASE}/theory-syllabus/dynasties`); const data = await res.json(); setDynasties(data.data || []); } finally { setLoading(false); } };
  const openAdd = () => { setEditing(null); setForm({ period: '', name: '', order: dynasties.length }); setShowModal(true); };
  const openEdit = (d) => { setEditing(d); setForm({ period: d.period, name: d.name, order: d.order }); setShowModal(true); };
  const handleSave = async () => {
    const url = editing ? `${API_BASE}/theory-syllabus/dynasties/${editing._id}` : `${API_BASE}/theory-syllabus/dynasties`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify({ ...form, order: Number(form.order) }) });
    setShowModal(false); fetchDynasties();
  };
  const handleDelete = async () => { await fetch(`${API_BASE}/theory-syllabus/dynasties/${deleteId}`, { method: 'DELETE', headers: authH() }); setDeleteId(null); fetchDynasties(); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div><h3 className="text-lg font-bold text-gray-800">Korean Dynasties</h3><p className="text-sm text-gray-500 mt-0.5">Period + name shown in the Dynasties tab.</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}><FaPlus /> Add Dynasty</button>
      </div>
      {loading ? <p className="text-gray-400 text-center py-6 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50"><th className="px-5 py-3">#</th><th className="px-5 py-3">Period</th><th className="px-5 py-3">Dynasty Name</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              {dynasties.map((d, idx) => (
                <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-5 py-3 italic text-[#006CB5] font-semibold">{d.period}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{d.name}</td>
                  <td className="px-5 py-3 text-right"><div className="flex gap-1.5 justify-end"><button onClick={() => setViewDynasty(d)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100" title="View"><FaEye size={13} /></button><button onClick={() => openEdit(d)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit"><FaEdit size={13} /></button><button onClick={() => setDeleteId(d._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete"><FaTrash size={13} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {dynasties.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No dynasties yet.</p>}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-5 border-b"><h4 className="font-bold text-gray-800">{editing ? 'Edit Dynasty' : 'Add Dynasty'}</h4><button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Period</label><input placeholder="e.g. 2333 – 194 BC" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} /></div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Dynasty Name</label><input placeholder="e.g. Gojoseon" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="text-sm font-semibold text-gray-700 block mb-1">Order</label><input type="number" className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button><button onClick={handleSave} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>Save</button></div>
          </div>
        </div>
      )}
      {deleteId && <ConfirmModal message="Delete this dynasty?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}

      {viewDynasty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-5 border-b"><h4 className="font-bold text-gray-800">View Dynasty</h4><button onClick={() => setViewDynasty(null)}><FaTimes className="text-gray-500" /></button></div>
            <div className="p-5 space-y-2">
              <p className="text-[#006CB5] font-semibold italic">{viewDynasty.period}</p>
              <p className="text-gray-800 font-bold text-lg">{viewDynasty.name}</p>
            </div>
            <div className="p-5 border-t flex justify-end gap-2">
              <button onClick={() => { setViewDynasty(null); openEdit(viewDynasty); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}><FaEdit size={12} /> Edit</button>
              <button onClick={() => setViewDynasty(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BASIC THEORY TAB ────────────────────────────────────────────────────────
function BasicTheoryTab() {
  return <BasicTheoryContent />;
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
function TheorySyllabusManagement() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Theory Syllabus Management</h2>
        <p className="text-gray-500 text-sm mt-1">Manage all content shown in the Theory section of the mobile app.</p>
      </div>
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === i ? 'border-[#006CB5] text-[#006CB5]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 0 && <BasicTheoryTab />}
        {activeTab === 1 && <HistoryTab />}
        {activeTab === 2 && <DynastiesTab />}
      </div>
    </div>
  );
}

export default TheorySyllabusManagement;
