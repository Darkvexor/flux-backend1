const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const adminAuth = require('../middleware/adminAuth');

// Stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    const sold = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'purchase' } },
      { $group: { _id: null, totalSold: { $sum: '$amount' }, totalRevenue: { $sum: '$totalUSD' } } }
    ]);

    res.json({
      totalUsers,
      verifiedUsers,
      totalSold: sold[0]?.totalSold || 0,
      totalRevenue: sold[0]?.totalRevenue || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get All Users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get All Transactions
router.get('/transactions', adminAuth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    
    const transactions = await Transaction.find(filter)
      .populate('userId', 'email username')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Credit User
router.post('/credit-user', adminAuth, async (req, res) => {
  try {
    const { userId, amount, notes } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.balance += Number(amount);
    await user.save();

    const transaction = new Transaction({
      userId,
      type: 'admin_credit',
      amount: Number(amount),
      totalUSD: 0,
      paymentMethod: 'admin',
      status: 'completed',
      adminNotes: notes,
      completedAt: new Date()
    });
    await transaction.save();

    res.json({ message: 'User credited', user: { id: user._id, balance: user.balance } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to credit user' });
  }
});

// Confirm Payment
router.post('/confirm-payment/:id', adminAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    transaction.status = 'completed';
    transaction.transactionHash = req.body.transactionHash;
    transaction.completedAt = new Date();
    await transaction.save();

    const user = await User.findById(transaction.userId);
    user.balance += transaction.amount;
    user.totalInvested += transaction.totalUSD;
    await user.save();

    res.json({ message: 'Payment confirmed', transaction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

module.exports = router;