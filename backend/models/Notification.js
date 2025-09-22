const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['task_assigned', 'task_updated', 'comment_added', 'project_invited', 'task_due_soon'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  data: {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
