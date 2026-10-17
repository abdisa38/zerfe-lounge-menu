const mongoose = require('mongoose');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Order = require('./models/Order');
const Staff = require('./models/Staff');
const Setting = require('./models/Setting');

const initialCategories = [
  { name: 'Tibs & Sizzlers', slug: 'tibs-sizzlers', description: 'Dry-roasted, sizzling clay-pot, and prime cut beef & lamb tibs', icon: 'flame', displayOrder: 1 },
  { name: 'Traditional Wats', slug: 'traditional-wats', description: 'Slow-simmered rich red berbere and golden mild Ethiopian stews', icon: 'bowl', displayOrder: 2 },
  { name: 'Raw & Delicacies', slug: 'raw-delicacies', description: 'Freshly carved cuts, seasoned kitfo, gored gored, and dulet', icon: 'utensils', displayOrder: 3 },
  { name: 'Hotel Meat Specialties', slug: 'hotel-meat-specialties', description: 'Gomen be siga, bone-in broth kekel, dinich be siga, and tihlo', icon: 'crown', displayOrder: 4 },
  { name: 'Firfir & Hybrids', slug: 'firfir-hybrids', description: 'Crispy dirkosh firfir with kitfo/quanta and sizzling bozena shiro', icon: 'coffee', displayOrder: 5 }
];

const initialDishes = [
  {
    name: 'Doro Wat (ዶሮ ወጥ)',
    description: 'A rich, slow-cooked chicken stew seasoned with berbere spice, niter kibbeh (clarified spiced butter), onions, and garlic, traditionally served with a hard-boiled egg.',
    price: 680,
    category: 'Traditional Wats',
    image: 'photo-1746716447103-e1618bbd0669',
    tag: 'House Special',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '25-30 min',
    displayOrder: 1
  },
  {
    name: 'Kitfo (ክትፎ)',
    description: 'Finely minced raw, medium-rare (leb leb), or cooked beef seasoned with mitmita (spicy chili powder) and mixed with warm niter kibbeh. Served with kocho, ayib, and gomen.',
    price: 750,
    category: 'Raw & Delicacies',
    image: 'photo-1544025162-d76694265947',
    tag: "Chef's Choice",
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 2
  },
  {
    name: 'Derek Tibs (ደረቅ ጥብስ)',
    description: 'Dry-roasted or pan-fried chunks of beef, lamb, or goat cooked with onions, garlic, and peppers until slightly crispy.',
    price: 720,
    category: 'Tibs & Sizzlers',
    image: 'photo-1555939594-58d7cb561ad1',
    tag: 'Popular',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 3
  },
  {
    name: 'Awaze Tibs (አዋዜ ጥብስ)',
    description: 'Sautéed meat (beef or lamb) tossed in a tangy and spicy awaze chili paste sauce with peppers and onions.',
    price: 740,
    category: 'Tibs & Sizzlers',
    image: 'photo-1544025162-d76694265947',
    tag: 'Spicy',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 4
  },
  {
    name: 'Shekla Tibs (ሸክላ ጥብስ)',
    description: 'Meat strips cooked and served sizzling hot in a traditional clay pot (shekla) usually placed over glowing hot coals.',
    price: 780,
    category: 'Tibs & Sizzlers',
    image: 'photo-1529193591184-b1d58069ecdd',
    tag: 'Signature Sizzler',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 5
  },
  {
    name: 'Key Wat / Sega Wat (ሥጋ ወጥ)',
    description: 'A thick, spicy red beef stew simmered slowly in a berbere sauce, onions, ginger, and garlic.',
    price: 620,
    category: 'Traditional Wats',
    image: 'photo-1588166524941-3bf61a9c41db',
    tag: 'Classic Stew',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 6
  },
  {
    name: 'Alicha Wat (አሊቻ ወጥ)',
    description: 'A mild, non-spicy yellow beef or lamb stew made with turmeric, ginger, garlic, and onions instead of berbere.',
    price: 590,
    category: 'Traditional Wats',
    image: 'photo-1547592180-85f173990554',
    tag: 'Mild Stew',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 7
  },
  {
    name: 'Gomen be Siga (ጎመን በሥጋ)',
    description: 'Tender chunks of beef sautéed and simmered with chopped collard greens (gomen), garlic, ginger, and spiced butter.',
    price: 580,
    category: 'Hotel Meat Specialties',
    image: 'photo-1574484284002-952d92456975',
    tag: 'Traditional',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 8
  },
  {
    name: 'Gored Gored (ጎረድ ጎረድ)',
    description: 'Cubed raw or very rare beef seasoned with mitmita, spices, and niter kibbeh, usually dipped in awaze.',
    price: 760,
    category: 'Raw & Delicacies',
    image: 'photo-1603048588665-791ca8aea617',
    tag: 'Raw Cut',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '10-15 min',
    displayOrder: 9
  },
  {
    name: 'Dulet (ዱለት)',
    description: 'A finely chopped and spiced dish made from a mix of finely minced beef, liver, and tripe cooked with niter kibbeh, onions, garlic, and mitmita.',
    price: 640,
    category: 'Raw & Delicacies',
    image: 'photo-1544025162-d76694265947',
    tag: 'Specialty',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 10
  },
  {
    name: 'Tere Siga (ጥሬ ሥጋ)',
    description: 'Fresh raw meat sliced straight from the carcass at the table, served with mitmita and awaze for dipping.',
    price: 850,
    category: 'Raw & Delicacies',
    image: 'photo-1588166524941-3bf61a9c41db',
    tag: 'Butcher Cut',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '10-15 min',
    displayOrder: 11
  },
  {
    name: 'Kekel (ቀቅል)',
    description: 'A light, clear-broth soup or mild stew typically made with bone-in lamb or beef, potatoes, and green peppers.',
    price: 520,
    category: 'Hotel Meat Specialties',
    image: 'photo-1547592180-85f173990554',
    tag: 'Nourishing Broth',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 12
  },
  {
    name: 'Dinich be Siga (ድንች በሥጋ)',
    description: 'A comforting home-style or hotel-menu stew made with chunks of beef and potatoes simmered in a mild or spiced sauce.',
    price: 540,
    category: 'Hotel Meat Specialties',
    image: 'photo-1588166524941-3bf61a9c41db',
    tag: 'Comfort Food',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 13
  },
  {
    name: 'Yebeg Tibs (የበግ ጥብስ)',
    description: 'Sautéed or grilled tender mutton (lamb) marinated in local herbs and spices.',
    price: 760,
    category: 'Tibs & Sizzlers',
    image: 'photo-1555939594-58d7cb561ad1',
    tag: 'Highland Lamb',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 14
  },
  {
    name: 'Zigni (ዝግኒ)',
    description: 'An East-African-style spiced beef or lamb cube stew cooked with heavy tomatoes and berbere, closely related to traditional red stews.',
    price: 650,
    category: 'Traditional Wats',
    image: 'photo-1588166524941-3bf61a9c41db',
    tag: 'Slow Braised',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 15
  },
  {
    name: 'Chikina Tibs (የጭቅና ጥብስ)',
    description: 'Premium, exceptionally tender tibs fillet cut from the beef tenderloin. It is lightly pan-fried with onions, garlic, tomatoes, fresh rosemary, and green chilies, offering a juicy texture.',
    price: 890,
    category: 'Tibs & Sizzlers',
    image: 'photo-1544025162-d76694265947',
    tag: 'Prime Tenderloin',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 16
  },
  {
    name: 'Dirkosh Firfir be Kitfo / Bequanta (ድርቆሽ ፍርፍር በክትፎ/በቋንጣ)',
    description: 'Dried, crispy pieces of injera (dirkosh) rehydrated in a rich spiced butter and berbere sauce, layered with beef jerky (quanta) or topped with fresh, warm kitfo.',
    price: 740,
    category: 'Firfir & Hybrids',
    image: 'photo-1593252719532-53f183016149',
    tag: 'Deluxe Firfir',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 17
  },
  {
    name: 'Tihlo (ጥህሎ)',
    description: 'A celebratory dish originating from the Tigray region. It consists of smooth, kneaded barley dough shaped into small rounds, which are speared with a traditional wooden fork and dipped into a rich, spicy lamb or beef stew (wret).',
    price: 680,
    category: 'Hotel Meat Specialties',
    image: 'photo-1544025162-d76694265947',
    tag: 'Cultural Platter',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 18
  },
  {
    name: 'Minchet Abish (ምንቸት አቢሽ)',
    description: 'A finely ground beef stew cooked with onions, garlic, ginger, and subtly flavored with fenugreek (abish). It is served as a spicy red stew or a mild yellow alicha, often topped with hard-boiled eggs.',
    price: 610,
    category: 'Traditional Wats',
    image: 'photo-1746716447103-e1618bbd0669',
    tag: 'House Classic',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 19
  },
  {
    name: 'Siga Firfir / Bozena Shiro (ቦዘና ሽሮ በሥጋ)',
    description: 'A highly popular hybrid hotel dish where tender chunks of seasoned beef or lamb are simmered directly inside a thick, boiling pot of Shiro (chickpea powder stew) with plenty of herbed butter.',
    price: 580,
    category: 'Firfir & Hybrids',
    image: 'photo-1593252719532-53f183016149',
    tag: 'Hotel Favourite',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 20
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
      { name: 'Doro Wat (ዶሮ ወጥ)', portion: 'Regular', extras: ['Extra egg'], instructions: 'Less spicy, please.', unitPrice: 740, quantity: 1 },
      { name: 'Shekla Tibs (ሸክላ ጥብስ)', portion: 'Regular', extras: ['Extra injera'], instructions: 'Medium rare meat, sizzling.', unitPrice: 825, quantity: 1 }
    ],
    orderNotes: 'Please bring all food together with extra napkins.',
    subtotal: 1565,
    total: 1565,
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
      { name: 'Kitfo (ክትፎ)', portion: 'Regular', extras: ['Extra ayib'], instructions: 'Leb-leb (medium rare)', unitPrice: 820, quantity: 1 },
      { name: 'Kekel (ቀቅል)', portion: 'Regular', extras: [], instructions: 'Hot clear broth', unitPrice: 520, quantity: 1 }
    ],
    orderNotes: 'Serve broth first as starter.',
    subtotal: 1340,
    total: 1340,
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
      { name: 'Chikina Tibs (የጭቅና ጥብስ)', portion: 'Regular', extras: ['Awaze sauce'], instructions: 'Tender fillet, well seared', unitPrice: 930, quantity: 1 },
      { name: 'Siga Firfir / Bozena Shiro (ቦዘና ሽሮ በሥጋ)', portion: 'Regular', extras: ['Extra kibbeh'], instructions: 'Bubbling hot in clay pot', unitPrice: 640, quantity: 1 }
    ],
    orderNotes: 'Quick order for outdoor seating.',
    subtotal: 1570,
    total: 1570,
    status: 'New',
    paymentMethod: 'Chapa',
    paymentStatus: 'Paid',
    placedAt: new Date(Date.now() - 3 * 60 * 1000)
  }
];

async function seedDatabase(forceRefresh = false) {
  try {
    const hasLegacyBurger = await Category.findOne({ slug: 'burgers' });
    const dishCount = await MenuItem.countDocuments();

    if (forceRefresh || hasLegacyBurger || dishCount < 15) {
      console.log('Refreshing database with 20 traditional Ethiopian hotel meat dishes...');
      await Category.deleteMany({});
      await MenuItem.deleteMany({});
      await Order.deleteMany({});

      await Category.insertMany(initialCategories);
      await MenuItem.insertMany(initialDishes);
      await Order.insertMany(initialOrders);
      console.log(`Seeded ${initialCategories.length} hotel categories and ${initialDishes.length} traditional meat dishes.`);
    } else {
      const categoryCount = await Category.countDocuments();
      if (categoryCount === 0) {
        await Category.insertMany(initialCategories);
      }
      if (dishCount === 0) {
        await MenuItem.insertMany(initialDishes);
      }
      const orderCount = await Order.countDocuments();
      if (orderCount === 0) {
        await Order.insertMany(initialOrders);
      }
    }

    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      await Table.insertMany(initialTables);
      console.log('Tables seeded.');
    }

    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
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

    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      await Setting.create({});
      console.log('Settings seeded.');
    }

    console.log('All MongoDB database seeds verified for Zerfe Lounge Hotel!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
}

if (require.main === module) {
  require('dotenv').config();
  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gebeta-qr';
  mongoose.connect(MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB for direct seeding...');
      await seedDatabase(true);
      console.log('Direct seeding complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to connect for seeding:', err.message);
      process.exit(1);
    });
}

module.exports = seedDatabase;
