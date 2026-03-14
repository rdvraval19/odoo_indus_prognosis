import { Link } from 'react-router-dom';
import { Warehouse, MapPin, ChevronRight, Settings as SettingsIcon } from 'lucide-react';

const items = [
  { to: '/settings/warehouses', icon: Warehouse, label: 'Warehouses', desc: 'Add, edit and delete warehouse locations', color: '#00c896', count: null },
  { to: '/settings/locations',  icon: MapPin,    label: 'Locations',  desc: 'Manage storage racks and bins within warehouses', color: '#7c6ff7', count: null },
];

export default function Settings() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <SettingsIcon size={20} color="#8892b8" />
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1d2e' }}>Settings</div>
      </div>
      <div style={{ fontSize: '13px', color: '#8892b8', marginBottom: '32px' }}>
        Configure your warehouses and storage locations
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px' }}>
        {items.map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white', borderRadius: '14px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px',
              cursor: 'pointer', transition: 'all 0.15s', border: '1px solid transparent'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.boxShadow = `0 4px 20px ${color}18`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ background: `${color}15`, borderRadius: '12px', padding: '14px', flexShrink: 0 }}>
                <Icon size={22} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: '15px', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: '#8892b8' }}>{desc}</div>
              </div>
              <ChevronRight size={18} color="#c8cde0" />
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '40px', padding: '16px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e8ebf4', maxWidth: '520px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#4a5278', marginBottom: '6px' }}>💡 TIP</div>
        <div style={{ fontSize: '12px', color: '#8892b8', lineHeight: 1.6 }}>
          Create warehouses first, then add locations inside them. Locations are used in transfers to track exactly where stock is stored.
        </div>
      </div>
    </div>
  );
}