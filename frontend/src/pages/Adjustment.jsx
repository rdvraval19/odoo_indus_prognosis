import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Adjustment() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [countedQty, setCountedQty] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/products/').then(r => setProducts(r.data));
  }, []);

  const selected = products.find(p => String(p.id) === productId);
  // FIX: use on_hand not stock
  const delta = selected && countedQty !== '' ? Number(countedQty) - selected.on_hand : null;

  const submit = async () => {
    if (delta === null || delta === 0 || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      await api.post('/adjustments', {
        product_id: Number(productId),
        counted_qty: Number(countedQty),  // send counted_qty, backend computes delta
      });
      setMsg({ type: 'success', text: `Adjustment of ${delta > 0 ? '+' : ''}${delta} recorded for ${selected.name}.` });
      setProductId(''); setCountedQty('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Adjustment failed.' });
    } finally { setBusy(false); }
  };

  const card = { background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e0e4f0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' };

  return (
    <div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1d2e', marginBottom: '4px' }}>Stock Adjustment</div>
      <div style={{ fontSize: '13px', color: '#8892b8', marginBottom: '24px' }}>Correct system stock to match a physical count</div>

      <div style={{ ...card, maxWidth: '520px' }}>
        {msg && (
          <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: msg.type === 'success' ? '#f0fdf4' : '#fff0f0', color: msg.type === 'success' ? '#15803d' : '#b91c1c', border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
            {msg.text}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5278', display: 'block', marginBottom: '6px' }}>PRODUCT</label>
          <select style={{ ...inputStyle, background: 'white' }} value={productId} onChange={e => { setProductId(e.target.value); setCountedQty(''); setMsg(null); }}>
            <option value="">Select a product...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.sku}</option>)}
          </select>
        </div>

        {selected && (
          <div style={{ padding: '12px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4a5278' }}>System stock</span>
              <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{selected.on_hand} {selected.uom}</span>
            </div>
            {selected.low_stock && <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px' }}>⚠ Below low-stock threshold</div>}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5278', display: 'block', marginBottom: '6px' }}>PHYSICALLY COUNTED QUANTITY</label>
          <input type="number" min="0" placeholder="What you actually counted" style={{ ...inputStyle, opacity: selected ? 1 : 0.5 }}
            value={countedQty} onChange={e => setCountedQty(e.target.value)} disabled={!selected} />
        </div>

        {delta !== null && (
          <div style={{
            padding: '14px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px',
            background: delta > 0 ? '#f0fdf4' : delta < 0 ? '#fff0f0' : '#f8fafc',
            border: `1px solid ${delta > 0 ? '#bbf7d0' : delta < 0 ? '#fecaca' : '#e0e4f0'}`,
            color: delta > 0 ? '#15803d' : delta < 0 ? '#b91c1c' : '#64748b'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Adjustment delta</span>
              <span style={{ fontWeight: 800, fontSize: '16px' }}>{delta > 0 ? '+' : ''}{delta}</span>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Stock: {selected.on_hand} → {selected.on_hand + delta} {selected.uom}
            </div>
          </div>
        )}

        <button onClick={submit} disabled={delta === null || delta === 0 || busy} style={{
          width: '100%', padding: '12px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white', fontWeight: 700, fontSize: '14px', border: 'none',
          cursor: delta === null || delta === 0 || busy ? 'not-allowed' : 'pointer',
          opacity: delta === null || delta === 0 || busy ? 0.4 : 1
        }}>
          {busy ? 'Submitting...' : 'Submit Adjustment'}
        </button>
      </div>
    </div>
  );
}