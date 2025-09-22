const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// Search projects and tasks
const searchAll = async (req, res) => {
  try {
    const { q, type, status, priority, assignee, projectId } = req.query;
    const userId = req.user._id;

    let searchResults = {
      projects: [],
      tasks: []
    };

    // Search projects
    if (!type || type === 'projects') {
      const projectQuery = {
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      };

      if (q) {
        projectQuery.$and = [
          {
            $or: [
              { title: { $regex: q, $options: 'i' } },
              { description: { $regex: q, $options: 'i' } }
            ]
          }
        ];
      }

      if (status) {
        projectQuery.status = status;
      }

      const projects = await Project.find(projectQuery)
        .populate('owner', 'name email avatar')
        .populate('members.user', 'name email avatar')
        .sort({ updatedAt: -1 })
        .limit(20);

      searchResults.projects = projects;
    }

    // Search tasks
    if (!type || type === 'tasks') {
      const taskQuery = {};

      // Find projects user has access to
      const userProjects = await Project.find({
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      }).select('_id');

      const projectIds = userProjects.map(p => p._id);
      taskQuery.project = { $in: projectIds };

      if (projectId) {
        taskQuery.project = projectId;
      }

      if (q) {
        taskQuery.$and = [
          {
            $or: [
              { title: { $regex: q, $options: 'i' } },
              { description: { $regex: q, $options: 'i' } }
            ]
          }
        ];
      }

      if (status) {
        taskQuery.status = status;
      }

      if (priority) {
        taskQuery.priority = priority;
      }

      if (assignee) {
        taskQuery['assignees.user'] = assignee;
      }

      const tasks = await Task.find(taskQuery)
        .populate('project', 'title')
        .populate('assignees.user', 'name email avatar')
        .populate('createdBy', 'name email')
        .sort({ updatedAt: -1 })
        .limit(50);

      searchResults.tasks = tasks;
    }

    res.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error while searching' });
  }
};

// Get filter options
const getFilterOptions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's projects
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    }).select('_id title');

    // Get unique statuses from tasks
    const statuses = await Task.distinct('status', {
      project: { $in: projects.map(p => p._id) }
    });

    // Get unique priorities from tasks
    const priorities = await Task.distinct('priority', {
      project: { $in: projects.map(p => p._id) }
    });

    // Get assignees from user's projects
    const assignees = await Task.aggregate([
      {
        $match: {
          project: { $in: projects.map(p => p._id) }
        }
      },
      {
        $unwind: '$assignees'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignees.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$user._id',
          name: { $first: '$user.name' },
          email: { $first: '$user.email' },
          avatar: { $first: '$user.avatar' }
        }
      }
    ]);

    res.json({
      projects,
      statuses,
      priorities,
      assignees
    });
  } catch (error) {
    console.error('Filter options error:', error);
    res.status(500).json({ message: 'Server error while getting filter options' });
  }
};

module.exports = {
  searchAll,
  getFilterOptions
};
