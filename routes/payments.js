const express = require('express');
const Paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/payments');

const router = express.Router();

// POST /api/v1/payments - Initiate payment
router.post('/payments', async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({ status: 'error', message: 'Request body is missing' });
    }
    const { first_name, last_name, phone_number, email, amount, state, country } = req.body;

    // Validation
    if (!first_name || !last_name || !phone_number || !email || !amount || !state || !country) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    if (amount <= 0) {
      return res.status(400).json({ status: 'error', message: 'Amount must be positive' });
    }

    const paymentId = uuidv4();
    const customerName = `${first_name} ${last_name}`;

    // Initialize Paystack transaction
    const transaction = await Paystack.transaction.initialize({
      email,
      amount: amount * 100, // Paystack uses kobo
      metadata: { customer_name: customerName, phone_number, state, country },
    });

    // Check Paystack response
    if (!transaction.status) {
      return res.status(400).json({
        status: 'error',
        message: transaction.message || 'Failed to initialize Paystack transaction',
        paystackResponse: transaction
      });
    }

    // Save to MongoDB 
    const payment = new Payment({
      paymentId,
      customerName,
      customerEmail: email, // Consistent with schema
      phoneNumber: phone_number, // Convert snake_case to camelCase
      amount,
      state,
      country,
      paystackRef: transaction.data.reference,
    });
    await payment.save();

    res.status(201).json({
      status: 'success',
      message: 'Payment initiated successfully',
      payment: {
        id: paymentId,
        authorization_url: transaction.data.authorization_url,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/payments/{id} - Get payment status
router.get('/payments/:id', async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.id });

    if (!payment) {
      return res.status(404).json({ status: 'error', message: 'Payment not found' });
    }

    // Defensive: check paystackRef
    if (!payment.paystackRef || typeof payment.paystackRef !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Invalid Paystack reference in payment record' });
    }

    // Verify with Paystack
    const verification = await Paystack.transaction.verify({ reference: payment.paystackRef });

    // Defensive: check Paystack response
    if (
      !verification ||
      typeof verification !== 'object' ||
      !('status' in verification) ||
      !verification.status ||
      !verification.data ||
      typeof verification.data !== 'object' ||
      !('status' in verification.data)
    ) {
      return res.status(400).json({
        status: 'error',
        message: verification && verification.message
          ? verification.message
          : 'Invalid response from Paystack during verification',
        paystackResponse: verification
      });
    }

    const paystackStatus = verification.data.status;

    // Map Paystack status to local status
    let updatedStatus;
    if (paystackStatus === 'success') {
      updatedStatus = 'completed';
    } else if (paystackStatus === 'failed') {
      updatedStatus = 'failed';
    } else if (paystackStatus === 'abandoned') {
      updatedStatus = 'abandoned';
    } else {
      updatedStatus = paystackStatus; // fallback to raw status
    }

    // Update status in MongoDB
    payment.status = updatedStatus;
    await payment.save();

    res.json({
      status: 'success',
      message: 'Payment details retrieved successfully',
      payment: {
        id: payment.paymentId,
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;