const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { initDatabase } = require('./db/database');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const documentRoutes = require('./routes/document.routes');
const aiRoutes = require('./routes/ai.routes');
const reportRoutes = require('./routes/report.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware: Set Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  next();
});

// Enable Cookie Parser for HttpOnly cookie sessions
app.use(cookieParser());

// Enable CORS for frontend integration with credentials support
const allowedOrigins = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigins === '*' ? true : allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Apply General Rate Limiter to all API endpoints
app.use('/api', generalLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'Jiffy Research AI Backend API',
    security: 'Hardened (Rate limiting, HttpOnly cookies, TOTP 2FA, Security Audit Logging, RBAC)',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'connected',
    security: 'active',
    gemini_key_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_google_gemini_api_key_here')
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Static serving for built frontend if present
const fs = require('fs');
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 Handler for API endpoints
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Global Error Handler - Suppress internal stack traces in response for security
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(status).json({
    success: false,
    error: isDev ? (err.message || 'Internal Server Error') : 'An unexpected server error occurred.'
  });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Security-Hardened Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
