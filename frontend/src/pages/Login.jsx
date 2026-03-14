import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login({ email, role: res.data.role }, res.data.access_token);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-2xl shadow-2xl w-[400px]">
        <h2 className="text-3xl font-bold mb-2 text-slate-800">Welcome back</h2>
        <p className="text-slate-500 mb-8">Please enter your details to sign in.</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required className="w-full border p-3 rounded-xl outline-blue-600"
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required className="w-full border p-3 rounded-xl outline-blue-600"
              onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;