import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Box } from 'lucide-react';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login({ email, role: res.data.role, full_name: res.data.full_name }, res.data.access_token);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f2f8' }}>

      {/* Left Panel */}
      <div style={{
        width: '420px', minWidth: '420px',
        background: 'linear-gradient(160deg, #1e2140 0%, #252849 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #00c896, #00a878)', borderRadius: '10px', padding: '8px' }}>
            <Box size={20} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '15px' }}>CoreInventory</div>
            <div style={{ color: '#6b7aaa', fontSize: '11px' }}>INDUS × ODOO</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '38px', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '16px' }}>
            Manage your<br />
            <span style={{ color: '#00c896' }}>inventory</span><br />
            smarter.
          </div>
          <div style={{ color: '#6b7aaa', fontSize: '14px', lineHeight: 1.7 }}>
            Real-time stock tracking, receipts, deliveries, and adjustments — all in one place.
          </div>
        </div>
        <div style={{ color: '#4a5278', fontSize: '12px' }}>© 2025 CoreInventory · INDUS × ODOO Hackathon</div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '36px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1a1d2e', marginBottom: '6px' }}>Welcome back</div>
            <div style={{ fontSize: '14px', color: '#8892b8' }}>Sign in to your account to continue</div>
          </div>

          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', color: '#cc3333', fontSize: '13px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4a5278', marginBottom: '6px' }}>Email address</label>
              <input type="email" required placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e0e4f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none', transition: 'border 0.15s' }}
                onFocus={e => e.target.style.border = '1.5px solid #00c896'}
                onBlur={e => e.target.style.border = '1.5px solid #e0e4f0'}
                onChange={e => setEmail(e.target.value)} />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4a5278', marginBottom: '6px' }}>Password</label>
              <input type="password" required placeholder="••••••••"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e0e4f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none', transition: 'border 0.15s' }}
                onFocus={e => e.target.style.border = '1.5px solid #00c896'}
                onBlur={e => e.target.style.border = '1.5px solid #e0e4f0'}
                onChange={e => setPassword(e.target.value)} />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: '#00c896', fontWeight: 600, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #00c896, #00a878)',
              border: 'none', color: 'white', fontWeight: 800, fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit', letterSpacing: '0.3px'
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#8892b8' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#00c896', fontWeight: 700, textDecoration: 'none' }}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;