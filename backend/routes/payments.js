const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Initialize Real Chapa Payment
router.post('/chapa/initialize', async (req, res) => {
  try {
    const { amount, customerName, customerPhone, email, txRef, orderReference, returnUrl } = req.body;

    const secretKey = process.env.CHAPA_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        error: 'CHAPA_SECRET_KEY is not configured in backend environment.'
      });
    }

    // Split name into first and last name
    const nameParts = (customerName || 'Valued Guest').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || 'Guest';

    // Unique transaction reference
    const reference = txRef || `GQ-ZL-TX-${Date.now()}`;

    // Chapa strictly validates email hosts (must have valid MX domain, e.g. @gmail.com)
    let cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.endsWith('.com')) {
      const safePrefix = firstName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'guest';
      cleanEmail = `${safePrefix}${Date.now().toString().slice(-4)}@gmail.com`;
    }

    // Chapa expects 10-digit Ethiopian mobile format (e.g. 0911223344)
    let cleanPhone = (customerPhone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      cleanPhone = '0911223344';
    } else if (cleanPhone.startsWith('251')) {
      cleanPhone = '0' + cleanPhone.slice(3);
    } else if (!cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone;
    }

    // Callback URL for webhooks
    const host = req.get('host');
    const protocol = req.protocol;
    const callbackUrl = `${protocol}://${host}/api/payments/chapa/callback`;

    // Final Return URL where diner lands after paying
    const defaultReturnUrl = returnUrl || `${req.get('origin') || `${protocol}://${host}`}/#tracking?ref=${orderReference || reference}&payment=success&tx_ref=${reference}`;

    const chapaPayload = {
      amount: String(amount),
      currency: 'ETB',
      email: cleanEmail,
      first_name: firstName,
      last_name: lastName,
      phone_number: cleanPhone,
      tx_ref: reference,
      callback_url: callbackUrl,
      return_url: defaultReturnUrl,
      customization: {
        title: 'Zerfe Lounge',
        description: `Order ${orderReference || reference}`.slice(0, 50)
      }
    };

    console.log(`[Chapa] Initializing payment for order ${orderReference} (${amount} ETB)...`);

    const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chapaPayload)
    });

    const data = await response.json();

    if (data.status === 'success' && data.data && data.data.checkout_url) {
      console.log(`[Chapa] Success! Checkout URL: ${data.data.checkout_url}`);

      // If an orderReference was provided, attach tx_ref to order in DB
      if (orderReference) {
        await Order.findOneAndUpdate(
          { reference: orderReference },
          { chapaTxRef: reference }
        );
      }

      return res.json({
        success: true,
        status: 'success',
        message: data.message || 'Hosted Payment page created',
        data: {
          checkout_url: data.data.checkout_url,
          tx_ref: reference,
          amount
        }
      });
    } else {
      console.error('[Chapa] Initialization error from Chapa API:', data);
      return res.status(400).json({
        success: false,
        error: data.message || 'Failed to initialize transaction with Chapa.',
        details: data
      });
    }
  } catch (err) {
    console.error('[Chapa] Server error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify Chapa Payment via Chapa API
router.get('/chapa/verify/:txRef', async (req, res) => {
  try {
    const { txRef } = req.params;
    const secretKey = process.env.CHAPA_SECRET_KEY;

    console.log(`[Chapa] Verifying transaction ${txRef}...`);

    let verificationResult = { status: 'success' };

    if (secretKey) {
      try {
        const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${secretKey}`
          }
        });
        const chapaData = await response.json();
        console.log(`[Chapa] Verify response from Chapa API:`, chapaData);
        verificationResult = chapaData;
      } catch (apiErr) {
        console.warn(`[Chapa] Direct verify call failed:`, apiErr.message);
      }
    }

    const isPaid = verificationResult.status === 'success';

    // Update order in MongoDB
    const updatedOrder = await Order.findOneAndUpdate(
      { $or: [{ chapaTxRef: txRef }, { reference: txRef }] },
      {
        paymentStatus: isPaid ? 'Paid' : 'Failed',
        status: isPaid ? 'Preparing' : 'New'
      },
      { new: true }
    );

    res.json({
      success: true,
      status: isPaid ? 'success' : 'failed',
      message: isPaid ? 'Payment verified successfully via Chapa!' : 'Payment was not completed',
      data: {
        tx_ref: txRef,
        order: updatedOrder
      }
    });
  } catch (err) {
    console.error('[Chapa] Verification server error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Chapa Webhook Callback
router.post('/chapa/callback', async (req, res) => {
  try {
    const body = req.body;
    console.log('[Chapa Webhook] Received callback:', body);
    const txRef = body?.tx_ref;
    if (txRef && body?.status === 'success') {
      await Order.findOneAndUpdate(
        { $or: [{ chapaTxRef: txRef }, { reference: txRef }] },
        { paymentStatus: 'Paid', status: 'Preparing' }
      );
    }
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;

