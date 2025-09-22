require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');

async function migrateTaskAssignees() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Get all tasks
    const tasks = await Task.find({});
    console.log(`Found ${tasks.length} tasks to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    // Migrate each task
    for (const task of tasks) {
      try {
        if (task.assignee) {
          // Convert old assignee to new assignees array
          task.assignees = [{
            user: task.assignee,
            role: 'primary',
            assignedBy: task.createdBy,
            assignedAt: task.updatedAt || task.createdAt
          }];
          
          // Remove old assignee field
          task.assignee = undefined;

          await task.save();
          migratedCount++;
          console.log(`Migrated task: ${task._id}`);
        } else {
          // Task had no assignee, initialize empty array
          task.assignees = [];
          await task.save();
          skippedCount++;
          console.log(`Initialized empty assignees for task: ${task._id}`);
        }
      } catch (error) {
        console.error(`Error migrating task ${task._id}:`, error);
      }
    }

    console.log('\nMigration complete:');
    console.log(`- Successfully migrated: ${migratedCount} tasks`);
    console.log(`- Skipped (no assignee): ${skippedCount} tasks`);
    console.log(`- Total processed: ${tasks.length} tasks`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateTaskAssignees();
