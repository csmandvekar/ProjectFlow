const Project = require('../models/Project');
const User = require('../models/User');

// Get all projects for the current user
const getProjects = async (req, res) => {
  try {
    console.log('Fetching projects for user:', req.user._id);
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

    console.log('Found projects:', projects.length);
    res.json(projects);
  } catch (error) {
    console.error('Error in getProjects:', error);
    res.status(500).json({ message: 'Server error while fetching projects' });
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    console.log('Finding project with ID:', req.params.id, 'for user:', req.user._id);
    
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

    console.log('Found project:', {
      id: project?._id,
      owner: project?.owner,
      memberCount: project?.members?.length,
      members: project?.members
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error in getProject:', error);
    res.status(500).json({ message: 'Server error while fetching project' });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const { title, description, deadline, status = 'active' } = req.body;

    console.log('Creating project:', { title, owner: req.user._id });

    const project = new Project({
      title,
      description,
      deadline,
      status,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }] // Add owner as a member by default
    });

    console.log('Project before save:', {
      title: project.title,
      owner: project.owner,
      memberCount: project.members.length,
      members: project.members.map(m => ({
        id: m.user.toString(),
        role: m.role
      }))
    });

    await project.save();
    
    // Populate the owner and members fields before sending response
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    console.log('Project after save:', {
      title: project.title,
      owner: project.owner,
      memberCount: project.members.length,
      members: project.members.map(m => ({
        id: m.user._id.toString(),
        name: m.user.name,
        role: m.role
      }))
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Error in createProject:', error);
    res.status(500).json({ message: 'Server error while creating project' });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can update certain fields
    if (project.owner.toString() !== req.user._id.toString()) {
      const allowedUpdates = ['status'];
      const updates = Object.keys(req.body);
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(403).json({ message: 'Only project owner can perform this update' });
      }
    }

    Object.assign(project, req.body);
    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.json(project);
  } catch (error) {
    console.error('Error in updateProject:', error);
    res.status(500).json({ message: 'Server error while updating project' });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id // Only owner can delete
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.deleteOne({ _id: project._id });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({ message: 'Server error while deleting project' });
  }
};

// Add member to project
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('Adding member with email:', email);
    
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (project.members.some(member => member.user.toString() === user._id.toString())) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add new member
    project.members.push({ user: user._id, role: 'member' });
    
    console.log('Project members before save:', {
      memberCount: project.members.length,
      members: project.members.map(m => ({
        id: m.user.toString(),
        role: m.role
      }))
    });

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    console.log('Project members after save:', {
      memberCount: project.members.length,
      members: project.members.map(m => ({
        id: m.user._id.toString(),
        name: m.user.name,
        role: m.role
      }))
    });

    res.json(project);
  } catch (error) {
    console.error('Error in addMember:', error);
    res.status(500).json({ message: 'Server error while adding member' });
  }
};

// Remove member from project
const removeMember = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id // Only owner can remove members
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const memberId = req.params.memberId;
    if (memberId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    project.members = project.members.filter(member => member.user.toString() !== memberId);
    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.json(project);
  } catch (error) {
    console.error('Error in removeMember:', error);
    res.status(500).json({ message: 'Server error while removing member' });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};