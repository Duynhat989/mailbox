const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Database connection
const { initializeDatabase } = require('./src/config/config.js');
const socketService = require('./src/services/socket-service.js'); // Import Socket Service

// Services
const smtpService = require('./src/services/smtp-service');
// Routes
const domainRoutes = require('./src/routes');
const authRoutes = require('./src/routes/authRoutes.js');

// Initialize Express app
const app = express();

const server = http.createServer(app);
// Set up middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging
const logFormat = process.env.NODE_ENV === 'production' 
  ? 'combined' 
  : 'dev';
app.use(morgan(logFormat));

// Serve static files if needed
app.use('/', express.static(path.join(__dirname, 'public/dist')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', domainRoutes);

// Root route
// app.get('/', (req, res) => {
//   res.json({
//     name: 'Email Server API (Sequelize Version)',
//     version: process.env.npm_package_version || '1.0.0',
//     status: 'running'
//   });
// });

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', message: 'The requested resource does not exist' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[${new Date().toISOString()}] Error:`, err);
  
  // Send different error details based on environment
  res.status(statusCode).json({
    error: err.name || 'Server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

/**
 * Initialize database and start servers
 */
async function startServer() {
  try {
    // Test database connection
    // Initialize database and models
    await initializeDatabase();
    console.log('Database and models initialized successfully');

    // Get server IP for logging
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    const serverIP = Object.values(networkInterfaces)
      .flat()
      .filter(details => details.family === 'IPv4' && !details.internal)
      .map(details => details.address)[0] || 'localhost';
    
    console.log(`Server Hostname: ${serverIP}`);

    // Start HTTP server
    const PORT = process.env.PORT || 2053;
    const server = app.listen(PORT, () => {
      console.log(`✅ API server running on http://${serverIP}:${PORT}`);
    });

    // Setup SMTP server
    const SMTP_PORT = process.env.SMTP_PORT || 2525;
    const smtpServer = await smtpService.createSMTPServer();
    
    // Start SMTP server
    smtpServer.listen(SMTP_PORT, () => {
      console.log(`✅ SMTP server running on ${serverIP}:${SMTP_PORT}`);
      // emailService.setupTransporter();
    });

    // Graceful shutdown
    setupGracefulShutdown(server, smtpServer);
    
    return { httpServer: server, smtpServer };
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(httpServer, smtpServer) {
  // Handle process termination gracefully
  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down gracefully`);
    
    // Close HTTP server
    httpServer.close(() => {
      console.log('HTTP server closed');
    });
    
    // Close SMTP server
    smtpServer.close(() => {
      console.log('SMTP server closed');
    });
    
    // Close database connections
    try {
      const { sequelize } = require('./src/config/config.js');
      await sequelize.close();
      console.log('Database connections closed');
    } catch (err) {
      console.error('Error closing database connections:', err);
    }
    
    // Exit with success code
    setTimeout(() => {
      console.log('Exiting process');
      process.exit(0);
    }, 1000);
  };

  // Attach signal handlers
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
  });
}

// Only start the server if this file is run directly
if (require.main === module) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
// Khởi tạo Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Khởi tạo socket service để có thể truy cập từ bất kỳ đâu
socketService.initialize(io);

// Export for testing
module.exports = { app, startServer };