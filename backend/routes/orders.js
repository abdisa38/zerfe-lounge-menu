const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const { status, table } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (table) {
      filter.table = table;
    }

    const orders = await Order.find(filter).sort({ placedAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single order by reference
router.get('/:ref', async (req, res) => {
  try {
    const order = await Order.findOne({ reference: req.params.ref });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Customer Checkout (Create Order)
router.post('/checkout', async (req, res) => {
  try {
    const { customerName, customerPhone, table, lines, orderNotes, paymentMethod, chapaTxRef } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, error: 'Customer name is required to place an order.' });
    }

    if (!lines || !lines.length) {
      return res.status(400).json({ success: false, error: 'Cart is empty. Add at least one dish.' });
    }

    // Calculate subtotal
    const subtotal = lines.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const total = subtotal; // Inclusive of VAT and standard service

    // Generate unique order reference
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const reference = `GQ-AK-${randomSuffix}`;

    const order = new Order({
      reference,
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : '',
      table: table || 'Table 08',
      lines: lines.map(line => ({
        key: line.key,
        dishId: line.dish?.id ? String(line.dish.id) : undefined,
        name: line.name || line.dish?.name || 'Dish',
        portion: line.portion || 'Regular',
        extras: Array.isArray(line.extras) ? line.extras : [],
        instructions: line.instructions || '',
        unitPrice: line.unitPrice,
        quantity: line.quantity
      })),
      orderNotes: orderNotes || '',
      subtotal,
      total,
      status: 'New',
      paymentMethod: paymentMethod || 'Telebirr',
      paymentStatus: paymentMethod === 'Cash' ? 'Pending' : 'Paid',
      chapaTxRef: chapaTxRef || '',
      placedAt: new Date()
    });

    await order.save();

    // Mark the table as occupied
    if (table) {
      await Table.findOneAndUpdate(
        { number: table },
        { status: 'occupied', activeOrderRef: reference }
      );
    }

    res.status(201).json({
      success: true,
      data: order,
      message: `Order ${reference} successfully created for ${customerName}!`
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['New', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    order.status = status;
    await order.save();

    // If completed or cancelled, optionally release table if no other active orders
    if (status === 'Completed' || status === 'Cancelled') {
      const activeForTable = await Order.countDocuments({
        table: order.table,
        status: { $in: ['New', 'Preparing', 'Ready'] }
      });
      if (activeForTable === 0) {
        await Table.findOneAndUpdate({ number: order.table }, { status: 'available', activeOrderRef: null });
      }
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
