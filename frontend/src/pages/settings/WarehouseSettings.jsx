import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import api from '../../api/axios';

const EMPTY = { name: '', short_code: '', address: '' };

export default function WarehouseSettings() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/warehouses')
      .then(r => setList(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const save = async () => {
    if (!form.name.trim() || !form.short_code.trim()) return;
    try {
      if (editId) {
        await api.patch(`/warehouses/${editId}`, form);
        flash('success', 'Warehouse updated successfully');
      } else {
        await api.post('/warehouses', form);
        flash('success', 'Warehouse created successfully');
      }
      setForm(EMPTY); setEditId(null); setShowForm(false); load();
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to save');
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/warehouses/${id}`);
      flash('success', `"${name}" deleted`);
      load();
    } catch {
      flash('error', 'Failed to delete. Warehouse may have locations.');
    }
  };

  const startEdit = (w) => {
    setEditId(w.id);
    setForm({ name: w.name, short_code: w.short_code, address: w.address || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancel = () => { setForm(EMPTY); setEditId(null); setShowForm(false); };

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e0e4f0', fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: 'white', transition: 'border 0.15s' };
  const card = { background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };

  return (
    <div>
      <Link to="/settings" style={{ color: '#8892b8', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
        ← Settings
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1d2e' }}>Warehouses</div>
          <div style={{ fontSize: '13px', color: '#8892b8', marginTop: '2px' }}>Manage your warehouse locations</div>
        </div>
        {!showForm && (
          <button onClick={() => { setEditId(null); setForm(EMPTY); setShowForm(true); }} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
            background: 'linear-gradient(135deg, #00c896, #00a878)', color: 'white',
            border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
          }}>
            <Plus size={16} /> Add Warehouse
          </button>
        )}
      </div>

      {msg && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: msg.type === 'success' ? '#f0fdf4' : '#fff0f0', color: msg.type === 'success' ? '#15803d' : '#b91c1c', border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
          {msg.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ ...card, padding: '24px', marginBottom: '20px', maxWidth: '560px', border: `1px solid ${editId ? '#bfdbfe' : '#bbf7d0'}`, background: editId ? '#f0f7ff' : '#f0fdf4' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1d2e', marginBottom: '16px' }}>
            {editId ? '✏️ Edit Warehouse' : '+ New Warehouse'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a5278', display: 'block', marginBottom: '5px' }}>WAREHOUSE NAME *</label>
              <input placeholder="e.g. Main Warehouse" style={inputStyle} value={form.name}
                onFocus={e => e.target.style.borderColor = '#00c896'}
                onBlur={e => e.target.style.borderColor = '#e0e4f0'}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a5278', display: 'block', marginBottom: '5px' }}>SHORT CODE *</label>
                <input placeholder="e.g. MW" style={inputStyle} value={form.short_code}
                  onFocus={e => e.target.style.borderColor = '#00c896'}
                  onBlur={e => e.target.style.borderColor = '#e0e4f0'}
                  onChange={e => setForm({ ...form, short_code: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a5278', display: 'block', marginBottom: '5px' }}>ADDRESS</label>
                <input placeholder="e.g. Plot 1, Industrial Area" style={inputStyle} value={form.address}
                  onFocus={e => e.target.style.borderColor = '#00c896'}
                  onBlur={e => e.target.style.borderColor = '#e0e4f0'}
                  onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button onClick={cancel} style={{ padding: '9px 16px', border: '1px solid #e0e4f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <X size={14} /> Cancel
              </button>
              <button onClick={save} disabled={!form.name.trim() || !form.short_code.trim()} style={{
                padding: '9px 18px', background: 'linear-gradient(135deg, #00c896, #00a878)', color: 'white',
                border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                opacity: !form.name.trim() || !form.short_code.trim() ? 0.4 : 1
              }}>
                <Check size={14} /> {editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8892b8' }}>Loading...</div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #e0e4f0', borderRadius: '16px', color: '#8892b8' }}>
          No warehouses yet. Add your first one above.
        </div>
      ) : (
        <div style={{ ...card, overflow: 'hidden', maxWidth: '700px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {['Name', 'Code', 'Address', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#8892b8', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid #f8fafc', background: editId === w.id ? '#f0f7ff' : 'white' }}
                  onMouseEnter={e => { if (editId !== w.id) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (editId !== w.id) e.currentTarget.style.background = 'white'; }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1a1d2e' }}>{w.name}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ background: '#f1f5f9', color: '#4a5278', padding: '2px 8px', borderRadius: '4px', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>{w.short_code}</span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#8892b8' }}>{w.address || '—'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEdit(w)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => remove(w.id, w.name)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#fff0f0', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}