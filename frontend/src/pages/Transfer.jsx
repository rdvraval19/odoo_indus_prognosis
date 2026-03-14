import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY = { product_id: '', from_location_id: '', to_location_id: '', quantity: '' };

export default function Transfer() {
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/products/'), api.get('/locations')])
      .then(([p, l]) => { setProducts(p.data); setLocations(l.data); })
      .catch(() => setMsg({ type: 'error', text: 'Failed to load data' }))
      .finally(() => setLoading(false));
  }, []);

  const selected = products.find(p => String(p.id) === form.product_id);
  const toOptions = locations.filter(l => String(l.id) !== form.from_location_id);
  const isValid = form.product_id && form.from_location_id && form.to_location_id && Number(form.quantity) > 0;
  const overStock = selected && form.quantity && Number(form.quantity) > selected.on_hand;

  const submit = async () => {
    if (!isValid || busy) return;
    setBusy(true); setMsg(null);
    try {
      await api.post('/transfers', {
        product_id: Number(form.product_id),
        from_location_id: Number(form.from_location_id),  // correct field name
        to_location_id: Number(form.to_location_id),      // correct field name
        quantity: Number(form.quantity),
      });
      const from = locations.find(l => String(l.id) === form.from_location_id)?.name;
      const to = locations.find(l => String(l.id) === form.to_location_id)?.name;
      setMsg({ type: 'success', text: `Transferred ${form.quantity} ${selected?.uom || 'units'} of "${selected?.name}" from ${from} to ${to}.` });
      setForm(EMPTY);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Transfer failed' });
    } finally { setBusy(false); }
  };

  const card = { background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px', maxWidth: '520px' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e0e4f0', fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: 'white' };
  const label = { fontSize: '12px', fontWeight: 700, color: '#4a5278', display: 'block', marginBottom: '6px' };

  return (
    <div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1d2e', marginBottom: '4px' }}>Internal Transfer</div>
      <div style={{ fontSize: '13px', color: '#8892b8', marginBottom: '24px' }}>Move stock between locations — total quantity stays unchanged</div>

      <div style={card}>
        {msg && (
          <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: msg.type === 'success' ? '#f0fdf4' : '#fff0f0', color: msg.type === 'success' ? '#15803d' : '#b91c1c', border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
            {msg.text}
            {msg.type === 'success' && <button onClick={() => { setForm(EMPTY); setMsg(null); }} style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: '#15803d', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Do another transfer →</button>}
          </div>
        )}

        {loading ? <div style={{ color: '#8892b8', fontSize: '13px' }}>Loading...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={label}>PRODUCT</label>
              <select style={inputStyle} value={form.product_id} onChange={e => setForm({ ...EMPTY, product_id: e.target.value })}>
                <option value="">Select a product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.sku}</option>)}
              </select>
              {selected && (
                <div style={{ marginTop: '6px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8892b8' }}>Available stock</span>
                  <span style={{ fontWeight: 700 }}>{selected.on_hand} {selected.uom}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={label}>FROM LOCATION</label>
                <select style={inputStyle} value={form.from_location_id} onChange={e => setForm({ ...form, from_location_id: e.target.value, to_location_id: '' })}>
                  <option value="">Select...</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>TO LOCATION</label>
                <select style={{ ...inputStyle, opacity: form.from_location_id ? 1 : 0.5 }} value={form.to_location_id} onChange={e => setForm({ ...form, to_location_id: e.target.value })} disabled={!form.from_location_id}>
                  <option value="">Select...</option>
                  {toOptions.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={label}>QUANTITY</label>
              <input type="number" min="1" placeholder={selected ? `Max: ${selected.on_hand} ${selected.uom}` : 'Enter quantity'}
                style={{ ...inputStyle, borderColor: overStock ? '#fca5a5' : '#e0e4f0', background: overStock ? '#fff8f8' : 'white' }}
                value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
              {overStock && <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px' }}>Exceeds available stock ({selected.on_hand} {selected.uom})</div>}
            </div>

            {isValid && selected && (
              <div style={{ padding: '14px 16px', background: '#f8fafc', border: '1px solid #e0e4f0', borderRadius: '10px', fontSize: '12px' }}>
                <div style={{ fontWeight: 700, color: '#1a1d2e', marginBottom: '8px' }}>Transfer summary</div>
                {[
                  ['Product', selected.name],
                  ['From', locations.find(l => String(l.id) === form.from_location_id)?.name],
                  ['To', locations.find(l => String(l.id) === form.to_location_id)?.name],
                  ['Quantity', `${form.quantity} ${selected.uom}`],
                  ['Total stock after', `${selected.on_hand} ${selected.uom} (unchanged)`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#8892b8' }}>{k}</span>
                    <span style={{ fontWeight: 600, color: '#1a1d2e' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={submit} disabled={!isValid || busy || overStock} style={{
              padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, #0099ff, #0077dd)',
              color: 'white', fontWeight: 700, fontSize: '14px', border: 'none',
              cursor: !isValid || busy || overStock ? 'not-allowed' : 'pointer',
              opacity: !isValid || busy || overStock ? 0.4 : 1
            }}>
              {busy ? 'Submitting...' : 'Submit Transfer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}