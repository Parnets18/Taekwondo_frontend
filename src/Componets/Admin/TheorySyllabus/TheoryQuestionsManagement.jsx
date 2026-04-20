import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye, FaTags } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
const getToken = () => localStorage.getItem('token');
const jsonH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const DEFAULT_BELTS = ['10th Kup','9th Kup','8th Kup','7th Kup','6th Kup','5th Kup','4th Kup','3rd Kup','2nd Kup','1st Kup','1st Dan'];
const STORAGE_KEY = 'theory_belt_levels';

const loadBelts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_BELTS;
  } catch { return DEFAULT_BELTS; }
};

const EMPTY_FORM = { beltLevel: '', question: '', options: ['','','',''], answer: '', order: 0, isActive: true };

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <p className="text-gray-800 font-semibold mb-6 text-center">Delete this question?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg border border-red-500 font-semibold" style={{ color: '#000000' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function TheoryQuestionsManagement() {
  const [beltLevels, setBeltLevels] = useState(loadBelts);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, beltLevel: loadBelts()[0] || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchBelt, setSearchBelt] = useState('');

  // Belt manager state
  const [showBeltModal, setShowBeltModal] = useState(false);
  const [newBeltName, setNewBeltName] = useState('');
  const [beltError, setBeltError] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const saveBelts = (updated) => {
    setBeltLevels(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addBelt = () => {
    const name = newBeltName.trim();
    if (!name) { setBeltError('Belt name is required'); return; }
    if (beltLevels.includes(name)) { setBeltError('Belt already exists'); return; }
    saveBelts([...beltLevels, name]);
    setNewBeltName('');
    setBeltError('');
  };

  const removeBelt = (belt) => {
    saveBelts(beltLevels.filter(b => b !== belt));
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/theory-questions/admin`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const d = await res.json();
      setItems(d.data || []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, beltLevel: beltLevels[0] || '', order: items.length });
    setError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      beltLevel: item.beltLevel,
      question: item.question,
      options: [...item.options],
      answer: item.answer,
      order: item.order,
      isActive: item.isActive,
    });
    setError('');
    setShowModal(true);
  };

  const setOption = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm(f => ({ ...f, options: opts }));
  };

  const validate = () => {
    if (!form.question.trim()) return 'Question is required';
    if (form.options.some(o => !o.trim())) return 'All 4 options are required';
    if (!form.answer.trim()) return 'Correct answer is required';
    if (!form.options.includes(form.answer)) return 'Correct answer must match one of the options exactly';
    return '';
  };

  const save = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    const url = editing ? `${API_BASE}/theory-questions/${editing._id}` : `${API_BASE}/theory-questions`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: jsonH(), body: JSON.stringify(form) });
    setSaving(false);
    setShowModal(false);
    fetchItems();
  };

  const del = async () => {
    await fetch(`${API_BASE}/theory-questions/${deleteId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    setDeleteId(null);
    fetchItems();
  };

  const filtered = searchBelt.trim()
    ? items.filter(i => i.beltLevel.toLowerCase().includes(searchBelt.toLowerCase()))
    : items;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Theory Questions</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} total questions across all belt levels</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchBelt}
              onChange={e => setSearchBelt(e.target.value)}
              placeholder="Search belt level..."
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            {searchBelt && (
              <button onClick={() => setSearchBelt('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
                <FaTimes size={12} />
              </button>
            )}
          </div>
          {/* Manage Belts */}
          <button
            onClick={() => { setShowBeltModal(true); setBeltError(''); setNewBeltName(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <FaTags /> Manage Belts
          </button>
          {/* Add Question */}
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <FaPlus /> Add Question
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No questions yet</p>
          <p className="text-sm mt-1">Click "Add Question" to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">#</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Belt</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Question</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Answer</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{item.beltLevel}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 max-w-xs truncate">{item.question}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">{item.answer}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewItem(item)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="View"><FaEye /></button>
                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-yellow-600 transition-colors" title="Edit"><FaEdit /></button>
                        <button onClick={() => setDeleteId(item._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manage Belts Modal */}
      {showBeltModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Manage Belt Levels</h2>
              <button onClick={() => setShowBeltModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Add new belt */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBeltName}
                  onChange={e => { setNewBeltName(e.target.value); setBeltError(''); }}
                  onKeyDown={e => e.key === 'Enter' && addBelt()}
                  placeholder="e.g. 2nd Dan, Poom..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={addBelt} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1">
                  <FaPlus size={11} /> Add
                </button>
              </div>
              {beltError && <p className="text-red-500 text-xs">{beltError}</p>}

              {/* Belt list */}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {beltLevels.map(belt => (
                  <div key={belt} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{belt}</span>
                    <button
                      onClick={() => removeBelt(belt)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove belt"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
                {beltLevels.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">No belt levels. Add one above.</p>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100">
              <button onClick={() => setShowBeltModal(false)} className="w-full py-2.5 rounded-xl bg-gray-700 text-white hover:bg-gray-800 text-sm font-medium">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit Question' : 'Add Question'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Belt Level</label>
                <select value={form.beltLevel} onChange={e => setForm(f => ({ ...f, beltLevel: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {beltLevels.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  rows={3} placeholder="Enter the question..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options (4 required)</label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5">{String.fromCharCode(65 + i)}.</span>
                      <input value={opt} onChange={e => setOption(i, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <select value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select correct answer --</option>
                  {form.options.filter(Boolean).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: +e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                  <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{viewItem.beltLevel}</span>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-gray-800 font-semibold text-base">{viewItem.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {viewItem.options.map((opt, i) => (
                  <div key={i} className={`px-3 py-2 rounded-lg text-sm font-medium border-2 ${opt === viewItem.answer ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">Correct: <span className="text-green-600 font-semibold">{viewItem.answer}</span></p>
            </div>
          </div>
        </div>
      )}

      {deleteId && <ConfirmModal onConfirm={del} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
