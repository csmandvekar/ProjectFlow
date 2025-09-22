const mongoose = require('mongoose');
const Team = require('../models/Team');
const User = require('../models/User');
require('dotenv').config();

async function setupDefaultTeam() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('MONGO_URI not found in environment variables');
      return;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please run checkUsers.js first.');
      return;
    }

    console.log('Found admin user:', {
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email
    });

    // Delete any existing teams
    console.log('\nDeleting existing teams...');
    await Team.deleteMany({});

    // Create default team
    console.log('\nCreating default team...');
    const defaultTeam = new Team({
      name: 'ProjectFlow Team',
      description: 'Main organization team',
      owner: adminUser._id,
      members: [{
        user: adminUser._id,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    await defaultTeam.save();

    // Update admin user with team reference
    adminUser.teamId = defaultTeam._id;
    await adminUser.save();

    console.log('\nDefault team created successfully:', {
      teamId: defaultTeam._id,
      teamName: defaultTeam.name,
      memberCount: defaultTeam.members.length,
      owner: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  setupDefaultTeam()
    .then(() => console.log('Script completed'))
    .catch(err => console.error('Script failed:', err));
}

module.exports = setupDefaultTeam;
