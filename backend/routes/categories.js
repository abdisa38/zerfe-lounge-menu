const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// GET all categories with dishCount
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, createdAt: 1 });
    const dishes = await MenuItem.find();
    
    // Calculate dish counts
    const counts = {};
    dishes.forEach(d => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });

    const result = categories.map(cat => ({
      _id: cat._id,
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
      dishCount: counts[cat.name] || 0
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new category (Create)
router.post('/', async (req, res) => {
  try {
    const { name, description, icon, displayOrder, isActive } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newCategory = new Category({
      name: name.trim(),
      slug: slug || `category-${Date.now()}`,
      description: description || '',
      icon: icon || 'utensils',
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    await newCategory.save();
    res.status(201).json({ success: true, data: newCategory });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update category (Update)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, icon, displayOrder, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const oldName = category.name;
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    // If name changed, optionally update existing menu items in this category
    if (name && name !== oldName) {
      await MenuItem.updateMany({ category: oldName }, { category: name });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE category (Delete)
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `Category "${category.name}" removed successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
