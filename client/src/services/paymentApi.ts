import { ApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export interface PaymentRequest {
  reference: string;
  amount: number;
  paymentType: string;
  userId: string;
  matricNumber?: string;
  department?: string;
}

export interface PaymentReceipt {
  reference: string;
  email: string;
  amount: number;
  paymentType: string;
  studentName: string;
  matricNumber?: string;
  department?: string;
}

export interface PaymentHistory {
  id: string;
  reference: string;
  amount: number;
  paymentType: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// Payment API Services
export const paymentApi = {
  // Verify payment with Paystack
  verifyPayment: async (paymentData: PaymentRequest): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    return handleResponse(response);
  },

  // Send payment receipt via email
  sendReceipt: async (receiptData: PaymentReceipt): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/payments/send-receipt`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(receiptData),
    });

    return handleResponse(response);
  },

  // Get payment history for user
  getPaymentHistory: async (): Promise<ApiResponse<PaymentHistory[]>> => {
    const response = await fetch(`${API_BASE_URL}/payments/history`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Get payment by reference
  getPaymentByReference: async (reference: string): Promise<ApiResponse<PaymentHistory>> => {
    const response = await fetch(`${API_BASE_URL}/payments/${reference}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Initialize payment (create payment record)
  initializePayment: async (paymentData: Omit<PaymentRequest, 'reference'>): Promise<ApiResponse<{ reference: string }>> => {
    const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    return handleResponse(response);
  },

  // Get payment statistics
  getPaymentStats: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/payments/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },
}; 