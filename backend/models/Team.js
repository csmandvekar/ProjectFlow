const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [50, 'Team name cannot be more than 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  pendingInvites: [{
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure owner is always in members
teamSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('owner')) {
    const ownerMember = this.members.find(member => 
      member.user.toString() === this.owner.toString()
    );
    
    if (!ownerMember) {
      this.members.push({
        user: this.owner,
        role: 'owner',
        joinedAt: this.createdAt
      });
    }
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema);
