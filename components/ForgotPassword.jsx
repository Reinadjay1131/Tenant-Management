import React, { useState } from 'react';

const ForgotPassword = ({ onRequestReset, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessage('If the username exists, a reset link will be sent.');
      if (onRequestReset) onRequestReset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src="/zenith-logo-png_seeklogo-479185.png" alt="Logo" className="w-16 h-16 mb-2 rounded-full bg-white" />
          <h1 className="text-3xl font-bold text-blue-700 mb-1">Reset Password</h1>
          <p className="text-gray-500">Enter your username to request a password reset</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter your username"
              autoFocus
            />
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          {message && <div className="text-green-600 text-sm text-center">{message}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Requesting...' : 'Request Reset'}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-gray-400">
          Remembered your password?{' '}
          <button className="text-blue-600 hover:underline" onClick={onSwitchToLogin}>Sign in</button>
        </div>
        <div className="mt-2 text-center text-xs text-gray-400">NOYB FUNDAMENTALS 2025 ©</div>
      </div>
    </div>
  );
};

export default ForgotPassword;
