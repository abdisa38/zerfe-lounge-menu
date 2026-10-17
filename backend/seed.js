const mongoose = require('mongoose');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Order = require('./models/Order');
const Staff = require('./models/Staff');
const Setting = require('./models/Setting');

const initialCategories = [
  { name: 'Breakfast', slug: 'breakfast', description: 'Fresh morning meals, shakshuka, and warm bread', icon: 'coffee', displayOrder: 1 },
  { name: 'Ethiopian Food', slug: 'ethiopian-food', description: 'Traditional stews, spicy wats, and injera platters', icon: 'utensils', displayOrder: 2 },
  { name: 'Main Courses', slug: 'main-courses', description: 'Flame-grilled chicken, steak, and wholesome mains', icon: 'bowl', displayOrder: 3 },
  { name: 'Burgers', slug: 'burgers', description: 'Gourmet handcrafted burgers with crispy seasoned fries', icon: 'burger', displayOrder: 4 },
  { name: 'Pizza', slug: 'pizza', description: 'Stone-baked thin-crust artisan pizzas with fresh toppings', icon: 'pizza', displayOrder: 5 },
  { name: 'Drinks', slug: 'drinks', description: 'Freshly blended fruit juices, coffee, and chilled beverages', icon: 'glass', displayOrder: 6 },
  { name: 'Desserts', slug: 'desserts', description: 'Decadent chocolate cakes, ice cream, and sweet finishes', icon: 'cake', displayOrder: 7 }
];

const initialDishes = [
  {
    name: 'Doro Wat',
    description: 'Slow-simmered chicken in a rich berbere sauce, with a boiled egg and soft injera.',
    price: 680,
    category: 'Ethiopian Food',
    image: 'photo-1746716447103-e1618bbd0669',
    tag: 'House favourite',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 1
  },
  {
    name: 'Sizzling Beef Tibs',
    description: 'Tender beef, rosemary, peppers and onions. Served sizzling, with fresh injera.',
    price: 720,
    category: 'Ethiopian Food',
    image: 'photo-1544025162-d76694265947',
    tag: 'Popular',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 2
  },
  {
    name: 'The Garden Beyaynetu',
    description: 'A colourful spread of lentils, seasonal greens and spiced vegetables on injera.',
    price: 460,
    category: 'Ethiopian Food',
    image: 'photo-1593252719532-53f183016149',
    tag: 'Plant-based',
    isCustomizable: false,
    isAvailable: true,
    prepTime: '10-15 min',
    displayOrder: 3
  },
  {
    name: 'Herb-Grilled Chicken',
    description: 'Flame-grilled chicken, garden vegetables and our signature herb dressing.',
    price: 650,
    category: 'Main Courses',
    image: 'photo-1670398564097-0762e1b30b3a',
    tag: '',
    isCustomizable: false,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 4
  },
  {
    name: 'Zerfe Signature Burger',
    description: 'Grilled beef, aged cheddar, caramelised onions and house sauce. Served with fries.',
    price: 580,
    category: 'Burgers',
    image: 'photo-1568901346375-23c9450c58cd',
    tag: '',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 5
  },
  {
    name: 'Garden Margherita',
    description: 'Stone-baked dough, tomato, fresh mozzarella and a scattering of basil.',
    price: 620,
    category: 'Pizza',
    image: 'photo-1574071318508-1cdbab80d002',
    tag: 'Vegetarian',
    isCustomizable: false,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 6
  },
  {
    name: 'Fresh Mango Juice',
    description: 'Freshly blended ripe mango. Sunshine in a glass, with no added sugar.',
    price: 180,
    category: 'Drinks',
    image: 'photo-1622597467836-f3285f2131b8',
    tag: '',
    isCustomizable: false,
    isAvailable: true,
    prepTime: '5-10 min',
    displayOrder: 7
  },
  {
    name: 'Chocolate Indulgence',
    description: 'Warm chocolate cake with a soft centre and a scoop of vanilla ice cream.',
    price: 320,
    category: 'Desserts',
    image: 'photo-1578985545062-69928b1d9587',
    tag: '',
    isCustomizable: false,
    isAvailable: false,
    prepTime: '10-15 min',
    displayOrder: 8
  },
  {
    name: 'Morning Shakshuka',
    description: 'Free-range eggs nestled in slow-cooked tomatoes, with warm sourdough.',
    price: 340,
    category: 'Breakfast',
    image: 'photo-1525351484163-7529414344d8',
    tag: '',
    isCustomizable: false,
    isAvailable: true,
    prepTime: '12-18 min',
    displayOrder: 9
  }
];

const initialTables = [
  { number: 'Table 01', area: 'Indoor Dining', seats: 2, status: 'available' },
  { number: 'Table 02', area: 'Indoor Dining', seats: 4, status: 'occupied' },
  { number: 'Table 03', area: 'Indoor Dining', seats: 6, status: 'available' },
  { number: 'Table 04', area: 'Garden Terrace', seats: 4, status: 'occupied' },
  { number: 'Table 05', area: 'Garden Terrace', seats: 4, status: 'available' },
  { number: 'Table 06', area: 'Garden Terrace', seats: 8, status: 'available' },
  { number: 'Table 07', area: 'Bar Lounge', seats: 2, status: 'occupied' },
  { number: 'Table 08', area: 'Indoor Dining', seats: 4, status: 'occupied' }
];

const initialStaff = [
  { name: 'Zerfe Admin', email: 'admin@zerfelounge.et', phone: '+251 92 234 5678', role: 'Owner', pin: '1234', status: 'Active' },
  { name: 'Abebe Bekele', email: 'abebe@zerfelounge.et', phone: '+251 92 234 5678', role: 'Owner', pin: '1234', status: 'Active' },
  { name: 'Tigist Alemu', email: 'tigist@zerfelounge.et', phone: '+251 92 234 5679', role: 'Manager', pin: '1234', status: 'Active' },
  { name: 'Dawit Hailu', email: 'dawit@zerfelounge.et', phone: '+251 92 345 6789', role: 'Kitchen', pin: '1234', status: 'Active' },
  { name: 'Sara Girma', email: 'sara@zerfelounge.et', phone: '+251 92 456 7890', role: 'Waiter', pin: '1234', status: 'Active' },
  { name: 'Yohannes Tadesse', email: 'yohannes@zerfelounge.et', phone: '+251 92 567 8901', role: 'Waiter', pin: '1234', status: 'Active' }
];

const initialOrders = [
  {
    reference: 'DEMO-ZL-8F92B104',
    customerName: 'Abdisa Awel',
    customerPhone: '+251 91 100 2233',
    table: 'Table 08',
    lines: [
      { name: 'Doro Wat', portion: 'Regular', extras: ['Extra egg'], instructions: 'Less spicy, please.', unitPrice: 740, quantity: 1 },
      { name: 'Sizzling Beef Tibs', portion: 'Regular', extras: ['Extra injera'], instructions: 'Medium rare meat.', unitPrice: 765, quantity: 1 }
    ],
    orderNotes: 'Please bring all food together with extra napkins.',
    subtotal: 1505,
    total: 1505,
    status: 'Preparing',
    paymentMethod: 'Telebirr',
    paymentStatus: 'Paid',
    placedAt: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    reference: 'DEMO-ZL-3A10C921',
    customerName: 'Helen Tsegaye',
    customerPhone: '+251 92 334 5566',
    table: 'Table 08',
    lines: [
      { name: 'Fresh Mango Juice', portion: 'Regular', extras: [], instructions: 'With crushed ice', unitPrice: 180, quantity: 2 }
    ],
    orderNotes: 'Cold drinks first.',
    subtotal: 360,
    total: 360,
    status: 'Completed',
    paymentMethod: 'CBE Birr',
    paymentStatus: 'Paid',
    placedAt: new Date(Date.now() - 50 * 60 * 1000)
  },
  {
    reference: 'DEMO-ZL-5B71C809',
    customerName: 'Meron Haile',
    customerPhone: '+251 93 445 6677',
    table: 'Table 04',
    lines: [
      { name: 'Zerfe Signature Burger', portion: 'Regular', extras: ['Extra cheese'], instructions: 'Extra crispy fries', unitPrice: 600, quantity: 1 },
      { name: 'Garden Margherita', portion: 'Regular', extras: [], instructions: 'Fresh basil', unitPrice: 620, quantity: 1 }
    ],
    orderNotes: 'Quick order for outdoor seating.',
    subtotal: 1220,
    total: 1220,
    status: 'New',
    paymentMethod: 'Chapa',
    paymentStatus: 'Paid',
    placedAt: new Date(Date.now() - 3 * 60 * 1000)
  }
];

async function seedDatabase() {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('Seeding initial categories...');
      await Category.insertMany(initialCategories);
      console.log('Categories seeded.');
    }

    const dishCount = await MenuItem.countDocuments();
    if (dishCount === 0) {
      console.log('Seeding initial dishes...');
      await MenuItem.insertMany(initialDishes);
      console.log('Dishes seeded.');
    }

    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      console.log('Seeding initial dining tables...');
      await Table.insertMany(initialTables);
      console.log('Tables seeded.');
    }

    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      console.log('Seeding initial staff members...');
      await Staff.insertMany(initialStaff);
      console.log('Staff members seeded.');
    } else {
      const adminExists = await Staff.findOne({ email: 'admin@zerfelounge.et' });
      if (!adminExists) {
        await Staff.create({
          name: 'Zerfe Admin',
          email: 'admin@zerfelounge.et',
          phone: '+251 92 234 5678',
          role: 'Owner',
          pin: '1234',
          status: 'Active'
        });
        console.log('Admin account created: admin@zerfelounge.et (PIN: 1234)');
      }
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      console.log('Seeding initial demo orders...');
      await Order.insertMany(initialOrders);
      console.log('Orders seeded.');
    }

    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      console.log('Seeding initial settings...');
      await Setting.create({});
      console.log('Settings seeded.');
    }

    console.log('All MongoDB database seeds verified!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
}

module.exports = seedDatabase;
