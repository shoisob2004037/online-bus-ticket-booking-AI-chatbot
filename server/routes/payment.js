const express = require('express');
const SSLCommerzPayment = require('sslcommerz-lts');
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const storeId = process.env.STORE_ID;
const storePassword = process.env.STORE_PASSWORD;
const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

const getServerUrl = (req) => `${req.protocol}://${req.get('host')}`;

const completeGatewayPayment = async (booking, gatewayData = {}) => {
  booking.paymentStatus = 'completed';
  booking.bookingStatus = 'confirmed';
  booking.paymentMethod = 'sslcommerz';
  booking.paymentValidationStatus = 'valid';
  booking.sslBankTranId = gatewayData.bank_tran_id || booking.sslBankTranId;
  booking.sslSessionKey = gatewayData.sessionkey || booking.sslSessionKey;
  booking.paidAt = new Date();
  await booking.save();
};

const failGatewayPayment = async (booking, gatewayData = {}) => {
  if (booking.paymentStatus !== 'completed') {
    booking.paymentStatus = 'failed';
    booking.bookingStatus = 'pending';
    booking.paymentMethod = 'sslcommerz';
    booking.paymentValidationStatus = 'invalid';
    booking.sslBankTranId = gatewayData.bank_tran_id || booking.sslBankTranId;
    await booking.save();
  }
};

// Pay booking with wallet balance
router.post('/pay/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ message: 'Cannot pay for a cancelled booking' });
    }

    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'This booking is already paid' });
    }

    // Re-fetch user to get latest balance
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if ((user.balance || 0) < booking.totalAmount) {
      return res.status(400).json({
        message: 'Insufficient balance. Please top up your wallet via টাকা ঢুকান.',
        currentBalance: user.balance || 0,
        requiredAmount: booking.totalAmount
      });
    }

    // Deduct balance atomically
    user.balance -= booking.totalAmount;
    await user.save();

    booking.paymentStatus = 'completed';
    booking.bookingStatus = 'confirmed';
    booking.paymentMethod = 'wallet';
    booking.paymentValidationStatus = 'valid';
    await booking.save();

    return res.json({
      success: true,
      message: 'Payment completed successfully',
      bookingId: booking._id,
      ticketNumber: booking.ticketNumber,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Wallet payment error:', error);
    return res.status(500).json({ message: 'Payment failed. Please try again.' });
  }
});

// Start SSLCommerz sandbox/dummy payment for an existing booking
router.post('/ssl/init/:bookingId', auth, async (req, res) => {
  try {
    if (!storeId || !storePassword) {
      return res.status(500).json({
        message: 'SSLCommerz credentials are missing. Add STORE_ID and STORE_PASSWORD in server .env.'
      });
    }

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ message: 'Cannot pay for a cancelled booking' });
    }

    if (booking.paymentStatus === 'completed') {
      return res.json({
        success: true,
        alreadyPaid: true,
        redirectUrl: `${clientUrl}/ticket/${booking._id}`
      });
    }

    const tranId = `BUSGO_${booking._id}_${Date.now()}`;
    const serverUrl = getServerUrl(req);

    booking.paymentMethod = 'sslcommerz';
    booking.paymentStatus = 'pending';
    booking.paymentValidationStatus = 'pending';
    booking.sslTranId = tranId;
    await booking.save();

    const data = {
      total_amount: booking.totalAmount,
      currency: 'BDT',
      tran_id: tranId,
      success_url: `${serverUrl}/api/payment/ssl/success`,
      fail_url: `${serverUrl}/api/payment/ssl/fail`,
      cancel_url: `${serverUrl}/api/payment/ssl/cancel`,
      ipn_url: `${serverUrl}/api/payment/ssl/ipn`,
      shipping_method: 'No',
      product_name: `Bus ticket ${booking.busName}`,
      product_category: 'Bus Ticket',
      product_profile: 'general',
      cus_name: booking.passengerName,
      cus_email: booking.passengerEmail,
      cus_add1: booking.startPoint || 'Dhaka',
      cus_add2: booking.destination || 'Bangladesh',
      cus_city: booking.startPoint || 'Dhaka',
      cus_state: booking.startPoint || 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: booking.passengerPhone,
      cus_fax: booking.passengerPhone,
      ship_name: booking.passengerName,
      ship_add1: booking.startPoint || 'Dhaka',
      ship_add2: booking.destination || 'Bangladesh',
      ship_city: booking.destination || 'Dhaka',
      ship_state: booking.destination || 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
      value_a: booking._id.toString()
    };

    const sslcz = new SSLCommerzPayment(storeId, storePassword, isLive);
    const apiResponse = await sslcz.init(data);

    if (!apiResponse?.GatewayPageURL) {
      return res.status(502).json({
        message: 'SSLCommerz did not return a gateway URL',
        response: apiResponse
      });
    }

    booking.sslSessionKey = apiResponse.sessionkey || apiResponse.sessionKey || '';
    await booking.save();

    return res.json({
      success: true,
      gatewayUrl: apiResponse.GatewayPageURL,
      bookingId: booking._id,
      tranId
    });
  } catch (error) {
    console.error('SSLCommerz init error:', error);
    return res.status(500).json({ message: 'Could not start SSLCommerz payment. Please try again.' });
  }
});

// Demo fallback: lets the dummy flow complete without contacting SSLCommerz validation
router.post('/ssl/dummy-success/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await completeGatewayPayment(booking, { bank_tran_id: `DUMMY_${Date.now()}` });

    return res.json({
      success: true,
      bookingId: booking._id,
      ticketNumber: booking.ticketNumber,
      redirectUrl: `${clientUrl}/payment/success?booking_id=${booking._id}&status=success`
    });
  } catch (error) {
    console.error('Dummy SSLCommerz success error:', error);
    return res.status(500).json({ message: 'Dummy payment failed. Please try again.' });
  }
});

router.all('/ssl/success', async (req, res) => {
  try {
    const payload = { ...req.query, ...req.body };
    const tranId = payload.tran_id;
    const bookingId = payload.value_a;
    const bookingQuery = [];
    if (tranId) bookingQuery.push({ sslTranId: tranId });
    if (bookingId) bookingQuery.push({ _id: bookingId });

    const booking = bookingQuery.length ? await Booking.findOne({ $or: bookingQuery }) : null;

    if (!booking) {
      return res.redirect(`${clientUrl}/payment/failed?status=failed`);
    }

    let isValid = payload.status === 'VALID' || payload.status === 'VALIDATED' || Boolean(payload.val_id);

    if (payload.val_id && storeId && storePassword) {
      try {
        const sslcz = new SSLCommerzPayment(storeId, storePassword, isLive);
        const validation = await sslcz.validate({ val_id: payload.val_id });
        isValid = validation?.status === 'VALID' || validation?.status === 'VALIDATED';
      } catch (validationError) {
        console.error('SSLCommerz validation error:', validationError);
      }
    }

    if (isValid) {
      await completeGatewayPayment(booking, payload);
      return res.redirect(`${clientUrl}/payment/success?booking_id=${booking._id}&status=success`);
    }

    await failGatewayPayment(booking, payload);
    return res.redirect(`${clientUrl}/payment/failed?booking_id=${booking._id}&status=failed`);
  } catch (error) {
    console.error('SSLCommerz success callback error:', error);
    return res.redirect(`${clientUrl}/payment/failed?status=failed`);
  }
});

router.all('/ssl/fail', async (req, res) => {
  const payload = { ...req.query, ...req.body };
  const booking = await Booking.findOne({ sslTranId: payload.tran_id });
  if (booking) await failGatewayPayment(booking, payload);
  return res.redirect(`${clientUrl}/payment/failed?booking_id=${booking?._id || ''}&status=failed`);
});

router.all('/ssl/cancel', async (req, res) => {
  const payload = { ...req.query, ...req.body };
  const booking = await Booking.findOne({ sslTranId: payload.tran_id });
  if (booking && booking.paymentStatus !== 'completed') {
    booking.paymentStatus = 'pending';
    booking.bookingStatus = 'pending';
    booking.paymentMethod = 'sslcommerz';
    await booking.save();
  }
  return res.redirect(`${clientUrl}/payment/failed?booking_id=${booking?._id || ''}&status=cancelled`);
});

router.all('/ssl/ipn', async (req, res) => {
  try {
    const payload = { ...req.query, ...req.body };
    const booking = await Booking.findOne({ sslTranId: payload.tran_id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (payload.status === 'VALID' || payload.status === 'VALIDATED') {
      await completeGatewayPayment(booking, payload);
    } else if (payload.status === 'FAILED') {
      await failGatewayPayment(booking, payload);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('SSLCommerz IPN error:', error);
    return res.status(500).json({ message: 'IPN processing failed' });
  }
});

// Get payment status
router.get('/status/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    return res.json({
      paymentStatus: booking.paymentStatus,
      paymentValidationStatus: booking.paymentValidationStatus,
      bookingStatus: booking.bookingStatus,
      ticketNumber: booking.ticketNumber,
      totalAmount: booking.totalAmount,
      paymentMethod: booking.paymentMethod
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return res.status(500).json({ message: 'Error checking payment status' });
  }
});

module.exports = router;
