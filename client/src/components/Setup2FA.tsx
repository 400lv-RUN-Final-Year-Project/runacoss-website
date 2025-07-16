import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface Setup2FAProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const Setup2FA: React.FC<Setup2FAProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'success'>('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 2FA setup data
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');

  // Verification
  const [token, setToken] = useState('');

  useEffect(() => {
    if (step === 'setup') {
      handleSetup2FA();
    }
  }, []);

  const handleSetup2FA = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.setup2FA();
      
      if (response.success) {
        setQrCode(response.qrCode || '');
        setSecret(response.secret || '');
        setOtpauthUrl(response.otpauthUrl || '');
      } else {
        setError(response.message || 'Failed to setup 2FA');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyAndEnable2FA(token);
      
      if (response.success) {
        setStep('success');
        setSuccess('2FA enabled successfully!');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(response.message || 'Failed to verify 2FA');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              2FA Setup Complete!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {success}
            </p>
            <div className="mt-4">
              <button
                onClick={onSuccess}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'setup' ? 'Setup Two-Factor Authentication' : 'Verify 2FA'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'setup' 
              ? 'Scan the QR code with your authenticator app'
              : 'Enter the 6-digit code from your authenticator app'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {step === 'setup' ? (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Setting up 2FA...</p>
              </div>
            ) : (
              <>
                {qrCode && (
                  <div className="text-center">
                    <img 
                      src={qrCode} 
                      alt="2FA QR Code" 
                      className="mx-auto border-2 border-gray-300 rounded-lg"
                    />
                    <p className="mt-2 text-sm text-gray-600">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>
                )}

                {secret && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Manual Entry (if QR code doesn't work)
                    </h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={secret}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono bg-white"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(secret)}
                        className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep('verify')}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    I've Added the Code
                  </button>
                  <button
                    onClick={onCancel}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerify2FA}>
            <div>
              <label htmlFor="token" className="sr-only">
                2FA Token
              </label>
              <input
                id="token"
                name="token"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter 6-digit code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                maxLength={6}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('setup')}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Back to Setup
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Setup2FA; 