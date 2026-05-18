import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PAGE_SIZE = 10;

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
      <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
          <FaChevronLeft size={11} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push('...'); acc.push(p); return acc; }, [])
          .map((p, i) => p === '...'
            ? <span key={`e${i}`} className="px-1 text-gray-400 text-xs">…</span>
            : <button key={p} onClick={() => onPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold border ${page === p ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                style={page === p ? { backgroundColor: '#006CB5' } : {}}>
                {p}
              </button>
          )}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
          <FaChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
const getToken = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

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

// ─── SECTIONS TAB ─────────────────────────────────────────────────────────────
function SectionsTab({ sections, setSections }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ section: '', sectionKorean: '' });
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Sections are stored in localStorage for now (no separate backend model needed)
  useEffect(() => {
    const saved = localStorage.getItem('korean_sections');
    if (saved) setSections(JSON.parse(saved));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? sections.filter(s => s.section?.toLowerCase().includes(q) || s.sectionKorean?.toLowerCase().includes(q)) : sections;
  }, [sections, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search]);

  const save = () => {
    let updated;
    if (editing !== null) {
      updated = sections.map((s, i) => i === editing ? form : s);
    } else {
      if (sections.find(s => s.section === form.section)) return alert('Section already exists');
      updated = [...sections, form];
    }
    setSections(updated);
    localStorage.setItem('korean_sections', JSON.stringify(updated));
    setShowModal(false);
  };

  const del = () => {
    const updated = sections.filter((_, i) => i !== deleteIdx);
    setSections(updated);
    localStorage.setItem('korean_sections', JSON.stringify(updated));
    setDeleteIdx(null);
  };

  const openAdd = () => { setEditing(null); setForm({ section: '', sectionKorean: '' }); setShowModal(true); };
  const openEdit = (i) => { setEditing(i); setForm({ ...sections[i] }); setShowModal(true); };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">Add sections that appear as headers in the Korean screen.</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
          <FaPlus /> Add Section
        </button>
      </div>
      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
        <input type="text" placeholder="Search section or Korean..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FaTimes size={12} /></button>}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 text-xs uppercase bg-gray-50 border-b">
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Section</th>
            <th className="px-4 py-3">Korean</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {paged.map((s, i) => {
              const realIdx = sections.indexOf(s);
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{s.section}</td>
                  <td className="px-4 py-3 text-gray-500">{s.sectionKorean || '—'}</td>
                  <td className="px-4 py-3 text-right"><div className="flex gap-1.5 justify-end">
                    <button onClick={() => setViewItem(s)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><FaEye size={13} /></button>
                    <button onClick={() => openEdit(realIdx)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={13} /></button>
                    <button onClick={() => setDeleteIdx(realIdx)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FaTrash size={13} /></button>
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">{sections.length === 0 ? 'No sections yet. Add one first.' : 'No results match your search.'}</p>}
        <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">{editing !== null ? 'Edit Section' : 'Add Section'}</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Section Name *</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Stances"
                  value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Section Korean</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Sogi"
                  value={form.sectionKorean} onChange={e => setForm({ ...form, sectionKorean: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
                {editing !== null ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteIdx !== null && <ConfirmModal message="Delete this section?" onConfirm={del} onCancel={() => setDeleteIdx(null)} />}

      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Section</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <p><span className="font-semibold text-gray-700">Section: </span>{viewItem.section}</p>
              <p><span className="font-semibold text-gray-700">Korean: </span>{viewItem.sectionKorean || '—'}</p>
            </div>
            <div className="p-5 border-t flex justify-end gap-2">
              <button onClick={() => { const i = sections.indexOf(viewItem); setViewItem(null); openEdit(i); }}
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

// ─── TERMS TAB ────────────────────────────────────────────────────────────────
function TermsTab({ sections }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState({ section: '', sectionKorean: '', korean: '', english: '', order: 0 });
  const [filterSection, setFilterSection] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/korean`);
    const d = await res.json();
    const data = d.data || [];
    const sortedData = data.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return dateA - dateB;
    });
    setItems(sortedData);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let rows = filterSection === 'all' ? items : items.filter(i => i.section === filterSection);
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter(i => i.korean?.toLowerCase().includes(q) || i.english?.toLowerCase().includes(q) || i.section?.toLowerCase().includes(q));
    return rows;
  }, [items, filterSection, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, filterSection]);

  const openAdd = () => {
    setEditing(null);
    setForm({ section: sections[0]?.section || '', sectionKorean: sections[0]?.sectionKorean || '', korean: '', english: '', order: items.length });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ section: item.section, sectionKorean: item.sectionKorean || '', korean: item.korean, english: item.english, order: item.order });
    setShowModal(true);
  };

  const handleSectionChange = (sectionName) => {
    const sec = sections.find(s => s.section === sectionName);
    setForm({ ...form, section: sectionName, sectionKorean: sec?.sectionKorean || '' });
  };

  const save = async () => {
    const url = editing ? `${API_BASE}/korean/${editing._id}` : `${API_BASE}/korean`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(form) });
    setShowModal(false);
    fetchItems();
  };

  const del = async () => {
    await fetch(`${API_BASE}/korean/${deleteId}`, { method: 'DELETE', headers: authH() });
    setDeleteId(null);
    fetchItems();
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <p className="text-sm text-gray-500">Manage Korean terms grouped by section.</p>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input type="text" placeholder="Search Korean or English..." value={search} onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-52" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FaTimes size={12} /></button>}
          </div>
          {/* Section filter */}
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700">
            <option value="all">All ({items.length})</option>
            {sections.map(s => <option key={s.section} value={s.section}>{s.section} ({items.filter(i => i.section === s.section).length})</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#006CB5' }}>
            <FaPlus /> Add Term
          </button>
        </div>
      </div>

      {loading ? <p className="text-gray-400 text-center py-10 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 text-xs uppercase bg-gray-50 border-b">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Korean</th>
              <th className="px-4 py-3">English</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {paged.map((item, i) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{item.section}</span></td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.korean}</td>
                  <td className="px-4 py-3 text-gray-500">{item.english}</td>
                  <td className="px-4 py-3 text-right"><div className="flex gap-1.5 justify-end">
                    <button onClick={() => setViewItem(item)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><FaEye size={13} /></button>
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FaEdit size={13} /></button>
                    <button onClick={() => setDeleteId(item._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FaTrash size={13} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">{items.length === 0 ? 'No terms yet.' : 'No results match your search.'}</p>}
          <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">{editing ? 'Edit Term' : 'Add Term'}</h4>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Section *</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.section} onChange={e => handleSectionChange(e.target.value)}>
                  <option value="">— Select Section —</option>
                  {sections.map(s => <option key={s.section} value={s.section}>{s.section}{s.sectionKorean ? ` (${s.sectionKorean})` : ''}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Korean *</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Gunnun"
                    value={form.korean} onChange={e => setForm({ ...form, korean: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">English *</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Walking"
                    value={form.english} onChange={e => setForm({ ...form, english: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Order</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
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
      {deleteId && <ConfirmModal message="Delete this term?" onConfirm={del} onCancel={() => setDeleteId(null)} />}

      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-bold text-gray-800">View Term</h4>
              <button onClick={() => setViewItem(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <p><span className="font-semibold text-gray-700">Section: </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{viewItem.section}</span>
              </p>
              <p><span className="font-semibold text-gray-700">Korean: </span>{viewItem.korean}</p>
              <p><span className="font-semibold text-gray-700">English: </span>{viewItem.english}</p>
              {viewItem.order !== undefined && <p><span className="font-semibold text-gray-700">Order: </span>{viewItem.order}</p>}
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
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function KoreanManagement() {
  const [activeTab, setActiveTab] = useState('sections');
  const [sections, setSections] = useState([]);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800">Korean Terminology</h3>
        <p className="text-sm text-gray-500 mt-0.5">Manage Korean terms shown in the Korean screen of the mobile app.</p>
      </div>
      <div className="flex border-b border-gray-200 mb-6">
        {[{ key: 'sections', label: 'Sections' }, { key: 'terms', label: 'Terms' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.key ? 'border-[#006CB5] text-[#006CB5]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'sections' && <SectionsTab sections={sections} setSections={setSections} />}
      {activeTab === 'terms'    && <TermsTab sections={sections} />}
    </div>
  );
}

