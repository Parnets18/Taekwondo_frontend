import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
const getToken = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const EMPTY_FORM = { category: '', title: '', sections: [], order: 0 };
const emptySection    = () => ({ title: '', subtitle: '', description: '', headingBlocks: [] });
const emptyHeadingBlock = () => ({ heading: '', points: [] });
const emptyPoint      = () => ({ text: '', subPoints: [], detailSections: [] });
const emptySubPoint   = () => ({ text: '', subPoints: [], detailSections: [] });
const emptyDetailSec  = () => ({ title: '', subtitle: '', description: '', points: '' });

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

// ── Detail Sections Modal (for a single point) ────────────────────────────────
function PointDetailModal({ pointText, detailSections, onChange, onClose }) {
  const secs = detailSections || [];

  const addSec = () => onChange([...secs, emptyDetailSec()]);
  const removeSec = (i) => onChange(secs.filter((_, idx) => idx !== i));
  const updSec = (i, key, val) => {
    const arr = [...secs];
    arr[i] = { ...arr[i], [key]: val };
    onChange(arr);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b flex-shrink-0">
          <div>
            <h4 className="font-bold text-gray-800 text-base">Detail Sections for this point</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Point: <span className="italic">{pointText || '(untitled)'}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <FaTimes size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {secs.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6">
              No detail sections yet. Click "Add Section" to create one.
            </p>
          )}
          {secs.map((ds, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Section {i + 1}</span>
                <button type="button" onClick={() => removeSec(i)}
                  className="text-xs text-red-400 hover:text-red-600 font-semibold">Remove</button>
              </div>
              {/* Title + Subtitle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Title</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    placeholder="Title..."
                    value={ds.title}
                    onChange={e => updSec(i, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Subtitle</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    placeholder="Subtitle..."
                    value={ds.subtitle}
                    onChange={e => updSec(i, 'subtitle', e.target.value)}
                  />
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Description</label>
                <textarea rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white resize-none"
                  placeholder="Description..."
                  value={ds.description}
                  onChange={e => updSec(i, 'description', e.target.value)}
                />
              </div>
              {/* Points (one per line) */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Points <span className="font-normal text-gray-400">(one per line)</span></label>
                <textarea rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white resize-none font-mono"
                  placeholder={'Point one\nPoint two\nPoint three'}
                  value={ds.points}
                  onChange={e => updSec(i, 'points', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t flex-shrink-0">
          <button type="button" onClick={addSec}
            className="px-5 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
            Add Section
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold">
            Done
          </button>
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

  // pointDetailTarget: { si, pi, spi?, sspi? } — which point's detail modal is open
  const [pointDetailTarget, setPointDetailTarget] = useState(null);

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
    let sections = item.sections ? JSON.parse(JSON.stringify(item.sections)) : [];
    if (sections.length === 0 && ((item.headings && item.headings.length > 0) || (item.points && item.points.length > 0))) {
      const headings = item.headings || [];
      const points = item.points || [];
      if (headings.length > 0) {
        headings.forEach(h => sections.push({ heading: h, points: [] }));
      }
      if (points.length > 0) {
        sections.push({ heading: '', points: JSON.parse(JSON.stringify(points)) });
      }
    }

    const normalizePoint = (pt) => ({
      text: pt.text || '',
      subPoints: (pt.subPoints || []).map(sp => ({
        text: sp.text || '',
        subPoints: (sp.subPoints || []).map(ssp => ({
          text: ssp.text || '',
          subPoints: [],
          detailSections: ssp.detailSections || [],
        })),
        detailSections: sp.detailSections || [],
      })),
      detailSections: pt.detailSections || [],
    });

    sections = sections.map(s => {
      // If already has headingBlocks, use them
      if (s.headingBlocks && s.headingBlocks.length > 0) {
        return {
          title: s.title || '',
          subtitle: s.subtitle || '',
          description: s.description || '',
          headingBlocks: s.headingBlocks.map(hb => ({
            heading: hb.heading || '',
            points: (hb.points || []).map(normalizePoint),
          })),
        };
      }
      // Legacy: migrate heading + points into a single headingBlock
      return {
        title: s.title || '',
        subtitle: s.subtitle || '',
        description: s.description || '',
        headingBlocks: [{
          heading: s.heading || '',
          points: (s.points || []).map(normalizePoint),
        }],
      };
    });

    setForm({
      category: item.category,
      title: item.title,
      sections,
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

  // ── Sections ──────────────────────────────────────────────────────────────
  const addSection = () => upd('sections', [...form.sections, emptySection()]);
  const updSection = (si, key, val) => {
    const arr = [...form.sections];
    arr[si] = { ...arr[si], [key]: val };
    upd('sections', arr);
  };
  const removeSection = (si) => upd('sections', form.sections.filter((_, idx) => idx !== si));

  // ── Heading blocks inside a section ──────────────────────────────────────
  const addHeadingBlock = (si) => {
    const arr = [...form.sections];
    arr[si].headingBlocks = [...(arr[si].headingBlocks || []), emptyHeadingBlock()];
    upd('sections', arr);
  };
  const updHeading = (si, hi, val) => {
    const arr = [...form.sections];
    arr[si].headingBlocks[hi] = { ...arr[si].headingBlocks[hi], heading: val };
    upd('sections', arr);
  };
  const removeHeadingBlock = (si, hi) => {
    const arr = [...form.sections];
    arr[si].headingBlocks = arr[si].headingBlocks.filter((_, idx) => idx !== hi);
    upd('sections', arr);
  };

  // ── Points inside a heading block ─────────────────────────────────────────
  const addPoint = (si, hi) => {
    const arr = [...form.sections];
    arr[si].headingBlocks[hi].points = [...(arr[si].headingBlocks[hi].points || []), emptyPoint()];
    upd('sections', arr);
  };
  const updPoint = (si, hi, pi, val) => {
    const arr = [...form.sections];
    arr[si].headingBlocks[hi].points[pi] = { ...arr[si].headingBlocks[hi].points[pi], text: val };
    upd('sections', arr);
  };
  const removePoint = (si, hi, pi) => {
    const arr = [...form.sections];
    arr[si].headingBlocks[hi].points = arr[si].headingBlocks[hi].points.filter((_, idx) => idx !== pi);
    upd('sections', arr);
  };

  // ── Sub-points ────────────────────────────────────────────────────────────
  const addSubPoint = (si, hi, pi) => {
    const arr = [...form.sections];
    arr[si].headingBlocks[hi].points[pi].subPoints = [...(arr[si].headingBlocks[hi].points[pi].subPoints || []), emptySubPoint()];
    upd('sections', arr);
  };
  const updSubPoint = (si, hi, pi, spi, val) => {
    const arr = [...form.sections];
    arr[si].headingBlocks[hi].points[pi].subPoints[spi] = { ...arr[si].headingBlocks[hi].points[pi].subPoints[spi], text: val };
    upd('sections', arr);
  };
  const removeSubPoint = (si, hi, pi, spi) => {
    const arr = [...form.sections];
    arr[si].headingBlocks[hi].points[pi].subPoints = arr[si].headingBlocks[hi].points[pi].subPoints.filter((_, idx) => idx !== spi);
    upd('sections', arr);
  };

  // ── Sub-sub-points ────────────────────────────────────────────────────────
  const addSubSubPoint = (si, hi, pi, spi) => {
    const arr = [...form.sections];
    arr[si].headingBlocks[hi].points[pi].subPoints[spi].subPoints = [...(arr[si].headingBlocks[hi].points[pi].subPoints[spi].subPoints || []), emptySubPoint()];
    upd('sections', arr);
  };
  const updSubSubPoint = (si, hi, pi, spi, sspi, val) => {
    const arr = [...form.sections];
    arr[si].headingBlocks[hi].points[pi].subPoints[spi].subPoints[sspi] = { ...arr[si].headingBlocks[hi].points[pi].subPoints[spi].subPoints[sspi], text: val };
    upd('sections', arr);
  };
  const removeSubSubPoint = (si, hi, pi, spi, sspi) => {
    const arr = [...form.sections];
    arr[si].headingBlocks[hi].points[pi].subPoints[spi].subPoints = arr[si].headingBlocks[hi].points[pi].subPoints[spi].subPoints.filter((_, idx) => idx !== sspi);
    upd('sections', arr);
  };

  // ── Detail sections for a point (any level) ───────────────────────────────
  const getPointDetailSections = (target) => {
    const { si, hi, pi, spi, sspi } = target;
    const hb = form.sections[si].headingBlocks[hi];
    if (sspi !== undefined) return hb.points[pi].subPoints[spi].subPoints[sspi].detailSections || [];
    if (spi  !== undefined) return hb.points[pi].subPoints[spi].detailSections || [];
    return hb.points[pi].detailSections || [];
  };

  const getPointText = (target) => {
    const { si, hi, pi, spi, sspi } = target;
    const hb = form.sections[si].headingBlocks[hi];
    if (sspi !== undefined) return hb.points[pi].subPoints[spi].subPoints[sspi].text;
    if (spi  !== undefined) return hb.points[pi].subPoints[spi].text;
    return hb.points[pi].text;
  };

  const setPointDetailSections = (target, detailSections) => {
    const { si, hi, pi, spi, sspi } = target;
    const arr = JSON.parse(JSON.stringify(form.sections));
    const hb = arr[si].headingBlocks[hi];
    if (sspi !== undefined) hb.points[pi].subPoints[spi].subPoints[sspi].detailSections = detailSections;
    else if (spi !== undefined) hb.points[pi].subPoints[spi].detailSections = detailSections;
    else hb.points[pi].detailSections = detailSections;
    upd('sections', arr);
  };

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
                <th className="px-4 py-3">Sections</th>
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
                  <td className="px-4 py-3 text-center">
                    {item.sections?.length > 0
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600">{item.sections.length}</span>
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

              {/* Sections */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">Sections</label>
                  <button type="button" onClick={addSection}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
                    <FaPlus size={10} /> Add Section
                  </button>
                </div>

                {form.sections.length === 0 && (
                  <p className="text-gray-400 text-xs py-3 text-center border border-dashed border-gray-200 rounded-lg">
                    No sections yet. Click "Add Section" to create one.
                  </p>
                )}

                <div className="space-y-4">
                  {form.sections.map((sec, si) => (
                    <div key={si} className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">

                      {/* Section header bar */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Section {si + 1}</span>
                        <button type="button" onClick={() => removeSection(si)}
                          className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500">
                          <FaTimes size={11} />
                        </button>
                      </div>

                      <div className="p-3 space-y-2.5">

                        {/* Section Title */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Title</label>
                          <input
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                            placeholder="Section title..."
                            value={sec.title}
                            onChange={e => updSection(si, 'title', e.target.value)}
                          />
                        </div>

                        {/* Section Subtitle */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Subtitle</label>
                          <input
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                            placeholder="Optional subtitle..."
                            value={sec.subtitle}
                            onChange={e => updSection(si, 'subtitle', e.target.value)}
                          />
                        </div>

                        {/* Section Description */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Description</label>
                          <textarea rows={2}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white resize-none"
                            placeholder="Description shown at the top of this section..."
                            value={sec.description}
                            onChange={e => updSection(si, 'description', e.target.value)}
                          />
                        </div>

                        {/* Heading Blocks */}
                        <div className="border border-gray-200 rounded-lg p-2.5 bg-white">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-gray-500">Headings &amp; Points</label>
                            <button type="button" onClick={() => addHeadingBlock(si)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: '#006CB5' }}>
                              <FaPlus size={9} /> Add
                            </button>
                          </div>

                          {(sec.headingBlocks || []).length === 0 && (
                            <p className="text-gray-400 text-xs py-1 pl-1">No headings yet. Click "Add" to create one.</p>
                          )}

                          <div className="space-y-3">
                            {(sec.headingBlocks || []).map((hb, hi) => (
                              <div key={hi} className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2">

                                {/* Heading row */}
                                <div className="flex items-center gap-2">
                                  <input
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                                    placeholder="Heading (optional)..."
                                    value={hb.heading}
                                    onChange={e => updHeading(si, hi, e.target.value)}
                                  />
                                  <button type="button" onClick={() => addPoint(si, hi)}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 text-sm font-semibold flex-shrink-0"
                                    style={{ borderColor: '#006CB5', color: '#006CB5', backgroundColor: '#fff' }}>
                                    <FaPlus size={9} /> Point
                                  </button>
                                  <button type="button" onClick={() => removeHeadingBlock(si, hi)}
                                    className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 flex-shrink-0">
                                    <FaTimes size={11} />
                                  </button>
                                </div>

                                {/* Points */}
                                <div className="space-y-1.5">
                                  {(hb.points || []).map((pt, pi) => (
                                    <div key={pi} className="space-y-1">

                                      {/* Point row */}
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-xs w-3 flex-shrink-0">•</span>
                                        <input
                                          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                                          placeholder="Point text..."
                                          value={pt.text}
                                          onChange={e => updPoint(si, hi, pi, e.target.value)}
                                        />
                                        <button type="button" onClick={() => addSubPoint(si, hi, pi)}
                                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:border-[#006CB5] hover:text-[#006CB5] flex-shrink-0"
                                          title="Add sub-point">
                                          <FaPlus size={9} />
                                        </button>
                                        <button type="button" onClick={() => setPointDetailTarget({ si, hi, pi })}
                                          className="w-7 h-7 flex items-center justify-center rounded-lg border font-bold text-xs flex-shrink-0"
                                          style={{ borderColor: '#d946ef', color: '#d946ef' }}
                                          title="Add detail sections">
                                          *
                                        </button>
                                        <button type="button" onClick={() => removePoint(si, hi, pi)}
                                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 flex-shrink-0">
                                          <FaTimes size={10} />
                                        </button>
                                      </div>

                                      {/* Sub-points */}
                                      {(pt.subPoints || []).map((sp, spi) => (
                                        <div key={spi} className="space-y-1 ml-7">
                                          <div className="flex items-center gap-2">
                                            <span className="text-gray-300 text-xs w-3 flex-shrink-0">–</span>
                                            <input
                                              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50"
                                              placeholder="Sub-point text..."
                                              value={sp.text}
                                              onChange={e => updSubPoint(si, hi, pi, spi, e.target.value)}
                                            />
                                            <button type="button" onClick={() => addSubSubPoint(si, hi, pi, spi)}
                                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:border-[#006CB5] hover:text-[#006CB5] flex-shrink-0"
                                              title="Add nested point">
                                              <FaPlus size={8} />
                                            </button>
                                            <button type="button" onClick={() => setPointDetailTarget({ si, hi, pi, spi })}
                                              className="w-7 h-7 flex items-center justify-center rounded-lg border font-bold text-xs flex-shrink-0"
                                              style={{ borderColor: '#d946ef', color: '#d946ef' }}
                                              title="Add detail sections">
                                              *
                                            </button>
                                            <button type="button" onClick={() => removeSubPoint(si, hi, pi, spi)}
                                              className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 flex-shrink-0">
                                              <FaTimes size={9} />
                                            </button>
                                          </div>

                                          {/* Sub-sub-points */}
                                          {(sp.subPoints || []).map((ssp, sspi) => (
                                            <div key={sspi} className="flex items-center gap-2 ml-7">
                                              <span className="text-gray-200 text-xs w-3 flex-shrink-0">▸</span>
                                              <input
                                                className="flex-1 border border-gray-100 rounded-lg px-3 py-1.5 text-sm bg-gray-50"
                                                placeholder="Nested point text..."
                                                value={ssp.text}
                                                onChange={e => updSubSubPoint(si, hi, pi, spi, sspi, e.target.value)}
                                              />
                                              <button type="button" onClick={() => setPointDetailTarget({ si, hi, pi, spi, sspi })}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg border font-bold text-xs flex-shrink-0"
                                                style={{ borderColor: '#d946ef', color: '#d946ef' }}
                                                title="Add detail sections">
                                                *
                                              </button>
                                              <button type="button" onClick={() => removeSubSubPoint(si, hi, pi, spi, sspi)}
                                                className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 flex-shrink-0">
                                                <FaTimes size={8} />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      ))}

                                    </div>
                                  ))}
                                  {(hb.points || []).length === 0 && (
                                    <p className="text-gray-400 text-xs pl-1">No points yet. Click "+ Point" to add.</p>
                                  )}
                                </div>

                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
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
              {(viewItem.sections || []).length > 0 ? (
                <div className="space-y-4 mt-2">
                  {viewItem.sections.map((sec, si) => {
                    // Support both new headingBlocks and legacy heading+points
                    const blocks = sec.headingBlocks
                      ? sec.headingBlocks
                      : (sec.heading || (sec.points && sec.points.length > 0))
                        ? [{ heading: sec.heading || '', points: sec.points || [] }]
                        : [];
                    return (
                      <div key={si} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-1">
                        {sec.title       && <p className="text-base font-bold text-gray-800">{sec.title}</p>}
                        {sec.subtitle    && <p className="text-sm text-gray-500 italic">{sec.subtitle}</p>}
                        {sec.description && <p className="text-sm text-gray-600 leading-relaxed">{sec.description}</p>}
                        {blocks.map((hb, hi) => (
                          <div key={hi} className="mt-2">
                            {hb.heading && <p className="text-sm font-bold text-gray-700 mb-1">{hb.heading}</p>}
                            {(hb.points || []).map((pt, pi) => (
                              <div key={pi} className="ml-2 mt-1">
                                <p className="text-sm text-gray-600">• {pt.text}</p>
                                {(pt.subPoints || []).map((sp, spi) => (
                                  <div key={spi} className="ml-4">
                                    <p className="text-xs text-gray-500">– {sp.text}</p>
                                    {(sp.subPoints || []).map((ssp, sspi) => (
                                      <p key={sspi} className="text-xs text-gray-400 ml-4">▸ {ssp.text}</p>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                        {blocks.length === 0 && <p className="text-gray-400 text-xs">No content.</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No sections added yet.</p>
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

      {/* Point Detail Sections Modal */}
      {pointDetailTarget && (
        <PointDetailModal
          pointText={getPointText(pointDetailTarget)}
          detailSections={getPointDetailSections(pointDetailTarget)}
          onChange={(ds) => setPointDetailSections(pointDetailTarget, ds)}
          onClose={() => setPointDetailTarget(null)}
        />
      )}
    </div>
  );
}