<<<<<<< HEAD:frontend/src/pages/Dashboard.jsx
const StatCard = ({ title, value, detail, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
    <div className="flex items-end gap-3 mt-2">
      <h3 className="text-4xl font-bold text-slate-800">{value}</h3>
      <span className={`text-sm font-semibold mb-1 ${colorClass}`}>{detail}</span>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Inventory Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Receipts" value="24" detail="12 Pending" colorClass="text-blue-600" />
        <StatCard title="Deliveries" value="18" detail="5 In Transit" colorClass="text-emerald-600" />
        <StatCard title="Low Stock Alerts" value="07" detail="Action Required" colorClass="text-red-600" />
      </div>
      
      <div className="mt-10 p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
        <p className="text-slate-400">Inventory Activity Charts will be rendered here.</p>
      </div>
    </div>
  );
};

=======
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const StatCard = ({ title, value, detail, colorClass, onClick }) => (
  <div onClick={onClick} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all">
    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
    <div className="flex items-end gap-3 mt-2">
      <h3 className="text-4xl font-bold text-slate-800">{value}</h3>
      <span className={`text-sm font-semibold mb-1 ${colorClass}`}>{detail}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <p className="text-slate-400">Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Inventory Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Receipts"
          value={stats.receipts.done + stats.receipts.todo + stats.receipts.waiting}
          detail={`${stats.receipts.todo} Pending`}
          colorClass="text-blue-600"
          onClick={() => navigate('/receipts')}
        />
        <StatCard
          title="Deliveries"
          value={stats.deliveries.done + stats.deliveries.todo + stats.deliveries.waiting}
          detail={`${stats.deliveries.todo} Pending`}
          colorClass="text-emerald-600"
          onClick={() => navigate('/deliveries')}
        />
        <StatCard
          title="Low Stock Alerts"
          value={String(stats.low_stock_products.length).padStart(2, '0')}
          detail="Action Required"
          colorClass="text-red-600"
        />
      </div>

      {/* Low stock list */}
      {stats.low_stock_products.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Low Stock Products</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {stats.low_stock_products.map(p => (
              <div key={p.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0">
                <div>
                  <p className="font-medium text-slate-800">{p.name}</p>
                  <p className="text-sm text-slate-400">{p.sku}</p>
                </div>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                  {p.on_hand} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

>>>>>>> a6c281ca7deb3f1660ca29e4576ab04d335cbe31:src/pages/Dashboard.jsx
export default Dashboard;