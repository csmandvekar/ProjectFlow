const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const sanitize = require('./middleware/sanitize');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const notificationRoutes = require('./routes/notifications');
const teamRoutes = require('./routes/team'); // Add this line

const app = express();
const server = createServer(app);

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:8080",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
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
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitize);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/team', teamRoutes); // Add this line

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Project Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      notifications: '/api/notifications',
      team: '/api/team',
      health: '/api/health'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user's personal room for notifications
  socket.on('join-user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${socket.id} joined personal room ${userId}`);
  });

  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`User ${socket.id} joined project ${projectId}`);

    socket.to(`project:${projectId}`).emit('user:joined', {
      userId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`User ${socket.id} left project ${projectId}`);

    socket.to(`project:${projectId}`).emit('user:left', {
      userId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('typing', (data) => {
    const { projectId, taskId, isTyping } = data;
    socket.to(`project:${projectId}`).emit('user:typing', {
      userId: socket.id,
      taskId,
      isTyping,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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