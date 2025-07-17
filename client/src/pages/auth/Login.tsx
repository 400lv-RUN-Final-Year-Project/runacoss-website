import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { FaGoogle } from 'react-icons/fa';
import runacossLogo from '../../assets/icons/runacossLogo.svg?url';

const AuthPage = () => {
  console.log('Login page loaded');
  const location = useLocation();
  // Default to register form as landing
  const [isLogin, setIsLogin] = useState(false);

  // Prefill from location.state if present
  const prefill = location.state || {};
  const [email, setEmail] = useState(prefill.email || '');
  const [password, setPassword] = useState(prefill.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [loginFormErrors, setLoginFormErrors] = useState<{ email?: string; password?: string; unverified?: boolean }>({});
  const [showResend, setShowResend] = useState(false);

  // Register form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    matricNumber: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerFormErrors, setRegisterFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    matricNumber?: string;
    department?: string;
  }>({});

  const { login, register, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  const [unverified] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  // Handle route changes
  useEffect(() => {
    setIsLogin(location.pathname === '/register' ? false : true);
  }, [location.pathname]);

  // Redirect to dashboard if user is already verified
  useEffect(() => {
    if (user && user.isVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Login form validation
  const validateLoginForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = 'Email or Matric Number is required';
    } else {
      // Strictly allow only the correct RUN email or matric number (case-insensitive)
      const emailRegex = /^[a-z]+\d{5}@run\.edu\.ng$/i;
      const matricRegex = /^RUN\/(CSC|CYB|IFT)\/[0-9]{2}\/[0-9]{5}$/i;
      if (!emailRegex.test(email.trim()) && !matricRegex.test(email.trim())) {
        errors.email = 'Enter a valid RUN email (lastnamefivedigit@run.edu.ng) or matric number (RUN/CSC/YY/12345, RUN/CYB/YY/12345, RUN/IFT/YY/12345), case-insensitive.';
      }
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setLoginFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Register form validation
  const validateRegisterForm = () => {
    const errors: typeof registerFormErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setRegisterFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoginFormErrors({});
    setShowResend(false);
    if (!validateLoginForm()) return;
    setLoadingForm(true);
    try {
      // Await login, which sets user context and stores token
      await login(email, password);
      // Redirect to intended page or dashboard
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
      // Clear pending verification session data on successful login
      sessionStorage.removeItem('pendingEmail');
      sessionStorage.removeItem('pendingPassword');
      sessionStorage.removeItem('pendingInfo');
    } catch (err: any) {
      // Map backend error code to field
      if (err && typeof err === 'object' && err.code) {
        switch (err.code) {
          case 'ERR_USER_NOT_FOUND':
            setLoginFormErrors({ email: err.error || 'User does not exist' });
            break;
          case 'ERR_EMAIL_NOT_VERIFIED':
            setLoginFormErrors({ email: err.error || 'Email not verified. Please check your email for the verification code.', unverified: true });
            setShowResend(true);
            break;
          case 'ERR_INCORRECT_PASSWORD':
            setLoginFormErrors({ password: err.error || 'Incorrect password' });
            break;
          default:
            setLoginFormErrors({ email: err.error || 'Login failed. Please try again.' });
        }
      } else {
        setLoginFormErrors({ email: (err && err.message) || 'Login failed. Please try again.' });
      }
    } finally {
      setLoadingForm(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    setLoginFormErrors({});
    setShowResend(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLoginFormErrors({ email: 'A new verification code has been sent to your email.' });
      } else {
        setLoginFormErrors({ email: data.error || 'Failed to resend code.' });
      }
    } catch (err) {
      setLoginFormErrors({ email: 'Could not reach the server. Please try again later.' });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateRegisterForm()) return;

    setLoadingForm(true);
    try {
      const response = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        matricNumber: formData.matricNumber || '',
        department: formData.department || '',
        password: formData.password
      });
      // On success, redirect to /verify and store credentials
      if (response && response.redirectTo === '/verify') {
        sessionStorage.setItem('pendingEmail', formData.email);
        sessionStorage.setItem('pendingPassword', formData.password);
        sessionStorage.setItem('pendingInfo', 'Check your mail for verification code.');
        navigate('/verify', {
          state: {
            email: formData.email,
            password: formData.password,
            info: 'Check your mail for verification code.'
          }
        });
      }
      // Optionally clear the form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        matricNumber: '',
        department: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setRegisterFormErrors({ email: 'Registration failed. Please try again.' });
    } finally {
      setLoadingForm(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (registerFormErrors[name as keyof typeof registerFormErrors]) {
      setRegisterFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSocialLogin = (provider: string) => {
    let url = '';
    if (provider === 'Gmail') {
      url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/auth/google`;
    }
    if (url) {
      window.open(url, '_self');
    }
  };

  // Handle /oauth-success?token=... on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (window.location.pathname === '/oauth-success' && token) {
      localStorage.setItem('accessToken', token);
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <Link to="/" className="flex items-center gap-2 text-3xl font-extrabold text-primary select-none mb-8 mt-8">
        <img src={runacossLogo} alt="RUNACOSS Logo" className="w-10 h-10" />
        RUNA<span className="text-secondary">COSS</span>
      </Link>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
            User Login
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            Access the RUNACOSS user dashboard
          </p>
          {/* Register Form (default landing) */}
          {!isLogin && (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                {/* Name Fields */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <div className="mt-1">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${registerFormErrors.firstName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter your first name"
                      />
                      {registerFormErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{registerFormErrors.firstName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <div className="mt-1">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${registerFormErrors.lastName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter your last name"
                      />
                      {registerFormErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{registerFormErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${registerFormErrors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter your email"
                    />
                    {registerFormErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{registerFormErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Matric Number Field */}
                <div>
                  <label htmlFor="register-matricNumber" className="block text-sm font-medium text-gray-700">
                    Matric Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="register-matricNumber"
                      name="matricNumber"
                      type="text"
                      autoComplete="off"
                      required
                      value={formData.matricNumber}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${registerFormErrors.matricNumber ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="e.g., RUN/CSC/24/12345"
                    />
                    {registerFormErrors.matricNumber && (
                      <p className="mt-1 text-sm text-red-600">{registerFormErrors.matricNumber}</p>
                    )}
                  </div>
                </div>
                {/* Department Field */}
                <div>
                  <label htmlFor="register-department" className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <div className="mt-1">
                    <select
                      id="register-department"
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${registerFormErrors.department ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      <option value="">Select your department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Information Technology">Information Technology</option>
                    </select>
                    {registerFormErrors.department && (
                      <p className="mt-1 text-sm text-red-600">{registerFormErrors.department}</p>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="register-password"
                      name="password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${registerFormErrors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <HiEyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <HiEye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {registerFormErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{registerFormErrors.password}</p>
                    )}
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${registerFormErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <HiEyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <HiEye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {registerFormErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{registerFormErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loadingForm}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingForm ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="small" color="white" />
                        <span className="ml-2">Registering...</span>
                      </div>
                    ) : (
                      'Register'
                    )}
                  </button>
                </div>
              </form>
              {/* Already have an account? Login */}
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600">Already have an account?</span>
                <button
                  onClick={() => setIsLogin(true)}
                  className="ml-2 font-medium text-primary hover:text-primary/80"
                >
                  Login
                </button>
              </div>
              {/* Social login buttons */}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Gmail')}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50"
                >
                  <FaGoogle className="text-lg" />
                  Login with Gmail
                </button>
              </div>
            </>
          )}

          {/* Login Form */}
          {isLogin && (
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              {/* Error Message */}
              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                  Email or Matric Number
                </label>
                <div className="mt-1">
                  <input
                    id="login-email"
                    name="email"
                    type="text"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${loginFormErrors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter your RUN email or matric number"
                  />
                  {loginFormErrors.email && (
                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive" id="login-email-error">{loginFormErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${loginFormErrors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <HiEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <HiEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {loginFormErrors.password && (
                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive" id="login-password-error">{loginFormErrors.password}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loadingForm}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingForm ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="small" color="white" />
                      <span className="ml-2">Signing in...</span>
                    </div>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>
              {/* Back to register link */}
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600">Don't have an account?</span>
                <button
                  onClick={() => setIsLogin(false)}
                  className="ml-2 font-medium text-primary hover:text-primary/80"
                >
                  Register
                </button>
              </div>
              {/* Show resend code button if user is unverified */}
              {showResend && (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="w-full flex justify-center py-2 px-4 border border-primary rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mt-2"
                  disabled={loadingForm}
                >
                  Resend Verification Code
                </button>
              )}
            </form>
          )}

          {unverified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4 text-yellow-800 text-sm text-center">
              Your account is not verified. Please check your email for the verification code.
            </div>
          )}

          {/* Help Section - Only show for login form */}
          {isLogin && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Need help?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 