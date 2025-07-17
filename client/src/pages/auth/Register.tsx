import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import runacossLogo from '../../assets/icons/runacossLogo.svg?url';

const Register = () => {
  console.log('Register page loaded');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    matricNumber: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    matricNumber?: string;
    department?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const departmentOptions = [
    'Computer Science',
    'Cyber Security',
    'Information Technology',
  ];

  const validateForm = () => {
    const errors: typeof formErrors = {};
    
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
    } else {
      // Email must be: lastname + last 5 digits of matric number + @run.edu.ng (case-insensitive)
      const matricMatch = formData.matricNumber.trim().match(/^RUN\/(CSC|CYB|IFT)\/[0-9]{2}\/[0-9]{5}$/i);
      if (!matricMatch) {
        errors.email = 'Enter a valid matric number first (RUN/CSC/YY/12345, RUN/CYB/YY/12345, or RUN/IFT/YY/12345).';
      } else {
        const lastName = formData.lastName.trim().toLowerCase();
        const lastFiveDigits = formData.matricNumber.trim().slice(-5);
        const expectedEmail = `${lastName}${lastFiveDigits}@run.edu.ng`;
        if (formData.email.trim().toLowerCase() !== expectedEmail) {
          errors.email = `Email must be ${expectedEmail} (case-insensitive)`;
        }
      }
    }
    
    if (!formData.matricNumber.trim()) {
      errors.matricNumber = 'Matric number is required';
    } else if (!/^RUN\/(CSC|CYB|IFT)\/[0-9]{2}\/[0-9]{5}$/i.test(formData.matricNumber.trim())) {
      errors.matricNumber = 'Matric number must be RUN/CSC/YY/12345, RUN/CYB/YY/12345, or RUN/IFT/YY/12345 (case-insensitive).';
    }
    
    if (!formData.department) {
      errors.department = 'Department is required';
    } else if (!departmentOptions.includes(formData.department)) {
      errors.department = 'Select a valid department';
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
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) return;
    
    try {
      const response = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        matricNumber: formData.matricNumber.trim(),
        department: formData.department,
        password: formData.password
      });
      if (response && response.redirectTo === '/verify') {
        sessionStorage.setItem('pendingEmail', formData.email);
        sessionStorage.setItem('pendingPassword', formData.password);
        navigate('/verify', { state: { email: formData.email, password: formData.password } });
      } else {
        setFormErrors(prev => ({ ...prev, general: 'User not created' }));
      }
    } catch (err: any) {
      // Map backend error code to field
      if (err && typeof err === 'object' && err.code) {
        switch (err.code) {
          case 'ERR_INVALID_DEPARTMENT':
            setFormErrors(prev => ({ ...prev, department: err.error || 'Invalid department' }));
            break;
          case 'ERR_INVALID_MATRIC':
            setFormErrors(prev => ({ ...prev, matricNumber: err.error || 'Invalid matric number' }));
            break;
          case 'ERR_INVALID_EMAIL':
            setFormErrors(prev => ({ ...prev, email: err.error || 'Invalid email' }));
            break;
          case 'ERR_EMAIL_EXISTS':
            setFormErrors(prev => ({ ...prev, email: err.error || 'Email already exists' }));
            break;
          case 'ERR_MATRIC_EXISTS':
            setFormErrors(prev => ({ ...prev, matricNumber: err.error || 'Matric number already exists' }));
            break;
          default:
            setFormErrors(prev => ({ ...prev, general: err.error || 'User not created' }));
        }
      } else {
        setFormErrors(prev => ({ ...prev, general: 'User not created' }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <Link to="/" className="flex items-center gap-2 text-3xl font-extrabold text-primary select-none mb-8 mt-8">
        <img src={runacossLogo} alt="RUNACOSS Logo" className="w-10 h-10" />
        RUNA<span className="text-secondary">COSS</span>
      </Link>
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
            Register User
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            Access the RUNACOSS user dashboard
          </p>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {formErrors.general && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{formErrors.general}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                      formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your first name"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive" id="firstName-error">{formErrors.firstName}</p>
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
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                      formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your last name"
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive" id="lastName-error">{formErrors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Email Field */}
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
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive" id="email-error">{formErrors.email}</p>
                )}
              </div>
            </div>

            {/* Matric Number Field */}
            <div>
              <label htmlFor="matricNumber" className="block text-sm font-medium text-gray-700">
                Matric Number
              </label>
              <div className="mt-1">
                <input
                  id="matricNumber"
                  name="matricNumber"
                  type="text"
                  autoComplete="off"
                  required
                  value={formData.matricNumber}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                    formErrors.matricNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., RUN/CSC/24/12345"
                />
                {formErrors.matricNumber && (
                  <p className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive" id="matricNumber-error">{formErrors.matricNumber}</p>
                )}
              </div>
            </div>

            {/* Department Field */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <div className="mt-1">
                <select
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                    formErrors.department ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {formErrors.department && (
                  <p className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive" id="department-error">{formErrors.department}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
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
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive" id="password-error">{formErrors.password}</p>
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
                  className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                    formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
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
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive" id="confirmPassword-error">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="small" color="white" />
                    <span className="ml-2">Creating account...</span>
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          {/* Social Login Buttons */}
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-3">
              {/* Login with Gmail */}
              <button
                type="button"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                // onClick={handleGmailLogin}
              >
                {/* Gmail Icon */}
                Login with Gmail
              </button>
              {/* Login with LinkedIn */}
              <button
                type="button"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                // onClick={handleLinkedInLogin}
              >
                {/* LinkedIn Icon */}
                Login with LinkedIn
              </button>
            </div>
          </div>

          {/* Remove the icon and the bottom login with email button here. Leave the terms/privacy links. */}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">By creating an account, you agree to our</span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <Link
                to="/terms"
                className="text-primary hover:text-primary/80"
              >
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link
                to="/privacy"
                className="text-primary hover:text-primary/80"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 