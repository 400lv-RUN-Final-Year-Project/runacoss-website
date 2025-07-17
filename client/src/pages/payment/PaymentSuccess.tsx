import Navbar from '../../componentLibrary/NavBar';

const PaymentSuccess = () => (
  <>
    <Navbar />
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 mt-2">
        <h2 className="text-2xl font-bold text-primary mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-2">Thank you for your payment.</p>
        <a href="/dashboard" className="text-primary underline">Go to Dashboard</a>
      </div>
    </div>
  </>
);

export default PaymentSuccess; 