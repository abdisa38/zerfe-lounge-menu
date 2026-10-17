const mongoose = require('mongoose');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Order = require('./models/Order');
const Staff = require('./models/Staff');
const Setting = require('./models/Setting');

const initialCategories = [
  { name: 'Tibs & Sizzlers', slug: 'tibs-sizzlers', description: 'Sizzling clay pots, dry-roasted cuts & prime tenderloin tibs', icon: 'flame', displayOrder: 1 },
  { name: 'Traditional Wats', slug: 'traditional-wats', description: 'Slow-simmered rich red berbere and golden mild Ethiopian stews', icon: 'bowl', displayOrder: 2 },
  { name: 'Raw & Delicacies', slug: 'raw-delicacies', description: 'Freshly carved cuts, seasoned kitfo, gored gored, and dulet', icon: 'utensils', displayOrder: 3 },
  { name: 'Hotel Meat Specialties', slug: 'hotel-meat-specialties', description: 'Gomen be siga, bone-in broth kekel, dinich be siga, and tihlo', icon: 'crown', displayOrder: 4 },
  { name: 'Firfir & Fasting', slug: 'firfir-fasting', description: 'Crispy dirkosh firfir with kitfo, bozena shiro, and colorful beyaynetu', icon: 'leaf', displayOrder: 5 },
  { name: 'Hotel Breakfast', slug: 'hotel-breakfast', description: 'Chechebsa with honey & spiced butter, shakshuka, and enkulal firfir', icon: 'coffee', displayOrder: 6 },
  { name: 'Burgers & Mains', slug: 'burgers-mains', description: 'Prime beef burgers, flame-grilled chicken, and lounge favorites', icon: 'utensils', displayOrder: 7 },
  { name: 'Stone-Baked Pizza', slug: 'stone-baked-pizza', description: 'Artisan crust pizzas baked fresh with mozzarella and savory toppings', icon: 'utensils', displayOrder: 8 },
  { name: 'Fresh Juices & Coffee', slug: 'juices-coffee', description: 'Special avocado-mango spris and traditional Bale Highland jebena coffee', icon: 'coffee', displayOrder: 9 },
  { name: 'Desserts', slug: 'desserts', description: 'Warm chocolate lava cake and delightful sweet lounge treats', icon: 'crown', displayOrder: 10 }
];

const initialDishes = [
  // 1. Tibs & Sizzlers
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
    displayOrder: 1
  },
  {
    name: 'Awaze Tibs (አዋዜ ጥብስ)',
    description: 'Sautéed tender beef chunks tossed in a tangy and spicy awaze chili paste sauce with red onions and rosemary.',
    price: 740,
    category: 'Tibs & Sizzlers',
    image: 'photo-1600891964599-f61ba0e24092',
    tag: 'Spicy',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 2
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
    displayOrder: 3
  },
  {
    name: 'Yebeg Tibs (የበግ ጥብስ)',
    description: 'Sautéed or grilled tender highland mutton (lamb) marinated in local rosemary, garlic, and spiced butter.',
    price: 760,
    category: 'Tibs & Sizzlers',
    image: 'photo-1555939594-58d7cb561ad1',
    tag: 'Highland Lamb',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 4
  },
  {
    name: 'Chikina Tibs (የጭቅና ጥብስ)',
    description: 'Premium, exceptionally tender tibs fillet cut from prime beef tenderloin. Lightly pan-fried with onions, garlic, fresh rosemary, and green chilies.',
    price: 890,
    category: 'Tibs & Sizzlers',
    image: 'photo-1600891964599-f61ba0e24092',
    tag: 'Prime Tenderloin',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 5
  },

  // 2. Traditional Wats
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
    displayOrder: 6
  },
  {
    name: 'Key Wat / Sega Wat (ሥጋ ወጥ)',
    description: 'A thick, spicy red beef stew simmered slowly in a rich berbere sauce, caramelized onions, ginger, and garlic.',
    price: 620,
    category: 'Traditional Wats',
    image: 'photo-1588166524941-3bf61a9c41db',
    tag: 'Classic Stew',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 7
  },
  {
    name: 'Alicha Wat (አሊቻ ወጥ)',
    description: 'A mild, non-spicy golden yellow beef or lamb stew made with turmeric, ginger, garlic, and onions instead of berbere.',
    price: 590,
    category: 'Traditional Wats',
    image: 'photo-1547592180-85f173990554',
    tag: 'Mild Stew',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 8
  },
  {
    name: 'Zigni (ዝግኒ)',
    description: 'An East-African-style spiced beef or lamb cube stew cooked with heavy tomatoes, garlic, and berbere, closely related to traditional red stews.',
    price: 650,
    category: 'Traditional Wats',
    image: 'photo-1588166524941-3bf61a9c41db',
    tag: 'Slow Braised',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 9
  },
  {
    name: 'Minchet Abish (ምንቸት አቢሽ)',
    description: 'A finely ground beef stew cooked with onions, garlic, ginger, and subtly flavored with fenugreek (abish). Topped with a hard-boiled egg.',
    price: 610,
    category: 'Traditional Wats',
    image: 'photo-1746716447103-e1618bbd0669',
    tag: 'House Classic',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 10
  },

  // 3. Raw & Delicacies
  {
    name: 'Kitfo (ክትፎ)',
    description: 'Finely minced lean raw, medium-rare (leb leb), or cooked beef seasoned with mitmita and warm niter kibbeh. Served with kocho, ayib, and gomen.',
    price: 750,
    category: 'Raw & Delicacies',
    image: 'photo-1544025162-d76694265947',
    tag: "Chef's Choice",
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 11
  },
  {
    name: 'Gored Gored (ጎረድ ጎረድ)',
    description: 'Cubed raw or very rare prime beef seasoned with mitmita, spices, and warm niter kibbeh, served with awaze and senafich.',
    price: 760,
    category: 'Raw & Delicacies',
    image: 'photo-1603048588665-791ca8aea617',
    tag: 'Raw Cut',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '10-15 min',
    displayOrder: 12
  },
  {
    name: 'Dulet (ዱለት)',
    description: 'A finely chopped and spiced dish made from a mix of finely minced beef, liver, and tripe cooked with niter kibbeh, onions, garlic, and mitmita.',
    price: 640,
    category: 'Raw & Delicacies',
    image: 'photo-1541832676-9b763b0239ab',
    tag: 'Specialty',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 13
  },
  {
    name: 'Tere Siga (ጥሬ ሥጋ)',
    description: 'Fresh raw meat sliced straight from the carcass at the table, served with fiery mitmita, senafich, and awaze for dipping.',
    price: 850,
    category: 'Raw & Delicacies',
    image: 'photo-1588166524941-3bf61a9c41db',
    tag: 'Butcher Cut',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '10-15 min',
    displayOrder: 14
  },

  // 4. Hotel Meat Specialties
  {
    name: 'Gomen be Siga (ጎመን በሥጋ)',
    description: 'Tender chunks of beef sautéed and simmered with chopped highland collard greens (gomen), garlic, ginger, and spiced butter.',
    price: 580,
    category: 'Hotel Meat Specialties',
    image: 'photo-1574484284002-952d92456975',
    tag: 'Traditional',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 15
  },
  {
    name: 'Kekel (ቀቅል)',
    description: 'A light, clear-broth nourishing soup made with bone-in lamb or beef, potatoes, and green peppers with digestive herbs.',
    price: 520,
    category: 'Hotel Meat Specialties',
    image: 'photo-1547592180-85f173990554',
    tag: 'Nourishing Broth',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 16
  },
  {
    name: 'Dinich be Siga (ድንች በሥጋ)',
    description: 'A comforting home-style or hotel-menu stew made with tender chunks of beef and golden potatoes simmered in a mild spiced sauce.',
    price: 540,
    category: 'Hotel Meat Specialties',
    image: 'photo-1563379091339-03b21ab4a4f8',
    tag: 'Comfort Food',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 17
  },
  {
    name: 'Tihlo (ጥህሎ)',
    description: 'Smooth, kneaded barley dough rounds speared with traditional wooden forks and dipped into a rich, spicy lamb or beef stew (wret).',
    price: 680,
    category: 'Hotel Meat Specialties',
    image: 'photo-1546069901-ba9599a7e63c',
    tag: 'Cultural Platter',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 18
  },

  // 5. Firfir & Fasting
  {
    name: 'Dirkosh Firfir be Kitfo / Bequanta (ድርቆሽ ፍርፍር)',
    description: 'Dried, crispy pieces of injera rehydrated in rich spiced butter and berbere sauce, layered with beef jerky (quanta) or topped with fresh kitfo.',
    price: 740,
    category: 'Firfir & Fasting',
    image: 'photo-1593252719532-53f183016149',
    tag: 'Deluxe Firfir',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 19
  },
  {
    name: 'Siga Firfir / Bozena Shiro (ቦዘና ሽሮ በሥጋ)',
    description: 'A highly popular hybrid hotel dish where tender chunks of seasoned beef are simmered directly inside a thick, boiling clay pot of Shiro with spiced butter.',
    price: 580,
    category: 'Firfir & Fasting',
    image: 'photo-1593252719532-53f183016149',
    tag: 'Hotel Favourite',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 20
  },
  {
    name: 'The Garden Beyaynetu (የፆም በያይነቱ)',
    description: 'A colourful spread of spiced red lentils (misir wat), yellow split peas (kik alicha), collard greens, shiro, and seasonal vegetables on injera.',
    price: 460,
    category: 'Firfir & Fasting',
    image: 'photo-1512621776951-a57141f2eefd',
    tag: 'Plant-based',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 21
  },

  // 6. Hotel Breakfast
  {
    name: 'Zerfe Special Chechebsa (ጨጨብሳ በቅቤና ማር)',
    description: 'Delicate torn flatbread (kita) pan-fried in generous niter kibbeh (spiced butter) and berbere, drizzled with pure Bale highland organic honey.',
    price: 380,
    category: 'Hotel Breakfast',
    image: 'photo-1509722747041-616f39b57569',
    tag: 'Morning Special',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '10-15 min',
    displayOrder: 22
  },
  {
    name: 'Morning Shakshuka (ሻክሹካ)',
    description: 'Free-range farm eggs gently poached in a rich skillet sauce of simmered tomatoes, sweet peppers, garlic, cumin, and fresh herbs. Served with warm bread.',
    price: 340,
    category: 'Hotel Breakfast',
    image: 'photo-1525351484163-7529414344d8',
    tag: "Chef's Breakfast",
    isCustomizable: true,
    isAvailable: true,
    prepTime: '10-15 min',
    displayOrder: 23
  },
  {
    name: 'Enkulal Firfir be Siga (እንቁላል ፍርፍር በሥጋ)',
    description: 'Fluffy scrambled farm eggs sautéed with seasoned minced beef, sliced onions, tomatoes, and fresh green chilies. Served with warm injera or toast.',
    price: 360,
    category: 'Hotel Breakfast',
    image: 'photo-1567620905732-2d1ec7ab7445',
    tag: 'High Protein',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '10-15 min',
    displayOrder: 24
  },

  // 7. Burgers & Mains
  {
    name: 'Zerfe Signature Prime Burger',
    description: '200g charbroiled prime beef patty, aged cheddar, caramelized balsamic onions, crisp lettuce, tomato, and secret house sauce in a toasted brioche bun. Served with golden fries.',
    price: 580,
    category: 'Burgers & Mains',
    image: 'photo-1568901346375-23c9450c58cd',
    tag: 'House Favourite',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 25
  },
  {
    name: 'Herb-Grilled Half Chicken',
    description: 'Flame-grilled half tender chicken marinated in fresh highland rosemary, garlic, and lemon butter. Served with roasted vegetables and hand-cut potato wedges.',
    price: 650,
    category: 'Burgers & Mains',
    image: 'photo-1670398564097-0762e1b30b3a',
    tag: 'Flame Grilled',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '20-25 min',
    displayOrder: 26
  },

  // 8. Stone-Baked Pizza
  {
    name: 'Garden Margherita Pizza',
    description: 'Stone-baked artisan dough, San Marzano tomato reduction, melted fresh mozzarella, and sweet garden basil leaves drizzled with extra virgin olive oil.',
    price: 620,
    category: 'Stone-Baked Pizza',
    image: 'photo-1574071318508-1cdbab80d002',
    tag: 'Stone Baked',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 27
  },
  {
    name: 'Meat Lovers Beef Pizza',
    description: 'Artisan crust loaded with spicy seasoned ground beef, beef pepperoni, rosemary, sweet bell peppers, red onions, and bubbly melted mozzarella.',
    price: 720,
    category: 'Stone-Baked Pizza',
    image: 'photo-1565299624946-b28f40a0ae38',
    tag: 'Best Seller',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '15-20 min',
    displayOrder: 28
  },

  // 9. Fresh Juices & Coffee
  {
    name: 'Special Layered Spris Juice (ስፕሪስ ጁስ)',
    description: 'A velvety layered blend of freshly pureed ripe Bale avocado and sweet tropical mango, served with a squeeze of fresh lime and a drizzle of honey.',
    price: 220,
    category: 'Fresh Juices & Coffee',
    image: 'photo-1622597467836-f3285f2131b8',
    tag: 'Fresh Tropical',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '5-10 min',
    displayOrder: 29
  },
  {
    name: 'Bale Highland Coffee Ceremony (የባሌ ቡና)',
    description: 'Authentic traditional Ethiopian coffee ceremony brewed in a clay pot (jebena) from freshly pan-roasted Bale mountain arabica beans. Served with popped barley (kolo).',
    price: 150,
    category: 'Fresh Juices & Coffee',
    image: 'photo-1514432324607-a09d9b4aefdd',
    tag: 'Traditional Ceremony',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '10-15 min',
    displayOrder: 30
  },

  // 10. Desserts
  {
    name: 'Warm Chocolate Lava Cake',
    description: 'Decadent Belgian dark chocolate sponge cake with a molten fudge center, served warm with a scoop of Madagascar vanilla ice cream and mint.',
    price: 340,
    category: 'Desserts',
    image: 'photo-1578985545062-69928b1d9587',
    tag: 'Sweet Finish',
    isCustomizable: true,
    isAvailable: true,
    prepTime: '10-15 min',
    displayOrder: 31
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

async function seedDatabase(forceRefresh = true) {
  try {
    console.log('Seeding Zerfe Lounge & Hotel complete 31-dish catalog & 10 categories...');
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});

    await Category.insertMany(initialCategories);
    await MenuItem.insertMany(initialDishes);
    await Order.insertMany(initialOrders);
    console.log(`✓ Seeded ${initialCategories.length} categories and ${initialDishes.length} items with complete info & photos.`);

    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      await Table.insertMany(initialTables);
      console.log('✓ Tables seeded.');
    }

    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      await Staff.insertMany(initialStaff);
      console.log('✓ Staff members seeded.');
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
        console.log('✓ Admin account created: admin@zerfelounge.et (PIN: 1234)');
      }
    }

    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      await Setting.create({});
      console.log('✓ Settings seeded.');
    }

    console.log('✓ All database seeds successfully installed for Zerfe Lounge & Hotel!');
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
