import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';
const getToken = () => localStorage.getItem('token');
const authH = () => ({ Authorization: `Bearer ${getToken()}` });

const EMPTY_FORM = {
  name: '', korean: '',
  title: '',
  weight: '', width: '', length: '', facing: '', lr: '',
  description: '', order: 0,
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

export default function StancesManagement() {
  const [stances, setStances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [diagramFile, setDiagramFile] = useState(null);
  const [diagramPreview, setDiagramPreview] = useState(null);
  const [personFiles, setPersonFiles] = useState([]);
  const [personPreviews, setPersonPreviews] = useState([]); // { url, isExisting }[]
  const [filterCategory, setFilterCategory] = useState('all');  useEffect(() => { fetchStances(); }, []);

  const fetchStances = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stances`);
      const data = await res.json();
      setStances(data.data || []);
    } finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, order: stances.length });
    setDiagramFile(null); setDiagramPreview(null);
    setPersonFiles([]); setPersonPreviews([]);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name, korean: s.korean,
      title: s.title || '',
      weight: s.weight, width: s.width, length: s.length,
      facing: s.facing, lr: s.lr, description: s.description, order: s.order,
    });
    setDiagramFile(null); setDiagramPreview(s.diagramImage ? `${BASE_URL}${s.diagramImage}` : null);
    setPersonFiles([]);
    setPersonPreviews((s.personImages || []).map(url => ({ url: `${BASE_URL}${url}`, isExisting: true, path: url })));
    setShowModal(true);
  };

  const handleSave = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (diagramFile) fd.append('diagramImage', diagramFile);
    // Send existing image paths so backend can preserve them
    const existingPaths = personPreviews.filter(p => p.isExisting).map(p => p.path);
    fd.append('existingPersonImages', JSON.stringify(existingPaths));
    personFiles.forEach(f => fd.append('personImages', f));

    const url    = editing ? `${API_BASE}/stances/${editing._id}` : `${API_BASE}/stances`;
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, { method, headers: authH(), body: fd });
    setShowModal(false);
    fetchStances();
  };

  const handleDelete = async () => {
    await fetch(`${API_BASE}/stances/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null);
    fetchStances();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Stances</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage stances shown in the Stances screen of the mobile app.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ backgroundColor: '#006CB5' }}
          >
            <FaPlus /> Add Stance
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
                <th className="px-4 py-3">Images</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Korean</th>
                <th className="px-4 py-3">Weight</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stances.map((s, idx) => (
                <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3">
                    {s.diagramImage
                      ? <img src={`${BASE_URL}${s.diagramImage}`} alt="diagram" className="w-10 h-10 object-cover rounded border border-gray-200" />
                      : <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.korean}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.weight || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1.5 justify-end items-center">
                      <button onClick={() => setViewItem(s)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100" title="View"><FaEye size={13} /></button>
                      <button onClick={() => openEdit(s)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit"><FaEdit size={13} /></button>
                      <button onClick={() => setDeleteId(s._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete"><FaTrash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stances.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No stances yet.</p>}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit Stance' : 'Add Stance'}</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Name + Korean */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Name <span className="text-red-500">*</span></label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Close Stance"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Korean Name <span className="text-red-500">*</span></label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Moa Sogi"
                    value={form.korean} onChange={e => setForm({ ...form, korean: e.target.value })} />
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Weight Distribution</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 50/50"
                    value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Width</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 1 shoulder width"
                    value={form.width} onChange={e => setForm({ ...form, width: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Length</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 1½ shoulder width"
                    value={form.length} onChange={e => setForm({ ...form, length: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Facing</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Full or Half"
                    value={form.facing} onChange={e => setForm({ ...form, facing: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">L / R</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Leading foot"
                    value={form.lr} onChange={e => setForm({ ...form, lr: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Order</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
                </div>
              </div>

              {/* Title + Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Text</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Key points of this stance..."
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Description shown when tapping the stance in the app..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              {/* Images */}
              <div className="grid grid-cols-2 gap-4">
                {/* Diagram image */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Foot Diagram Image</label>
                  <div className="flex flex-col gap-2">
                    {diagramPreview && <img src={diagramPreview} alt="diagram" className="w-full h-32 object-contain rounded-lg border border-gray-200 bg-gray-50" />}
                    <label className="cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs text-center hover:border-[#006CB5] hover:text-[#006CB5] transition-colors">
                      {diagramPreview ? 'Change Image' : 'Upload Diagram'}
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const f = e.target.files[0];
                        if (f) { setDiagramFile(f); setDiagramPreview(URL.createObjectURL(f)); }
                      }} />
                    </label>
                    {diagramPreview && (
                      <button onClick={() => { setDiagramFile(null); setDiagramPreview(null); }} className="text-red-400 text-xs">Remove</button>
                    )}
                  </div>
                </div>

                {/* Person images */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Person / Stance Photos</label>
                  <div className="flex flex-col gap-2">
                    {personPreviews.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p.url} alt={`person-${i}`} className="w-full h-40 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                        <button
                          onClick={() => {
                            const updated = personPreviews.filter((_, idx) => idx !== i);
                            setPersonPreviews(updated);
                            if (!p.isExisting) setPersonFiles(prev => prev.filter((_, idx) => idx !== personPreviews.slice(0, i).filter(x => !x.isExisting).length));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >×</button>
                      </div>
                    ))}
                    <label className="cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs text-center hover:border-[#006CB5] hover:text-[#006CB5] transition-colors">
                      + Add Photo
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                        const files = Array.from(e.target.files);
                        setPersonFiles(prev => [...prev, ...files]);
                        setPersonPreviews(prev => [...prev, ...files.map(f => ({ url: URL.createObjectURL(f), isExisting: false }))]);
                        e.target.value = '';
                      }} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t">
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
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Stance</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xl font-bold text-gray-800">{viewItem.name} <span className="text-green-600 font-normal text-base">({viewItem.korean})</span></p>
              {viewItem.diagramImage && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Foot Diagram</p>
                  <img src={`${BASE_URL}${viewItem.diagramImage}`} alt="diagram" className="w-24 h-24 object-cover rounded-lg border border-gray-200 bg-gray-50" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {viewItem.weight && <div><span className="font-semibold text-gray-700">Weight: </span><span className="text-gray-500">{viewItem.weight}</span></div>}
                {viewItem.width  && <div><span className="font-semibold text-gray-700">Width: </span><span className="text-gray-500">{viewItem.width}</span></div>}
                {viewItem.length && <div><span className="font-semibold text-gray-700">Length: </span><span className="text-gray-500">{viewItem.length}</span></div>}
                {viewItem.facing && <div><span className="font-semibold text-gray-700">Facing: </span><span className="text-gray-500">{viewItem.facing}</span></div>}
                {viewItem.lr     && <div><span className="font-semibold text-gray-700">L/R: </span><span className="text-gray-500">{viewItem.lr}</span></div>}
                {viewItem.order !== undefined && <div><span className="font-semibold text-gray-700">Order: </span><span className="text-gray-500">{viewItem.order}</span></div>}
              </div>
              {viewItem.title && <div><span className="font-semibold text-gray-700 text-sm">Text: </span><span className="text-gray-600 text-sm">{viewItem.title}</span></div>}
              {viewItem.description && <div><span className="font-semibold text-gray-700 text-sm">Description: </span><p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mt-1">{viewItem.description}</p></div>}
              {viewItem.personImages?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Person / Stance Photos</p>
                  <div className="flex flex-wrap gap-2">
                    {viewItem.personImages.map((img, i) => (
                      <img key={i} src={`${BASE_URL}${img}`} alt={`person-${i}`} className="w-24 h-24 object-cover rounded-lg border border-gray-200 bg-gray-50" />
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

      {deleteId && <ConfirmModal message="Delete this stance?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

