const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'admin_credit', 'admin_debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  totalUSD: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['SOL', 'USDT-ERC20', 'USDT-TRC20', 'BTC', 'admin'],
    required: true
  },
  paymentAddress: String,
  transactionHash: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'failed'],
    default: 'pending'
  },
  adminNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  completedAt: Date
});

module.exports = mongoose.model('Transaction', transactionSchema);