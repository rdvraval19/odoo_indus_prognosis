import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    draft:     { bg: '#f1f5f9', color: '#64748b', label: 'Draft' },
    waiting:   { bg: '#fef9c3', color: '#a16207', label: 'Waiting' },
    ready:     { bg: '#dbeafe', color: '#1d4ed8', label: 'Ready' },
    done:      { bg: '#dcfce7', color: '#15803d', label: 'Done' },
    cancelled: { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' },
  };
  const key = status?.toLowerCase();
  const c = config[key] || config.draft;
  return (
    <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
      {c.label}
    </span>
  );
};

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [validating, setValidating] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState([]);
  const [newDelivery, setNewDelivery] = useState({ contact: '', lines: [{ product_id: '', quantity: '' }] });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/deliveries');
      setDeliveries(res.data);
    } catch { showToast('error', 'Failed to load deliveries'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    api.get('/products/').then(r => setProducts(r.data));
  }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = async (id) => {
    setValidating(true);
    try {
      await api.post(`/deliveries/${id}/validate`);
      showToast('success', 'Delivery validated! Stock decreased.');
      setSelected(null);
      load();
    } catch (err) {
      showToast('error', err.response?.data?.detail || 'Validation failed');
    } finally { setValidating(false); }
  };

  const createDelivery = async (e) => {
    e.preventDefault();
    try {
      const lines = newDelivery.lines.filter(l => l.product_id && l.quantity);
      await api.post('/deliveries', {
        contact: newDelivery.contact,
        lines: lines.map(l => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) }))
      });
      showToast('success', 'Delivery created successfully');
      setShowCreate(false);
      setNewDelivery({ contact: '', lines: [{ product_id: '', quantity: '' }] });
      load();
    } catch (err) {
      showToast('error', err.response?.data?.detail || 'Failed to create delivery');
    }
  };

  const filtered = deliveries.filter(d => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return d.reference?.toLowerCase().includes(q) || d.contact?.toLowerCase().includes(q);
  });

  const card = { background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e0e4f0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' };

  // Detail view
  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)} style={{ color: '#8892b8', fontSize: '13px', marginBottom: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
        ← Back to Deliveries
      </button>
      {toast && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: toast.type === 'success' ? '#f0fdf4' : '#fff0f0', color: toast.type === 'success' ? '#15803d' : '#b91c1c', border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
          {toast.text}
        </div>
      )}
      <div style={{ ...card, padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1a1d2e' }}>{selected.reference}</div>
            <div style={{ fontSize: '13px', color: '#8892b8', marginTop: '4px' }}>Contact: {selected.contact || '—'}</div>
          </div>
          <StatusBadge status={selected.status} />
        </div>
        <div style={{ border: '1px solid #e8ebf4', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#8892b8', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', color: '#8892b8', fontWeight: 600 }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {(selected.lines || []).map((line, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{line.product_name || `Product #${line.product_id}`}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#4a5278' }}>{line.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selected.status?.toLowerCase() !== 'done' && selected.status?.toLowerCase() !== 'cancelled' && (
        <button onClick={() => validate(selected.id)} disabled={validating} style={{
          padding: '12px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c6ff7, #5f57e8)',
          color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', opacity: validating ? 0.7 : 1
        }}>
          {validating ? 'Validating...' : '✓ Validate Delivery'}
        </button>
      )}
      {selected.status?.toLowerCase() === 'done' && (
        <div style={{ padding: '14px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#15803d', fontSize: '13px', fontWeight: 600 }}>
          ✓ This delivery has been validated. Stock has been deducted.
        </div>
      )}
    </div>
  );

  // List view
  return (
    <div>
      {toast && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: toast.type === 'success' ? '#f0fdf4' : '#fff0f0', color: toast.type === 'success' ? '#15803d' : '#b91c1c', border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
          {toast.text}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1d2e' }}>Deliveries</div>
          <div style={{ fontSize: '13px', color: '#8892b8', marginTop: '2px' }}>Manage outgoing stock to customers</div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
          background: 'linear-gradient(135deg, #7c6ff7, #5f57e8)', color: 'white',
          border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
        }}>
          <Plus size={16} /> New Delivery
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input placeholder="Search by reference or contact..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: '300px' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#8892b8' }}>Loading deliveries...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #e0e4f0', borderRadius: '16px', color: '#8892b8' }}>
          {deliveries.length === 0 ? 'No deliveries yet.' : 'No deliveries match your search.'}
        </div>
      ) : (
        <div style={card}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Reference', 'Contact', 'Date', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#8892b8', fontWeight: 600, fontSize: '11px', background: '#f8fafc' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} onClick={() => setSelected(d)} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#7c6ff7', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>{d.reference}</td>
                  <td style={{ padding: '14px 20px', color: '#4a5278' }}>{d.contact || '—'}</td>
                  <td style={{ padding: '14px 20px', color: '#8892b8', fontSize: '12px' }}>{d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '14px 20px' }}><StatusBadge status={d.status} /></td>
                  <td style={{ padding: '14px 20px' }}>
                    {d.status?.toLowerCase() !== 'done' && d.status?.toLowerCase() !== 'cancelled' ? (
                      <button onClick={e => { e.stopPropagation(); validate(d.id); }} disabled={validating}
                        style={{ padding: '5px 12px', background: '#f5f3ff', color: '#7c6ff7', border: '1px solid #ddd6fe', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        Validate
                      </button>
                    ) : <span style={{ color: '#c8cde0', fontSize: '12px' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a1d2e', marginBottom: '20px' }}>New Delivery</div>
            <form onSubmit={createDelivery}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5278', display: 'block', marginBottom: '5px' }}>CONTACT / CUSTOMER</label>
                <input placeholder="Customer name" style={inputStyle} value={newDelivery.contact}
                  onChange={e => setNewDelivery({ ...newDelivery, contact: e.target.value })} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5278', display: 'block', marginBottom: '8px' }}>PRODUCT LINES</label>
                {newDelivery.lines.map((line, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 32px', gap: '8px', marginBottom: '8px' }}>
                    <select style={inputStyle} value={line.product_id}
                      onChange={e => { const l = [...newDelivery.lines]; l[i].product_id = e.target.value; setNewDelivery({ ...newDelivery, lines: l }); }}>
                      <option value="">Select product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.on_hand})</option>)}
                    </select>
                    <input type="number" placeholder="Qty" min="1" style={inputStyle} value={line.quantity}
                      onChange={e => { const l = [...newDelivery.lines]; l[i].quantity = e.target.value; setNewDelivery({ ...newDelivery, lines: l }); }} />
                    <button type="button" onClick={() => { const l = newDelivery.lines.filter((_, idx) => idx !== i); setNewDelivery({ ...newDelivery, lines: l.length ? l : [{ product_id: '', quantity: '' }] }); }}
                      style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>×</button>
                  </div>
                ))}
                <button type="button" onClick={() => setNewDelivery({ ...newDelivery, lines: [...newDelivery.lines, { product_id: '', quantity: '' }] })}
                  style={{ fontSize: '12px', color: '#7c6ff7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add line</button>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '10px 18px', border: '1px solid #e0e4f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #7c6ff7, #5f57e8)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Create Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}