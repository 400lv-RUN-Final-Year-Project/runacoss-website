import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiArrowLeft, HiCreditCard, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import Logo from '../../assets/icons/runacossLogo.svg?url';
import { paymentApi } from '../../services/paymentApi';
import Navbar from '../../componentLibrary/NavBar';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  console.log("[DEBUG] PaymentPage loaded. User:", user);
  
  // Load Paystack script
  useEffect(() => {
    const loadPaystack = () => {
      if ((window as any).PaystackPop) {
        console.log('Paystack already loaded');
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        console.log('Paystack script loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Paystack script');
        setError('Failed to load payment gateway. Please refresh the page.');
      };
      document.head.appendChild(script);
    };
    
    loadPaystack();
  }, []);
  const [amount, setAmount] = useState('10000');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  // Remove all input fields for name, email, matric number, and department
  // Use user context for all these values
  const name = user ? `${user.firstName} ${user.lastName}` : '';
  const email = user?.email || '';
  const matricNumber = user?.matricNumber || '';
  const department = user?.department || '';

  // Only one payment type: RUNACOSS Dues
  const paymentType = 'runacoss_dues';
  const paymentTypeName = 'RUNACOSS Dues';

  // Pre-fill name and email from user context if available
  // const name = user ? `${user.firstName} ${user.lastName}` : '';
  // const email = user?.email || '';

  const onSuccess = async (reference: any) => {
    try {
      console.log('Paystack callback response:', reference);
      
      // Verify payment with backend
      const response = await paymentApi.verifyPayment({
        reference: reference.reference,
        amount: parseInt(amount),
        paymentType: paymentType,
        userId: user?._id || '',
        matricNumber,
        department,
      });
      
      console.log('Backend verifyPayment response:', response);
      
      if (response.success) {
        setSuccess(true);
        setLoading(false);
        
        // Send receipt email
        try {
          await sendReceiptEmail(reference.reference);
        } catch (emailError) {
          console.error('Failed to send receipt email:', emailError);
          // Don't fail the payment if email fails
        }
        
        // Navigate to success page
        navigate('/payment/success');
      } else {
        setError('Payment verification failed: ' + (response.error || 'Unknown error'));
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError('Payment verification failed. Please contact support.');
      setLoading(false);
    }
  };

  const onClose = () => {
    setError('Payment was cancelled');
  };

  const sendReceiptEmail = async (reference: string) => {
    try {
      await paymentApi.sendReceipt({
        reference,
        email,
        amount: parseInt(amount),
        paymentType: paymentTypeName,
        studentName: name,
        matricNumber,
        department,
      });
    } catch (err) {
      console.error('Failed to send receipt email:', err);
    }
  };

  const departmentOptions = [
    'Computer Science',
    'Cyber Security',
    'Information Technology',
  ];

  const [formErrors, setFormErrors] = useState<{
    email?: string;
    matricNumber?: string;
    department?: string;
    general?: string;
  }>({});
  const [inputEmail, setInputEmail] = useState(email);

  // Email and department validation logic (copied from Register.tsx)
  // Remove all input fields for name, email, matric number, and department
  // Use user context for all these values
  const validateForm = () => {
    const amt = parseInt(amount);
    if (!amount || amt <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (amt < 5000) {
      setError('Minimum payment amount is ₦5,000');
      return false;
    }
    if (amt > 15000) {
      setError('Maximum payment amount is ₦15,000');
      return false;
    }
    setError('');
    return true;
  };

  // Mock payment function for development/testing
  const handleMockPayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock payment response
      const mockResponse = {
        reference: `MOCK_${Date.now()}`,
        status: 'success',
        amount: parseInt(amount) * 100,
        currency: 'NGN'
      };
      
      console.log('Mock payment successful:', mockResponse);
      await onSuccess(mockResponse);
    } catch (error) {
      console.error('Mock payment error:', error);
      setError('Mock payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!validateForm()) return;
    
    // Check if Paystack is loaded
    if (!(window as any).PaystackPop) {
      setError('Payment gateway is still loading. Please wait a moment and try again.');
      return;
    }
    
    // Check if Paystack key is configured
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey || paystackKey === 'pk_test_your_public_key_here') {
      // For development/testing, use a mock payment flow
      console.log('Paystack key not configured, using mock payment flow');
      handleMockPayment();
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Initialize Paystack payment
      const handler = (window as any).PaystackPop.setup({
        key: paystackKey,
        email: email,
        amount: parseInt(amount) * 100,
        currency: 'NGN',
        ref: new Date().getTime().toString(),
        callback: function(response: any) {
          console.log('Paystack callback fired:', response);
          onSuccess(response);
        },
        onClose: function() {
          console.log('Paystack payment closed');
          onClose();
        },
        metadata: {
          custom_fields: [
            {
              display_name: "Student Name",
              variable_name: "student_name",
              value: name
            },
            {
              display_name: "Matric Number",
              variable_name: "matric_number",
              value: matricNumber
            },
            {
              display_name: "Department",
              variable_name: "department",
              value: department
            },
            {
              display_name: "Payment Type",
              variable_name: "payment_type",
              value: paymentTypeName
            }
          ]
        }
      });
      
      handler.openIframe();
    } catch (error) {
      console.error('Paystack setup error:', error);
      setError('Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  // Refined amount change handler for seamless UX
  const handleAmountChange = (value: string) => {
    if (value === '') {
      setAmount('');
      setError('Please enter a valid amount');
      return;
    }
    let numValue = parseInt(value);
    if (isNaN(numValue)) {
      setAmount('');
      setError('Please enter a valid amount');
      return;
    }
    if (numValue < 5000) {
      setAmount('5000');
      setError('Minimum payment amount is ₦5,000');
      return;
    }
    if (numValue > 15000) {
      setAmount('15000');
      setError('Maximum payment amount is ₦15,000');
      return;
    }
    setAmount(numValue.toString());
    setError('');
  };

  // Receipt PDF/Print handlers
  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('RUNACOSS Payment Receipt', 14, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 30);
    (doc as any).autoTable({
      startY: 40,
      head: [['Field', 'Value']],
      body: [
        ['Name', name],
        ['Email', email],
        ['Matric Number', matricNumber],
        ['Department', department],
        ['Amount Paid', `₦${parseInt(amount).toLocaleString()}`],
        ['Payment Type', paymentTypeName],
        ['Reference', 'Provided in your email receipt'],
      ],
    });
    doc.text('Thank you for your payment!', 14, ((doc as any).lastAutoTable.finalY || 60) + 20);
    doc.save('RUNACOSS_Receipt.pdf');
  };

  const handlePrint = () => {
    window.print();
  };

  try {
    if (!user) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please create an account to access the payment page.</p>
            <button
              onClick={() => navigate('/login', { state: { from: location.pathname } })}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }

    if (success) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
          {/* Removed Home and Dashboard links here */}
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 mt-2 print:shadow-none print:bg-white">
            <div className="text-center mb-6">
              <HiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 print:hidden" />
              <h2 className="text-2xl font-bold text-primary mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-2">Thank you, <span className="font-semibold">{name}</span>!</p>
              <p className="text-gray-500 mb-4">A receipt has been sent to <span className="font-semibold">{email}</span>.</p>
            </div>
            <div className="mb-6" id="receipt-summary">
              <table className="w-full text-sm mb-4">
                <tbody>
                  <tr><td className="font-medium py-1">Name:</td><td>{name}</td></tr>
                  <tr><td className="font-medium py-1">Email:</td><td>{email}</td></tr>
                  <tr><td className="font-medium py-1">Matric Number:</td><td>{matricNumber}</td></tr>
                  <tr><td className="font-medium py-1">Department:</td><td>{department}</td></tr>
                  <tr><td className="font-medium py-1">Amount Paid:</td><td>₦{parseInt(amount).toLocaleString()}</td></tr>
                  <tr><td className="font-medium py-1">Payment Type:</td><td>{paymentTypeName}</td></tr>
                  <tr><td className="font-medium py-1">Date:</td><td>{new Date().toLocaleString()}</td></tr>
                </tbody>
              </table>
              <div className="text-center text-green-700 font-semibold mb-2">Payment received successfully!</div>
              <div className="text-center text-xs text-gray-400 mb-4">(Reference number is in your email receipt)</div>
            </div>
            <div className="flex flex-col gap-3 print:hidden">
              <button
                onClick={async () => await handleDownloadPDF()}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Download PDF Receipt
              </button>
              <button
                onClick={handlePrint}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center relative">
          {/* Removed Home and Dashboard links here */}
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 mt-2">
            <div className="flex items-center mb-6">
              <img src={Logo} alt="RUNACOSS Logo" className="w-8 h-8 mr-2" />
              <h1 className="text-xl font-bold text-primary">RUNACOSS Dues Payment</h1>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                handlePayment();
              }}
              className="space-y-6"
            >
              {/* Name (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={name}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-100 text-gray-700 border-gray-300"
                />
              </div>
              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-100 text-gray-700 border-gray-300"
                />
              </div>
              {/* Amount (editable) */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Amount (₦)</label>
                <input
                  type="number"
                  min="5000"
                  max="15000"
                  step="500"
                  value={amount}
                  onChange={e => handleAmountChange(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  placeholder="Enter amount between ₦5,000 and ₦15,000"
                  inputMode="numeric"
                  aria-describedby="payment-amount-error"
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive" id="payment-amount-error">{error}</p>
                )}
                {amount !== '5000' && (
                  <button
                    type="button"
                    className="mt-2 text-xs text-primary underline hover:text-primary/80"
                    onClick={() => handleAmountChange('5000')}
                  >
                    Set to Minimum (₦5,000)
                  </button>
                )}
              </div>
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-2 text-red-600 text-sm text-center" role="alert" aria-live="assertive">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  } catch (err) {
    console.error('[ERROR] PaymentPage render error:', err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">An unexpected error occurred while loading the payment page.</p>
          <pre className="bg-red-100 text-red-800 p-2 rounded text-xs max-w-md mx-auto overflow-x-auto">{String(err)}</pre>
        </div>
      </div>
    );
  }
};

export default PaymentPage; 