const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    restaurantName: { type: String, default: 'Abay Kitchen' },
    tagline: { type: String, default: 'Authentic Ethiopian Flavors & Modern Dining' },
    cuisine: { type: String, default: 'Ethiopian & Continental' },
    phone: { type: String, default: '+251 91 123 4567' },
    email: { type: String, default: 'contact@abaykitchen.et' },
    address: { type: String, default: 'Bole Medhanialem, Camrose Bldg 2nd Floor, Addis Ababa' },
    openingHours: { type: String, default: 'Mon – Sun: 07:00 AM – 11:00 PM' },
    currency: { type: String, default: 'ETB' },
    wifiSsid: { type: String, default: 'AbayKitchen_Guest' },
    wifiPassword: { type: String, default: 'Enjera2026' },
    directOrdering: { type: Boolean, default: true },
    prepTimeEstimate: { type: String, default: '15 – 20 mins' },
    allowSpecialNotes: { type: Boolean, default: true },
    soundAlerts: { type: Boolean, default: true },
    autoPrintTickets: { type: Boolean, default: false },
    serviceCharge: { type: Number, default: 10 },
    taxVat: { type: Number, default: 15 },
    telebirrEnabled: { type: Boolean, default: true },
    telebirrMerchantCode: { type: String, default: '892341' },
    cbeBirrEnabled: { type: Boolean, default: true },
    cbeBirrAccount: { type: String, default: '100028471920' },
    chapaEnabled: { type: Boolean, default: true },
    chapaPublicKey: { type: String, default: 'CHAPUBK_TEST-demo-key' },
    chapaSecretKey: { type: String, default: 'CHASECK_TEST-demo-secret' },
    cashEnabled: { type: Boolean, default: true },
    posEnabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', SettingSchema);
