const express = require('express');
const router = express.Router();
const PaymentWallet = require('../models/paymentWallet');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get wallets (public)
router.get('/wallets', async (req, res) => {
  try {
    const wallets = await PaymentWallet.find({ isActive: true });
    res.json({ wallets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

// Update wallets (admin)
router.put('/wallets', auth, adminAuth, async (req, res) => {
  try {
    const { wallets } = req.body;
    
    for (const w of wallets) {
      await PaymentWallet.findOneAndUpdate(
        { currency: w.currency },
        { address: w.address, updatedAt: new Date() },
        { upsert: true }
      );
    }

    res.json({ message: 'Wallets updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wallets' });
  }
});

module.exports = router;
