import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Settings, 
  LogOut, 
  User,
  Box
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // 'flex' makes the Sidebar and Main content sit side-by-side
    <div className="flex h-screen w-full bg-gray-100 font-sans">
      
      {/* SIDEBAR */}
      <nav className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
        {/* Logo Section */}
        <div className="p-8">
          <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Box size={24} className="text-white" />
            </div>
            INDUS X ODOO
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 px-4 space-y-2">
          <Link 
            to="/" 
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all group"
          >
            <LayoutDashboard size={20} className="group-hover:text-blue-400" />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link 
            to="/products" 
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all group"
          >
            <Package size={20} className="group-hover:text-blue-400" />
            <span className="font-medium">Products</span>
          </Link>
          
          <Link 
            to="/history" 
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all group"
          >
            <History size={20} className="group-hover:text-blue-400" />
            <span className="font-medium">Move History</span>
          </Link>
          
          <Link 
            to="/settings" 
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all group"
          >
            <Settings size={20} className="group-hover:text-blue-400" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>

        {/* User & Logout Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 mb-2 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="bg-blue-500 p-2 rounded-full text-white">
              <User size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Rahul Khara</p>
              <p className="text-xs text-slate-500 truncate">Admin</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            Welcome Back, Rahul!
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400 leading-none">Status</p>
              <p className="text-sm font-bold text-green-500 uppercase">System Online</p>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
};

export default MainLayout;