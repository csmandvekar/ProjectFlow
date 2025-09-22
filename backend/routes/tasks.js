const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  uploadFile,
  deleteFile
} = require('../controllers/taskController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Task routes
router.get('/projects/:projectId/tasks', getTasks);
router.post('/projects/:projectId/tasks', createTask);
router.get('/projects/:projectId/tasks/:taskId', getTask);
router.patch('/projects/:projectId/tasks/:taskId', updateTask);
router.delete('/projects/:projectId/tasks/:taskId', deleteTask);

// Comment routes
router.post('/projects/:projectId/tasks/:taskId/comments', addComment);

// File upload routes
router.post('/projects/:projectId/tasks/:taskId/upload', upload.single('file'), uploadFile);
router.delete('/projects/:projectId/tasks/:taskId/attachments/:attachmentId', deleteFile);

module.exports = router;