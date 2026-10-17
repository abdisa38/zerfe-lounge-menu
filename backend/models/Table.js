const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, trim: true, unique: true },
    area: { type: String, default: 'Indoor Dining' },
    seats: { type: Number, default: 4 },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved'],
      default: 'available'
    },
    isActive: { type: Boolean, default: true },
    activeOrderRef: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', TableSchema);
