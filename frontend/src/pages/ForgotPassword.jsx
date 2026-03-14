import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send OTP — also validates email exists in DB
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[420px]">
        
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step > s ? 'bg-green-500 text-white' : step === s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`h-1 w-8 rounded ${step > s ? 'bg-green-500' : 'bg-gray-200'}`}/>}
            </div>
          ))}
          <span className="ml-2 text-sm text-slate-500">
            {step === 1 ? 'Enter email' : step === 2 ? 'Verify OTP' : step === 3 ? 'New password' : 'Done'}
          </span>
        </div>

        <h2 className="text-3xl font-bold mb-2 text-slate-800">Reset Password</h2>

        {/* Step 1 - Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5 mt-6">
            <p className="text-slate-500 text-sm">Enter your registered email address.</p>
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required
                className="w-full border p-3 rounded-xl outline-blue-600"
                onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2 - OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 mt-6">
            {message && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-blue-700 text-sm">{message}</p>
                <p className="text-blue-500 text-xs mt-1">Check the uvicorn terminal for the OTP code.</p>
              </div>
            )}
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium mb-1">Enter 6-digit OTP</label>
              <input type="text" required maxLength={6} placeholder="• • • • • •"
                className="w-full border p-3 rounded-xl outline-blue-600 text-center text-2xl tracking-[0.5em]"
                onChange={e => setOtp(e.target.value)} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" onClick={() => { setStep(1); setError(''); setMessage(''); }}
              className="w-full text-slate-500 text-sm hover:underline">
              ← Use different email
            </button>
          </form>
        )}

        {/* Step 3 - New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5 mt-6">
            <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">✓ OTP verified! Set your new password.</p>
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" required minLength={6}
                className="w-full border p-3 rounded-xl outline-blue-600"
                onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input type="password" required
                className="w-full border p-3 rounded-xl outline-blue-600"
                onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Step 4 - Success */}
        {step === 4 && (
          <div className="mt-6 text-center space-y-4">
            <div className="text-6xl">✅</div>
            <p className="text-green-600 font-semibold text-lg">Password reset successful!</p>
            <p className="text-slate-500 text-sm">You can now login with your new password.</p>
            <button onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
              Go to Login
            </button>
          </div>
        )}

        {step < 4 && (
          <p className="text-center text-sm text-slate-500 mt-6">
            <Link to="/login" className="text-blue-600 font-semibold">← Back to Login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;