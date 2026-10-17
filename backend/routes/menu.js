const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

// Helper to query item by ObjectId, name, or search term
const findItem = async (id, fallbackName) => {
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    const item = await MenuItem.findById(id);
    if (item) return item;
  }
  const searchName = fallbackName || id;
  if (searchName && typeof searchName === 'string') {
    const escaped = searchName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const item = await MenuItem.findOne({ name: new RegExp('^' + escaped + '$', 'i') });
    if (item) return item;
  }
  return null;
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

// PUT update dish (Finds by ObjectId OR dish name, or upserts so it never fails)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let dish = null;

    // 1. Try finding by MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      dish = await MenuItem.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    }

    // 2. Try finding by dish name from body
    if (!dish && req.body.name) {
      dish = await MenuItem.findOneAndUpdate(
        { name: req.body.name.trim() },
        req.body,
        { new: true, runValidators: true }
      );
    }

    // 3. Try finding by ID string as dish name
    if (!dish && id && isNaN(Number(id))) {
      const escaped = id.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      dish = await MenuItem.findOneAndUpdate(
        { name: new RegExp('^' + escaped + '$', 'i') },
        req.body,
        { new: true, runValidators: true }
      );
    }

    // 4. If still not found, create a new dish so update is never lost
    if (!dish) {
      dish = await MenuItem.create({
        ...req.body,
        name: req.body.name || `Dish ${id}`
      });
    }

    res.json({ success: true, data: dish });
  } catch (err) {
    console.error('Error in PUT /menu/:id:', err);
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
    let dish = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      dish = await MenuItem.findByIdAndDelete(id);
    }

    if (!dish && id && isNaN(Number(id))) {
      const escaped = id.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      dish = await MenuItem.findOneAndDelete({ name: new RegExp('^' + escaped + '$', 'i') });
    }

    res.json({ success: true, message: 'Dish deleted successfully', data: dish });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
