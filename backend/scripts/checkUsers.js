const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('MONGO_URI not found in environment variables');
      return;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');

    // Find all users
    const users = await User.find({}).select('name email role');
    console.log('\nCurrent Users:');
    console.log('-------------');
    users.forEach(user => {
      console.log({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    });

    // Delete admin user if exists
    console.log('\nDeleting existing admin user...');
    const deleteResult = await User.deleteOne({ email: 'csmandvekar@gmail.com' });
    console.log('Delete result:', deleteResult);

    // Create new admin user
    console.log('\nCreating new admin user...');
    const plainPassword = 'admin123';

    const newAdmin = new User({
      name: 'Chinmay Mandvekar',
      email: 'csmandvekar@gmail.com',
      password: plainPassword, // Will be hashed by the pre-save middleware
      role: 'admin'
    });

    await newAdmin.save();

    // Verify the password
    console.log('\nVerifying password...');
    const isMatch = await newAdmin.comparePassword(plainPassword);
    
    console.log('\nPassword verification result:', isMatch);
    console.log('\nCreated new admin user with credentials:');
    console.log({
      email: 'csmandvekar@gmail.com',
      password: plainPassword,
      passwordMatches: isMatch
    });

    // Show final user list
    const finalUsers = await User.find({}).select('name email role');
    console.log('\nFinal User List:');
    console.log('---------------');
    finalUsers.forEach(user => {
      console.log({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
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
  checkUsers()
    .then(() => console.log('Script completed'))
    .catch(err => console.error('Script failed:', err));
}

module.exports = checkUsers;