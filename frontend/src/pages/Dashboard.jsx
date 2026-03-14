import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// ─────────────────────────────────────────────
// Stat card — clickable KPI card
// ─────────────────────────────────────────────
const StatCard = ({ title, value, detail, colorClass, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm
               cursor-pointer hover:shadow-md transition-all"
  >
    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
      {title}
    </p>
    <div className="flex items-end gap-3 mt-2">
      <h3 className="text-4xl font-bold text-slate-800">{value}</h3>
      <span className={`text-sm font-semibold mb-1 ${colorClass}`}>
        {detail}
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Transfer row — one item in the schedule list
// ─────────────────────────────────────────────
const TransferRow = ({ transfer, onNavigate }) => {
  const statusStyles = {
    pending:   'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  };
  const key = transfer.status?.toLowerCase() || 'pending';

  return (
    <div className="flex items-center justify-between px-6 py-4
                    border-b last:border-0 hover:bg-gray-50 transition">
      <div className="flex items-center gap-4">
        {/* Arrow icon */}
        <div className="w-8 h-8 rounded-full bg-purple-50 border
                        border-purple-100 flex items-center justify-center
                        text-purple-500 text-sm flex-shrink-0">
          ⇄
        </div>
        <div>
          <p className="font-medium text-slate-800 text-sm">
            {transfer.product_name || 'Product'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {transfer.from_location || '—'} → {transfer.to_location || '—'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-700">
            {transfer.qty} {transfer.uom || 'units'}
          </p>
          <p className="text-xs text-slate-400">
            {transfer.timestamp
              ? new Date(transfer.timestamp).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
              : '—'}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                          ${statusStyles[key] || 'bg-gray-100 text-gray-600'}`}>
          {transfer.status || 'Pending'}
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ─────────────────────────────────────────────
const Dashboard = () => {
  const [stats,     setStats]     = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loadingT,  setLoadingT]  = useState(true);
  const navigate = useNavigate();

  // Fetch dashboard stats
  useEffect(() => {
    api.get('/stats')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  // Fetch recent transfers from ledger
  // Filter ledger rows where type = transfer
  useEffect(() => {
    setLoadingT(true);
    api.get('/ledger')
      .then(res => {
        // Keep only transfer type entries
        const transferRows = res.data
          .filter(row => row.type?.toLowerCase() === 'transfer')
          // Sort newest first
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          // Show only last 5
          .slice(0, 5);
        setTransfers(transferRows);
      })
      .catch(console.error)
      .finally(() => setLoadingT(false));
  }, []);

  if (!stats) {
    return <p className="text-slate-400">Loading dashboard...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-8">
        Inventory Dashboard
      </h1>

      {/* ── KPI CARDS ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Receipts"
          value={
            (stats.receipts?.done || 0) +
            (stats.receipts?.todo || 0) +
            (stats.receipts?.waiting || 0)
          }
          detail={`${stats.receipts?.todo || 0} Pending`}
          colorClass="text-blue-600"
          onClick={() => navigate('/receipts')}
        />
        <StatCard
          title="Deliveries"
          value={
            (stats.deliveries?.done || 0) +
            (stats.deliveries?.todo || 0) +
            (stats.deliveries?.waiting || 0)
          }
          detail={`${stats.deliveries?.todo || 0} Pending`}
          colorClass="text-emerald-600"
          onClick={() => navigate('/deliveries')}
        />
        <StatCard
          title="Low Stock Alerts"
          value={String(stats.low_stock_products?.length || 0).padStart(2, '0')}
          detail="Action Required"
          colorClass="text-red-600"
        />
      </div>

      {/* ── BOTTOM GRID — transfers + low stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── INTERNAL TRANSFER SCHEDULE ─────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-4
                          border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-slate-700">
                Internal Transfers
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Recent stock movements between locations
              </p>
            </div>
            <button
              onClick={() => navigate('/transfer')}
              className="text-xs bg-purple-50 text-purple-600 border
                         border-purple-100 px-3 py-1.5 rounded-lg
                         hover:bg-purple-100 transition font-medium"
            >
              + New Transfer
            </button>
          </div>

          {/* Transfer list */}
          {loadingT ? (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              Loading transfers...
            </div>
          ) : transfers.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-400 mb-1">
                No transfers recorded yet.
              </p>
              <button
                onClick={() => navigate('/transfer')}
                className="text-xs text-purple-600 hover:underline mt-1"
              >
                Create your first transfer →
              </button>
            </div>
          ) : (
            <>
              {transfers.map((t, i) => (
                <TransferRow key={t.id || i} transfer={t} />
              ))}
              {/* View all link */}
              <div className="px-6 py-3 border-t border-gray-50">
                <button
                  onClick={() => navigate('/move-history')}
                  className="text-xs text-purple-600 hover:underline"
                >
                  View all in Move History →
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── LOW STOCK ALERTS ───────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-4
                          border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-slate-700">
                Low Stock Alerts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Products below minimum threshold
              </p>
            </div>
            {stats.low_stock_products?.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-bold
                               px-2.5 py-1 rounded-full">
                {stats.low_stock_products.length} alerts
              </span>
            )}
          </div>

          {/* Low stock list */}
          {!stats.low_stock_products?.length ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-400">
                All products are sufficiently stocked.
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Great job keeping up with inventory!
              </p>
            </div>
          ) : (
            <>
              {stats.low_stock_products.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-6 py-4
                             border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    {/* Red dot indicator */}
                    <div className="w-2 h-2 rounded-full bg-red-400
                                    flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-400">{p.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-red-100 text-red-600 text-xs
                                     font-bold px-3 py-1 rounded-full">
                      {p.on_hand} left
                    </span>
                    {p.low_stock_threshold && (
                      <p className="text-xs text-gray-400 mt-1">
                        min: {p.low_stock_threshold}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {/* View products link */}
              <div className="px-6 py-3 border-t border-gray-50">
                <button
                  onClick={() => navigate('/products')}
                  className="text-xs text-red-500 hover:underline"
                >
                  View all products →
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;