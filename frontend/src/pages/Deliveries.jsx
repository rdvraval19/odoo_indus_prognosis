import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// ─────────────────────────────────────────────
// Status badge — colour coded
// ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    draft:     'bg-gray-100 text-gray-600',
    waiting:   'bg-yellow-100 text-yellow-700',
    ready:     'bg-blue-100 text-blue-700',
    done:      'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  };
  const key = status?.toLowerCase();
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                      ${styles[key] || 'bg-gray-100 text-gray-600'}`}>
      {status || '—'}
    </span>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState(null); // delivery open in detail view
  const [validating, setValidating] = useState(false);
  const [toast,      setToast]      = useState(null); // { type, text }

  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // FETCH all deliveries
  // ─────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/deliveries');
      setDeliveries(res.data);
    } catch (err) {
      setError('Failed to load deliveries. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ─────────────────────────────────────────────
  // VALIDATE a delivery
  // ─────────────────────────────────────────────
  const validate = async (id) => {
    setValidating(true);
    setToast(null);
    try {
      await api.post(`/deliveries/${id}/validate`);
      showToast('success', 'Delivery validated successfully. Stock updated.');
      setSelected(null);
      load();
    } catch (err) {
      // Backend returns the exact product name that has insufficient stock
      const detail = err.response?.data?.detail || 'Validation failed.';
      showToast('error', detail);
    } finally {
      setValidating(false);
    }
  };

  // ─────────────────────────────────────────────
  // TOAST helper — auto hides after 4 seconds
  // ─────────────────────────────────────────────
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // ─────────────────────────────────────────────
  // FILTER deliveries by search text
  // ─────────────────────────────────────────────
  const filtered = deliveries.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.reference?.toLowerCase().includes(q) ||
      d.customer?.toLowerCase().includes(q) ||
      d.status?.toLowerCase().includes(q)
    );
  });

  // ─────────────────────────────────────────────
  // RENDER — Detail view
  // ─────────────────────────────────────────────
  if (selected) {
    return (
      <div className="p-6 max-w-2xl">

        {/* Back button */}
        <button
          onClick={() => setSelected(null)}
          className="text-gray-400 hover:text-gray-600 text-sm mb-5 block"
        >
          ← Back to Deliveries
        </button>

        <h1 className="text-xl font-medium mb-1">{selected.reference}</h1>
        <p className="text-sm text-gray-500 mb-5">
          Customer: {selected.customer || '—'}
        </p>

        {/* Toast inside detail view */}
        {toast && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {toast.text}
          </div>
        )}

        {/* Header info */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl
                        px-4 py-3 mb-5 flex gap-6 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Status</p>
            <StatusBadge status={selected.status} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Reference</p>
            <p className="font-medium">{selected.reference}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Date</p>
            <p className="font-medium">
              {selected.date
                ? new Date(selected.date).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </div>

        {/* Product lines */}
        <h2 className="text-sm font-medium text-gray-600 mb-2">
          Product Lines
        </h2>
        <div className="bg-white border border-gray-100 rounded-xl
                        overflow-hidden mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs text-gray-400 font-medium">
                  Product
                </th>
                <th className="px-4 py-2.5 text-xs text-gray-400 font-medium text-right">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {(selected.lines || []).map((line, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {line.product_name || line.product_id}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {line.qty}
                  </td>
                </tr>
              ))}
              {(!selected.lines || selected.lines.length === 0) && (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center
                                              text-gray-400 text-xs">
                    No product lines
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Validate button — only show if not already done/cancelled */}
        {selected.status?.toLowerCase() !== 'done' &&
         selected.status?.toLowerCase() !== 'cancelled' && (
          <button
            onClick={() => validate(selected.id)}
            disabled={validating}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg
                       text-sm font-medium hover:bg-green-700
                       disabled:opacity-50 transition"
          >
            {validating ? 'Validating...' : 'Validate Delivery'}
          </button>
        )}

        {selected.status?.toLowerCase() === 'done' && (
          <div className="bg-green-50 border border-green-200 rounded-lg
                          px-4 py-3 text-sm text-green-700">
            This delivery has been validated. Stock has been deducted.
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER — List view
  // ─────────────────────────────────────────────
  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-slate-800 mb-1">
            Deliveries
          </h1>
          <p className="text-sm text-gray-500">
            Manage outgoing stock deliveries.
          </p>
        </div>
      </div>

      {/* Toast — global */}
      {toast && (
        <div className={`mb-5 px-4 py-3 rounded-lg text-sm ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.text}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg text-sm bg-red-50
                        text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by reference or customer..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                     w-72 focus:outline-none focus:border-blue-400 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          Loading deliveries...
        </p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed
                        border-gray-200 rounded-2xl">
          <p className="text-gray-400 text-sm">
            {deliveries.length === 0
              ? 'No deliveries yet.'
              : 'No deliveries match your search.'}
          </p>
        </div>
      ) : (
        /* Table */
        <div className="bg-white border border-gray-100 rounded-2xl
                        shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs text-gray-400 font-medium">
                  Reference
                </th>
                <th className="px-5 py-3 text-xs text-gray-400 font-medium">
                  Customer
                </th>
                <th className="px-5 py-3 text-xs text-gray-400 font-medium">
                  Date
                </th>
                <th className="px-5 py-3 text-xs text-gray-400 font-medium">
                  Status
                </th>
                <th className="px-5 py-3 text-xs text-gray-400 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-gray-50 hover:bg-gray-50
                             transition cursor-pointer"
                  onClick={() => setSelected(d)}
                >
                  <td className="px-5 py-3.5 font-medium text-blue-600">
                    {d.reference}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {d.customer || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {d.date
                      ? new Date(d.date).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    {d.status?.toLowerCase() !== 'done' &&
                     d.status?.toLowerCase() !== 'cancelled' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent row click
                          validate(d.id);
                        }}
                        disabled={validating}
                        className="text-xs bg-green-50 text-green-700
                                   border border-green-200 px-3 py-1
                                   rounded-lg hover:bg-green-100 transition"
                      >
                        Validate
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
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