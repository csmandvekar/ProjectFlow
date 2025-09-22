const Task = require('../models/Task');
const Project = require('../models/Project');
const NotificationService = require('../services/notificationService');
const { taskPermissions } = require('../middleware/taskPermissions');
const cloudinary = require('cloudinary').v2;

// Get all tasks for a project
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignees.user', 'name email avatar')
      .populate('assignees.assignedBy', 'name')
      .populate('attachments.uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.findOne({
      _id: taskId,
      project: projectId
    }).populate('assignee', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assignees, deadline } = req.body;

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Validate and process assignees
    let validatedAssignees = [];
    if (Array.isArray(assignees) && assignees.length > 0) {
      // Filter out empty or invalid assignees
      const validAssignees = assignees.filter(a => a && a.user && a.role);
      
      // Check if all assignees are project members
      for (const assignee of validAssignees) {
        const isMember = project.members.some(member => 
          member.user.toString() === assignee.user.toString()
        );
        if (!isMember) {
          return res.status(400).json({ 
            message: `User ${assignee.user} must be a project member to be assigned` 
          });
        }
        validatedAssignees.push({
          user: assignee.user,
          role: assignee.role,
          assignedBy: req.user._id,
          assignedAt: new Date()
        });
      }
    }

    const task = new Task({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      project: projectId,
      assignees: validatedAssignees,
      deadline,
      createdBy: req.user._id
    });

    await task.save();
    await task.populate('assignees.user', 'name email avatar');
    await task.populate('assignees.assignedBy', 'name');
    await task.populate('project', 'title');

    // Send notifications to all assignees
    for (const assignee of task.assignees) {
      if (assignee.user._id.toString() !== req.user._id.toString()) {
        await NotificationService.createNotification({
          type: 'task_assigned',
          title: `New Task Assignment (${assignee.role})`,
          message: `${req.user.name} assigned you as ${assignee.role} assignee to task "${title}" in project "${task.project.title}"`,
          recipient: assignee.user._id,
          sender: req.user._id,
          project: projectId,
          actionType: 'view',
          actionData: { projectId, taskId: task._id }
        });
      }
    }

    // Notify project members about new task
    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('task:created', task);

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const updates = req.body;

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get the original task
    const originalTask = await Task.findOne({ _id: taskId, project: projectId })
      .populate('assignees.user', 'name email avatar')
      .populate('project', 'title');
      
    if (!originalTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check user's permission to update the task
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = project.members.some(m => 
      m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );
    const isPrimaryAssignee = originalTask.assignees.some(a => 
      a.user._id.toString() === req.user._id.toString() && a.role === 'primary'
    );

    if (!isOwner && !isAdmin && !isPrimaryAssignee) {
      return res.status(403).json({ 
        message: 'Only project owner, admin, or primary assignee can update task details' 
      });
    }

    // Handle assignee updates if present
    if (updates.assignees) {
      if (!Array.isArray(updates.assignees)) {
        return res.status(400).json({ message: 'Assignees must be an array' });
      }

      // Validate and process new assignees
      const validatedAssignees = [];
      for (const assignee of updates.assignees) {
        if (!assignee.user || !assignee.role) {
          return res.status(400).json({ 
            message: 'Each assignee must have user and role properties' 
          });
        }

        const isMember = project.members.some(member => 
          member.user.toString() === assignee.user.toString()
        );
        if (!isMember) {
          return res.status(400).json({ 
            message: `User ${assignee.user} must be a project member to be assigned` 
          });
        }

        validatedAssignees.push({
          user: assignee.user,
          role: assignee.role,
          assignedBy: req.user._id,
          assignedAt: new Date()
        });
      }

      updates.assignees = validatedAssignees;
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      updates,
      { new: true }
    )
    .populate('assignees.user', 'name email avatar')
    .populate('assignees.assignedBy', 'name')
    .populate('project', 'title');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Send notifications for assignee changes
    if (updates.assignees) {
      // Find new assignees
      const newAssignees = task.assignees.filter(newAssignee => 
        !originalTask.assignees.some(oldAssignee => 
          oldAssignee.user._id.toString() === newAssignee.user._id.toString()
        )
      );

      // Find removed assignees
      const removedAssignees = originalTask.assignees.filter(oldAssignee => 
        !task.assignees.some(newAssignee => 
          newAssignee.user._id.toString() === oldAssignee.user._id.toString()
        )
      );

      // Notify new assignees
      for (const assignee of newAssignees) {
        if (assignee.user._id.toString() !== req.user._id.toString()) {
          await NotificationService.createNotification({
            type: 'task_assigned',
            title: `Task Assignment (${assignee.role})`,
            message: `${req.user.name} assigned you as ${assignee.role} assignee to task "${task.title}" in project "${task.project.title}"`,
            recipient: assignee.user._id,
            sender: req.user._id,
            project: projectId,
            actionType: 'view',
            actionData: { projectId, taskId }
          });
        }
      }

      // Notify removed assignees
      for (const assignee of removedAssignees) {
        await NotificationService.createNotification({
          type: 'task_updated',
          title: 'Task Assignment Removed',
          message: `${req.user.name} removed you from task "${task.title}" in project "${task.project.title}"`,
          recipient: assignee.user._id,
          sender: req.user._id,
          project: projectId,
          actionType: 'view',
          actionData: { projectId, taskId }
        });
      }
    }

    // Notify project members about task update
    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('task:updated', task);

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Check if user has access to the project and their role
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get the task first to check permissions
    const task = await Task.findOne({ _id: taskId, project: projectId })
      .populate('assignees.user', 'name email')
      .populate('project', 'title');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to delete
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = project.members.some(m => 
      m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );
    const isTaskCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isTaskCreator) {
      return res.status(403).json({ 
        message: 'Only project owner, admin, or task creator can delete tasks' 
      });
    }

    // Notify all assignees about task deletion
    for (const assignee of task.assignees) {
      if (assignee.user._id.toString() !== req.user._id.toString()) {
        await NotificationService.createNotification({
          type: 'task_deleted',
          title: 'Task Deleted',
          message: `${req.user.name} deleted task "${task.title}" in project "${task.project.title}"`,
          recipient: assignee.user._id,
          sender: req.user._id,
          project: projectId,
          actionType: 'view',
          actionData: { projectId }
        });
      }
    }

    // Delete the task
    await Task.findOneAndDelete({
      _id: taskId,
      project: projectId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Notify project members about task deletion
    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('task:deleted', taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};

// Add comment to task
const addComment = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { content } = req.body;
    
    // Check if user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.findOne({
      _id: taskId,
      project: projectId
    })
    .populate('assignees.user', 'name email')
    .populate('project', 'title');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = {
      content,
      author: req.user._id,
      createdAt: new Date()
    };

    task.comments.push(comment);
    await task.save();
    await task.populate('comments.author', 'name email');

    // Notify all assignees about the new comment
    for (const assignee of task.assignees) {
      if (assignee.user._id.toString() !== req.user._id.toString()) {
        await NotificationService.createNotification({
          type: 'comment_added',
          title: 'New Comment',
          message: `${req.user.name} commented on task "${task.title}" in project "${task.project.title}"`,
          recipient: assignee.user._id,
          sender: req.user._id,
          project: projectId,
          actionType: 'view',
          actionData: { projectId, taskId }
        });
      }
    };

    // Notify project members about new comment
    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('task:commented', {
      taskId,
      comment: task.comments[task.comments.length - 1]
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
};

// Upload file to task
const uploadFile = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find the task
    const task = await Task.findOne({
      _id: taskId,
      project: projectId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Add attachment to task
    const attachment = {
      name: req.file.originalname,
      url: req.file.path,
      type: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id
    };

    task.attachments.push(attachment);
    await task.save();

    // Populate the uploadedBy field
    await task.populate('attachments.uploadedBy', 'name email');

    // Notify project members about file upload
    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('file:uploaded', {
      taskId,
      attachment: task.attachments[task.attachments.length - 1],
      uploadedBy: req.user.name
    });

    res.json({
      message: 'File uploaded successfully',
      attachment: task.attachments[task.attachments.length - 1]
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ message: 'Server error while uploading file' });
  }
};

// Delete file from task
const deleteFile = async (req, res) => {
  try {
    const { projectId, taskId, attachmentId } = req.params;

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find the task
    const task = await Task.findOne({
      _id: taskId,
      project: projectId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find the attachment
    const attachment = task.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Check if user can delete (uploader, task creator, or project owner)
    const canDelete = attachment.uploadedBy.toString() === req.user._id.toString() ||
                     task.createdBy.toString() === req.user._id.toString() ||
                     project.owner.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ message: 'You can only delete your own files' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(attachment.url.split('/').pop().split('.')[0]);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Remove from task
    task.attachments.pull(attachmentId);
    await task.save();

    // Notify project members about file deletion
    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('file:deleted', {
      taskId,
      attachmentId,
      deletedBy: req.user.name
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error while deleting file' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  uploadFile,
  deleteFile
};