const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone: { type: String, default: '' },
    role: {
      type: String,
      enum: ['Owner', 'Manager', 'Kitchen', 'Waiter', 'Customer'],
      default: 'Waiter'
    },
    pin: { type: String, default: '1234' },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Invited'],
      default: 'Active'
    },
    lastLogin: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', StaffSchema);
