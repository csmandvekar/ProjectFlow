const Team = require('../models/Team');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

// Get team members
const getTeamMembers = async (req, res) => {
  try {
    console.log('Getting team members for user:', req.user._id);
    
    // Find team where user is a member
    const team = await Team.findOne({
      members: { $elemMatch: { user: req.user._id } }
    }).populate('members.user', 'name email avatar role');

    if (!team) {
      console.log('No team found for user');
      return res.status(404).json({ message: 'User is not part of any team' });
    }

    const members = team.members.map(member => ({
      _id: member.user._id,
      name: member.user.name,
      email: member.user.email,
      avatar: member.user.avatar,
      role: member.role,
      joinedAt: member.joinedAt
    }));

    console.log('Found team members:', members.length);
    res.json(members);
  } catch (error) {
    console.error('Error getting team members:', error);
    res.status(500).json({ message: 'Server error while fetching team members' });
  }
};

// Get team invites
const getTeamInvites = async (req, res) => {
  try {
    const team = await Team.findOne({
      'members.user': req.user._id,
      'members.role': 'admin'
    });

    if (!team) {
      return res.json([]);
    }

    res.json(team.pendingInvites);
  } catch (error) {
    console.error('Error getting team invites:', error);
    res.status(500).json({ message: 'Server error while fetching invites' });
  }
};

// Send team invitation
const inviteMember = async (req, res) => {
  try {
    console.log('Invite request body:', req.body);
    const { email } = req.body;
    if (!email) {
      console.log('No email provided in request');
      return res.status(400).json({ message: 'Email is required' });
    }
    console.log('Inviting member:', email);

    // Check if user is admin or owner
    const team = await Team.findOne({
      members: {
        $elemMatch: {
          user: req.user._id,
          role: { $in: ['admin', 'owner'] }
        }
      }
    });

    if (!team) {
      console.log('User is not an admin or owner of any team');
      return res.status(403).json({ message: 'Only team admins or owners can send invitations' });
    }

    // Check if invited user exists
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already in the team
    const isAlreadyMember = team.members.some(member => 
      member.user.toString() === invitedUser._id.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    // Check if invitation is already pending
    const existingInvite = team.pendingInvites.find(invite => 
      invite.email === email
    );
    
    if (existingInvite) {
      // Remove the existing invite
      team.pendingInvites = team.pendingInvites.filter(invite => 
        invite.email !== email
      );
    }

    // Add new invite
    team.pendingInvites.push({
      email,
      role: 'member',
      invitedBy: req.user._id,
      invitedAt: new Date()
    });
    await team.save();

    // Clear any existing notifications for this team invite
    const existingNotifications = invitedUser.notifications.filter(n => 
      n.type === 'team_invite' && 
      n.team && 
      n.team.equals(team._id)
    );
    if (existingNotifications.length > 0) {
      invitedUser.notifications = invitedUser.notifications.filter(n => 
        !(n.type === 'team_invite' && n.team && n.team.equals(team._id))
      );
      invitedUser.unreadNotificationsCount = Math.max(
        0, 
        invitedUser.unreadNotificationsCount - existingNotifications.length
      );
      await invitedUser.save();
    }

    // Send notification to invited user
    await NotificationService.createNotification({
      recipient: invitedUser._id,
      sender: req.user._id,
      type: 'team_invite',
      title: 'Team Invitation',
      message: `${req.user.name} has invited you to join their team`,
      team: team._id,
      actionType: 'accept_invite',
      actionData: { teamId: team._id, inviteId: team.pendingInvites[team.pendingInvites.length - 1]._id }
    });

    console.log('Invitation sent successfully');
    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error sending team invitation:', error);
    res.status(500).json({ message: 'Server error while sending invitation' });
  }
};

// Accept team invitation
const acceptInvitation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const team = await Team.findOne({
      'pendingInvites._id': inviteId
    });

    if (!team) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    const invite = team.pendingInvites.id(inviteId);
    if (invite.email !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to accept this invitation' });
    }

    // Add user to team members
    team.members.push({
      user: req.user._id,
      role: invite.role,
      joinedAt: new Date()
    });

    // Remove invitation
    team.pendingInvites.pull(inviteId);
    await team.save();

    // Update user's team reference
    await User.findByIdAndUpdate(req.user._id, { teamId: team._id });

    // Notify team admin
    await NotificationService.createNotification({
      recipient: team.members.find(m => m.role === 'admin').user,
      sender: req.user._id,
      type: 'member_joined',
      title: 'New Team Member',
      message: `${req.user.name} has joined your team`,
      actionType: 'view'
    });

    res.json({ message: 'Successfully joined team' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ message: 'Server error while accepting invitation' });
  }
};

// Reject team invitation
const rejectInvitation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const team = await Team.findOne({
      'pendingInvites._id': inviteId
    });

    if (!team) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    const invite = team.pendingInvites.id(inviteId);
    if (invite.email !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to reject this invitation' });
    }

    // Remove invitation
    team.pendingInvites.pull(inviteId);
    await team.save();

    res.json({ message: 'Invitation rejected' });
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    res.status(500).json({ message: 'Server error while rejecting invitation' });
  }
};

module.exports = {
  getTeamMembers,
  getTeamInvites,
  inviteMember,
  acceptInvitation,
  rejectInvitation
};