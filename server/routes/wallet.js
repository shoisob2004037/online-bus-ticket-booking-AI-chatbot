const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const TopupRequest = require('../models/TopupRequest');

const router = express.Router();

// Get user balance
router.get('/balance', auth, async (req, res) => {
  res.json({ balance: req.user.balance || 0 });
});

// Submit top-up request (Taka Dhukan)
router.post('/topup-request', auth, async (req, res) => {
  try {
    const { paymentMethod, amount, transactionId, accountName } = req.body;

    if (!paymentMethod || !amount || !transactionId || !accountName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const request = new TopupRequest({
      user: req.user._id,
      paymentMethod,
      amount: Number(amount),
      transactionId,
      accountName
    });

    await request.save();

    res.status(201).json({
      message: 'Top-up request submitted successfully. Admin will review it.',
      request
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit request' });
  }
});

// Get my top-up requests
router.get('/my-topup-requests', auth, async (req, res) => {
  const requests = await TopupRequest.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  res.json({ requests });
});

// ====================== ADMIN ROUTES ======================

// Get all top-up requests (Admin only)
router.get('/admin/topup-requests', auth, admin, async (req, res) => {
  const requests = await TopupRequest.find()
    .populate('user', 'name email phone')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });
  res.json({ requests });
});

// Approve or reject top-up request
router.put('/admin/topup-requests/:id', auth, admin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const request = await TopupRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already reviewed' });
    }

    request.status = status;
    request.adminNote = adminNote || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    if (status === 'approved') {
      const user = await User.findById(request.user);
      if (user) {
        user.balance = (user.balance || 0) + request.amount;
        await user.save();
      }
    }

    await request.save();

    res.json({ 
      message: `Request ${status} successfully`, 
      request 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update request' });
  }
});

module.exports = router;