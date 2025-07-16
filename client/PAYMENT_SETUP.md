# Payment Integration Setup

## Paystack Configuration

To enable payment functionality, you need to set up your Paystack public key in the environment variables.

### 1. Create Environment File

Create a `.env` file in the client directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
```

### 2. Get Your Paystack Public Key

1. Sign up for a Paystack account at https://paystack.com
2. Go to your dashboard
3. Navigate to Settings > API Keys
4. Copy your public key (starts with `pk_test_` for test mode or `pk_live_` for live mode)

### 3. Backend API Endpoints

The payment integration expects the following backend endpoints:

- `POST /api/payments/verify` - Verify payment with Paystack
- `POST /api/payments/send-receipt` - Send email receipt
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/:reference` - Get payment by reference
- `POST /api/payments/initialize` - Initialize payment
- `GET /api/payments/stats` - Get payment statistics

### 4. Payment Types

The system supports the following payment types:

- **Annual Dues** - ₦5,000 (Annual membership dues for RUNACOSS)
- **Event Registration** - ₦2,000 (Registration fee for upcoming events)
- **Graduation Fee** - ₦3,000 (Graduation ceremony participation fee)

### 5. Features

- Secure payment processing with Paystack
- Email receipt delivery
- Payment history tracking
- Multiple payment types
- Responsive design
- User authentication required

### 6. Testing

For testing, use Paystack's test cards:
- Card Number: 4084 0840 8408 4081
- Expiry: Any future date
- CVV: Any 3 digits
- PIN: Any 4 digits

### 7. Security

- All payments are processed through Paystack's secure infrastructure
- SSL encryption is enforced
- PCI DSS compliant
- No sensitive payment data is stored locally 

## Minimum Payment Amount

- The minimum payment amount is now **₦10,000** for all payment types. Users cannot pay less than this amount.
- All payment types (dues, event, graduation) default to ₦10,000 or higher. 