const mongoose = require('mongoose');

const OrderLineSchema = new mongoose.Schema(
  {
    key: { type: String },
    dishId: { type: String },
    name: { type: String, required: true },
    portion: { type: String, default: 'Regular' },
    extras: [{ type: String }],
    instructions: { type: String, default: '' },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, default: '' },
    table: { type: String, required: true, default: 'Table 08' },
    lines: [OrderLineSchema],
    orderNotes: { type: String, default: '' },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['New', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
      default: 'New'
    },
    paymentMethod: {
      type: String,
      enum: ['Telebirr', 'CBE Birr', 'Chapa', 'Cash', 'Card'],
      default: 'Telebirr'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Paid'
    },
    chapaTxRef: { type: String, default: '' },
    placedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
