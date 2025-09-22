const mongoose = require('mongoose');
const Team = require('../models/Team');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createDefaultTeam() {
  try {
    const uri = process.env.MONGO_URI;  // Changed from MONGODB_URI to MONGO_URI
    if (!uri) {
      console.error('MONGO_URI not found in environment variables');
      return;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');

    // Create or find admin user
    const adminEmail = 'csmandvekar@gmail.com'; // Your admin email
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.log('Creating admin user...');
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      adminUser = new User({
        name: 'Chinmay Mandvekar',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
      // Update role to admin if not already
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('Updated user role to admin');
      }
    }

    // Check for existing team
    let team = await Team.findOne({ owner: adminUser._id });

    if (!team) {
      console.log('Creating default team...');
      team = new Team({
        name: 'ProjectFlow Team',
        description: 'Main organization team',
        owner: adminUser._id,
        members: [{
          user: adminUser._id,
          role: 'admin',
          joinedAt: new Date()
        }]
      });

      await team.save();

      // Update admin user with team reference
      adminUser.teamId = team._id;
      await adminUser.save();

      console.log('Default team created successfully');
    } else {
      console.log('Team already exists for admin user');
    }

    // Log final status
    console.log('\nSetup Complete:');
    console.log('---------------');
    console.log('Admin User:', {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role
    });
    console.log('Team:', {
      id: team._id,
      name: team.name,
      memberCount: team.members.length
    });

  } catch (error) {
    console.error('Error in setup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  createDefaultTeam()
    .then(() => console.log('Script completed'))
    .catch(err => console.error('Script failed:', err));
}

module.exports = createDefaultTeam;