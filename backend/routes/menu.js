const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

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
    const dish = new MenuItem(req.body);
    await dish.save();
    res.status(201).json({ success: true, data: dish });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update dish
router.put('/:id', async (req, res) => {
  try {
    const dish = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dish) return res.status(404).json({ success: false, error: 'Dish not found' });
    res.json({ success: true, data: dish });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH toggle dish availability
router.patch('/:id/toggle', async (req, res) => {
  try {
    const dish = await MenuItem.findById(req.params.id);
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
    const dish = await MenuItem.findByIdAndDelete(req.params.id);
    if (!dish) return res.status(404).json({ success: false, error: 'Dish not found' });
    res.json({ success: true, message: 'Dish deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
