const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DHMS API' });
});

// Health Check (used by Render)
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const authRoutes = require('./routes/auth');
const domainRoutes = require('./routes/domains');
const hostingRoutes = require('./routes/hosting');
const dashboardRoutes = require('./routes/dashboard');
const contactRoutes = require('./routes/contact');

app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/hosting', hostingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contact', contactRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
