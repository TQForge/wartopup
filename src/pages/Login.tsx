import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google login window was closed before completion. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('The signing in attempt was cancelled.');
      } else {
        setError(err.message || 'Failed to login with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[65vh] flex items-center justify-center py-8 bg-[#F3F7FF]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full flex justify-center">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-100 p-6 space-y-5">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900 ml-1">Login</h1>
          </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm text-sm"
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5">
              <g fill="#000" fillRule="evenodd">
                <path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335" />
                <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c-1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4" />
                <path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05" />
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853" />
                <path fill="none" d="M0 0h18v18H0z" />
              </g>
            </svg>
            Login with Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-gray-400 text-xs">Or sign in with credentials</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 block" style={{ color: '#0B2A5B' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input relative block w-full focus:outline-none border-0 rounded-md placeholder-gray-400 text-sm pl-9 pr-4 py-2.5 shadow-none bg-transparent text-gray-900 ring-1 ring-inset ring-green-300 focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 block" style={{ color: '#0B2A5B' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input relative block w-full focus:outline-none border-0 rounded-md placeholder-gray-400 text-sm pl-9 pr-4 py-2.5 shadow-none bg-transparent text-gray-900 ring-1 ring-inset ring-green-300 focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            {error && <p className="text-primary text-xs text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-primary-start to-primary-end text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50 text-sm"
            >
              {loading ? 'Processing...' : 'Login'}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            New user to WarTopUp?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Register
            </Link>{' '}
            Now.
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
