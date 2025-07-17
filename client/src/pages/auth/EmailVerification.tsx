import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>((searchParams.get('token') ? 'loading' : 'loading'));
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState<string>(
    (location.state && location.state.verificationToken) || searchParams.get('token') || ''
  );

  // Show the code if available (for user convenience)
  const showCode = location.state?.verificationToken;

  // If token is present in URL, auto-verify
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (typeof urlToken === 'string' && urlToken) {
      handleVerify(urlToken);
    }
    // eslint-disable-next-line
  }, []);

  const handleVerify = async (inputToken?: string) => {
    setVerificationStatus('loading');
    setErrorMessage('');
    const verifyToken = inputToken || token;
    if (!verifyToken) {
      setVerificationStatus('error');
      setErrorMessage('Please enter the verification code sent to your email.');
      return;
    }
    try {
      const { authApi } = await import('../../services/api');
      await authApi.verifyEmail(verifyToken);
      setVerificationStatus('success');
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  const handleRetry = () => {
    setVerificationStatus('loading');
    setErrorMessage('');
    // Reload the page to retry verification
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/home" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              RUNA<span className="text-secondary">COSS</span>
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {verificationStatus === 'loading' && (
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-sm text-gray-600">
                Verifying your email address...
              </p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <HiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Email verified successfully!
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Your email address has been verified. You can now sign in to your account.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Continue to Sign In
                </button>
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <HiXCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Verification failed
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {errorMessage || 'There was an error verifying your email address.'}
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Go to Sign In
                </button>
              </div>
            </div>
          )}

          {verificationStatus !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {showCode && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-blue-800 text-sm text-center">
                  <strong>Your verification code:</strong> <span className="font-mono">{showCode}</span>
                  <br />
                  (You can copy and paste this code, or use the link in your email)
                </div>
              )}
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                  Enter Verification Code
                </label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Paste the code from your email"
                  required
                />
              </div>
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-md p-2 text-red-600 text-sm">
                  {errorMessage}
                </div>
              )}
              <div>
                <button
                  type="submit"
                  disabled={verificationStatus === 'loading'}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {verificationStatus === 'loading' ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                Didn’t get a code? Check your spam folder or request a new one from the registration page.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 