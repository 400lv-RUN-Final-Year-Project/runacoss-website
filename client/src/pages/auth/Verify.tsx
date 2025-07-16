import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Add API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export default function Verify() {
  console.log('Verify page loaded');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get email/password from state or sessionStorage
  const state = location.state || {};
  const [email, setEmail] = useState(state.email || sessionStorage.getItem('pendingEmail') || '');
  const [password, setPassword] = useState(state.password || sessionStorage.getItem('pendingPassword') || '');
  const [info, setInfo] = useState(state.info || sessionStorage.getItem('pendingInfo') || 'Check your mail for verification code.');

  // On mount, check for email and set loading false
  useEffect(() => {
    if (!email) {
      setLoading(false);
    } else {
      // Store in sessionStorage for refreshes
      sessionStorage.setItem('pendingEmail', email);
      if (password) sessionStorage.setItem('pendingPassword', password);
      if (info) sessionStorage.setItem('pendingInfo', info);
      setLoading(false);
    }
  }, [email, password, info]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        // Clear sessionStorage on success
        sessionStorage.removeItem('pendingEmail');
        sessionStorage.removeItem('pendingPassword');
        sessionStorage.removeItem('pendingInfo');
        navigate('/login', { state: { email, password } });
      } else {
        const data = await res.json();
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Could not reach the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('Resending code...');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInfo('A new code has been sent to your email.');
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('Could not reach the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  // Only redirect to signup if no email is available at all
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <div className="text-red-600 font-semibold mb-4">No email found. Please sign up first.</div>
          <button
            onClick={() => navigate('/signup')}
            className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Go to Signup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">{info || 'Check your mail for verification code.'}</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm border-gray-300"
                  placeholder="Enter 6-digit code"
                  disabled={loading}
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 text-red-600 text-sm text-center" role="alert" aria-live="assertive" id="verify-error">
                <p>{error}</p>
                {error === 'Invalid or expired code' ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setCode('')}
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      className="w-full flex justify-center py-2 px-4 border border-primary rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Resend Code
                    </button>
                  </div>
                ) : null}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={loading}
              >
                Verify
              </button>
              <button
                type="button"
                onClick={handleResend}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={loading}
              >
                Resend Code
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 