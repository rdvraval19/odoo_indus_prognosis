import { useEffect, useState } from 'react';
import api from '../api/axios';

// ─────────────────────────────────────────────
// Colour coded badge for each entry type
// Receipt  = blue
// Delivery = green
// Transfer = purple
// Adjustment = orange
// ─────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const styles = {
    receipt:    'bg-blue-100 text-blue-700',
    delivery:   'bg-green-100 text-green-700',
    transfer:   'bg-purple-100 text-purple-700',
    adjustment: 'bg-orange-100 text-orange-700',
  };

  const labels = {
    receipt:    'Receipt',
    delivery:   'Delivery',
    transfer:   'Transfer',
    adjustment: 'Adjustment',
  };

  const key = type?.toLowerCase();

  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full 
                      ${styles[key] || 'bg-gray-100 text-gray-600'}`}>
      {labels[key] || type}
    </span>
  );
};

// ─────────────────────────────────────────────
// Delta badge — green for positive, red for negative
// ─────────────────────────────────────────────
const DeltaBadge = ({ delta }) => {
  const isPositive = delta > 0;
  const isZero     = delta === 0;

  return (
    <span className={`text-sm font-semibold ${
      isZero     ? 'text-gray-400'
    : isPositive ? 'text-green-600'
    :              'text-red-600'
    }`}>
      {isPositive ? `+${delta}` : delta}
    </span>
  );
};

// ─────────────────────────────────────────────
// Format date from ISO string to readable format
// e.g. "2024-03-14T10:30:00" → "14 Mar 2024, 10:30"
// ─────────────────────────────────────────────
const formatDate = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function MoveHistory() {
  // ledger    = full list of ledger entries from API
  // filtered  = ledger after search filter is applied
  // search    = text in the search box
  // typeFilter = which type to show (all / receipt / delivery / transfer / adjustment)
  // loading   = true while fetching
  // error     = error message if fetch fails
  const [ledger,     setLedger]     = useState([]);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // ─────────────────────────────────────────────
  // FETCH ledger entries on mount
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchLedger = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/ledger');
        // Sort by newest first
        const sorted = res.data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setLedger(sorted);
      } catch (err) {
        setError('Failed to load move history. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  // ─────────────────────────────────────────────
  // FILTER — apply search text and type filter
  // ─────────────────────────────────────────────
  const filtered = ledger.filter((row) => {
    // Type filter
    if (typeFilter !== 'all' && row.type?.toLowerCase() !== typeFilter) {
      return false;
    }
    // Search filter — matches product name, ref, from/to location
    if (search.trim()) {
      const q = search.toLowerCase();
      const searchable = [
        row.product_name,
        row.ref_id,
        row.from_location,
        row.to_location,
        row.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  // Count entries per type for the filter buttons
  const counts = {
    all:        ledger.length,
    receipt:    ledger.filter(r => r.type?.toLowerCase() === 'receipt').length,
    delivery:   ledger.filter(r => r.type?.toLowerCase() === 'delivery').length,
    transfer:   ledger.filter(r => r.type?.toLowerCase() === 'transfer').length,
    adjustment: ledger.filter(r => r.type?.toLowerCase() === 'adjustment').length,
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="p-6">

      {/* ── PAGE HEADER ───────────────────────── */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-slate-800 mb-1">
          Move History
        </h1>
        <p className="text-sm text-gray-500">
          Complete ledger of all stock movements — receipts, deliveries,
          transfers and adjustments.
        </p>
      </div>

      {/* ── ERROR ─────────────────────────────── */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg text-sm bg-red-50
                        text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* ── FILTERS ROW ───────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">

        {/* Search box */}
        <input
          type="text"
          placeholder="Search product, reference, location..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                     w-72 focus:outline-none focus:border-blue-400 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Type filter buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all',        label: 'All' },
            { key: 'receipt',    label: 'Receipts' },
            { key: 'delivery',   label: 'Deliveries' },
            { key: 'transfer',   label: 'Transfers' },
            { key: 'adjustment', label: 'Adjustments' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium
                          border transition ${
                typeFilter === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                typeFilter === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── LOADING ───────────────────────────── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Loading move history...
        </div>

      ) : filtered.length === 0 ? (
        /* ── EMPTY STATE ──────────────────────── */
        <div className="text-center py-16 border-2 border-dashed
                        border-gray-200 rounded-2xl">
          <p className="text-gray-400 text-sm mb-1">
            {ledger.length === 0
              ? 'No stock movements yet.'
              : 'No entries match your search.'}
          </p>
          {ledger.length === 0 && (
            <p className="text-gray-300 text-xs">
              Movements will appear here after receipts, deliveries,
              transfers or adjustments are validated.
            </p>
          )}
          {search && (
            <button
              onClick={() => { setSearch(''); setTypeFilter('all'); }}
              className="mt-3 text-xs text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

      ) : (
        /* ── TABLE ────────────────────────────── */
        <div className="bg-white border border-gray-100 rounded-2xl
                        shadow-sm overflow-hidden">

          {/* Result count */}
          <div className="px-5 py-3 border-b border-gray-50 flex
                          justify-between items-center">
            <span className="text-xs text-gray-400">
              Showing {filtered.length} of {ledger.length} entries
            </span>
            <button
              onClick={() => { setSearch(''); setTypeFilter('all'); }}
              className={`text-xs text-blue-600 hover:underline ${
                search || typeFilter !== 'all' ? '' : 'invisible'
              }`}
            >
              Clear filters
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50">
                  <th className="px-5 py-3 text-xs font-medium text-gray-400">
                    Date
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400">
                    Type
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400">
                    Product
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400">
                    From
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400">
                    To
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400 text-right">
                    Qty Change
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    {/* Date */}
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(row.timestamp)}
                    </td>

                    {/* Type badge */}
                    <td className="px-5 py-3.5">
                      <TypeBadge type={row.type} />
                    </td>

                    {/* Product name + SKU */}
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-700">
                        {row.product_name || '—'}
                      </p>
                      {row.product_sku && (
                        <p className="text-xs text-gray-400">
                          {row.product_sku}
                        </p>
                      )}
                    </td>

                    {/* From location */}
                    <td className="px-5 py-3.5 text-gray-500">
                      {row.from_location || (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* To location */}
                    <td className="px-5 py-3.5 text-gray-500">
                      {row.to_location || (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Qty delta */}
                    <td className="px-5 py-3.5 text-right">
                      <DeltaBadge delta={row.qty_delta} />
                    </td>

                    {/* Reference ID */}
                    <td className="px-5 py-3.5">
                      {row.ref_id ? (
                        <span className="font-mono text-xs text-gray-500
                                         bg-gray-100 px-2 py-0.5 rounded">
                          {row.ref_id}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}