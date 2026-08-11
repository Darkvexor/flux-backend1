const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const PaymentWallet = require('../models/PaymentWallet');
const User = require('../models/user');

// Create Purchase
router.post('/purchase', async (req, res) => {
  try {
    const { amount, paymentMethod, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (amount < 500 || amount > 5000) {
      return res.status(400).json({ error: 'Amount must be between 500 and 5,000 Flux' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const sold = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'purchase' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const soldAmount = sold[0]?.total || 0;
    
    if (amount > (5000000 - soldAmount)) {
      return res.status(400).json({ error: 'Insufficient pre-sale supply' });
    }

    const wallet = await PaymentWallet.findOne({ currency: paymentMethod, isActive: true });
    if (!wallet) return res.status(400).json({ error: 'Invalid payment method' });

    const transaction = new Transaction({
      userId,
      type: 'purchase',
      amount,
      totalUSD: amount,
      paymentMethod,
      paymentAddress: wallet.address,
      status: 'pending'
    });

    await transaction.save();

    res.status(201).json({
      message: 'Purchase initiated',
      transaction: {
        id: transaction._id,
        amount,
        totalUSD: amount,
        paymentMethod,
        paymentAddress: wallet.address,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

// Get History
router.get('/history', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 }).limit(50);
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Pre-sale Stats
router.get('/presale-stats', async (req, res) => {
  try {
    const sold = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'purchase' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const soldAmount = sold[0]?.total || 0;
    res.json({
      totalSupply: 5000000,
      soldAmount,
      remaining: 5000000 - soldAmount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
