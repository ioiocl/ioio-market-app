const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const sliderRoutes = require('./routes/sliderRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const activitiesRoutes = require('./routes/activitiesRoutes');
const productsRoutes = require('./routes/productsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/slider', sliderRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/products', productsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ IOIO V2 Backend running on port ${PORT}`);
});
