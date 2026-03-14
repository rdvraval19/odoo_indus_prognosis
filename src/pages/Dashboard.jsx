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

export default Dashboard;