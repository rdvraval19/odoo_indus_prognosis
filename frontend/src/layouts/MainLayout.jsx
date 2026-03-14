import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ClipboardList,
  Truck, History, Settings, LogOut, User, Box, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/products',   icon: Package,         label: 'Products'     },
  { to: '/receipts',   icon: ClipboardList,   label: 'Receipts'     },
  { to: '/deliveries', icon: Truck,           label: 'Deliveries'   },
  { to: '/history',    icon: History,         label: 'Move History' },
  { to: '/settings',   icon: Settings,        label: 'Settings'     },
];

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = navItems.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: '#f0f2f8' }}>

      {/* SIDEBAR */}
      <nav style={{
        width: '260px', minWidth: '260px',
        background: 'linear-gradient(160deg, #1e2140 0%, #252849 100%)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #00c896, #00a878)',
              borderRadius: '10px', padding: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Box size={20} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px' }}>CoreInventory</div>
              <div style={{ color: '#6b7aaa', fontSize: '11px', fontWeight: 500 }}>INDUS × ODOO</div>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div style={{ margin: '0 16px 20px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00c896, #0099ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User size={18} color="white" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || user?.email || 'User'}
              </div>
              <div style={{ color: '#00c896', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' }}>
                {user?.role || 'Staff'}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ color: '#4a5278', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', padding: '0 12px', marginBottom: '6px' }}>
            NAVIGATION
          </div>
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px', borderRadius: '10px', cursor: 'pointer',
                  background: active ? 'linear-gradient(135deg, #00c896, #00a878)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}>
                  <Icon size={18} color={active ? 'white' : '#6b7aaa'} />
                  <span style={{
                    color: active ? 'white' : '#8892b8',
                    fontWeight: active ? 700 : 500,
                    fontSize: '13.5px', flex: 1
                  }}>{label}</span>
                  {active && <ChevronRight size={14} color="rgba(255,255,255,0.6)" />}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div style={{ padding: '16px 12px 24px' }}>
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '100%', padding: '11px 14px', borderRadius: '10px',
            background: 'rgba(255,99,99,0.08)', border: 'none', cursor: 'pointer',
            transition: 'background 0.15s'
          }}>
            <LogOut size={18} color="#ff6b6b" />
            <span style={{ color: '#ff6b6b', fontWeight: 600, fontSize: '13.5px' }}>Logout</span>
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          height: '68px', background: 'white',
          borderBottom: '1px solid #e8ebf4',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
        }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a1d2e' }}>
              {currentPage?.label || 'Dashboard'}
            </div>
            <div style={{ fontSize: '12px', color: '#8892b8', fontWeight: 500 }}>
              Welcome back, {user?.full_name || user?.email || 'User'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: '#e8faf3', border: '1px solid #b3f0d8',
              borderRadius: '20px', padding: '5px 12px',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00c896' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#00a878' }}>System Online</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;