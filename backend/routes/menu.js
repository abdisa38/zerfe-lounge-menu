const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

// Helper to query item by ObjectId or name
const findItem = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const item = await MenuItem.findById(id);
    if (item) return item;
  }
  return await MenuItem.findOne({
    $or: [{ name: id }, { _id: id }]
  });
};

// GET all dishes
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;
    const filter = {};
    if (category && category !== 'All Items') {
      filter.category = category;
    }
    if (available !== undefined) {
      filter.isAvailable = available === 'true';
    }

    const dishes = await MenuItem.find(filter).sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, data: dishes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new dish
router.post('/', async (req, res) => {
  try {
    const dishData = { ...req.body };
    if (!dishData.name) {
      return res.status(400).json({ success: false, error: 'Dish name is required.' });
    }
    if (dishData.price === undefined || isNaN(Number(dishData.price))) {
      return res.status(400).json({ success: false, error: 'Valid dish price is required.' });
    }

    const dish = new MenuItem(dishData);
    await dish.save();
    res.status(201).json({ success: true, data: dish });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update dish
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let dish;
    if (mongoose.Types.ObjectId.isValid(id)) {
      dish = await MenuItem.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    }
    if (!dish) {
      dish = await MenuItem.findOneAndUpdate(
        { $or: [{ name: id }, { _id: id }] },
        req.body,
        { new: true, runValidators: true }
      );
    }
    if (!dish) return res.status(404).json({ success: false, error: 'Dish not found' });
    res.json({ success: true, data: dish });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH toggle dish availability
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const dish = await findItem(id);
    if (!dish) return res.status(404).json({ success: false, error: 'Dish not found' });
    dish.isAvailable = !dish.isAvailable;
    await dish.save();
    res.json({ success: true, data: dish });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE dish
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let dish;
    if (mongoose.Types.ObjectId.isValid(id)) {
      dish = await MenuItem.findByIdAndDelete(id);
    }
    if (!dish) {
      dish = await MenuItem.findOneAndDelete({ $or: [{ name: id }, { _id: id }] });
    }
    if (!dish) return res.status(404).json({ success: false, error: 'Dish not found' });
    res.json({ success: true, message: 'Dish deleted successfully', data: dish });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
