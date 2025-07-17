import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

const AdminVerify: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const urlToken = params.get('token');
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Link-based verification
  useEffect(() => {
    if (urlToken) {
      setLoading(true);
      adminApi.auth.verifyEmail({ token: urlToken })
        .then(() => {
          setSuccess(true);
          setTimeout(() => navigate('/admin/login'), 2000);
        })
        .catch((err: any) => {
          setError(err.message || 'Verification failed');
        })
        .finally(() => setLoading(false));
    }
  }, [urlToken, navigate]);

  // Fallback: code/email form (if needed)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminApi.auth.verify({ email, code });
      setSuccess(true);
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    }
    setLoading(false);
  };

  if (urlToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Admin Verification</h2>
          {loading && <div className="text-primary">Verifying...</div>}
          {success && <div className="text-green-600">Verification successful! Redirecting to login...</div>}
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
      </div>
    );
  }

  // Fallback: code/email form (if no token in URL)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-primary mb-4">Admin Verification</h2>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600">Verification successful! Redirecting to login...</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Verification Code"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition-colors"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
};

export default AdminVerify; 