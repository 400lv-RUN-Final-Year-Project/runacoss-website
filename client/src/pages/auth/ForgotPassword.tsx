import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import runacossLogo from '../../assets/icons/runacossLogo.svg?url';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const validateInput = (input: string) => {
    // RUN email: lastnamefivedigit@run.edu.ng
    const emailRegex = /^[a-z]+\d{5}@run\.edu\.ng$/i;
    // Matric: RUN/CSC/YY/12345, RUN/CYB/YY/12345, RUN/IFT/YY/12345
    const matricRegex = /^RUN\/(CSC|CYB|IFT)\/[0-9]{2}\/[0-9]{5}$/i;
    return emailRegex.test(input.trim()) || matricRegex.test(input.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    if (!validateInput(email)) {
      setLoading(false);
      setError('Enter a valid RUN email (lastnamefivedigit@run.edu.ng) or matric number (RUN/CSC/YY/12345, RUN/CYB/YY/12345, RUN/IFT/YY/12345), case-insensitive.');
      return;
    }
    try {
      const response = await authApi.forgotPassword(email);
      if (response.success) {
        setSuccess('Password reset email sent! Please check your inbox.');
      } else {
        setError(response.error || 'Failed to send reset email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <Link to="/" className="flex items-center gap-2 text-3xl font-extrabold text-primary select-none mb-8 mt-8">
        <img src={runacossLogo} alt="RUNACOSS Logo" className="w-10 h-10" />
        RUNA<span className="text-secondary">COSS</span>
      </Link>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm border-gray-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-2 text-green-700 text-sm text-center">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            <Link to="/login" className="text-primary hover:text-primary/80">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 