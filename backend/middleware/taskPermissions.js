const Task = require('../models/Task');
const Project = require('../models/Project');

const taskPermissions = {
  primary: ['view', 'edit', 'delete', 'assign', 'comment'],
  secondary: ['view', 'edit', 'comment'],
  projectOwner: ['view', 'edit', 'delete', 'assign', 'comment'],
  projectAdmin: ['view', 'edit', 'delete', 'assign', 'comment'],
  projectMember: ['view', 'comment']
};

const checkTaskPermission = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    // Get task with project details
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get project with members
    const project = await Project.findById(task.project._id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check user's project role
    const projectMember = project.members.find(m => m.user.toString() === userId.toString());
    if (!projectMember) {
      return res.status(403).json({ message: 'User is not a project member' });
    }

    // Check user's task role
    const taskAssignee = task.assignees.find(a => a.user.toString() === userId.toString());
    
    // Determine user's permissions
    let userPermissions = [];

    // Project owner/admin permissions override task permissions
    if (project.owner.toString() === userId.toString()) {
      userPermissions = taskPermissions.projectOwner;
    } else if (projectMember.role === 'admin') {
      userPermissions = taskPermissions.projectAdmin;
    } else if (taskAssignee) {
      // Task assignee permissions
      userPermissions = taskPermissions[taskAssignee.role];
    } else {
      // Regular project member
      userPermissions = taskPermissions.projectMember;
    }

    // Check if the requested action is allowed
    const action = req.taskAction; // This should be set by the route handler
    if (!userPermissions.includes(action)) {
      return res.status(403).json({ 
        message: `You don't have permission to ${action} this task` 
      });
    }

    // Add permissions to request for use in controllers
    req.taskPermissions = userPermissions;
    req.projectRole = projectMember.role;
    req.taskRole = taskAssignee ? taskAssignee.role : null;

    next();
  } catch (error) {
    console.error('Task permission check error:', error);
    res.status(500).json({ message: 'Error checking task permissions' });
  }
};

// Helper middleware to set the task action
const setTaskAction = (action) => (req, res, next) => {
  req.taskAction = action;
  next();
};

module.exports = {
  checkTaskPermission,
  setTaskAction,
  taskPermissions
};
