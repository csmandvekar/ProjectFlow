const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTeamMembers,
  inviteMember,
  acceptInvitation,
  rejectInvitation,
  getTeamInvites
} = require('../controllers/teamController');

// All team routes require authentication
router.use(auth);

// Get team members
router.get('/members', getTeamMembers);

// Get team invites
router.get('/invites', getTeamInvites);

// Send team invitation
router.post('/invite', inviteMember);

// Accept team invitation
router.post('/invites/:inviteId/accept', acceptInvitation);

// Reject team invitation
router.post('/invites/:inviteId/reject', rejectInvitation);

module.exports = router;