const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Connect to MongoDB Atlas
connectDB();

// ----- Global Middleware -----

// Sets security-related HTTP response headers
app.use(helmet());

// Enables CORS for frontend requests (Vite dev server on port 5173)
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://kishan-ai-smart-agriculture-platfor.vercel.app'
    ],
    credentials: true,
  })
);

// Logs HTTP requests to the console in dev format
app.use(morgan('dev'));

// Parses incoming JSON request bodies (limit raised for image uploads)
app.use(express.json({ limit: '10mb' }));

// Parses URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use('/uploads', express.static('uploads'));

// ----- Health Check -----

// Returns server status — useful for deployment health probes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: null,
    message: 'KishanAi API is running 🌾',
  });
});

// ----- API Routes -----
// Each route module is mounted under /api prefix
// Routes will be uncommented as they are built in subsequent steps

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/crop', require('./routes/cropRoutes'));
app.use('/api/disease', require('./routes/diseaseRoutes'));
app.use('/api/fertilizer', require('./routes/fertilizerRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// ----- Error Handling -----

// Catches requests to undefined routes
app.use(notFound);

// Global error handler — must be registered last
app.use(errorHandler);

// ----- Start Server -----

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🌾 KishanAi server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

module.exports = app;
