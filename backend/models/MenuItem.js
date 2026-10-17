const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: 'photo-1746716447103-e1618bbd0669' },
    tag: { type: String, default: '' },
    isCustomizable: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    prepTime: { type: String, default: '15-20 min' },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', MenuItemSchema);
