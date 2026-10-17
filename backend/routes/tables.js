const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// GET all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.json({ success: true, data: tables });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new table
router.post('/', async (req, res) => {
  try {
    const table = new Table(req.body);
    await table.save();
    res.status(201).json({ success: true, data: table });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update table
router.put('/:id', async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return res.status(404).json({ success: false, error: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH table status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, error: 'Table not found' });
    if (status) table.status = status;
    await table.save();
    res.json({ success: true, data: table });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE table
router.delete('/:id', async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ success: false, error: 'Table not found' });
    res.json({ success: true, message: 'Table removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
