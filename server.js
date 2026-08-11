const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://flux-coin.vercel.app'], credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));