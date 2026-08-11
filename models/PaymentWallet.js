const mongoose = require('mongoose');

const paymentWalletSchema = new mongoose.Schema({
  currency: {
    type: String,
    enum: ['SOL', 'USDT-ERC20', 'USDT-TRC20', 'BTC'],
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  network: String,
  isActive: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentWallet', paymentWalletSchema);