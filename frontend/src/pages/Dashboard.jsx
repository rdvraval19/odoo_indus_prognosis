// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ShoppingCart, Truck, AlertTriangle, Package } from 'lucide-react';
// import api from '../api/axios';

// const KPICard = ({ icon: Icon, label, value, sub, subColor, accent, onClick }) => (
//   <div onClick={onClick} style={{
//     background: 'white', borderRadius: '16px', padding: '24px',
//     boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: onClick ? 'pointer' : 'default',
//     borderTop: `3px solid ${accent}`, transition: 'transform 0.15s, box-shadow 0.15s',
//     position: 'relative', overflow: 'hidden'
//   }}
//   onMouseEnter={e => { if(onClick) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'; }}}
//   onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)'; }}
//   >
//     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//       <div>
//         <div style={{ fontSize: '12px', fontWeight: 700, color: '#8892b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</div>
//         <div style={{ fontSize: '42px', fontWeight: 800, color: '#1a1d2e', lineHeight: 1.1, marginTop: '8px' }}>{value}</div>
//         <div style={{ fontSize: '13px', fontWeight: 600, color: subColor, marginTop: '6px' }}>{sub}</div>
//       </div>
//       <div style={{ background: `${accent}18`, borderRadius: '12px', padding: '12px' }}>
//         <Icon size={24} color={accent} />
//       </div>
//     </div>
//   </div>
// );

// const Dashboard = () => {
//   const [stats, setStats] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     api.get('/stats').then(res => setStats(res.data)).catch(console.error);
//   }, []);

//   if (!stats) return (
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
//       <div style={{ color: '#8892b8', fontWeight: 600 }}>Loading dashboard...</div>
//     </div>
//   );

//   return (
//     <div>
//       {/* KPI Grid */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
//         <KPICard
//           icon={Package} label="Total Products" accent="#0099ff"
//           value={stats.total_products} sub="In inventory" subColor="#0099ff"
//         />
//         <KPICard
//           icon={ShoppingCart} label="Receipts" accent="#00c896"
//           value={stats.receipts.todo + stats.receipts.waiting + stats.receipts.done}
//           sub={`${stats.receipts.todo} pending`} subColor="#00a878"
//           onClick={() => navigate('/receipts')}
//         />
//         <KPICard
//           icon={Truck} label="Deliveries" accent="#7c6ff7"
//           value={stats.deliveries.todo + stats.deliveries.waiting + stats.deliveries.done}
//           sub={`${stats.deliveries.todo} pending`} subColor="#7c6ff7"
//           onClick={() => navigate('/deliveries')}
//         />
//         <KPICard
//           icon={AlertTriangle} label="Low Stock" accent="#ff6b6b"
//           value={String(stats.low_stock_products.length).padStart(2,'0')}
//           sub="Needs attention" subColor="#ff6b6b"
//         />
//       </div>

//       {/* Status Row */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
//         {/* Receipts breakdown */}
//         <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
//           <div style={{ fontWeight: 800, fontSize: '15px', color: '#1a1d2e', marginBottom: '16px' }}>Receipts Overview</div>
//           {[
//             { label: 'Todo / Draft', value: stats.receipts.todo, color: '#f59e0b' },
//             { label: 'Waiting',      value: stats.receipts.waiting, color: '#0099ff' },
//             { label: 'Done',         value: stats.receipts.done, color: '#00c896' },
//           ].map(({ label, value, color }) => (
//             <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
//                 <span style={{ fontSize: '13px', color: '#4a5278', fontWeight: 500 }}>{label}</span>
//               </div>
//               <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a1d2e' }}>{value}</span>
//             </div>
//           ))}
//         </div>

//         {/* Deliveries breakdown */}
//         <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
//           <div style={{ fontWeight: 800, fontSize: '15px', color: '#1a1d2e', marginBottom: '16px' }}>Deliveries Overview</div>
//           {[
//             { label: 'Todo / Draft', value: stats.deliveries.todo, color: '#f59e0b' },
//             { label: 'Waiting',      value: stats.deliveries.waiting, color: '#7c6ff7' },
//             { label: 'Done',         value: stats.deliveries.done, color: '#00c896' },
//           ].map(({ label, value, color }) => (
//             <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
//                 <span style={{ fontSize: '13px', color: '#4a5278', fontWeight: 500 }}>{label}</span>
//               </div>
//               <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a1d2e' }}>{value}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Low Stock */}
//       {stats.low_stock_products.length > 0 && (
//         <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
//             <div style={{ fontWeight: 800, fontSize: '15px', color: '#1a1d2e' }}>Low Stock Alerts</div>
//             <div style={{ background: '#fff0f0', color: '#ff6b6b', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
//               {stats.low_stock_products.length} items
//             </div>
//           </div>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
//             {stats.low_stock_products.map(p => (
//               <div key={p.id} style={{
//                 background: '#fff8f8', border: '1px solid #ffe0e0',
//                 borderRadius: '10px', padding: '12px 14px',
//                 display: 'flex', justifyContent: 'space-between', alignItems: 'center'
//               }}>
//                 <div>
//                   <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a1d2e' }}>{p.name}</div>
//                   <div style={{ fontSize: '11px', color: '#8892b8', fontFamily: "'DM Mono', monospace" }}>{p.sku}</div>
//                 </div>
//                 <div style={{ background: '#ff6b6b', color: 'white', fontWeight: 800, fontSize: '13px', padding: '4px 10px', borderRadius: '20px' }}>
//                   {p.on_hand}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Truck, AlertTriangle, Package, ArrowLeftRight } from 'lucide-react';
import api from '../api/axios';

// ─────────────────────────────────────────────
// KPI Card — unchanged from your original
// ─────────────────────────────────────────────
const KPICard = ({ icon: Icon, label, value, sub, subColor, accent, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'white', borderRadius: '16px', padding: '24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      cursor: onClick ? 'pointer' : 'default',
      borderTop: `3px solid ${accent}`,
      transition: 'transform 0.15s, box-shadow 0.15s',
      position: 'relative', overflow: 'hidden'
    }}
    onMouseEnter={e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
      }
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#8892b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontSize: '42px', fontWeight: 800, color: '#1a1d2e', lineHeight: 1.1, marginTop: '8px' }}>
          {value}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: subColor, marginTop: '6px' }}>
          {sub}
        </div>
      </div>
      <div style={{ background: `${accent}18`, borderRadius: '12px', padding: '12px' }}>
        <Icon size={24} color={accent} />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Date + time formatters
// ─────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};
const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
};

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
const Dashboard = () => {
  const [stats,    setStats]    = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loadingT,  setLoadingT]  = useState(true);
  const navigate = useNavigate();

  // Fetch stats
  useEffect(() => {
    api.get('/stats')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  // Fetch transfers from ledger
  useEffect(() => {
    setLoadingT(true);
    api.get('/ledger')
      .then(res => {
        const rows = res.data
          .filter(r => r.type?.toLowerCase() === 'transfer')
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 6);
        setTransfers(rows);
      })
      .catch(console.error)
      .finally(() => setLoadingT(false));
  }, []);

  if (!stats) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
      <div style={{ color: '#8892b8', fontWeight: 600 }}>Loading dashboard...</div>
    </div>
  );

  return (
    <div>

      {/* ── KPI CARDS ─────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px', marginBottom: '28px'
      }}>
        <KPICard
          icon={Package} label="Total Products" accent="#0099ff"
          value={stats.total_products} sub="In inventory" subColor="#0099ff"
        />
        <KPICard
          icon={ShoppingCart} label="Receipts" accent="#00c896"
          value={stats.receipts.todo + stats.receipts.waiting + stats.receipts.done}
          sub={`${stats.receipts.todo} pending`} subColor="#00a878"
          onClick={() => navigate('/receipts')}
        />
        <KPICard
          icon={Truck} label="Deliveries" accent="#7c6ff7"
          value={stats.deliveries.todo + stats.deliveries.waiting + stats.deliveries.done}
          sub={`${stats.deliveries.todo} pending`} subColor="#7c6ff7"
          onClick={() => navigate('/deliveries')}
        />
        <KPICard
          icon={AlertTriangle} label="Low Stock" accent="#ff6b6b"
          value={String(stats.low_stock_products.length).padStart(2, '0')}
          sub="Needs attention" subColor="#ff6b6b"
        />
      </div>

      {/* ── STATUS ROW ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>

        {/* Receipts breakdown */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 800, fontSize: '15px', color: '#1a1d2e', marginBottom: '16px' }}>
            Receipts Overview
          </div>
          {[
            { label: 'Todo / Draft', value: stats.receipts.todo,    color: '#f59e0b' },
            { label: 'Waiting',      value: stats.receipts.waiting, color: '#0099ff' },
            { label: 'Done',         value: stats.receipts.done,    color: '#00c896' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '13px', color: '#4a5278', fontWeight: 500 }}>{label}</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a1d2e' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Deliveries breakdown */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 800, fontSize: '15px', color: '#1a1d2e', marginBottom: '16px' }}>
            Deliveries Overview
          </div>
          {[
            { label: 'Todo / Draft', value: stats.deliveries.todo,    color: '#f59e0b' },
            { label: 'Waiting',      value: stats.deliveries.waiting, color: '#7c6ff7' },
            { label: 'Done',         value: stats.deliveries.done,    color: '#00c896' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '13px', color: '#4a5278', fontWeight: 500 }}>{label}</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a1d2e' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRANSFERS + LOW STOCK SIDE BY SIDE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>

        {/* ── INTERNAL TRANSFER SCHEDULE ──────── */}
        <div style={{
          background: 'white', borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden'
        }}>

          {/* Card header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #f1f3f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#f0ebff', borderRadius: '10px', padding: '8px' }}>
                <ArrowLeftRight size={18} color="#7c6ff7" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#1a1d2e' }}>
                  Internal Transfers
                </div>
                <div style={{ fontSize: '11px', color: '#8892b8', marginTop: '2px' }}>
                  Recent movements between locations
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/transfer')}
              style={{
                background: '#f0ebff', color: '#7c6ff7',
                border: '1px solid #e0d9ff', borderRadius: '8px',
                padding: '6px 14px', fontSize: '12px',
                fontWeight: 700, cursor: 'pointer'
              }}
            >
              + New
            </button>
          </div>

          {/* Transfer rows */}
          {loadingT ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#8892b8', fontSize: '13px' }}>
              Loading transfers...
            </div>
          ) : transfers.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: '#f0ebff', margin: '0 auto 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ArrowLeftRight size={20} color="#7c6ff7" />
              </div>
              <div style={{ fontSize: '13px', color: '#8892b8', fontWeight: 500 }}>
                No transfers recorded yet
              </div>
              <button
                onClick={() => navigate('/transfer')}
                style={{
                  marginTop: '10px', background: 'none', border: 'none',
                  color: '#7c6ff7', fontSize: '12px',
                  fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
                }}
              >
                Create first transfer →
              </button>
            </div>
          ) : (
            <div>
              {transfers.map((t, i) => (
                <div
                  key={t.id || i}
                  style={{
                    padding: '14px 24px',
                    borderBottom: i < transfers.length - 1
                      ? '1px solid #f5f6fa' : 'none',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {/* Left */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: '#f0ebff', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <ArrowLeftRight size={15} color="#7c6ff7" />
                    </div>
                    <div>
                      {/* Product name */}
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a1d2e' }}>
                        {t.product_name || 'Product'}
                      </div>
                      {/* From → To locations */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <span style={{
                          background: '#f5f6fa', borderRadius: '4px',
                          padding: '1px 7px', fontSize: '10px',
                          fontWeight: 600, color: '#4a5278'
                        }}>
                          {t.from_location || '—'}
                        </span>
                        <span style={{ color: '#c4c9df', fontSize: '11px' }}>→</span>
                        <span style={{
                          background: '#f0ebff', borderRadius: '4px',
                          padding: '1px 7px', fontSize: '10px',
                          fontWeight: 600, color: '#7c6ff7'
                        }}>
                          {t.to_location || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right — qty + date */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#1a1d2e' }}>
                      {t.qty_delta > 0 ? '+' : ''}{t.qty_delta} units
                    </div>
                    <div style={{ fontSize: '10px', color: '#8892b8', marginTop: '2px' }}>
                      {formatDate(t.timestamp)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#b0b8d8' }}>
                      {formatTime(t.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {/* View all */}
              <div style={{ padding: '12px 24px', borderTop: '1px solid #f5f6fa' }}>
                <button
                  onClick={() => navigate('/move-history')}
                  style={{
                    background: 'none', border: 'none',
                    color: '#7c6ff7', fontSize: '12px',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  View all in Move History →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── LOW STOCK ALERTS ────────────────── */}
        <div style={{
          background: 'white', borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden'
        }}>

          {/* Card header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #f1f3f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#fff0f0', borderRadius: '10px', padding: '8px' }}>
                <AlertTriangle size={18} color="#ff6b6b" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#1a1d2e' }}>
                  Low Stock Alerts
                </div>
                <div style={{ fontSize: '11px', color: '#8892b8', marginTop: '2px' }}>
                  Products below threshold
                </div>
              </div>
            </div>
            {stats.low_stock_products.length > 0 && (
              <div style={{
                background: '#fff0f0', color: '#ff6b6b',
                fontSize: '12px', fontWeight: 700,
                padding: '4px 10px', borderRadius: '20px'
              }}>
                {stats.low_stock_products.length} alerts
              </div>
            )}
          </div>

          {/* Low stock list */}
          {stats.low_stock_products.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>✅</div>
              <div style={{ fontSize: '13px', color: '#8892b8', fontWeight: 500 }}>
                All products sufficiently stocked
              </div>
            </div>
          ) : (
            <div>
              {stats.low_stock_products.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    padding: '14px 24px',
                    borderBottom: i < stats.low_stock_products.length - 1
                      ? '1px solid #f5f6fa' : 'none',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: p.on_hand === 0 ? '#ff3b3b' : '#ff6b6b',
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a1d2e' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8892b8', fontFamily: 'monospace', marginTop: '2px' }}>
                        {p.sku}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: p.on_hand === 0 ? '#ff3b3b' : '#ff6b6b',
                      color: 'white', fontWeight: 800, fontSize: '13px',
                      padding: '4px 10px', borderRadius: '20px'
                    }}>
                      {p.on_hand === 0 ? 'OUT' : `${p.on_hand} left`}
                    </div>
                    {p.low_stock_threshold && (
                      <div style={{ fontSize: '10px', color: '#b0b8d8', marginTop: '3px' }}>
                        min: {p.low_stock_threshold}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ padding: '12px 24px', borderTop: '1px solid #f5f6fa' }}>
                <button
                  onClick={() => navigate('/products')}
                  style={{
                    background: 'none', border: 'none',
                    color: '#ff6b6b', fontSize: '12px',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  View all products →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;