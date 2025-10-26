
import React, { useState } from 'react';

const Login = ({ onLogin, onSwitchToRegister = () => {}, onSwitchToForgot = () => {} }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLogin(data);
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
          <h1 className="text-3xl font-bold text-blue-700 mb-1">Tenant Management</h1>
          <p className="text-gray-500">Sign in to your account</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="text-right mt-2">
            <button type="button" className="text-blue-600 hover:underline text-xs" onClick={onSwitchToForgot}>Forgot Password?</button>
          </div>
        </form>
        <div className="mt-6 text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <button className="text-blue-600 hover:underline" type="button" onClick={onSwitchToRegister}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
