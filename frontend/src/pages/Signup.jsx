import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box } from 'lucide-react';
import api from '../api/axios';

const Signup = () => {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'staff' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/signup', form);
      login({ email: form.email, role: res.data.role, full_name: form.full_name }, res.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: '1.5px solid #e0e4f0', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none', transition: 'border 0.15s'
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
            Join your<br />
            <span style={{ color: '#00c896' }}>team</span><br />
            today.
          </div>
          <div style={{ color: '#6b7aaa', fontSize: '14px', lineHeight: 1.7 }}>
            Create your account and start managing inventory operations instantly.
          </div>
        </div>
        <div style={{ color: '#4a5278', fontSize: '12px' }}>© 2025 CoreInventory · INDUS × ODOO Hackathon</div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1a1d2e', marginBottom: '6px' }}>Create account</div>
            <div style={{ fontSize: '14px', color: '#8892b8' }}>Fill in your details to get started</div>
          </div>

          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', color: '#cc3333', fontSize: '13px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4a5278', marginBottom: '6px' }}>Full Name</label>
              <input type="text" required placeholder="Your full name" style={inputStyle}
                onFocus={e => e.target.style.border='1.5px solid #00c896'}
                onBlur={e => e.target.style.border='1.5px solid #e0e4f0'}
                onChange={e => setForm({...form, full_name: e.target.value})} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4a5278', marginBottom: '6px' }}>Email address</label>
              <input type="email" required placeholder="you@example.com" style={inputStyle}
                onFocus={e => e.target.style.border='1.5px solid #00c896'}
                onBlur={e => e.target.style.border='1.5px solid #e0e4f0'}
                onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4a5278', marginBottom: '6px' }}>Password</label>
              <input type="password" required placeholder="Min 6 characters" style={inputStyle}
                onFocus={e => e.target.style.border='1.5px solid #00c896'}
                onBlur={e => e.target.style.border='1.5px solid #e0e4f0'}
                onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4a5278', marginBottom: '6px' }}>Role</label>
              <select style={{...inputStyle, background: 'white'}}
                onFocus={e => e.target.style.border='1.5px solid #00c896'}
                onBlur={e => e.target.style.border='1.5px solid #e0e4f0'}
                onChange={e => setForm({...form, role: e.target.value})}>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #00c896, #00a878)',
              border: 'none', color: 'white', fontWeight: 800, fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit'
            }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#8892b8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#00c896', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;