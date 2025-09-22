const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('../config/db');
const sanitize = require('../middleware/sanitize');

// Import routes
const authRoutes = require('../routes/auth');
const projectRoutes = require('../routes/projects');
const taskRoutes = require('../routes/tasks');
const notificationRoutes = require('../routes/notifications');
const teamRoutes = require('../routes/team');
const searchRoutes = require('../routes/search');

const app = express();
const server = createServer(app);

// Trust proxy for deployment platforms (Render, Vercel, etc.)
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://localhost:8080',
    'https://projectflow-pssc.onrender.com', // Your backend URL
    'https://projectflow-frontend.vercel.app', // Your actual frontend URL
    /^https:\/\/.*\.vercel\.app$/, // Vercel frontend URLs
    /^https:\/\/.*\.netlify\.app$/, // Netlify frontend URLs
    /^https:\/\/.*\.github\.io$/ // GitHub Pages URLs
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Increase preflight cache time to 10 minutes
};

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions
});

// Make io accessible to routes
app.set('io', io);

// Connect to database
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 100, // Higher limit for production
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Trust proxy for accurate IP detection
  trustProxy: true
});

// Middleware
app.use(cors(corsOptions)); // Apply CORS to all routes
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitize);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes); // Mount task routes at root level since they include project ID
app.use('/api/notifications', notificationRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/search', searchRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Project Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/projects/:projectId/tasks',
      notifications: '/api/notifications',
      team: '/api/team'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io connection handling with authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userName = decoded.name;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userName} (${socket.id})`);

  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`User ${socket.userName} joined project ${projectId}`);
    
    // Notify others in the project that a user joined
    socket.to(`project:${projectId}`).emit('user:joined', {
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`User ${socket.userName} left project ${projectId}`);
    
    // Notify others in the project that a user left
    socket.to(`project:${projectId}`).emit('user:left', {
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('typing', (data) => {
    const { projectId, taskId, isTyping } = data;
    socket.to(`project:${projectId}`).emit('user:typing', {
      userId: socket.userId,
      userName: socket.userName,
      taskId,
      isTyping,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('task-update', (data) => {
    const { projectId, taskId, updates } = data;
    socket.to(`project:${projectId}`).emit('task:updated', {
      taskId,
      updates,
      updatedBy: socket.userName,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('comment-added', (data) => {
    const { projectId, taskId, comment } = data;
    socket.to(`project:${projectId}`).emit('comment:added', {
      taskId,
      comment,
      addedBy: socket.userName,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userName} (${socket.id})`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});