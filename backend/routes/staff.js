const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// Staff Login by Role/Username/Email and PIN
router.post('/login', async (req, res) => {
  try {
    const { role, pin, email, username } = req.body;
    let query = {};

    const rawId = (email || username || '').toLowerCase().trim();
    if (rawId) {
      if (rawId === 'admin') {
        query = { $or: [{ role: 'Owner' }, { email: 'admin@abaykitchen.et' }] };
      } else if (rawId === 'manager') {
        query = { role: 'Manager' };
      } else if (rawId === 'kitchen') {
        query = { role: 'Kitchen' };
      } else if (rawId === 'waiter') {
        query = { role: 'Waiter' };
      } else if (rawId === 'customer') {
        query = { role: 'Customer' };
      } else {
        query = { $or: [{ email: rawId }, { name: new RegExp('^' + rawId + '$', 'i') }] };
      }
    } else if (role) {
      query = { role };
    } else {
      return res.status(400).json({ success: false, error: 'Username or email required for login.' });
    }

    let staff = await Staff.findOne(query);

    // If admin is requested and not found in database, automatically seed admin
    if (!staff && (rawId === 'admin' || rawId === 'admin@abaykitchen.et' || role === 'Owner')) {
      staff = await Staff.create({
        name: 'Abay Admin',
        email: 'admin@abaykitchen.et',
        phone: '+251 91 123 4567',
        role: 'Owner',
        pin: '1234',
        status: 'Active'
      });
    } else if (!staff && rawId === 'customer') {
      staff = await Staff.create({
        name: 'Guest Diner',
        email: 'customer@abaykitchen.et',
        phone: '+251 91 234 5678',
        role: 'Customer',
        pin: '1234',
        status: 'Active'
      });
    } else if (!staff && rawId && !['admin', 'manager', 'kitchen', 'waiter', 'owner'].includes(rawId)) {
      // Auto-register customer account on login
      const displayName = rawId.includes('@') ? rawId.split('@')[0] : rawId;
      const capitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      staff = await Staff.create({
        name: capitalized,
        email: rawId.includes('@') ? rawId : `${rawId}@customer.abaykitchen.et`,
        role: 'Customer',
        pin: (pin || '').trim() || '1234',
        status: 'Active'
      });
    }

    if (!staff) {
      return res.status(404).json({ success: false, error: 'No account found with this username or email.' });
    }

    // Check PIN / password
    const enteredPin = (pin || '').trim();
    if (staff.pin && enteredPin && staff.pin !== enteredPin) {
      return res.status(401).json({ success: false, error: 'Incorrect password or PIN.' });
    }

    staff.lastLogin = new Date();
    await staff.save();

    res.json({
      success: true,
      message: `Welcome back, ${staff.name}`,
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        status: staff.status,
        lastLogin: staff.lastLogin
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all staff
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find().select('-pin').sort({ createdAt: 1 });
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new staff member
router.post('/', async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update staff
router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!staff) return res.status(404).json({ success: false, error: 'Staff member not found' });
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE staff
router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ success: false, error: 'Staff member not found' });
    res.json({ success: true, message: 'Staff member removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
