const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Project routes
router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

// Member management routes
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);

module.exports = router;
