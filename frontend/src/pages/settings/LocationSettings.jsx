import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import api from '../../api/axios';

const EMPTY = { name: '', short_code: '', warehouse_id: '' };

export default function LocationSettings() {
  const [locations, setLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/locations'), api.get('/warehouses')])
      .then(([l, w]) => { setLocations(l.data); setWarehouses(w.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const save = async () => {
    if (!form.name.trim() || !form.short_code.trim() || !form.warehouse_id) return;
    try {
      const payload = { ...form, warehouse_id: Number(form.warehouse_id), short_code: form.short_code.toUpperCase() };
      if (editId) {
        await api.patch(`/locations/${editId}`, payload);
        flash('success', 'Location updated');
      } else {
        await api.post('/locations', payload);
        flash('success', 'Location created');
      }
      setForm(EMPTY); setEditId(null); setShowForm(false); load();
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to save');
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/locations/${id}`);
      flash('success', `"${name}" deleted`);
      if (editId === id) { setForm(EMPTY); setEditId(null); setShowForm(false); }
      load();
    } catch {
      flash('error', 'Failed to delete. Location may be in use.');
    }
  };

  const startEdit = (loc) => {
    setEditId(loc.id);
    setForm({ name: loc.name, short_code: loc.short_code, warehouse_id: String(loc.warehouse_id) });
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
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1d2e' }}>Locations</div>
          <div style={{ fontSize: '13px', color: '#8892b8', marginTop: '2px' }}>Storage locations grouped by warehouse</div>
        </div>
        {!showForm && (
          <button onClick={() => { setEditId(null); setForm(EMPTY); setShowForm(true); }} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
            background: 'linear-gradient(135deg, #7c6ff7, #5f57e8)', color: 'white',
            border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
          }}>
            <Plus size={16} /> Add Location
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
        <div style={{ ...card, padding: '24px', marginBottom: '24px', maxWidth: '560px', border: `1px solid ${editId ? '#bfdbfe' : '#ddd6fe'}`, background: editId ? '#f0f7ff' : '#faf5ff' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1d2e', marginBottom: '16px' }}>
            {editId ? '✏️ Edit Location' : '+ New Location'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a5278', display: 'block', marginBottom: '5px' }}>LOCATION NAME *</label>
              <input placeholder="e.g. Rack A, Production Floor" style={inputStyle} value={form.name}
                onFocus={e => e.target.style.borderColor = '#7c6ff7'}
                onBlur={e => e.target.style.borderColor = '#e0e4f0'}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a5278', display: 'block', marginBottom: '5px' }}>SHORT CODE *</label>
                <input placeholder="e.g. RA" style={inputStyle} value={form.short_code} maxLength={6}
                  onFocus={e => e.target.style.borderColor = '#7c6ff7'}
                  onBlur={e => e.target.style.borderColor = '#e0e4f0'}
                  onChange={e => setForm({ ...form, short_code: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a5278', display: 'block', marginBottom: '5px' }}>WAREHOUSE *</label>
                {warehouses.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#b91c1c', padding: '10px' }}>
                    No warehouses yet. <button onClick={() => navigate('/settings/warehouses')} style={{ color: '#7c6ff7', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Add one first →</button>
                  </div>
                ) : (
                  <select style={inputStyle} value={form.warehouse_id}
                    onFocus={e => e.target.style.borderColor = '#7c6ff7'}
                    onBlur={e => e.target.style.borderColor = '#e0e4f0'}
                    onChange={e => setForm({ ...form, warehouse_id: e.target.value })}>
                    <option value="">Select warehouse...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.short_code})</option>)}
                  </select>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button onClick={cancel} style={{ padding: '9px 16px', border: '1px solid #e0e4f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <X size={14} /> Cancel
              </button>
              <button onClick={save} disabled={!form.name.trim() || !form.short_code.trim() || !form.warehouse_id} style={{
                padding: '9px 18px', background: 'linear-gradient(135deg, #7c6ff7, #5f57e8)', color: 'white',
                border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                opacity: !form.name.trim() || !form.short_code.trim() || !form.warehouse_id ? 0.4 : 1
              }}>
                <Check size={14} /> {editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grouped list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8892b8' }}>Loading...</div>
      ) : warehouses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #e0e4f0', borderRadius: '16px', color: '#8892b8' }}>
          <div style={{ marginBottom: '8px' }}>No warehouses found.</div>
          <Link to="/settings/warehouses" style={{ color: '#7c6ff7', fontWeight: 600, fontSize: '13px' }}>Add a warehouse first →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {warehouses.map(wh => {
            const whLocs = locations.filter(l => String(l.warehouse_id) === String(wh.id));
            return (
              <div key={wh.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1d2e' }}>{wh.name}</div>
                  <span style={{ background: '#f1f5f9', color: '#4a5278', padding: '2px 8px', borderRadius: '4px', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>{wh.short_code}</span>
                  <span style={{ fontSize: '11px', color: '#8892b8' }}>{whLocs.length} location{whLocs.length !== 1 ? 's' : ''}</span>
                </div>
                {whLocs.length === 0 ? (
                  <div style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', color: '#8892b8', border: '1px dashed #e0e4f0' }}>
                    No locations in this warehouse yet.
                  </div>
                ) : (
                  <div style={{ ...card, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                          {['Name', 'Code', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '10px 18px', textAlign: 'left', color: '#8892b8', fontWeight: 600, fontSize: '11px' }}>{h.toUpperCase()}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {whLocs.map(loc => (
                          <tr key={loc.id} style={{ borderBottom: '1px solid #f8fafc', background: editId === loc.id ? '#faf5ff' : 'white' }}
                            onMouseEnter={e => { if (editId !== loc.id) e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseLeave={e => { if (editId !== loc.id) e.currentTarget.style.background = 'white'; }}>
                            <td style={{ padding: '12px 18px', fontWeight: 600, color: '#1a1d2e' }}>{loc.name}</td>
                            <td style={{ padding: '12px 18px' }}>
                              <span style={{ background: '#f5f3ff', color: '#7c6ff7', padding: '2px 8px', borderRadius: '4px', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>{loc.short_code}</span>
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => startEdit(loc)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                                  <Pencil size={11} /> Edit
                                </button>
                                <button onClick={() => remove(loc.id, loc.name)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#fff0f0', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                                  <Trash2 size={11} /> Delete
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
          })}
        </div>
      )}
    </div>
  );
}