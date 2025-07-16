const { USER_EMAIL } = require("../config/index");
const { createTransporter } = require("../helpers/smtpTransport");

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  const { reference, amount, paymentType, userId, matricNumber, department } = req.body;

  // Enforce minimum payment
  if (!amount || amount < 5000) {
    return res.status(400).json({ success: false, error: "Minimum payment amount is ₦5,000" });
  }

  // TODO: Add actual payment verification logic with Paystack or DB
  // For now, assume payment is verified if reference is present
  if (!reference) {
    return res.status(400).json({ success: false, error: "Missing payment reference" });
  }

  // Simulate success
  return res.json({ success: true, message: "Payment verified" });
};

// POST /api/payments/send-receipt
exports.sendReceipt = async (req, res) => {
  const { reference, email, amount, paymentType, studentName, matricNumber, department } = req.body;

  if (!email || !reference || !amount || !paymentType || !studentName || !matricNumber || !department) {
    return res.status(400).json({ success: false, error: "Missing required fields for receipt" });
  }

  // Check if email configuration is available
  if (!USER_EMAIL) {
    console.log('⚠️ Email configuration not set up. Skipping email receipt.');
    return res.json({ 
      success: true, 
      message: "Payment successful, but email receipts are not configured",
      warning: "Email configuration not set up. Receipt available for download on success page."
    });
  }

  try {
    const transporter = await createTransporter();
    const mailOptions = {
      to: email,
      from: USER_EMAIL,
      subject: "RUNACOSS Payment Receipt",
      html: `
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
          <h2 style='color: #3498db;'>RUNACOSS Payment Receipt</h2>
          <p>Dear ${studentName},</p>
          <p>Thank you for your payment. Here are your payment details:</p>
          <ul>
            <li><strong>Reference:</strong> ${reference}</li>
            <li><strong>Amount:</strong> ₦${amount.toLocaleString()}</li>
            <li><strong>Payment Type:</strong> ${paymentType}</li>
            <li><strong>Matric Number:</strong> ${matricNumber}</li>
            <li><strong>Department:</strong> ${department}</li>
          </ul>
          <p>If you have any questions, please contact support.</p>
          <hr style='margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;'>
          <p style='color: #7f8c8d; font-size: 12px;'>This is an automated message from RUNACOSS. Please do not reply to this email.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log('✅ Receipt email sent successfully to:', email);
    return res.json({ success: true, message: "Receipt sent" });
  } catch (err) {
    console.error("Failed to send receipt email:", err);
    // Return success even if email fails - payment is still valid
    return res.json({ 
      success: true, 
      message: "Payment successful, but receipt email failed",
      warning: "Receipt email could not be sent. Please contact support if needed."
    });
  }
}; 

