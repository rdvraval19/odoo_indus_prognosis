import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Signup = () => {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'staff' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/signup', form);
      login({ email: form.email, role: res.data.role }, res.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <form onSubmit={handleSignup} className="bg-white p-10 rounded-2xl shadow-2xl w-[400px]">
        <h2 className="text-3xl font-bold mb-2 text-slate-800">Create account</h2>
        <p className="text-slate-500 mb-8">Start managing your inventory today.</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" required className="w-full border p-3 rounded-xl outline-blue-600"
              onChange={e => setForm({...form, full_name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required className="w-full border p-3 rounded-xl outline-blue-600"
              onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required className="w-full border p-3 rounded-xl outline-blue-600"
              onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select className="w-full border p-3 rounded-xl outline-blue-600"
              onChange={e => setForm({...form, role: e.target.value})}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
            Create Account
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Sign in</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;