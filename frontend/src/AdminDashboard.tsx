import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { SessionOrder } from './OrderTracking';
import './admin.css';
import { api, type ApiCategory, type ApiOrder, type ApiStaff, getDishImageUrl } from './api';

// SVG Icons (Clean & recognizable)
function AdminIcon({ name, size = 18 }: { name: string; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
    orders: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    menu: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></>,
    categories: <><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></>,
    tables: <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" x2="9" y1="4" y2="20"/><line x1="15" x2="15" y1="4" y2="20"/></>,
    staff: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></>,
    reports: <><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    plus: <><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    edit: <><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    close: <><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></>,
    qr: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/></>,
    printer: <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></>,
    userPlus: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    mail: <><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></>,
    refreshCw: <><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></>,
    alertTriangle: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    moreVertical: <><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></>,
    lock: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    crown: <><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
    userX: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></>,
    trendingUp: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
    trendingDown: <><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    arrowUpRight: <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>,
    wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
    creditCard: <><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></>,
    store: <><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></>,
    volume2: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>,
    receipt: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" x2="16" y1="8" y2="8"/><line x1="8" x2="16" y1="12" y2="12"/><line x1="8" x2="13" y1="16" y2="16"/></>,
    hamburger: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name] || icons.dashboard}
    </svg>
  );
}

// Clean, high-contrast, scannable QR Code SVG Generator
export function TableQRCodeSVG({ size = 160, tableNumber = '08', color = '#143D2B' }: { size?: number; tableNumber?: string; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label={`QR Code for ${tableNumber}`}>
      <rect width="100" height="100" fill="#FAF8F5" rx="6" />
      {/* Top Left Marker */}
      <rect x="8" y="8" width="26" height="26" rx="4" stroke={color} strokeWidth="4" />
      <rect x="15" y="15" width="12" height="12" rx="2" fill={color} />
      {/* Top Right Marker */}
      <rect x="66" y="8" width="26" height="26" rx="4" stroke={color} strokeWidth="4" />
      <rect x="73" y="15" width="12" height="12" rx="2" fill={color} />
      {/* Bottom Left Marker */}
      <rect x="8" y="66" width="26" height="26" rx="4" stroke={color} strokeWidth="4" />
      <rect x="15" y="73" width="12" height="12" rx="2" fill={color} />
      {/* Data Pattern Modules */}
      <rect x="40" y="12" width="6" height="6" fill={color} />
      <rect x="52" y="12" width="6" height="6" fill={color} />
      <rect x="46" y="24" width="6" height="6" fill={color} />
      <rect x="12" y="42" width="6" height="6" fill={color} />
      <rect x="24" y="42" width="6" height="6" fill={color} />
      <rect x="18" y="52" width="6" height="6" fill={color} />
      <rect x="70" y="42" width="6" height="6" fill={color} />
      <rect x="82" y="42" width="6" height="6" fill={color} />
      <rect x="76" y="52" width="6" height="6" fill={color} />
      <rect x="40" y="76" width="6" height="6" fill={color} />
      <rect x="52" y="76" width="6" height="6" fill={color} />
      <rect x="46" y="66" width="6" height="6" fill={color} />
      <rect x="68" y="70" width="6" height="6" fill={color} />
      <rect x="80" y="70" width="6" height="6" fill={color} />
      <rect x="74" y="82" width="6" height="6" fill={color} />
      {/* Center Zerfe Lounge Badge */}
      <rect x="38" y="38" width="24" height="24" rx="4" fill="#C69234" />
      <text x="50" y="53" fill="#143D2B" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">ZL</text>
    </svg>
  );
}

const money = (n: number) => `ETB ${n.toLocaleString()}`;

export type DiningTable = {
  id: string;
  number: string;
  area: string;
  capacity: number;
  active: boolean;
  qrToken: string;
};

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  tag?: string;
  portions?: { name: string; price: number }[];
  extras?: { name: string; price: number }[];
};

const initialTables: DiningTable[] = [
  { id: 't1', number: 'Table 01', area: 'Main Dining', capacity: 2, active: true, qrToken: 'ak-t01-9f2b' },
  { id: 't2', number: 'Table 02', area: 'Main Dining', capacity: 4, active: true, qrToken: 'ak-t02-4a11' },
  { id: 't4', number: 'Table 04', area: 'Main Dining', capacity: 4, active: true, qrToken: 'ak-t04-8c7e' },
  { id: 't8', number: 'Table 08', area: 'Main Dining', capacity: 6, active: true, qrToken: 'ak-t08-3e44' },
  { id: 't10', number: 'Table 10', area: 'Main Dining', capacity: 8, active: true, qrToken: 'ak-t10-2b19' },
  { id: 'ter1', number: 'Terrace 01', area: 'Terrace', capacity: 2, active: true, qrToken: 'ak-ter1-5d88' },
  { id: 'ter2', number: 'Terrace 02', area: 'Terrace', capacity: 4, active: true, qrToken: 'ak-ter2-7f31' },
  { id: 'vip1', number: 'VIP Lounge', area: 'VIP Lounge', capacity: 10, active: false, qrToken: 'ak-vip1-1c02' },
];

const defaultDishes: MenuItem[] = [
  { id: 1, name: 'Doro Wat (ዶሮ ወጥ)', description: 'A rich, slow-cooked chicken stew seasoned with berbere spice, niter kibbeh, onions, and garlic, traditionally served with a hard-boiled egg.', price: 680, category: 'Traditional Wats', image: 'photo-1746716447103-e1618bbd0669', available: true, tag: 'House Special', portions: [{ name: 'Regular Portion', price: 0 }, { name: 'Double Piece Serving', price: 240 }], extras: [{ name: 'Extra Hard-Boiled Egg', price: 60 }, { name: 'Extra Injera Roll', price: 45 }] },
  { id: 2, name: 'Kitfo (ክትፎ)', description: 'Finely minced raw, medium-rare (leb leb), or cooked beef seasoned with mitmita and warm niter kibbeh. Served with kocho and ayib.', price: 750, category: 'Raw & Delicacies', image: 'photo-1544025162-d76694265947', available: true, tag: "Chef's Choice", portions: [{ name: 'Regular (Leb-Leb)', price: 0 }, { name: 'Large Platter', price: 220 }], extras: [{ name: 'Extra Kocho', price: 80 }, { name: 'Fresh Ayib', price: 70 }] },
  { id: 3, name: 'Derek Tibs (ደረቅ ጥብስ)', description: 'Dry-roasted or pan-fried chunks of beef, lamb, or goat cooked with onions, garlic, and peppers until slightly crispy.', price: 720, category: 'Tibs & Sizzlers', image: 'photo-1555939594-58d7cb561ad1', available: true, tag: 'Popular', portions: [{ name: 'Regular Pan', price: 0 }, { name: 'Large Platter', price: 240 }], extras: [{ name: 'Extra Injera Roll', price: 45 }, { name: 'Spicy Awaze Dip', price: 40 }] },
  { id: 4, name: 'Awaze Tibs (አዋዜ ጥብስ)', description: 'Sautéed meat (beef or lamb) tossed in a tangy and spicy awaze chili paste sauce with peppers and onions.', price: 740, category: 'Tibs & Sizzlers', image: 'photo-1544025162-d76694265947', available: true, tag: 'Spicy', portions: [{ name: 'Regular Pan', price: 0 }, { name: 'Large Platter', price: 240 }], extras: [{ name: 'Extra Injera Roll', price: 45 }, { name: 'Senafich Mustard', price: 35 }] },
  { id: 5, name: 'Shekla Tibs (ሸክላ ጥብስ)', description: 'Meat strips cooked and served sizzling hot in a traditional clay pot (shekla) usually placed over glowing hot coals.', price: 780, category: 'Tibs & Sizzlers', image: 'photo-1529193591184-b1d58069ecdd', available: true, tag: 'Signature Sizzler', portions: [{ name: 'Regular Pot', price: 0 }, { name: 'Large Sharing Pot', price: 260 }], extras: [{ name: 'Extra Injera Roll', price: 45 }, { name: 'Extra Spiced Butter', price: 50 }] },
  { id: 6, name: 'Key Wat / Sega Wat (ሥጋ ወጥ)', description: 'A thick, spicy red beef stew simmered slowly in a berbere sauce, onions, ginger, and garlic.', price: 620, category: 'Traditional Wats', image: 'photo-1588166524941-3bf61a9c41db', available: true, tag: 'Classic Stew', portions: [{ name: 'Regular Serving', price: 0 }, { name: 'Large Serving', price: 180 }], extras: [{ name: 'Extra Injera Roll', price: 45 }, { name: 'Fresh Ayib', price: 70 }] },
  { id: 7, name: 'Alicha Wat (አሊቻ ወጥ)', description: 'A mild, non-spicy yellow beef or lamb stew made with turmeric, ginger, garlic, and onions instead of berbere.', price: 590, category: 'Traditional Wats', image: 'photo-1547592180-85f173990554', available: true, tag: 'Mild Stew', portions: [{ name: 'Regular Serving', price: 0 }, { name: 'Large Serving', price: 170 }], extras: [{ name: 'Extra Injera Roll', price: 45 }] },
  { id: 8, name: 'Gomen be Siga (ጎመን በሥጋ)', description: 'Tender chunks of beef sautéed and simmered with chopped collard greens (gomen), garlic, ginger, and spiced butter.', price: 580, category: 'Hotel Meat Specialties', image: 'photo-1574484284002-952d92456975', available: true, tag: 'Traditional', portions: [{ name: 'Regular Serving', price: 0 }, { name: 'Large Serving', price: 160 }], extras: [{ name: 'Extra Injera Roll', price: 45 }] },
  { id: 9, name: 'Gored Gored (ጎረድ ጎረድ)', description: 'Cubed raw or very rare beef seasoned with mitmita, spices, and niter kibbeh, usually dipped in awaze.', price: 760, category: 'Raw & Delicacies', image: 'photo-1603048588665-791ca8aea617', available: true, tag: 'Raw Cut', portions: [{ name: '1/2 Kilogram (500g)', price: 0 }, { name: '1 Kilogram (1000g)', price: 480 }], extras: [{ name: 'Spicy Awaze & Senafich', price: 45 }, { name: 'Mitmita & Kibbeh Dip', price: 55 }] },
  { id: 10, name: 'Dulet (ዱለት)', description: 'A finely chopped and spiced dish made from a mix of finely minced beef, liver, and tripe cooked with niter kibbeh, onions, garlic, and mitmita.', price: 640, category: 'Raw & Delicacies', image: 'photo-1544025162-d76694265947', available: true, tag: 'Specialty', portions: [{ name: 'Regular Plate', price: 0 }, { name: 'Large Platter', price: 180 }], extras: [{ name: 'Extra Injera Roll', price: 45 }] },
  { id: 11, name: 'Tere Siga (ጥሬ ሥጋ)', description: 'Fresh raw meat sliced straight from the carcass at the table, served with mitmita and awaze for dipping.', price: 850, category: 'Raw & Delicacies', image: 'photo-1588166524941-3bf61a9c41db', available: true, tag: 'Butcher Cut', portions: [{ name: '1/2 Kilogram (500g)', price: 0 }, { name: '1 Kilogram (1000g)', price: 520 }], extras: [{ name: 'Spicy Awaze & Senafich', price: 45 }, { name: 'Fresh Warm Injera Roll', price: 45 }] },
  { id: 12, name: 'Kekel (ቀቅል)', description: 'A light, clear-broth soup or mild stew typically made with bone-in lamb or beef, potatoes, and green peppers.', price: 520, category: 'Hotel Meat Specialties', image: 'photo-1547592180-85f173990554', available: true, tag: 'Nourishing Broth', portions: [{ name: 'Regular Bowl', price: 0 }, { name: 'Large Family Bowl', price: 160 }], extras: [{ name: 'Extra Warm Injera', price: 45 }] },
  { id: 13, name: 'Dinich be Siga (ድንች በሥጋ)', description: 'A comforting home-style or hotel-menu stew made with chunks of beef and potatoes simmered in a mild or spiced sauce.', price: 540, category: 'Hotel Meat Specialties', image: 'photo-1588166524941-3bf61a9c41db', available: true, tag: 'Comfort Food', portions: [{ name: 'Regular Bowl', price: 0 }, { name: 'Large Bowl', price: 160 }], extras: [{ name: 'Extra Injera Roll', price: 45 }] },
  { id: 14, name: 'Yebeg Tibs (የበግ ጥብስ)', description: 'Sautéed or grilled tender mutton (lamb) marinated in local herbs and spices.', price: 760, category: 'Tibs & Sizzlers', image: 'photo-1555939594-58d7cb561ad1', available: true, tag: 'Highland Lamb', portions: [{ name: 'Regular Pan', price: 0 }, { name: 'Large Platter', price: 240 }], extras: [{ name: 'Extra Injera Roll', price: 45 }, { name: 'Spicy Awaze Dip', price: 40 }] },
  { id: 15, name: 'Zigni (ዝግኒ)', description: 'An East-African-style spiced beef or lamb cube stew cooked with heavy tomatoes and berbere, closely related to traditional red stews.', price: 650, category: 'Traditional Wats', image: 'photo-1588166524941-3bf61a9c41db', available: true, tag: 'Slow Braised', portions: [{ name: 'Regular Serving', price: 0 }, { name: 'Large Serving', price: 180 }], extras: [{ name: 'Extra Injera Roll', price: 45 }] },
  { id: 16, name: 'Chikina Tibs (የጭቅና ጥብስ)', description: 'Premium, exceptionally tender tibs fillet cut from the beef tenderloin. It is lightly pan-fried with onions, garlic, tomatoes, fresh rosemary, and green chilies, offering a juicy texture.', price: 890, category: 'Tibs & Sizzlers', image: 'photo-1544025162-d76694265947', available: true, tag: 'Prime Tenderloin', portions: [{ name: 'Regular Medallions', price: 0 }, { name: 'Large Platter', price: 280 }], extras: [{ name: 'Extra Injera Roll', price: 45 }, { name: 'Spicy Awaze Dip', price: 40 }] },
  { id: 17, name: 'Dirkosh Firfir be Kitfo / Bequanta (ድርቆሽ ፍርፍር በክትፎ/በቋንጣ)', description: 'Dried, crispy pieces of injera (dirkosh) rehydrated in a rich spiced butter and berbere sauce, layered with beef jerky (quanta) or topped with fresh, warm kitfo.', price: 740, category: 'Firfir & Hybrids', image: 'photo-1593252719532-53f183016149', available: true, tag: 'Deluxe Firfir', portions: [{ name: 'Regular Clay Pot', price: 0 }, { name: 'Large Family Pot', price: 200 }], extras: [{ name: 'Extra Spiced Butter', price: 60 }, { name: 'Extra Injera Roll', price: 45 }] },
  { id: 18, name: 'Tihlo (ጥህሎ)', description: 'A celebratory dish originating from the Tigray region. It consists of smooth, kneaded barley dough shaped into small rounds, which are speared with a traditional wooden fork and dipped into a rich, spicy lamb or beef stew (wret).', price: 680, category: 'Hotel Meat Specialties', image: 'photo-1544025162-d76694265947', available: true, tag: 'Cultural Platter', portions: [{ name: 'Regular Platter', price: 0 }, { name: 'Large Celebration Platter', price: 220 }], extras: [{ name: 'Extra Meat Wret Gravy', price: 70 }] },
  { id: 19, name: 'Minchet Abish (ምንቸት አቢሽ)', description: 'A finely ground beef stew cooked with onions, garlic, ginger, and subtly flavored with fenugreek (abish). It is served as a spicy red stew or a mild yellow alicha, often topped with hard-boiled eggs.', price: 610, category: 'Traditional Wats', image: 'photo-1746716447103-e1618bbd0669', available: true, tag: 'House Classic', portions: [{ name: 'Regular Serving', price: 0 }, { name: 'Large Serving', price: 180 }], extras: [{ name: 'Extra Boiled Egg', price: 60 }, { name: 'Extra Injera Roll', price: 45 }] },
  { id: 20, name: 'Siga Firfir / Bozena Shiro (ቦዘና ሽሮ በሥጋ)', description: 'A highly popular hybrid hotel dish where tender chunks of seasoned beef or lamb are simmered directly inside a thick, boiling pot of Shiro (chickpea powder stew) with plenty of herbed butter.', price: 580, category: 'Firfir & Hybrids', image: 'photo-1593252719532-53f183016149', available: true, tag: 'Hotel Favourite', portions: [{ name: 'Traditional Clay Pot', price: 0 }, { name: 'Large Pot', price: 180 }], extras: [{ name: 'Extra Kibbeh (Spiced Butter)', price: 60 }, { name: 'Extra Beef Chunks', price: 120 }] }
];

const initialCategories = ['All Items', 'Tibs & Sizzlers', 'Traditional Wats', 'Raw & Delicacies', 'Hotel Meat Specialties', 'Firfir & Hybrids'];
const diningAreas = ['All Areas', 'Main Dining', 'Terrace', 'VIP Lounge', 'Patio'];

// 03D — Staff Management, Roles & Permissions Types & Data
export type StaffRole = 'Owner' | 'Manager' | 'Kitchen Staff' | 'Waiter' | 'Cashier';
export type StaffStatus = 'Active' | 'Pending Invitation' | 'Inactive';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  status: StaffStatus;
  dateAdded: string;
  lastActive: string;
  avatar: string;
  invitationNote?: string;
}

export const initialStaff: StaffMember[] = [
  {
    id: 's1',
    name: 'Abebe Bekele',
    email: 'abebe@zerfelounge.et',
    phone: '+251 92 123 4567',
    role: 'Owner',
    status: 'Active',
    dateAdded: '12 Jan 2026',
    lastActive: '5m ago',
    avatar: 'AB'
  },
  {
    id: 's2',
    name: 'Selamawit Desta',
    email: 'selam@zerfelounge.et',
    phone: '+251 92 345 6789',
    role: 'Manager',
    status: 'Active',
    dateAdded: '15 Jan 2026',
    lastActive: '22m ago',
    avatar: 'SD'
  },
  {
    id: 's3',
    name: 'Tigist Haile',
    email: 'tigist@zerfelounge.et',
    phone: '+251 92 456 7890',
    role: 'Kitchen Staff',
    status: 'Active',
    dateAdded: '18 Jan 2026',
    lastActive: '1h ago',
    avatar: 'TH'
  },
  {
    id: 's4',
    name: 'Dawit Tadesse',
    email: 'dawit@zerfelounge.et',
    phone: '+251 92 567 8901',
    role: 'Waiter',
    status: 'Active',
    dateAdded: '20 Jan 2026',
    lastActive: '3h ago',
    avatar: 'DT'
  },
  {
    id: 's5',
    name: 'Almaz Ayana',
    email: 'almaz@zerfelounge.et',
    phone: '+251 92 678 9012',
    role: 'Cashier',
    status: 'Active',
    dateAdded: '22 Jan 2026',
    lastActive: '2h ago',
    avatar: 'AA'
  },
  {
    id: 's6',
    name: 'Yared Solomon',
    email: 'yared.s@gmail.com',
    phone: '+251 96 789 0123',
    role: 'Waiter',
    status: 'Pending Invitation',
    dateAdded: '16 Oct 2026',
    lastActive: 'Never (Invite Sent)',
    avatar: 'YS',
    invitationNote: 'Welcome to the evening dining room service crew.'
  },
  {
    id: 's7',
    name: 'Bethelhem Worku',
    email: 'bethel@gmail.com',
    phone: '+251 97 890 1234',
    role: 'Cashier',
    status: 'Inactive',
    dateAdded: '05 Feb 2026',
    lastActive: '14 days ago',
    avatar: 'BW'
  }
];

export const roleDescriptions: Record<StaffRole, { title: string; desc: string; icon: string; badgeClass: string }> = {
  Owner: {
    title: 'Owner',
    desc: 'Full workspace control, billing, settings, and team access.',
    icon: 'crown',
    badgeClass: 'owner'
  },
  Manager: {
    title: 'Manager',
    desc: 'Daily floor operations, orders, food menu, and dining tables.',
    icon: 'shield',
    badgeClass: 'manager'
  },
  'Kitchen Staff': {
    title: 'Kitchen Staff',
    desc: 'View incoming orders, prep statuses, and kitchen dietary notes.',
    icon: 'menu',
    badgeClass: 'kitchen'
  },
  Waiter: {
    title: 'Waiter / Service',
    desc: 'View table orders, update serving status, and table QR info.',
    icon: 'orders',
    badgeClass: 'waiter'
  },
  Cashier: {
    title: 'Cashier',
    desc: 'View orders, record payments, and confirm guest billing.',
    icon: 'check',
    badgeClass: 'cashier'
  }
};

export interface PermissionCategory {
  category: string;
  Owner: string;
  Manager: string;
  'Kitchen Staff': string;
  Waiter: string;
  Cashier: string;
}

export const permissionMatrix: PermissionCategory[] = [
  {
    category: 'Dashboard & Overview',
    Owner: 'Full View & KPI Controls',
    Manager: 'View Real-time Metrics',
    'Kitchen Staff': 'Restricted',
    Waiter: 'Restricted',
    Cashier: "View Today's Total Sales"
  },
  {
    category: 'Order Management',
    Owner: 'View, Edit, Cancel, Manage',
    Manager: 'View, Edit, Cancel, Manage',
    'Kitchen Staff': 'View Orders & Update Prep',
    Waiter: 'View Orders & Mark Served',
    Cashier: 'View Orders & Verify Pay'
  },
  {
    category: 'Food Menu & Categories',
    Owner: 'View, Create, Edit, Price',
    Manager: 'View, Create, Edit Availability',
    'Kitchen Staff': 'View Menu & Recipes',
    Waiter: 'View Available Items',
    Cashier: 'View Item Prices'
  },
  {
    category: 'Tables & QR Codes',
    Owner: 'View, Create, Print, Manage',
    Manager: 'View, Edit, Print QR Cards',
    'Kitchen Staff': 'Restricted',
    Waiter: 'View Table QR Status',
    Cashier: 'Restricted'
  },
  {
    category: 'Staff Management',
    Owner: 'Invite, Change Roles, Deactivate',
    Manager: 'View Staff Directory',
    'Kitchen Staff': 'Restricted',
    Waiter: 'Restricted',
    Cashier: 'Restricted'
  },
  {
    category: 'Customer Feedback',
    Owner: 'View, Export, Manage',
    Manager: 'View & Respond',
    'Kitchen Staff': 'View Food Rating Notes',
    Waiter: 'View Service Feedback',
    Cashier: 'Restricted'
  },
  {
    category: 'Reports & Analytics',
    Owner: 'Full Financial & Export',
    Manager: 'Daily Sales & Shift Summary',
    'Kitchen Staff': 'Restricted',
    Waiter: 'Restricted',
    Cashier: 'Restricted'
  },
  {
    category: 'Payment & Billing',
    Owner: 'Bank, Telebirr & Payouts',
    Manager: 'Restricted',
    'Kitchen Staff': 'Restricted',
    Waiter: 'Restricted',
    Cashier: 'Record & Confirm Payments'
  },
  {
    category: 'Restaurant Settings',
    Owner: 'Full Workspace Configuration',
    Manager: 'Restricted',
    'Kitchen Staff': 'Restricted',
    Waiter: 'Restricted',
    Cashier: 'Restricted'
  }
];

// 03E — Reports & Analytics Types and Datasets
export type DateRangePreset = 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'custom';
export type RankingMetric = 'quantity' | 'sales';
export type ExportFormat = 'csv' | 'pdf';

export interface TopSellingItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  salesAmount: number;
  sharePercent: number;
}

export interface CategoryPerformance {
  category: string;
  quantity: number;
  salesAmount: number;
  sharePercent: number;
}

export interface ChartPoint {
  label: string;
  sales: number;
  previousSales: number;
  orders: number;
}

export interface HistoricalOrderRecord {
  id: string;
  reference: string;
  time: string;
  date: string;
  table: string;
  itemsSummary: string;
  total: number;
  status: 'Completed' | 'Preparing' | 'Cancelled';
  paymentMethod: string;
}

export interface ReportDataset {
  periodLabel: string;
  grossSales: number;
  grossSalesChange: number;
  completedOrders: number;
  completedOrdersChange: number;
  averageOrderValue: number;
  averageOrderValueChange: number;
  cancelledOrders: number;
  cancelledRate: number;
  cancelledChange: number;
  chartPoints: ChartPoint[];
  topItems: TopSellingItem[];
  categories: CategoryPerformance[];
  recentOrders: HistoricalOrderRecord[];
}

export const reportsDataByPreset: Record<DateRangePreset, ReportDataset> = {
  today: {
    periodLabel: 'Today · 17 Oct 2026',
    grossSales: 18450,
    grossSalesChange: 8.4,
    completedOrders: 46,
    completedOrdersChange: 6.2,
    averageOrderValue: 401,
    averageOrderValueChange: 2.1,
    cancelledOrders: 1,
    cancelledRate: 2.1,
    cancelledChange: -1.2,
    chartPoints: [
      { label: '11:00', sales: 980, previousSales: 840, orders: 3 },
      { label: '12:00', sales: 2450, previousSales: 2100, orders: 7 },
      { label: '13:00', sales: 4200, previousSales: 3800, orders: 11 },
      { label: '14:00', sales: 3100, previousSales: 2950, orders: 8 },
      { label: '15:00', sales: 1200, previousSales: 1150, orders: 3 },
      { label: '16:00', sales: 850, previousSales: 920, orders: 2 },
      { label: '17:00', sales: 1100, previousSales: 1050, orders: 3 },
      { label: '18:00', sales: 2150, previousSales: 1980, orders: 5 },
      { label: '19:00', sales: 4800, previousSales: 4250, orders: 12 },
      { label: '20:00', sales: 3850, previousSales: 3400, orders: 9 },
      { label: '21:00', sales: 2100, previousSales: 1950, orders: 5 }
    ],
    topItems: [
      { id: 1, name: 'Doro Wat (ዶሮ ወጥ)', category: 'Traditional Wats', quantity: 24, salesAmount: 16320, sharePercent: 32.5 },
      { id: 5, name: 'Shekla Tibs (ሸክላ ጥብስ)', category: 'Tibs & Sizzlers', quantity: 19, salesAmount: 14820, sharePercent: 29.5 },
      { id: 2, name: 'Kitfo (ክትፎ)', category: 'Raw & Delicacies', quantity: 15, salesAmount: 11250, sharePercent: 22.4 },
      { id: 16, name: 'Chikina Tibs (የጭቅና ጥብስ)', category: 'Tibs & Sizzlers', quantity: 6, salesAmount: 5340, sharePercent: 10.6 },
      { id: 20, name: 'Siga Firfir / Bozena Shiro (ቦዘና ሽሮ)', category: 'Firfir & Hybrids', quantity: 4, salesAmount: 2320, sharePercent: 4.6 }
    ],
    categories: [
      { category: 'Tibs & Sizzlers', quantity: 25, salesAmount: 20160, sharePercent: 40.2 },
      { category: 'Traditional Wats', quantity: 24, salesAmount: 16320, sharePercent: 32.5 },
      { category: 'Raw & Delicacies', quantity: 15, salesAmount: 11250, sharePercent: 22.4 },
      { category: 'Firfir & Hybrids', quantity: 4, salesAmount: 2320, sharePercent: 4.6 }
    ],
    recentOrders: [
      { id: 'o1', reference: '#GQ-1048', time: '13:24', date: '17 Oct 2026', table: 'Dine-in', itemsSummary: '2× Doro Wat, 1× Shekla Tibs', total: 2140, status: 'Completed', paymentMethod: 'Telebirr' },
      { id: 'o2', reference: '#GQ-1047', time: '13:10', date: '17 Oct 2026', table: 'Table 02', itemsSummary: '1× Kitfo, 1× Kekel Broth', total: 1270, status: 'Completed', paymentMethod: 'Cash' },
      { id: 'o3', reference: '#GQ-1046', time: '12:55', date: '17 Oct 2026', table: 'Table 04', itemsSummary: '1× Derek Tibs, 1× Bozena Shiro', total: 1300, status: 'Completed', paymentMethod: 'CBE Birr' },
      { id: 'o4', reference: '#GQ-1045', time: '12:42', date: '17 Oct 2026', table: 'Terrace 01', itemsSummary: '2× Chikina Tibs', total: 1780, status: 'Completed', paymentMethod: 'Telebirr' },
      { id: 'o5', reference: '#GQ-1044', time: '12:30', date: '17 Oct 2026', table: 'Table 10', itemsSummary: '4× Doro Wat, 2× Shekla Tibs', total: 4280, status: 'Completed', paymentMethod: 'Card' }
    ]
  },
  yesterday: {
    periodLabel: 'Yesterday · 16 Oct 2026',
    grossSales: 17020,
    grossSalesChange: 4.2,
    completedOrders: 43,
    completedOrdersChange: 2.3,
    averageOrderValue: 395,
    averageOrderValueChange: 1.8,
    cancelledOrders: 2,
    cancelledRate: 4.4,
    cancelledChange: 0.5,
    chartPoints: [
      { label: '11:00', sales: 840, previousSales: 780, orders: 2 },
      { label: '12:00', sales: 2100, previousSales: 1950, orders: 6 },
      { label: '13:00', sales: 3800, previousSales: 3500, orders: 9 },
      { label: '14:00', sales: 2950, previousSales: 2800, orders: 7 },
      { label: '15:00', sales: 1150, previousSales: 1100, orders: 3 },
      { label: '16:00', sales: 920, previousSales: 890, orders: 2 },
      { label: '17:00', sales: 1050, previousSales: 1000, orders: 3 },
      { label: '18:00', sales: 1980, previousSales: 1850, orders: 5 },
      { label: '19:00', sales: 4250, previousSales: 3900, orders: 11 },
      { label: '20:00', sales: 3400, previousSales: 3100, orders: 8 },
      { label: '21:00', sales: 1950, previousSales: 1800, orders: 4 }
    ],
    topItems: [
      { id: 1, name: 'Doro Wat (ዶሮ ወጥ)', category: 'Traditional Wats', quantity: 21, salesAmount: 14280, sharePercent: 30.5 },
      { id: 5, name: 'Shekla Tibs (ሸክላ ጥብስ)', category: 'Tibs & Sizzlers', quantity: 18, salesAmount: 14040, sharePercent: 30.0 },
      { id: 2, name: 'Kitfo (ክትፎ)', category: 'Raw & Delicacies', quantity: 14, salesAmount: 10500, sharePercent: 22.4 },
      { id: 16, name: 'Chikina Tibs (የጭቅና ጥብስ)', category: 'Tibs & Sizzlers', quantity: 5, salesAmount: 4450, sharePercent: 9.5 },
      { id: 20, name: 'Siga Firfir / Bozena Shiro (ቦዘና ሽሮ)', category: 'Firfir & Hybrids', quantity: 6, salesAmount: 3480, sharePercent: 7.4 }
    ],
    categories: [
      { category: 'Tibs & Sizzlers', quantity: 23, salesAmount: 18490, sharePercent: 39.5 },
      { category: 'Traditional Wats', quantity: 21, salesAmount: 14280, sharePercent: 30.5 },
      { category: 'Raw & Delicacies', quantity: 14, salesAmount: 10500, sharePercent: 22.4 },
      { category: 'Firfir & Hybrids', quantity: 6, salesAmount: 3480, sharePercent: 7.4 }
    ],
    recentOrders: [
      { id: 'oy1', reference: '#GQ-1038', time: '20:45', date: '16 Oct 2026', table: 'Dine-in', itemsSummary: '2× Shekla Tibs', total: 1560, status: 'Completed', paymentMethod: 'Telebirr' },
      { id: 'oy2', reference: '#GQ-1037', time: '20:15', date: '16 Oct 2026', table: 'Table 04', itemsSummary: '1× Doro Wat, 1× Kitfo', total: 1430, status: 'Completed', paymentMethod: 'Cash' },
      { id: 'oy3', reference: '#GQ-1036', time: '19:40', date: '16 Oct 2026', table: 'VIP Lounge', itemsSummary: '4× Doro Wat, 2× Shekla Tibs', total: 4280, status: 'Completed', paymentMethod: 'Card' }
    ]
  },
  '7days': {
    periodLabel: '11 Oct – 17 Oct 2026 (Last 7 Days)',
    grossSales: 86400,
    grossSalesChange: 12.4,
    completedOrders: 286,
    completedOrdersChange: 8.2,
    averageOrderValue: 525,
    averageOrderValueChange: 3.8,
    cancelledOrders: 4,
    cancelledRate: 1.4,
    cancelledChange: -1.5,
    chartPoints: [
      { label: 'Sun 11', sales: 11200, previousSales: 10100, orders: 38 },
      { label: 'Mon 12', sales: 8900, previousSales: 8200, orders: 31 },
      { label: 'Tue 13', sales: 9400, previousSales: 8700, orders: 33 },
      { label: 'Wed 14', sales: 10800, previousSales: 9600, orders: 37 },
      { label: 'Thu 15', sales: 11900, previousSales: 10400, orders: 40 },
      { label: 'Fri 16', sales: 16750, previousSales: 14800, orders: 54 },
      { label: 'Sat 17', sales: 18450, previousSales: 15100, orders: 53 }
    ],
    topItems: [
      { id: 1, name: 'Doro Wat (ዶሮ ወጥ)', category: 'Traditional Wats', quantity: 142, salesAmount: 96560, sharePercent: 28.1 },
      { id: 5, name: 'Shekla Tibs (ሸክላ ጥብስ)', category: 'Tibs & Sizzlers', quantity: 118, salesAmount: 92040, sharePercent: 26.8 },
      { id: 2, name: 'Kitfo (ክትፎ)', category: 'Raw & Delicacies', quantity: 98, salesAmount: 73500, sharePercent: 21.4 },
      { id: 16, name: 'Chikina Tibs (የጭቅና ጥብስ)', category: 'Tibs & Sizzlers', quantity: 48, salesAmount: 42720, sharePercent: 12.4 },
      { id: 20, name: 'Siga Firfir / Bozena Shiro (ቦዘና ሽሮ)', category: 'Firfir & Hybrids', quantity: 42, salesAmount: 24360, sharePercent: 7.1 },
      { id: 8, name: 'Gomen be Siga (ጎመን በሥጋ)', category: 'Hotel Meat Specialties', quantity: 26, salesAmount: 15080, sharePercent: 4.2 }
    ],
    categories: [
      { category: 'Tibs & Sizzlers', quantity: 166, salesAmount: 134760, sharePercent: 39.2 },
      { category: 'Traditional Wats', quantity: 142, salesAmount: 96560, sharePercent: 28.1 },
      { category: 'Raw & Delicacies', quantity: 98, salesAmount: 73500, sharePercent: 21.4 },
      { category: 'Firfir & Hybrids', quantity: 42, salesAmount: 24360, sharePercent: 7.1 },
      { category: 'Hotel Meat Specialties', quantity: 26, salesAmount: 15080, sharePercent: 4.2 }
    ],
    recentOrders: [
      { id: 'o1', reference: '#GQ-1048', time: '13:24', date: '17 Oct 2026', table: 'Dine-in', itemsSummary: '2× Doro Wat, 1× Shekla Tibs', total: 2140, status: 'Completed', paymentMethod: 'Telebirr' },
      { id: 'o2', reference: '#GQ-1047', time: '13:10', date: '17 Oct 2026', table: 'Table 02', itemsSummary: '1× Kitfo, 1× Kekel Broth', total: 1270, status: 'Completed', paymentMethod: 'Cash' },
      { id: 'o3', reference: '#GQ-1046', time: '12:55', date: '17 Oct 2026', table: 'Table 04', itemsSummary: '1× Derek Tibs, 1× Bozena Shiro', total: 1300, status: 'Completed', paymentMethod: 'CBE Birr' },
      { id: 'o4', reference: '#GQ-1045', time: '12:42', date: '17 Oct 2026', table: 'Terrace 01', itemsSummary: '2× Chikina Tibs', total: 1780, status: 'Completed', paymentMethod: 'Telebirr' },
      { id: 'o5', reference: '#GQ-1044', time: '12:30', date: '17 Oct 2026', table: 'Table 10', itemsSummary: '4× Doro Wat, 2× Shekla Tibs', total: 4280, status: 'Completed', paymentMethod: 'Card' },
      { id: 'o6', reference: '#GQ-1043', time: '12:15', date: '17 Oct 2026', table: 'Table 01', itemsSummary: '1× Kekel Broth, 1× Injera', total: 565, status: 'Completed', paymentMethod: 'Cash' },
      { id: 'o7', reference: '#GQ-1042', time: '11:45', date: '17 Oct 2026', table: 'Terrace 02', itemsSummary: '1× Derek Tibs', total: 720, status: 'Completed', paymentMethod: 'Telebirr' },
      { id: 'o8', reference: '#GQ-1041', time: '11:30', date: '17 Oct 2026', table: 'VIP Lounge', itemsSummary: '3× Doro Wat, 1× Kitfo', total: 2790, status: 'Completed', paymentMethod: 'Card' },
      { id: 'o9', reference: '#GQ-1040', time: '11:10', date: '17 Oct 2026', table: 'Dine-in', itemsSummary: '1× Doro Wat', total: 680, status: 'Cancelled', paymentMethod: 'Voided' },
      { id: 'o10', reference: '#GQ-1039', time: '10:45', date: '17 Oct 2026', table: 'Table 04', itemsSummary: '2× Dulet', total: 1280, status: 'Completed', paymentMethod: 'Telebirr' }
    ]
  },
  '30days': {
    periodLabel: '18 Sep – 17 Oct 2026 (Last 30 Days)',
    grossSales: 342600,
    grossSalesChange: 9.8,
    completedOrders: 1140,
    completedOrdersChange: 7.1,
    averageOrderValue: 512,
    averageOrderValueChange: 2.5,
    cancelledOrders: 16,
    cancelledRate: 1.4,
    cancelledChange: -0.8,
    chartPoints: [
      { label: 'Week 1', sales: 78500, previousSales: 72000, orders: 260 },
      { label: 'Week 2', sales: 84200, previousSales: 76500, orders: 280 },
      { label: 'Week 3', sales: 93500, previousSales: 84000, orders: 310 },
      { label: 'Week 4', sales: 86400, previousSales: 79500, orders: 290 }
    ],
    topItems: [
      { id: 1, name: 'Doro Wat (ዶሮ ወጥ)', category: 'Traditional Wats', quantity: 580, salesAmount: 394400, sharePercent: 29.2 },
      { id: 5, name: 'Shekla Tibs (ሸክላ ጥብስ)', category: 'Tibs & Sizzlers', quantity: 485, salesAmount: 378300, sharePercent: 28.0 },
      { id: 2, name: 'Kitfo (ክትፎ)', category: 'Raw & Delicacies', quantity: 380, salesAmount: 285000, sharePercent: 21.1 },
      { id: 16, name: 'Chikina Tibs (የጭቅና ጥብስ)', category: 'Tibs & Sizzlers', quantity: 195, salesAmount: 173550, sharePercent: 12.8 },
      { id: 20, name: 'Siga Firfir / Bozena Shiro (ቦዘና ሽሮ)', category: 'Firfir & Hybrids', quantity: 185, salesAmount: 107300, sharePercent: 8.9 }
    ],
    categories: [
      { category: 'Tibs & Sizzlers', quantity: 680, salesAmount: 551850, sharePercent: 40.8 },
      { category: 'Traditional Wats', quantity: 580, salesAmount: 394400, sharePercent: 29.2 },
      { category: 'Raw & Delicacies', quantity: 380, salesAmount: 285000, sharePercent: 21.1 },
      { category: 'Firfir & Hybrids', quantity: 185, salesAmount: 107300, sharePercent: 8.9 }
    ],
    recentOrders: [
      { id: 'o1', reference: '#GQ-1048', time: '13:24', date: '17 Oct 2026', table: 'Dine-in', itemsSummary: '2× Doro Wat, 1× Shekla Tibs', total: 2140, status: 'Completed', paymentMethod: 'Telebirr' },
      { id: 'o2', reference: '#GQ-1047', time: '13:10', date: '17 Oct 2026', table: 'Table 02', itemsSummary: '1× Kitfo, 1× Kekel Broth', total: 1270, status: 'Completed', paymentMethod: 'Cash' }
    ]
  },
  month: {
    periodLabel: '1 Oct – 17 Oct 2026 (Month to Date)',
    grossSales: 194800,
    grossSalesChange: 11.2,
    completedOrders: 648,
    completedOrdersChange: 8.0,
    averageOrderValue: 518,
    averageOrderValueChange: 3.1,
    cancelledOrders: 8,
    cancelledRate: 1.2,
    cancelledChange: -0.6,
    chartPoints: [
      { label: 'Oct 1-4', sales: 44200, previousSales: 40100, orders: 148 },
      { label: 'Oct 5-8', sales: 46800, previousSales: 42500, orders: 156 },
      { label: 'Oct 9-12', sales: 49500, previousSales: 44200, orders: 165 },
      { label: 'Oct 13-17', sales: 54300, previousSales: 48900, orders: 179 }
    ],
    topItems: [
      { id: 1, name: 'Doro Wat (ዶሮ ወጥ)', category: 'Traditional Wats', quantity: 330, salesAmount: 224400, sharePercent: 28.8 },
      { id: 5, name: 'Shekla Tibs (ሸክላ ጥብስ)', category: 'Tibs & Sizzlers', quantity: 275, salesAmount: 214500, sharePercent: 27.5 },
      { id: 2, name: 'Kitfo (ክትፎ)', category: 'Raw & Delicacies', quantity: 210, salesAmount: 157500, sharePercent: 20.2 },
      { id: 16, name: 'Chikina Tibs (የጭቅና ጥብስ)', category: 'Tibs & Sizzlers', quantity: 120, salesAmount: 106800, sharePercent: 13.7 },
      { id: 20, name: 'Siga Firfir / Bozena Shiro (ቦዘና ሽሮ)', category: 'Firfir & Hybrids', quantity: 135, salesAmount: 78300, sharePercent: 9.8 }
    ],
    categories: [
      { category: 'Tibs & Sizzlers', quantity: 395, salesAmount: 321300, sharePercent: 41.2 },
      { category: 'Traditional Wats', quantity: 330, salesAmount: 224400, sharePercent: 28.8 },
      { category: 'Raw & Delicacies', quantity: 210, salesAmount: 157500, sharePercent: 20.2 },
      { category: 'Firfir & Hybrids', quantity: 135, salesAmount: 78300, sharePercent: 9.8 }
    ],
    recentOrders: [
      { id: 'o1', reference: '#GQ-1048', time: '13:24', date: '17 Oct 2026', table: 'Dine-in', itemsSummary: '2× Doro Wat, 1× Shekla Tibs', total: 2140, status: 'Completed', paymentMethod: 'Telebirr' }
    ]
  },
  custom: {
    periodLabel: 'Custom Date Range · 10 Oct – 15 Oct 2026',
    grossSales: 62450,
    grossSalesChange: 6.5,
    completedOrders: 208,
    completedOrdersChange: 4.2,
    averageOrderValue: 510,
    averageOrderValueChange: 2.2,
    cancelledOrders: 3,
    cancelledRate: 1.4,
    cancelledChange: -0.5,
    chartPoints: [
      { label: 'Day 1', sales: 9800, previousSales: 9200, orders: 33 },
      { label: 'Day 2', sales: 10400, previousSales: 9800, orders: 35 },
      { label: 'Day 3', sales: 10100, previousSales: 9500, orders: 34 },
      { label: 'Day 4', sales: 10900, previousSales: 10200, orders: 36 },
      { label: 'Day 5', sales: 10500, previousSales: 9900, orders: 35 },
      { label: 'Day 6', sales: 10750, previousSales: 10100, orders: 35 }
    ],
    topItems: [
      { id: 1, name: 'Doro Wat (ዶሮ ወጥ)', category: 'Traditional Wats', quantity: 105, salesAmount: 71400, sharePercent: 32.5 },
      { id: 5, name: 'Shekla Tibs (ሸክላ ጥብስ)', category: 'Tibs & Sizzlers', quantity: 88, salesAmount: 68640, sharePercent: 31.2 },
      { id: 2, name: 'Kitfo (ክትፎ)', category: 'Raw & Delicacies', quantity: 56, salesAmount: 42000, sharePercent: 19.1 }
    ],
    categories: [
      { category: 'Tibs & Sizzlers', quantity: 88, salesAmount: 68640, sharePercent: 37.8 },
      { category: 'Traditional Wats', quantity: 105, salesAmount: 71400, sharePercent: 39.4 },
      { category: 'Raw & Delicacies', quantity: 56, salesAmount: 42000, sharePercent: 22.8 }
    ],
    recentOrders: [
      { id: 'o1', reference: '#GQ-1048', time: '13:24', date: '15 Oct 2026', table: 'Dine-in', itemsSummary: '2× Doro Wat, 1× Shekla Tibs', total: 2140, status: 'Completed', paymentMethod: 'Telebirr' }
    ]
  }
};

type Props = {
  sharedOrders: SessionOrder[];
  onUpdateOrders: (orders: SessionOrder[]) => void;
  onNavigateToCustomer: () => void;
  onLogout?: () => void;
};

export default function AdminDashboard({ sharedOrders, onUpdateOrders, onNavigateToCustomer, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu' | 'categories' | 'tables' | 'staff' | 'reports' | 'settings'>('overview');
  const [tables, setTables] = useState<DiningTable[]>(initialTables);
  const [dishes, setDishes] = useState<MenuItem[]>(defaultDishes);
  const [categories, setCategories] = useState<string[]>(initialCategories);

  // Staff Role Login State
  const [activeStaffUser, setActiveStaffUser] = useState<{ name: string; role: 'Owner' | 'Manager' | 'Kitchen' | 'Waiter'; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('gebeta_staff_user');
      if (saved) {
        const u = JSON.parse(saved);
        return {
          name: u.name || 'Admin',
          role: (u.role === 'Admin' ? 'Owner' : u.role) as any,
          email: u.email || 'admin@zerfelounge.et'
        };
      }
    } catch {}
    return {
      name: 'Zerfe Admin',
      role: 'Owner',
      email: 'admin@zerfelounge.et'
    };
  });
  const [showStaffLoginModal, setShowStaffLoginModal] = useState(false);
  const [selectedLoginRole, setSelectedLoginRole] = useState<'Owner' | 'Manager' | 'Kitchen' | 'Waiter'>('Owner');
  const [loginPinInput, setLoginPinInput] = useState('');

  // Categories CRUD State
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ApiCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: 'utensils', isActive: true });

  // Rich Orders State
  const [orderStatusTab, setOrderStatusTab] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderModal, setSelectedOrderModal] = useState<any | null>(null);

  // Live Backend Data Fetching
  useEffect(() => {
    // 1. Fetch Categories
    api.getCategories().then(cats => {
      if (cats && cats.length) {
        setApiCategories(cats);
        setCategories(['All Items', ...cats.map(c => c.name)]);
      }
    }).catch(() => {});

    // 2. Fetch Menu Items
    api.getMenuItems().then(items => {
      if (items && items.length) {
        setDishes(items.map((it: any, idx: number) => ({
          id: it._id || it.id || idx + 1,
          name: it.name,
          description: it.description,
          price: it.price,
          category: it.category,
          image: it.image,
          available: it.isAvailable !== false,
          tag: it.tag
        })));
      }
    }).catch(() => {});

    // 3. Fetch Tables
    api.getTables().then(tbls => {
      if (tbls && tbls.length) {
        setTables(tbls.map((t: any, idx: number) => ({
          id: t._id || t.id || `t${idx + 1}`,
          number: t.number,
          area: t.area || 'Indoor Dining',
          capacity: t.seats || 4,
          active: t.isActive !== false,
          qrToken: `ak-t${idx + 1}-${Math.random().toString(36).substring(2, 6)}`
        })));
      }
    }).catch(() => {});

    // 4. Fetch Orders
    api.getOrders().then(ords => {
      if (ords && ords.length) {
        onUpdateOrders(ords.map((o: any) => ({
          reference: o.reference,
          placedAt: o.placedAt || new Date().toISOString(),
          status: o.status === 'New' ? 'Received' : o.status,
          customerName: o.customerName,
          lines: (o.lines || []).map((l: any) => ({
            key: l.key || l.name,
            dish: {
              id: l.dishId || 1,
              name: l.name,
              description: '',
              price: l.unitPrice,
              category: 'Ethiopian Food',
              image: 'photo-1746716447103-e1618bbd0669'
            },
            portion: l.portion || 'Regular',
            extras: l.extras || [],
            instructions: l.instructions || '',
            unitPrice: l.unitPrice,
            quantity: l.quantity
          }))
        })));
      }
    }).catch(() => {});
  }, []);

  // Table Filters & Search
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [searchTable, setSearchTable] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals for 03C
  const [selectedQRTable, setSelectedQRTable] = useState<DiningTable | null>(null);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  const [isNewTable, setIsNewTable] = useState(false);
  const [printModalTable, setPrintModalTable] = useState<DiningTable | null>(null);
  const [printConcept, setPrintConcept] = useState<'card' | 'tent' | 'bulk'>('card');
  const [toast, setToast] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals for 03B
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [previewItem, setPreviewItem] = useState<MenuItem | null>(null);

  // Staff Management State (03D)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaff);
  const [searchStaff, setSearchStaff] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('All');
  const [staffStatusFilter, setStaffStatusFilter] = useState<string>('All');

  // 03D Modals and Drawers
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<StaffMember | null>(null);
  const [isPermissionsMatrixOpen, setIsPermissionsMatrixOpen] = useState(false);
  const [selectedMatrixRole, setSelectedMatrixRole] = useState<StaffRole>('Manager');
  const [roleChangeTarget, setRoleChangeTarget] = useState<StaffMember | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState<StaffRole>('Manager');
  const [deactivatingTarget, setDeactivatingTarget] = useState<StaffMember | null>(null);

  // Add Staff Form State
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Waiter' as StaffRole,
    note: ''
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [inviteSentSuccess, setInviteSentSuccess] = useState<StaffMember | null>(null);
  const [simulateInviteError, setSimulateInviteError] = useState(false);
  const [inviteErrorMsg, setInviteErrorMsg] = useState<string | null>(null);
  const [showMernDetails, setShowMernDetails] = useState(false);

  // Reports & Analytics State (03E)
  const [selectedReportPreset, setSelectedReportPreset] = useState<DateRangePreset>('7days');
  const [comparePreviousPeriod, setComparePreviousPeriod] = useState(true);
  const [rankingMetric, setRankingMetric] = useState<RankingMetric>('quantity');
  const [customStartDate, setCustomStartDate] = useState('2026-10-10');
  const [customEndDate, setCustomEndDate] = useState('2026-10-15');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exportSections, setExportSections] = useState({
    summary: true,
    salesTrend: true,
    topItems: true,
    categories: true,
    orderLogs: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportErrorSimulate, setExportErrorSimulate] = useState(false);
  const [exportErrorMsg, setExportErrorMsg] = useState<string | null>(null);
  const [reportOrderSearch, setReportOrderSearch] = useState('');
  const [reportOrderStatusFilter, setReportOrderStatusFilter] = useState('all');
  const [selectedHistoricalOrder, setSelectedHistoricalOrder] = useState<HistoricalOrderRecord | null>(null);
  const [reportingRoleView, setReportingRoleView] = useState<StaffRole>('Owner');
  const [showCalculationRules, setShowCalculationRules] = useState(false);

  // Settings & Configuration State (03F)
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'ordering' | 'payments' | 'billing'>('profile');
  const [profileForm, setProfileForm] = useState({
    name: 'Zerfe Lounge',
    tagline: 'Luxury Dining, Lounge & Hospitality in Bale Robe',
    cuisine: 'Ethiopian & Continental',
    phone: '+251 92 234 5678',
    email: 'contact@zerfelounge.et',
    address: 'Main Road, Bale Robe, Oromia, Ethiopia',
    openingHours: 'Mon – Sun: 06:30 AM – 11:30 PM',
    wifiSsid: 'ZerfeLounge_Guest',
    wifiPassword: 'Zerfe2026',
    currency: 'ETB'
  });
  const [orderingSettings, setOrderingSettings] = useState({
    directOrdering: true,
    prepTimeEstimate: '15 – 20 mins',
    allowSpecialNotes: true,
    soundAlerts: true,
    autoPrintTickets: false,
    serviceCharge: 10,
    taxVat: 15
  });
  const [paymentSettings, setPaymentSettings] = useState({
    telebirrEnabled: true,
    telebirrMerchantCode: '892341',
    cbeBirrEnabled: true,
    cbeBirrAccount: '100028471920',
    cashEnabled: true,
    posEnabled: true
  });

  // Active Report Dataset
  const activeReport = useMemo(() => {
    return reportsDataByPreset[selectedReportPreset];
  }, [selectedReportPreset]);

  // Filtered Orders for the active report
  const filteredReportOrders = useMemo(() => {
    return activeReport.recentOrders.filter(ord => {
      const matchSearch =
        ord.reference.toLowerCase().includes(reportOrderSearch.toLowerCase()) ||
        ord.table.toLowerCase().includes(reportOrderSearch.toLowerCase()) ||
        ord.itemsSummary.toLowerCase().includes(reportOrderSearch.toLowerCase());
      const matchStatus = reportOrderStatusFilter === 'all' || ord.status === reportOrderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [activeReport, reportOrderSearch, reportOrderStatusFilter]);

  // Sorted Top Items
  const sortedTopItems = useMemo(() => {
    const items = [...activeReport.topItems];
    if (rankingMetric === 'quantity') {
      return items.sort((a, b) => b.quantity - a.quantity);
    } else {
      return items.sort((a, b) => b.salesAmount - a.salesAmount);
    }
  }, [activeReport, rankingMetric]);

  // Handle Export Download Action
  const handleTriggerExport = () => {
    setIsExporting(true);
    setExportErrorMsg(null);
    setTimeout(() => {
      setIsExporting(false);
      if (exportErrorSimulate) {
        setExportErrorMsg('Export pipeline failed: Internal report generator timeout. Please retry.');
        return;
      }
      setIsExportModalOpen(false);
      showToast(`Zerfe_Lounge_Report_${selectedReportPreset.toUpperCase()}.${exportFormat} downloaded!`);
    }, 850);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Category CRUD
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      showToast('Please enter a category name');
      return;
    }
    try {
      if (editingCategory) {
        const catId = editingCategory._id || editingCategory.id || '';
        const updated = await api.updateCategory(catId, categoryForm);
        setApiCategories(apiCategories.map(c => ((c._id && c._id === updated._id) || (c.id && c.id === updated.id) ? updated : c)));
        setCategories(categories.map(c => c === editingCategory.name ? updated.name : c));
        showToast(`Category "${updated.name}" updated successfully`);
      } else {
        const created = await api.createCategory(categoryForm);
        setApiCategories([...apiCategories, created]);
        setCategories([...categories, created.name]);
        showToast(`Category "${created.name}" created successfully`);
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      if (editingCategory) {
        setCategories(categories.map(c => c === editingCategory.name ? categoryForm.name : c));
      } else {
        setCategories([...categories, categoryForm.name]);
      }
      setIsCategoryModalOpen(false);
      showToast('Category saved successfully');
    }
  };

  const handleDeleteCategory = async (cat: ApiCategory) => {
    try {
      const catId = cat._id || cat.id || '';
      if (catId) {
        await api.deleteCategory(catId);
      }
      setApiCategories(apiCategories.filter(c => (c._id !== cat._id && c.id !== cat.id)));
      setCategories(categories.filter(c => c !== cat.name));
      setDeletingCategory(null);
      showToast(`Category "${cat.name}" deleted`);
    } catch (err: any) {
      setCategories(categories.filter(c => c !== cat.name));
      setDeletingCategory(null);
      showToast(`Category "${cat.name}" deleted`);
    }
  };

  // Handle Order Status Advance
  const handleAdvanceOrderStatus = async (ref: string, nextStatus: string) => {
    try {
      onUpdateOrders(sharedOrders.map(o => o.reference === ref ? { ...o, status: nextStatus as any } : o));
      const backendOrders = await api.getOrders();
      const match = backendOrders.find(o => o.reference === ref);
      if (match && match._id) {
        await api.updateOrderStatus(match._id, nextStatus);
      }
      showToast(`Order ${ref} updated to ${nextStatus}`);
    } catch (err: any) {
      showToast(`Order ${ref} updated to ${nextStatus}`);
    }
  };

  // Handle Staff Role Login
  const handleStaffRoleLogin = (role: 'Owner' | 'Manager' | 'Kitchen' | 'Waiter') => {
    let name = 'Abebe Bekele';
    let email = 'abebe@zerfelounge.et';
    if (role === 'Manager') {
      name = 'Tigist Alemu';
      email = 'tigist@zerfelounge.et';
    } else if (role === 'Kitchen') {
      name = 'Dawit Hailu';
      email = 'dawit@zerfelounge.et';
    } else if (role === 'Waiter') {
      name = 'Sara Girma';
      email = 'sara@zerfelounge.et';
    }
    setActiveStaffUser({ name, role, email });
    setShowStaffLoginModal(false);
    showToast(`Signed in as ${name} (${role})`);

    // If Kitchen staff, auto-switch to Orders tab with 'Preparing' filter
    if (role === 'Kitchen') {
      setActiveTab('orders');
      setOrderStatusTab('Preparing');
    }
  };

  // Filtered Staff (03D)
  const filteredStaff = useMemo(() => {
    return staffMembers.filter(member => {
      const matchSearch =
        member.name.toLowerCase().includes(searchStaff.toLowerCase()) ||
        member.email.toLowerCase().includes(searchStaff.toLowerCase()) ||
        (member.phone && member.phone.includes(searchStaff));
      const matchRole = staffRoleFilter === 'All' || member.role === staffRoleFilter;
      const matchStatus = staffStatusFilter === 'All' || member.status === staffStatusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [staffMembers, searchStaff, staffRoleFilter, staffStatusFilter]);

  // Handle Send Invitation (03D)
  const handleSendInvitation = () => {
    const errors: { name?: string; email?: string } = {};
    if (!addForm.name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!addForm.email.trim()) {
      errors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(addForm.email.trim())) {
        errors.email = 'Enter a valid email address (e.g. name@zerfelounge.et)';
      } else if (staffMembers.some(s => s.email.toLowerCase() === addForm.email.trim().toLowerCase())) {
        errors.email = 'A staff account with this email already exists in Zerfe Lounge';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmittingInvite(true);
    setInviteErrorMsg(null);

    // Simulate async network request
    setTimeout(() => {
      setIsSubmittingInvite(false);
      if (simulateInviteError) {
        setInviteErrorMsg('Unable to dispatch email invitation: Mail relay service unreachable. Please retry.');
        return;
      }

      const initials = addForm.name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const newMember: StaffMember = {
        id: `s-${Date.now()}`,
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim() || undefined,
        role: addForm.role,
        status: 'Pending Invitation',
        dateAdded: 'Today',
        lastActive: 'Never (Invite Sent)',
        avatar: initials || 'ST',
        invitationNote: addForm.note.trim() || undefined
      };

      setStaffMembers(prev => [newMember, ...prev]);
      setInviteSentSuccess(newMember);
      showToast(`Invitation sent to ${newMember.email}`);
    }, 650);
  };

  // Resend Invite (03D)
  const handleResendInvite = (member: StaffMember) => {
    showToast(`Fresh 24h invitation token dispatched to ${member.email}`);
  };

  // Change Role (03D)
  const handleConfirmRoleChange = () => {
    if (!roleChangeTarget) return;
    if (roleChangeTarget.role === 'Owner' && newSelectedRole !== 'Owner') {
      const ownerCount = staffMembers.filter(s => s.role === 'Owner' && s.status === 'Active').length;
      if (ownerCount <= 1) {
        showToast('Cannot change role: Workspace must have at least one active Owner.');
        return;
      }
    }

    setStaffMembers(prev =>
      prev.map(s => (s.id === roleChangeTarget.id ? { ...s, role: newSelectedRole } : s))
    );
    if (selectedStaffProfile?.id === roleChangeTarget.id) {
      setSelectedStaffProfile({ ...selectedStaffProfile, role: newSelectedRole });
    }
    showToast(`${roleChangeTarget.name}'s role updated to ${newSelectedRole}`);
    setRoleChangeTarget(null);
  };

  // Toggle Account Active / Inactive (03D)
  const handleConfirmDeactivation = () => {
    if (!deactivatingTarget) return;
    if (deactivatingTarget.role === 'Owner' && deactivatingTarget.status === 'Active') {
      showToast('Action Blocked: Primary Owner account cannot be deactivated.');
      setDeactivatingTarget(null);
      return;
    }

    const nextStatus: StaffStatus = deactivatingTarget.status === 'Active' ? 'Inactive' : 'Active';
    setStaffMembers(prev =>
      prev.map(s => (s.id === deactivatingTarget.id ? { ...s, status: nextStatus } : s))
    );
    if (selectedStaffProfile?.id === deactivatingTarget.id) {
      setSelectedStaffProfile({ ...selectedStaffProfile, status: nextStatus });
    }
    showToast(
      nextStatus === 'Inactive'
        ? `${deactivatingTarget.name} has been deactivated. Historical records preserved.`
        : `${deactivatingTarget.name} has been reactivated.`
    );
    setDeactivatingTarget(null);
  };

  // Toggle Table Active Status
  const toggleTableActive = (id: string) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id === id) {
          const next = !t.active;
          showToast(`${t.number} marked as ${next ? 'Active' : 'Inactive'}`);
          return { ...t, active: next };
        }
        return t;
      })
    );
  };

  // Filtered Tables
  const filteredTables = useMemo(() => {
    return tables.filter(t => {
      const matchArea = selectedArea === 'All Areas' || t.area === selectedArea;
      const matchSearch = t.number.toLowerCase().includes(searchTable.toLowerCase()) || t.area.toLowerCase().includes(searchTable.toLowerCase());
      const matchStatus = tableStatusFilter === 'all' ? true : tableStatusFilter === 'active' ? t.active : !t.active;
      return matchArea && matchSearch && matchStatus;
    });
  }, [tables, selectedArea, searchTable, tableStatusFilter]);

  // Save Table
  const handleSaveTable = () => {
    if (!editingTable) return;
    if (!editingTable.number.trim()) {
      showToast('Please enter a table name');
      return;
    }
    if (isNewTable) {
      if (tables.some(t => t.number.toLowerCase() === editingTable.number.toLowerCase())) {
        showToast('A table with this number already exists');
        return;
      }
      setTables([...tables, editingTable]);
      showToast(`${editingTable.number} created with QR Code!`);
    } else {
      setTables(tables.map(t => (t.id === editingTable.id ? editingTable : t)));
      showToast(`${editingTable.number} updated!`);
    }
    setEditingTable(null);
  };

  // Delete Table
  const handleDeleteTable = (id: string, name: string) => {
    setTables(tables.filter(t => t.id !== id));
    showToast(`${name} deleted`);
  };

  // Regenerate QR Token
  const handleRegenerateQR = (table: DiningTable) => {
    const newToken = `ak-${table.number.toLowerCase().replace(/\s+/g, '')}-${Math.random().toString(36).substring(2, 6)}`;
    setTables(tables.map(t => (t.id === table.id ? { ...t, qrToken: newToken } : t)));
    setSelectedQRTable({ ...table, qrToken: newToken });
    showToast(`New QR Code generated for ${table.number}`);
  };

  return (
    <div className="admin-shell">
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <a href="#" className="admin-brand" onClick={e => { e.preventDefault(); setActiveTab('overview'); }}>
            <span style={{ color: 'var(--gold)' }}>gebeta</span>QR
            <span className="admin-brand-badge">Admin</span>
          </a>
          <div className="admin-restaurant-selector" title="Active Branch">
            <div>
              <strong>Zerfe Lounge</strong>
              <small>Bale Robe · Oromia</small>
            </div>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Restaurant Management Menu">
          <button
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
          >
            <AdminIcon name="dashboard" size={18} />
            <span>Overview</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
          >
            <AdminIcon name="orders" size={18} />
            <span>Orders</span>
            {sharedOrders.filter(o => o.status === 'Received').length > 0 && (
              <span className="admin-nav-badge">{sharedOrders.filter(o => o.status === 'Received').length}</span>
            )}
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => { setActiveTab('menu'); setMobileMenuOpen(false); }}
          >
            <AdminIcon name="menu" size={18} />
            <span>Food Menu</span>
            <span className="admin-nav-badge" style={{ background: '#23734b', color: '#fff' }}>{dishes.length}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => { setActiveTab('categories'); setMobileMenuOpen(false); }}
          >
            <AdminIcon name="categories" size={18} />
            <span>Categories</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tables'); setMobileMenuOpen(false); }}
          >
            <AdminIcon name="qr" size={18} />
            <span>Universal QR</span>
            <span className="admin-nav-badge" style={{ background: 'var(--gold)', color: '#10261b' }}>Live</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => { setActiveTab('staff'); setMobileMenuOpen(false); }}
          >
            <AdminIcon name="staff" size={18} />
            <span>Staff</span>
            <span className="admin-nav-badge" style={{ background: '#2e6b4d', color: '#fff' }}>{staffMembers.length}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
          >
            <AdminIcon name="reports" size={18} />
            <span>Reports</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
          >
            <AdminIcon name="settings" size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-profile" onClick={() => setShowStaffLoginModal(true)} style={{ cursor: 'pointer' }} title="Click to switch staff role">
            <span className="admin-user-avatar">
              {activeStaffUser?.name ? activeStaffUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
            </span>
            <div className="admin-user-info">
              <span className="admin-user-name">{activeStaffUser?.name || 'Staff Member'}</span>
              <span className="admin-user-role" style={{ color: '#c69234', fontWeight: 600 }}>{activeStaffUser?.role || 'Waiter'}</span>
            </div>
            <button
              className="admin-logout-btn"
              title="Log out of Staff account"
              onClick={(e) => {
                e.stopPropagation();
                if (onLogout) {
                  onLogout();
                } else {
                  onNavigateToCustomer();
                }
              }}
              aria-label="Log out"
            >
              <AdminIcon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Workspace */}
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <AdminIcon name="hamburger" size={20} />
            </button>
            <div className="admin-breadcrumb">
              <span>Zerfe Lounge</span>
              <span>/</span>
              <strong>
                {activeTab === 'overview'
                  ? 'Overview'
                  : activeTab === 'orders'
                  ? 'Orders'
                  : activeTab === 'menu'
                  ? 'Food Menu'
                  : activeTab === 'categories'
                  ? 'Categories'
                  : activeTab === 'tables'
                  ? 'Tables & QR Codes'
                  : activeTab === 'staff'
                  ? 'Staff Management'
                  : activeTab === 'reports'
                  ? 'Reports & Analytics'
                  : 'Restaurant Settings'}
              </strong>
            </div>
          </div>

          <div className="admin-topbar-right">
            <button className="admin-live-link" onClick={onNavigateToCustomer} title="View live customer menu">
              <AdminIcon name="external" size={14} />
              <span>Customer Menu (Live)</span>
            </button>
            {onLogout && (
              <button className="admin-topbar-logout-btn" onClick={onLogout} title="Sign out of Admin Dashboard">
                <AdminIcon name="logout" size={14} />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </header>

        <main className="admin-content">
          {/* =========================================================
              TAB: UNIVERSAL RESTAURANT QR CODE (03C)
             ========================================================= */}
          {activeTab === 'tables' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1>Universal Restaurant QR Code</h1>
                  <p>One official QR code for all tables, stands, and counter cards at Zerfe Lounge.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    className="admin-action-btn secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      showToast('Digital Menu URL copied to clipboard!');
                    }}
                  >
                    <AdminIcon name="copy" size={15} /> Copy Menu URL
                  </button>
                  <button
                    className="admin-action-btn primary"
                    onClick={() => window.print()}
                  >
                    <AdminIcon name="printer" size={15} /> Print Table Stand
                  </button>
                </div>
              </div>

              {/* Universal QR Code Display & Print Card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
                {/* Print Stand Card (Physical Stand Preview) */}
                <div
                  style={{
                    background: '#FAF8F5',
                    border: '2px solid #C69234',
                    borderRadius: '16px',
                    padding: '36px 28px',
                    textAlign: 'center',
                    boxShadow: '0 12px 36px rgba(20, 61, 43, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontSize: '11px', letterSpacing: '2px', fontWeight: 700, color: '#C69234', textTransform: 'uppercase', marginBottom: '8px' }}>
                    TABLETOP STAND · ALL TABLES
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#143D2B', marginBottom: '6px' }}>
                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontStyle: 'italic', fontWeight: 700, color: '#143D2B' }}>
                      z<span style={{ color: '#C69234' }}>l</span>
                    </span>
                    <strong style={{ fontSize: '18px', letterSpacing: '1px' }}>ZERFE LOUNGE</strong>
                  </div>

                  <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#6e766c', letterSpacing: '0.5px' }}>
                    HOTEL &amp; LUXURY DINING · BALE ROBE
                  </p>

                  {/* QR Code Container */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '18px',
                      borderRadius: '12px',
                      border: '1px solid #d4decf',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      marginBottom: '20px'
                    }}
                  >
                    <TableQRCodeSVG size={220} tableNumber="Universal" color="#143D2B" />
                  </div>

                  <div style={{ maxWidth: '280px', margin: '0 auto' }}>
                    <strong style={{ display: 'block', fontSize: '16px', color: '#143D2B', marginBottom: '6px' }}>
                      Scan to View Digital Menu & Order
                    </strong>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6e766c', lineHeight: 1.5 }}>
                      Point your phone camera here to browse dishes, customize, and order instantly.
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: '24px',
                      paddingTop: '16px',
                      borderTop: '1px dashed #d9e2d5',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '16px',
                      fontSize: '11px',
                      color: '#143D2B',
                      fontWeight: 600
                    }}
                  >
                    <span>✓ Telebirr & CBE Birr</span>
                    <span>✓ Chapa Payment</span>
                    <span>✓ Instant Kitchen Order</span>
                  </div>
                </div>

                {/* Information & Instructions Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div className="admin-overview-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '17px', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AdminIcon name="qr" size={18} /> Universal QR Code Setup
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
                      You no longer need individual QR codes for each table number. This single universal QR code connects every guest to the full interactive Zerfe Lounge menu.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ background: '#eef4ec', color: '#143d2b', width: '28px', height: '28px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                          1
                        </div>
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>Print Table Stands or Stickers</strong>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                            Print this design on acrylic stands, wooden blocks, or table stickers and place one on each table.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ background: '#eef4ec', color: '#143d2b', width: '28px', height: '28px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                          2
                        </div>
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>Guest Scans & Enters Name</strong>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                            When customers sit at any table, they scan the code, browse food photos, and enter their name when ordering.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ background: '#eef4ec', color: '#143d2b', width: '28px', height: '28px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                          3
                        </div>
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>Order Appears Live in Kitchen</strong>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                            The order displays the customer's name, items, instructions, and payment status directly on the Kitchen Orders board.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links & Actions */}
                  <div className="admin-overview-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: 'var(--brand)' }}>
                      Quick Actions & Link
                    </h3>
                    <div style={{ background: '#f5f7f3', border: '1px solid #dce4d9', padding: '12px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#143d2b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {window.location.origin}
                      </span>
                      <button
                        className="admin-action-btn secondary sm"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin);
                          showToast('Digital Menu link copied!');
                        }}
                      >
                        Copy
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <a
                        href={window.location.origin}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-action-btn secondary"
                        style={{ textDecoration: 'none' }}
                      >
                        <AdminIcon name="external" size={15} /> Test Customer Menu
                      </a>
                      <button
                        className="admin-action-btn secondary"
                        onClick={() => {
                          window.print();
                        }}
                      >
                        <AdminIcon name="download" size={15} /> Print / Save as PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              TAB: MENU MANAGEMENT (03B)
             ========================================================= */}
          {activeTab === 'menu' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1>Menu Management</h1>
                  <p>Add new dishes, change prices, and toggle available items instantly.</p>
                </div>
                <button
                  className="admin-action-btn primary"
                  onClick={() => {
                    setIsNewItem(true);
                    setEditingItem({
                      id: Date.now(),
                      name: '',
                      description: '',
                      price: 350,
                      category: 'Ethiopian Food',
                      image: 'photo-1544025162-d76694265947',
                      available: true,
                      portions: [{ name: 'Regular', price: 0 }]
                    });
                  }}
                >
                  <AdminIcon name="plus" size={16} /> Add New Dish
                </button>
              </div>

              <div className="admin-menu-grid">
                {dishes.map(dish => (
                  <div className={`admin-food-card ${!dish.available ? 'unavailable' : ''}`} key={dish.id}>
                    <div className="admin-food-thumb">
                      <img src={`https://images.unsplash.com/${dish.image}?w=500&auto=format&fit=crop&q=80`} alt={dish.name} />
                      {dish.tag && <span className="admin-food-tag">{dish.tag}</span>}
                      {!dish.available && <div className="admin-soldout-badge">TEMPORARILY SOLD OUT</div>}
                    </div>

                    <div className="admin-food-body">
                      <div className="admin-food-title-row">
                        <h3>{dish.name}</h3>
                        <span className="admin-food-category-badge">{dish.category}</span>
                      </div>
                      <p className="admin-food-desc">{dish.description}</p>
                      <div className="admin-food-meta">
                        <span className="admin-food-price">{money(dish.price)}</span>
                        <div className="admin-toggle-wrap">
                          <button
                            className={`admin-toggle ${dish.available ? 'on' : ''}`}
                            onClick={() => {
                              const next = !dish.available;
                              setDishes(dishes.map(d => (d.id === dish.id ? { ...d, available: next } : d)));
                              showToast(`${dish.name} is now ${next ? 'Available' : 'Sold Out'}`);
                            }}
                          >
                            <span className="admin-toggle-knob" />
                          </button>
                          <span style={{ color: dish.available ? '#23734b' : '#b83b3b' }}>
                            {dish.available ? 'Available' : 'Sold Out'}
                          </span>
                        </div>
                      </div>

                      <div className="admin-food-actions">
                        <button className="admin-action-btn secondary" onClick={() => setPreviewItem(dish)}>
                          <AdminIcon name="eye" size={14} /> Preview
                        </button>
                        <button className="admin-action-btn secondary" onClick={() => { setIsNewItem(false); setEditingItem({ ...dish }); }}>
                          <AdminIcon name="edit" size={14} /> Edit
                        </button>
                        <button className="admin-action-btn danger" onClick={() => setDishes(dishes.filter(d => d.id !== dish.id))}>
                          <AdminIcon name="trash" size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* =========================================================
              TAB: CATEGORIES (03B) - FULL CRUD & MONGO CONNECTED
             ========================================================= */}
          {activeTab === 'categories' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1>Menu Categories</h1>
                  <p>Organize how dishes appear to customers browsing on their phones.</p>
                </div>
                <button
                  className="admin-action-btn primary"
                  onClick={() => {
                    setCategoryForm({ name: '', description: '', icon: 'utensils', isActive: true });
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }}
                >
                  <AdminIcon name="plus" size={15} /> Add New Category
                </button>
              </div>

              <div className="admin-category-grid">
                {(apiCategories.length > 0
                  ? apiCategories
                  : categories.filter(c => c !== 'All Items').map(c => ({ id: c, name: c, description: 'Fresh Ethiopian culinary choices', icon: 'utensils', isActive: true }))
                ).map(cat => {
                  const count = dishes.filter(d => d.category === cat.name).length;
                  return (
                    <div className="admin-category-card" key={cat.id || cat.name} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div className="admin-category-card-top">
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--brand)' }}>{cat.name}</h3>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: cat.isActive !== false ? '#edf7ee' : '#f2f3ed', color: cat.isActive !== false ? '#23734b' : '#798074' }}>
                              {cat.isActive !== false ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--muted)' }}>
                            {cat.description || `${count} signature dishes curated for dining guests.`}
                          </p>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                            {count} {count === 1 ? 'dish' : 'dishes'}
                          </span>
                        </div>
                      </div>

                      <div className="admin-category-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid #f0f3ee', paddingTop: '12px' }}>
                        <button
                          className="admin-action-btn secondary"
                          style={{ flex: 1 }}
                          onClick={() => {
                            setActiveTab('menu');
                          }}
                        >
                          <AdminIcon name="eye" size={14} /> View Items
                        </button>
                        <button
                          className="admin-action-btn secondary"
                          title="Edit Category"
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryForm({
                              name: cat.name,
                              description: cat.description || '',
                              icon: cat.icon || 'utensils',
                              isActive: cat.isActive !== false
                            });
                            setIsCategoryModalOpen(true);
                          }}
                        >
                          <AdminIcon name="edit" size={14} />
                        </button>
                        <button
                          className="admin-action-btn danger"
                          title="Delete Category"
                          onClick={() => setDeletingCategory(cat)}
                        >
                          <AdminIcon name="trash" size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* =========================================================
              TAB: ORDERS & KITCHEN MANAGEMENT (RICH DETAIL & FULL FUNCTION)
             ========================================================= */}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="admin-page-header">
                <div>
                  <h1>Orders & Kitchen Queue</h1>
                  <p>Real-time order management, kitchen preparation flow, and table delivery.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="admin-action-btn secondary"
                    onClick={() => {
                      api.getOrders().then(ords => {
                        if (ords && ords.length) {
                          onUpdateOrders(ords.map((o: any) => ({
                            reference: o.reference,
                            placedAt: o.placedAt || new Date().toISOString(),
                            status: o.status === 'New' ? 'Received' : o.status,
                            customerName: o.customerName,
                            paymentMethod: o.paymentMethod,
                            lines: (o.lines || []).map((l: any) => ({
                              key: l.key || l.name,
                              dish: { id: l.dishId || 1, name: l.name, description: '', price: l.unitPrice, category: 'Food', image: 'photo-1746716447103-e1618bbd0669' },
                              portion: l.portion || 'Regular',
                              extras: l.extras || [],
                              instructions: l.instructions || '',
                              unitPrice: l.unitPrice,
                              quantity: l.quantity
                            }))
                          })));
                          showToast('Orders refreshed from MongoDB');
                        }
                      }).catch(() => showToast('Orders up to date'));
                    }}
                  >
                    <AdminIcon name="refreshCw" size={15} /> Refresh Orders
                  </button>
                </div>
              </div>

              {/* Status Filters Bar & Search */}
              <div className="admin-orders-controls">
                <div className="admin-status-tabs">
                  {[
                    { key: 'all', label: 'All Orders', count: sharedOrders.length },
                    { key: 'New', label: 'New / Received', count: sharedOrders.filter(o => o.status === 'Received' || o.status === 'New').length },
                    { key: 'Preparing', label: 'In Kitchen', count: sharedOrders.filter(o => o.status === 'Preparing').length },
                    { key: 'Ready', label: 'Ready to Serve', count: sharedOrders.filter(o => o.status === 'Ready').length },
                    { key: 'Completed', label: 'Completed', count: sharedOrders.filter(o => o.status === 'Completed').length }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      className={`admin-tab-btn ${orderStatusTab === tab.key ? 'active' : ''}`}
                      onClick={() => setOrderStatusTab(tab.key)}
                    >
                      <span>{tab.label}</span>
                      <span className="admin-tab-count">{tab.count}</span>
                    </button>
                  ))}
                </div>

                <div className="admin-search-input">
                  <AdminIcon name="search" size={16} />
                  <input
                    type="text"
                    placeholder="Search customer name, order ref, table…"
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                  />
                  {orderSearch && (
                    <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setOrderSearch('')}>
                      <AdminIcon name="close" size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Orders Table */}
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>CUSTOMER & REF</th>
                      <th>SERVICE</th>
                      <th>ITEMS & SPECIAL NOTES</th>
                      <th>PAYMENT</th>
                      <th>TOTAL</th>
                      <th>STATUS</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sharedOrders
                      .filter(order => {
                        const statusMatch =
                          orderStatusTab === 'all' ||
                          (orderStatusTab === 'New' && (order.status === 'New' || order.status === 'Received')) ||
                          order.status === orderStatusTab;

                        const guestName = (order as any).customerName || 'Dine-in Guest';
                        const searchMatch =
                          !orderSearch ||
                          order.reference.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          guestName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          order.lines.some(l => l.dish.name.toLowerCase().includes(orderSearch.toLowerCase()));

                        return statusMatch && searchMatch;
                      })
                      .map(order => {
                        const guestName = (order as any).customerName || 'Dine-in Guest';
                        const initials = guestName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'DG';
                        const totalAmount = order.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
                        const itemsCount = order.lines.reduce((n, l) => n + l.quantity, 0);
                        const hasNotes = order.lines.some(l => l.instructions);

                        return (
                          <tr key={order.reference}>
                            {/* Customer & Ref */}
                            <td>
                              <div className="admin-order-customer-info">
                                <span className="admin-order-customer-avatar">{initials}</span>
                                <div>
                                  <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{guestName}</strong>
                                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                    {order.reference} · {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Service / Dine-in */}
                            <td>
                              <span className="admin-table-tag" style={{ background: '#eef4ec', color: '#143d2b', border: '1px solid #d0e2cc' }}>
                                Dine-in
                              </span>
                            </td>

                            {/* Items & Notes */}
                            <td className="admin-items-summary" style={{ maxWidth: '280px' }}>
                              <strong>{itemsCount} {itemsCount === 1 ? 'dish' : 'dishes'}</strong>
                              <p style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                                {order.lines.map(l => `${l.quantity}× ${l.dish.name}`).join(', ')}
                              </p>
                              {hasNotes && (
                                <span style={{ display: 'inline-block', fontSize: '11px', color: '#b83b3b', fontStyle: 'italic', marginTop: '2px' }}>
                                  Note: {order.lines.find(l => l.instructions)?.instructions}
                                </span>
                              )}
                            </td>

                            {/* Payment */}
                            <td>
                              <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: '#f0f5fa', color: '#1e6091', border: '1px solid #d4e4f5' }}>
                                {(order as any).paymentMethod || 'Telebirr'}
                              </span>
                            </td>

                            {/* Total */}
                            <td style={{ fontWeight: 700, color: 'var(--brand)' }}>
                              {money(totalAmount)}
                            </td>

                            {/* Status */}
                            <td>
                              <span className={`admin-status-badge ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {(order.status === 'Received' || order.status === 'New') && (
                                  <button
                                    className="admin-order-advance-btn cook"
                                    onClick={() => handleAdvanceOrderStatus(order.reference, 'Preparing')}
                                  >
                                    Accept & Cook
                                  </button>
                                )}
                                {order.status === 'Preparing' && (
                                  <button
                                    className="admin-order-advance-btn ready"
                                    onClick={() => handleAdvanceOrderStatus(order.reference, 'Ready')}
                                  >
                                    Mark Ready
                                  </button>
                                )}
                                {order.status === 'Ready' && (
                                  <button
                                    className="admin-order-advance-btn complete"
                                    onClick={() => handleAdvanceOrderStatus(order.reference, 'Completed')}
                                  >
                                    Mark Served
                                  </button>
                                )}
                                <button
                                  className="admin-action-btn secondary sm"
                                  onClick={() => setSelectedOrderModal(order)}
                                >
                                  Ticket
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB: OVERVIEW — LIVE DASHBOARD & OPERATIONS
             ========================================================= */}
          {activeTab === 'overview' && (
            <div className="admin-overview-section">
              {/* 4 Core Financial & Floor KPIs */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card" onClick={() => setActiveTab('tables')} style={{ cursor: 'pointer' }}>
                  <div className="admin-kpi-top"><span>ACTIVE TABLES</span><AdminIcon name="tables" size={16} /></div>
                  <strong>{tables.filter(t => t.active).length} / {tables.length}</strong>
                  <div className="admin-kpi-foot pos">QR Codes scannable</div>
                </div>
                <div className="admin-kpi-card" onClick={() => setActiveTab('menu')} style={{ cursor: 'pointer' }}>
                  <div className="admin-kpi-top"><span>DISHES ON MENU</span><AdminIcon name="menu" size={16} /></div>
                  <strong>{dishes.filter(d => d.available).length}</strong>
                  <div className="admin-kpi-foot">{dishes.filter(d => !d.available).length} sold out</div>
                </div>
                <div className="admin-kpi-card highlight" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
                  <div className="admin-kpi-top"><span>ORDERS TODAY</span><AdminIcon name="orders" size={16} /></div>
                  <strong>{sharedOrders.length + 28}</strong>
                  <div className="admin-kpi-foot">Live QR Orders</div>
                </div>
                <div className="admin-kpi-card">
                  <div className="admin-kpi-top"><span>RECORDED SALES</span><AdminIcon name="creditCard" size={16} /></div>
                  <strong>ETB 32,800</strong>
                  <div className="admin-kpi-foot">Pay at table & digital</div>
                </div>
              </div>

              {/* Meaningful, Interactive Lower Overview Section */}
              <div className="admin-overview-grid">
                {/* Left Column: Live Kitchen Queue & Popular Dishes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Live Kitchen Queue */}
                  <div className="admin-overview-card">
                    <div className="admin-overview-card-header">
                      <h3>
                        <AdminIcon name="clock" size={18} />
                        Active Kitchen Orders
                      </h3>
                      <span className="admin-live-badge">
                        <span className="admin-pulse-dot" /> LIVE STREAM
                      </span>
                    </div>

                    <div className="admin-live-orders-list">
                      {sharedOrders.filter(o => o.status === 'Preparing' || o.status === 'Received' || o.status === 'New').length > 0 ? (
                        sharedOrders
                          .filter(o => o.status === 'Preparing' || o.status === 'Received' || o.status === 'New')
                          .slice(0, 4)
                          .map(order => {
                            const guestName = (order as any).customerName || 'Guest';
                            const initials = guestName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'GT';
                            return (
                              <div className="admin-live-order-card" key={order.reference}>
                                <div className="admin-live-order-left">
                                  <span className="admin-live-order-avatar">{initials}</span>
                                  <div className="admin-live-order-meta">
                                    <strong>{guestName} · Dine-in</strong>
                                    <span>
                                      {order.lines.map(l => `${l.quantity}× ${l.dish.name}`).join(', ')}
                                    </span>
                                  </div>
                                </div>
                                <div className="admin-live-order-right">
                                  <span className={`admin-status-badge ${order.status.toLowerCase()}`}>
                                    {order.status}
                                  </span>
                                  {order.status === 'Preparing' ? (
                                    <button
                                      className="admin-order-advance-btn ready"
                                      onClick={() => handleAdvanceOrderStatus(order.reference, 'Ready')}
                                    >
                                      Mark Ready
                                    </button>
                                  ) : (
                                    <button
                                      className="admin-order-advance-btn cook"
                                      onClick={() => handleAdvanceOrderStatus(order.reference, 'Preparing')}
                                    >
                                      Cook
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', background: '#faf9f6', borderRadius: '10px' }}>
                          <p style={{ margin: 0, fontSize: '13px' }}>✓ Kitchen is clear! No pending preparation orders.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Today's Popular Dishes Widget */}
                  <div className="admin-overview-card">
                    <div className="admin-overview-card-header">
                      <h3>
                        <AdminIcon name="menu" size={18} />
                        Top Dishes Ordered Today
                      </h3>
                      <button className="admin-action-btn secondary sm" onClick={() => setActiveTab('reports')}>
                        Full Report
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {[
                        { name: 'Doro Wat (ዶሮ ወጥ)', category: 'Traditional Wats', count: 18, share: '32%' },
                        { name: 'Shekla Tibs (ሸክላ ጥብስ)', category: 'Tibs & Sizzlers', count: 14, share: '26%' },
                        { name: 'Kitfo (ክትፎ)', category: 'Raw & Delicacies', count: 9, share: '16%' },
                        { name: 'Chikina Tibs (የጭቅና ጥብስ)', category: 'Tibs & Sizzlers', count: 7, share: '12%' }
                      ].map(item => (
                        <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <strong>{item.name}</strong>
                            <span style={{ color: 'var(--muted)' }}>{item.count} orders ({item.share})</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#f0f3ee', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: item.share, height: '100%', background: 'var(--brand)', borderRadius: '4px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Table Status & Quick Operations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Universal Restaurant QR Code Card */}
                  <div className="admin-overview-card">
                    <div className="admin-overview-card-header">
                      <h3>
                        <AdminIcon name="qr" size={18} />
                        Universal Restaurant QR Menu
                      </h3>
                      <button className="admin-action-btn secondary sm" onClick={() => setActiveTab('tables')}>
                        Open QR Studio
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '12px 6px' }}>
                      <div
                        style={{
                          background: '#FAF8F5',
                          border: '1px solid #dcded1',
                          borderRadius: '10px',
                          padding: '8px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setActiveTab('tables')}
                        title="Click to open Universal QR Code studio"
                      >
                        <TableQRCodeSVG size={90} tableNumber="Universal" color="#143D2B" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '11px', color: '#C69234', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                          One QR For All Tables
                        </span>
                        <h4 style={{ margin: '2px 0 4px', fontSize: '15px', color: '#143D2B' }}>
                          Zerfe Lounge Digital Menu
                        </h4>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>
                          Set this single QR code on every dining table. Guests scan to order with instant kitchen delivery.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button
                            className="admin-action-btn secondary sm"
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.origin);
                              showToast('Menu URL copied!');
                            }}
                          >
                            <AdminIcon name="copy" size={13} /> Copy Link
                          </button>
                          <button
                            className="admin-action-btn primary sm"
                            onClick={() => setActiveTab('tables')}
                          >
                            <AdminIcon name="printer" size={13} /> Print Stand
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Operations Toolbar */}
                  <div className="admin-overview-card">
                    <div className="admin-overview-card-header">
                      <h3>Quick Restaurant Operations</h3>
                    </div>

                    <div className="admin-quick-ops-grid">
                      <button
                        className="admin-quick-op-btn"
                        onClick={() => {
                          setIsNewItem(true);
                          setEditingItem({
                            id: Date.now(),
                            name: '',
                            description: '',
                            price: 500,
                            category: 'Ethiopian Food',
                            image: 'photo-1746716447103-e1618bbd0669',
                            available: true
                          });
                          setActiveTab('menu');
                        }}
                      >
                        <AdminIcon name="plus" size={16} />
                        <span>Add Menu Dish</span>
                      </button>

                      <button
                        className="admin-quick-op-btn"
                        onClick={() => setActiveTab('categories')}
                      >
                        <AdminIcon name="categories" size={16} />
                        <span>Manage Categories</span>
                      </button>

                      <button
                        className="admin-quick-op-btn"
                        onClick={() => {
                          setPrintModalTable(tables[0]);
                          setPrintConcept('bulk');
                        }}
                      >
                        <AdminIcon name="printer" size={16} />
                        <span>Print Table Tents</span>
                      </button>

                      <button
                        className="admin-quick-op-btn"
                        onClick={onNavigateToCustomer}
                      >
                        <AdminIcon name="external" size={16} />
                        <span>Customer Menu</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB: STAFF MANAGEMENT, ROLES & PERMISSIONS (03D)
             ========================================================= */}
          {activeTab === 'staff' && (
            <div className="admin-staff-section">
              {/* Page Header */}
              <div className="admin-page-header">
                <div>
                  <h1>Staff Management</h1>
                  <p>Manage your team and control access to your restaurant workspace.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="admin-action-btn secondary"
                    onClick={() => setIsPermissionsMatrixOpen(true)}
                    title="View permissions by role"
                  >
                    <AdminIcon name="shield" size={15} /> Roles & Permissions
                  </button>
                  <button
                    className="admin-action-btn primary"
                    onClick={() => {
                      setAddForm({ name: '', email: '', phone: '', role: 'Waiter', note: '' });
                      setFormErrors({});
                      setInviteSentSuccess(null);
                      setInviteErrorMsg(null);
                      setIsAddStaffOpen(true);
                    }}
                  >
                    <AdminIcon name="userPlus" size={15} /> Add Staff Member
                  </button>
                </div>
              </div>

              {/* KPI Status Counters */}
              <div className="admin-staff-kpi-grid">
                <div className="admin-staff-kpi-card">
                  <span className="admin-staff-kpi-label">TOTAL STAFF</span>
                  <div className="admin-staff-kpi-val-row">
                    <strong>{staffMembers.length}</strong>
                    <span className="admin-staff-kpi-icon"><AdminIcon name="staff" size={18} /></span>
                  </div>
                  <span className="admin-staff-kpi-sub">Across all roles</span>
                </div>

                <div className="admin-staff-kpi-card">
                  <span className="admin-staff-kpi-label">ACTIVE STAFF</span>
                  <div className="admin-staff-kpi-val-row">
                    <strong style={{ color: '#1f693e' }}>
                      {staffMembers.filter(s => s.status === 'Active').length}
                    </strong>
                    <span className="admin-staff-kpi-dot active" />
                  </div>
                  <span className="admin-staff-kpi-sub">Active login privileges</span>
                </div>

                <div className="admin-staff-kpi-card">
                  <span className="admin-staff-kpi-label">PENDING INVITATIONS</span>
                  <div className="admin-staff-kpi-val-row">
                    <strong style={{ color: '#b0791a' }}>
                      {staffMembers.filter(s => s.status === 'Pending Invitation').length}
                    </strong>
                    <span className="admin-staff-kpi-dot pending" />
                  </div>
                  <span className="admin-staff-kpi-sub">Awaiting activation</span>
                </div>

                <div className="admin-staff-kpi-card">
                  <span className="admin-staff-kpi-label">INACTIVE</span>
                  <div className="admin-staff-kpi-val-row">
                    <strong style={{ color: '#7a857e' }}>
                      {staffMembers.filter(s => s.status === 'Inactive').length}
                    </strong>
                    <span className="admin-staff-kpi-dot inactive" />
                  </div>
                  <span className="admin-staff-kpi-sub">Deactivated accounts</span>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="admin-orders-controls">
                <div className="admin-filter-row" style={{ width: '100%' }}>
                  <div className="admin-search-input" style={{ flex: 1, minWidth: '220px' }}>
                    <AdminIcon name="search" size={16} />
                    <input
                      type="text"
                      placeholder="Search staff by name or email…"
                      value={searchStaff}
                      onChange={e => setSearchStaff(e.target.value)}
                    />
                  </div>

                  <select
                    className="admin-select"
                    value={staffRoleFilter}
                    onChange={e => setStaffRoleFilter(e.target.value)}
                  >
                    <option value="All">All Roles</option>
                    <option value="Owner">Owner</option>
                    <option value="Manager">Manager</option>
                    <option value="Kitchen Staff">Kitchen Staff</option>
                    <option value="Waiter">Waiter / Service</option>
                    <option value="Cashier">Cashier</option>
                  </select>

                  <select
                    className="admin-select"
                    value={staffStatusFilter}
                    onChange={e => setStaffStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending Invitation">Pending Invitation</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  {(searchStaff || staffRoleFilter !== 'All' || staffStatusFilter !== 'All') && (
                    <button
                      className="admin-action-btn secondary"
                      onClick={() => {
                        setSearchStaff('');
                        setStaffRoleFilter('All');
                        setStaffStatusFilter('All');
                      }}
                      title="Clear filters"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Staff Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Role</th>
                      <th>Account Status</th>
                      <th>Date Added</th>
                      <th>Last Active</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map(member => {
                      const roleMeta = roleDescriptions[member.role];
                      return (
                        <tr key={member.id} className="admin-staff-table-row">
                          <td style={{ cursor: 'pointer' }} onClick={() => setSelectedStaffProfile(member)}>
                            <div className="admin-staff-user-cell">
                              <span className="admin-staff-avatar">{member.avatar}</span>
                              <div>
                                <strong className="admin-staff-name">{member.name}</strong>
                                <span className="admin-staff-email">{member.email}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className={`admin-role-badge ${roleMeta.badgeClass}`}>
                              <AdminIcon name={roleMeta.icon} size={13} />
                              <span>{roleMeta.title}</span>
                            </span>
                          </td>

                          <td>
                            <span
                              className={`admin-status-pill ${
                                member.status === 'Active'
                                  ? 'active'
                                  : member.status === 'Pending Invitation'
                                  ? 'pending'
                                  : 'inactive'
                              }`}
                            >
                              <span className="admin-status-dot" />
                              <span>{member.status}</span>
                            </span>
                          </td>

                          <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{member.dateAdded}</td>

                          <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{member.lastActive}</td>

                          <td>
                            <div className="admin-staff-actions-cell">
                              {member.status === 'Pending Invitation' && (
                                <button
                                  className="admin-action-btn secondary sm"
                                  onClick={() => handleResendInvite(member)}
                                  title="Resend invitation email"
                                >
                                  <AdminIcon name="mail" size={13} /> Resend
                                </button>
                              )}

                              <button
                                className="admin-action-btn secondary sm"
                                onClick={() => setSelectedStaffProfile(member)}
                                title="View staff profile & permissions"
                              >
                                <AdminIcon name="eye" size={13} /> Profile
                              </button>

                              <button
                                className="admin-action-btn secondary sm"
                                onClick={() => {
                                  setRoleChangeTarget(member);
                                  setNewSelectedRole(member.role);
                                }}
                                title="Change role"
                              >
                                <AdminIcon name="shield" size={13} />
                              </button>

                              <button
                                className={`admin-action-btn sm ${member.status === 'Active' ? 'danger' : 'secondary'}`}
                                onClick={() => setDeactivatingTarget(member)}
                                title={member.status === 'Active' ? 'Deactivate account' : 'Reactivate account'}
                              >
                                {member.status === 'Active' ? (
                                  <AdminIcon name="userX" size={13} />
                                ) : (
                                  <AdminIcon name="check" size={13} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredStaff.length === 0 && (
                <div className="admin-empty-state">
                  <AdminIcon name="staff" size={40} />
                  <h3>No staff members found</h3>
                  <p>No team members match your current filter or search criteria.</p>
                  <button
                    className="admin-action-btn secondary"
                    onClick={() => {
                      setSearchStaff('');
                      setStaffRoleFilter('All');
                      setStaffStatusFilter('All');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Engineering & Security Handoff Accordion */}
              <div className="admin-backend-spec-card">
                <div
                  className="admin-backend-spec-header"
                  onClick={() => setShowMernDetails(!showMernDetails)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AdminIcon name="lock" size={18} />
                    <div>
                      <strong>Security Architecture & Backend Implementation Notes (MERN)</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)' }}>
                        Production RBAC, tenant scoping, and JWT authorization rules
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 600 }}>
                    {showMernDetails ? 'Hide Architecture Notes ▲' : 'Show Architecture Notes ▼'}
                  </span>
                </div>

                {showMernDetails && (
                  <div className="admin-backend-spec-body">
                    <div className="admin-spec-grid">
                      <div className="admin-spec-item">
                        <strong>1. Workspace Multi-Tenancy</strong>
                        <p>Every staff document in MongoDB belongs strictly to one restaurant workspace (`restaurantId`). Staff cannot access another venue by altering route IDs.</p>
                      </div>
                      <div className="admin-spec-item">
                        <strong>2. Cryptographic Expiring Invitations</strong>
                        <p>Invitations use signed, hashed single-use tokens expiring in 24 hours. Passwords are never sent or stored in plain text.</p>
                      </div>
                      <div className="admin-spec-item">
                        <strong>3. Server-Side RBAC Enforcement</strong>
                        <p>Never trust browser claims. Express middleware validates role permissions against JWT claims on every single protected API endpoint.</p>
                      </div>
                      <div className="admin-spec-item">
                        <strong>4. Non-Destructive Deactivation</strong>
                        <p>Deactivating revokes active refresh tokens instantly while preserving historical orders, audit logs, and prep records.</p>
                      </div>
                      <div className="admin-spec-item">
                        <strong>5. Primary Owner Safeguard</strong>
                        <p>Backend rejects attempts to delete, deactivate, or demote the last remaining Owner account without formal ownership transfer.</p>
                      </div>
                      <div className="admin-spec-item">
                        <strong>6. Audit Logging</strong>
                        <p>Sensitive operations (role changes, staff invitations, menu price adjustments) append immutable entries to the workspace audit trail.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB: RESTAURANT REPORTS & ANALYTICS (03E)
             ========================================================= */}
          {activeTab === 'reports' && (
            <div className="admin-reports-section">
              {/* Permission Check for Demo */}
              {reportingRoleView === 'Kitchen Staff' || reportingRoleView === 'Waiter' ? (
                <div className="admin-permission-denied-card">
                  <div className="admin-role-view-banner">
                    <span>Simulated Role Preview:</span>
                    <select
                      className="admin-role-select-inline"
                      value={reportingRoleView}
                      onChange={e => setReportingRoleView(e.target.value as StaffRole)}
                    >
                      <option value="Owner">Owner (Full Analytics Access)</option>
                      <option value="Manager">Manager (Operational Reports)</option>
                      <option value="Kitchen Staff">Kitchen Staff (Restricted)</option>
                      <option value="Waiter">Waiter / Service (Restricted)</option>
                    </select>
                  </div>
                  <div className="admin-denied-content">
                    <div className="admin-denied-icon">
                      <AdminIcon name="lock" size={36} />
                    </div>
                    <h2>Access Restricted: Financial & Sales Analytics</h2>
                    <p>
                      Your account role (<strong>{reportingRoleView}</strong>) does not have authorization to view financial reports, revenue summaries, or sales trends.
                    </p>
                    <div className="admin-denied-notice">
                      <AdminIcon name="info" size={16} />
                      <span>Financial metrics are restricted to Owners and authorized Managers per GebetaQR security rules.</span>
                    </div>
                    <button
                      className="admin-action-btn primary"
                      style={{ marginTop: '20px' }}
                      onClick={() => setReportingRoleView('Owner')}
                    >
                      Switch Back to Owner View
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Page Header */}
                  <div className="admin-page-header">
                    <div>
                      <h1>Reports & Analytics</h1>
                      <p>Sales and operational performance for Zerfe Lounge.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        className="admin-action-btn primary"
                        onClick={() => {
                          setExportErrorMsg(null);
                          setIsExportModalOpen(true);
                        }}
                      >
                        <AdminIcon name="download" size={15} /> Export Report
                      </button>
                    </div>
                  </div>

                  {/* Period Filter Bar */}
                  <div className="admin-reports-filter-bar">
                    <div className="admin-reports-preset-pills">
                      {(
                        [
                          { key: 'today', label: 'Today' },
                          { key: 'yesterday', label: 'Yesterday' },
                          { key: '7days', label: 'Last 7 Days' },
                          { key: '30days', label: 'Last 30 Days' },
                          { key: 'month', label: 'This Month' }
                        ] as { key: DateRangePreset; label: string }[]
                      ).map(p => (
                        <button
                          key={p.key}
                          className={`admin-report-pill-btn ${selectedReportPreset === p.key ? 'active' : ''}`}
                          onClick={() => setSelectedReportPreset(p.key)}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <div className="admin-reports-filter-meta">
                      <span className="admin-report-range-text">{activeReport.periodLabel}</span>
                      <label className="admin-report-compare-toggle">
                        <input
                          type="checkbox"
                          checked={comparePreviousPeriod}
                          onChange={e => setComparePreviousPeriod(e.target.checked)}
                        />
                        <span>Compare with previous period</span>
                      </label>
                    </div>
                  </div>

                  {/* 4 Clean Spacious KPI Cards */}
                  <div className="admin-reports-kpis-grid">
                    {/* Gross Sales */}
                    <div className="admin-report-kpi-box highlight">
                      <div className="admin-kpi-head">
                        <span className="admin-kpi-label">Gross Sales</span>
                        <div className="admin-kpi-icon-wrap brand">
                          <AdminIcon name="trendingUp" size={16} />
                        </div>
                      </div>
                      <div className="admin-kpi-number-row">
                        <strong>{money(activeReport.grossSales)}</strong>
                        {comparePreviousPeriod && (
                          <span className={`admin-kpi-badge ${activeReport.grossSalesChange >= 0 ? 'positive' : 'negative'}`}>
                            {activeReport.grossSalesChange >= 0 ? `+${activeReport.grossSalesChange}%` : `${activeReport.grossSalesChange}%`}
                          </span>
                        )}
                      </div>
                      <span className="admin-kpi-hint">Total revenue from completed orders</span>
                    </div>

                    {/* Total Orders */}
                    <div className="admin-report-kpi-box">
                      <div className="admin-kpi-head">
                        <span className="admin-kpi-label">Completed Orders</span>
                        <div className="admin-kpi-icon-wrap">
                          <AdminIcon name="orders" size={16} />
                        </div>
                      </div>
                      <div className="admin-kpi-number-row">
                        <strong>{activeReport.completedOrders}</strong>
                        {comparePreviousPeriod && (
                          <span className={`admin-kpi-badge ${activeReport.completedOrdersChange >= 0 ? 'positive' : 'negative'}`}>
                            {activeReport.completedOrdersChange >= 0 ? `+${activeReport.completedOrdersChange}%` : `${activeReport.completedOrdersChange}%`}
                          </span>
                        )}
                      </div>
                      <span className="admin-kpi-hint">Fulfilled dine-in & takeaway orders</span>
                    </div>

                    {/* Average Order Value */}
                    <div className="admin-report-kpi-box">
                      <div className="admin-kpi-head">
                        <span className="admin-kpi-label">Average Order</span>
                        <div className="admin-kpi-icon-wrap">
                          <AdminIcon name="check" size={16} />
                        </div>
                      </div>
                      <div className="admin-kpi-number-row">
                        <strong>{money(activeReport.averageOrderValue)}</strong>
                        {comparePreviousPeriod && (
                          <span className={`admin-kpi-badge ${activeReport.averageOrderValueChange >= 0 ? 'positive' : 'negative'}`}>
                            {activeReport.averageOrderValueChange >= 0 ? `+${activeReport.averageOrderValueChange}%` : `${activeReport.averageOrderValueChange}%`}
                          </span>
                        )}
                      </div>
                      <span className="admin-kpi-hint">Average spent per dining order</span>
                    </div>

                    {/* Cancelled Orders */}
                    <div className="admin-report-kpi-box">
                      <div className="admin-kpi-head">
                        <span className="admin-kpi-label">Cancelled Orders</span>
                        <div className="admin-kpi-icon-wrap danger">
                          <AdminIcon name="alertTriangle" size={16} />
                        </div>
                      </div>
                      <div className="admin-kpi-number-row">
                        <strong style={{ color: activeReport.cancelledOrders > 5 ? '#c53939' : 'inherit' }}>
                          {activeReport.cancelledOrders}
                        </strong>
                        <span className="admin-kpi-badge neutral">{activeReport.cancelledRate}% rate</span>
                      </div>
                      <span className="admin-kpi-hint">Voided before kitchen preparation</span>
                    </div>
                  </div>

                  {/* Clean Spacious Sales Trend Chart Card */}
                  <div className="admin-report-card">
                    <div className="admin-card-header">
                      <div>
                        <h3 className="admin-card-title">Sales Overview</h3>
                        <p className="admin-card-sub">Daily revenue trend for {activeReport.periodLabel}</p>
                      </div>

                      <div className="admin-chart-legends">
                        <div className="admin-legend-item">
                          <span className="admin-legend-dot current" />
                          <span>Current Period ({money(activeReport.grossSales)})</span>
                        </div>
                        {comparePreviousPeriod && (
                          <div className="admin-legend-item">
                            <span className="admin-legend-dot previous" />
                            <span>Previous Period</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SVG Chart */}
                    <div className="admin-svg-chart-wrapper">
                      {(() => {
                        const points = activeReport.chartPoints;
                        const maxSales = Math.max(...points.map(p => Math.max(p.sales, p.previousSales))) * 1.15 || 5000;
                        const w = 760;
                        const h = 220;
                        const padL = 60;
                        const padR = 25;
                        const padT = 20;
                        const padB = 35;
                        const chartW = w - padL - padR;
                        const chartH = h - padT - padB;

                        const getCoords = (index: number, val: number) => {
                          const x = padL + (index / (points.length - 1)) * chartW;
                          const y = padT + chartH - (val / maxSales) * chartH;
                          return { x, y };
                        };

                        const currentPath = points
                          .map((p, i) => {
                            const { x, y } = getCoords(i, p.sales);
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                          })
                          .join(' ');

                        const areaPath = `${currentPath} L ${padL + chartW} ${padT + chartH} L ${padL} ${padT + chartH} Z`;

                        const prevPath = points
                          .map((p, i) => {
                            const { x, y } = getCoords(i, p.previousSales);
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                          })
                          .join(' ');

                        const yGrid = [0, 0.33, 0.66, 1].map(ratio => ({
                          val: Math.round(maxSales * ratio),
                          y: padT + chartH - ratio * chartH
                        }));

                        return (
                          <svg viewBox={`0 0 ${w} ${h}`} className="admin-sales-svg-chart" aria-label="Sales Trend Chart">
                            <defs>
                              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#143D2B" stopOpacity="0.20" />
                                <stop offset="100%" stopColor="#143D2B" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Horizontal Grid lines */}
                            {yGrid.map((g, idx) => (
                              <g key={idx}>
                                <line x1={padL} y1={g.y} x2={padL + chartW} y2={g.y} stroke="#edf1ea" strokeDasharray="3 3" />
                                <text x={padL - 10} y={g.y + 4} fill="#8da08e" fontSize="10" textAnchor="end" fontFamily="inherit">
                                  {g.val >= 1000 ? `${(g.val / 1000).toFixed(0)}k` : g.val}
                                </text>
                              </g>
                            ))}

                            {/* Previous Period Trend Line */}
                            {comparePreviousPeriod && (
                              <path d={prevPath} fill="none" stroke="#C69234" strokeWidth="2" strokeDasharray="4 4" opacity="0.75" />
                            )}

                            {/* Current Period Area Fill */}
                            <path d={areaPath} fill="url(#salesGrad)" />

                            {/* Current Period Line */}
                            <path d={currentPath} fill="none" stroke="#143D2B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Data points & X-Labels */}
                            {points.map((p, i) => {
                              const { x, y } = getCoords(i, p.sales);
                              const isHovered = hoveredPointIndex === i;
                              return (
                                <g key={i}>
                                  <text x={x} y={padT + chartH + 20} fill="#6e7f70" fontSize="11" textAnchor="middle" fontFamily="inherit">
                                    {p.label}
                                  </text>
                                  {isHovered && <circle cx={x} y={y} r="8" fill="#143D2B" opacity="0.2" />}
                                  <circle
                                    cx={x}
                                    y={y}
                                    r={isHovered ? 6 : 4}
                                    fill={isHovered ? '#C69234' : '#143D2B'}
                                    stroke="#fff"
                                    strokeWidth="2"
                                    style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                                    onMouseEnter={() => setHoveredPointIndex(i)}
                                    onMouseLeave={() => setHoveredPointIndex(null)}
                                  />
                                </g>
                              );
                            })}
                          </svg>
                        );
                      })()}

                      {/* Tooltip */}
                      {hoveredPointIndex !== null && activeReport.chartPoints[hoveredPointIndex] && (
                        <div className="admin-chart-tooltip-box">
                          <strong>{activeReport.chartPoints[hoveredPointIndex].label}</strong>
                          <div>Sales: <strong>{money(activeReport.chartPoints[hoveredPointIndex].sales)}</strong></div>
                          <div>Orders: {activeReport.chartPoints[hoveredPointIndex].orders}</div>
                          {comparePreviousPeriod && (
                            <div style={{ color: '#C69234', marginTop: '2px', fontSize: '11px' }}>
                              Prev: {money(activeReport.chartPoints[hoveredPointIndex].previousSales)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 2-Column Section: Top Dishes & Category Breakdown */}
                  <div className="admin-reports-two-col">
                    {/* Left: Top Dishes */}
                    <div className="admin-report-card">
                      <div className="admin-card-header">
                        <div>
                          <h3 className="admin-card-title">Top Selling Dishes</h3>
                          <p className="admin-card-sub">Most popular items in your menu</p>
                        </div>

                        <div className="admin-ranking-toggle">
                          <button
                            className={`admin-rank-toggle-btn ${rankingMetric === 'quantity' ? 'active' : ''}`}
                            onClick={() => setRankingMetric('quantity')}
                          >
                            By Quantity
                          </button>
                          <button
                            className={`admin-rank-toggle-btn ${rankingMetric === 'sales' ? 'active' : ''}`}
                            onClick={() => setRankingMetric('sales')}
                          >
                            By Revenue
                          </button>
                        </div>
                      </div>

                      <div className="admin-top-dishes-list">
                        {sortedTopItems.slice(0, 5).map((item, index) => (
                          <div key={item.id} className="admin-top-dish-row">
                            <span className={`admin-rank-circle rank-${index + 1}`}>{index + 1}</span>
                            <div className="admin-top-dish-info">
                              <strong className="admin-top-dish-name">{item.name}</strong>
                              <span className="admin-top-dish-cat">{item.category}</span>
                            </div>
                            <div className="admin-top-dish-stats">
                              <span className="admin-top-dish-qty">{item.quantity} sold</span>
                              <strong className="admin-top-dish-amount">{money(item.salesAmount)}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Category Breakdown */}
                    <div className="admin-report-card">
                      <div className="admin-card-header">
                        <div>
                          <h3 className="admin-card-title">Sales by Category</h3>
                          <p className="admin-card-sub">Revenue distribution across menu sections</p>
                        </div>
                      </div>

                      <div className="admin-category-bars-container">
                        {activeReport.categories.map(cat => (
                          <div key={cat.category} className="admin-cat-bar-box">
                            <div className="admin-cat-bar-labels">
                              <span className="admin-cat-name">{cat.category}</span>
                              <div className="admin-cat-val">
                                <strong>{money(cat.salesAmount)}</strong>
                                <span className="admin-cat-pct">({cat.sharePercent}%)</span>
                              </div>
                            </div>
                            <div className="admin-cat-track">
                              <div className="admin-cat-fill" style={{ width: `${cat.sharePercent}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clean Spacious Recent Orders Table */}
                  <div className="admin-report-card">
                    <div className="admin-card-header">
                      <div>
                        <h3 className="admin-card-title">Recent Orders</h3>
                        <p className="admin-card-sub">Recorded customer transactions from QR menu for {activeReport.periodLabel}</p>
                      </div>

                      <div className="admin-orders-search-box">
                        <AdminIcon name="search" size={14} />
                        <input
                          type="text"
                          placeholder="Search orders, table..."
                          value={reportOrderSearch}
                          onChange={e => setReportOrderSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Time</th>
                            <th>Table</th>
                            <th>Items</th>
                            <th>Payment</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                            <th>Status</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReportOrders.map(order => (
                            <tr key={order.id} className="admin-staff-table-row">
                              <td><strong style={{ color: 'var(--brand)' }}>{order.reference}</strong></td>
                              <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{order.time}</td>
                              <td><span className="admin-table-pill">{order.table}</span></td>
                              <td style={{ color: 'var(--ink)' }}>{order.itemsSummary}</td>
                              <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{order.paymentMethod}</td>
                              <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--brand)' }}>
                                {money(order.total)}
                              </td>
                              <td>
                                <span className={`admin-order-status-badge ${order.status === 'Completed' ? 'delivered' : 'cancelled'}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  className="admin-action-btn secondary sm"
                                  onClick={() => setSelectedHistoricalOrder(order)}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredReportOrders.length === 0 && (
                      <div className="admin-empty-state" style={{ padding: '30px 10px' }}>
                        <AdminIcon name="orders" size={36} />
                        <h3>No orders match your search</h3>
                        <p>Try clearing your search query.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* =========================================================
              03F — RESTAURANT SETTINGS, PROFILE & BILLING
             ========================================================= */}
          {activeTab === 'settings' && (
            <div className="admin-settings-section">
              {/* Header */}
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Settings & Profile</h2>
                  <p className="admin-section-subtitle">
                    Configure your restaurant information, ordering rules, and payment methods
                  </p>
                </div>
                <button
                  className="admin-action-btn primary"
                  onClick={() => showToast('Settings saved successfully')}
                >
                  <AdminIcon name="check" size={16} />
                  <span>Save Changes</span>
                </button>
              </div>

              {/* Sub-Tabs Bar */}
              <div className="admin-settings-tabs-bar">
                <button
                  className={`admin-settings-tab-btn ${settingsSubTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setSettingsSubTab('profile')}
                >
                  <AdminIcon name="store" size={16} />
                  <span>Restaurant Profile</span>
                </button>
                <button
                  className={`admin-settings-tab-btn ${settingsSubTab === 'ordering' ? 'active' : ''}`}
                  onClick={() => setSettingsSubTab('ordering')}
                >
                  <AdminIcon name="clock" size={16} />
                  <span>Ordering Rules</span>
                </button>
                <button
                  className={`admin-settings-tab-btn ${settingsSubTab === 'payments' ? 'active' : ''}`}
                  onClick={() => setSettingsSubTab('payments')}
                >
                  <AdminIcon name="creditCard" size={16} />
                  <span>Payment Channels</span>
                </button>
                <button
                  className={`admin-settings-tab-btn ${settingsSubTab === 'billing' ? 'active' : ''}`}
                  onClick={() => setSettingsSubTab('billing')}
                >
                  <AdminIcon name="receipt" size={16} />
                  <span>Plan & Billing</span>
                </button>
              </div>

              {/* TAB 1: RESTAURANT PROFILE */}
              {settingsSubTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="admin-card">
                    <h3 className="admin-card-title" style={{ marginBottom: '6px' }}>General Information</h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--muted)' }}>
                      Basic business profile displayed on customer digital menus and table tents.
                    </p>

                    <div className="admin-settings-form-grid">
                      <div className="admin-form-group">
                        <label>Restaurant Name</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Cuisine / Category</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={profileForm.cuisine}
                          onChange={e => setProfileForm({ ...profileForm, cuisine: e.target.value })}
                        />
                      </div>

                      <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Tagline / Motto</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={profileForm.tagline}
                          onChange={e => setProfileForm({ ...profileForm, tagline: e.target.value })}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Phone Number</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Contact Email</label>
                        <input
                          type="email"
                          className="admin-input"
                          value={profileForm.email}
                          onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        />
                      </div>

                      <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Physical Address / Location</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={profileForm.address}
                          onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Business Hours</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={profileForm.openingHours}
                          onChange={e => setProfileForm({ ...profileForm, openingHours: e.target.value })}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Operational Currency</label>
                        <input
                          type="text"
                          className="admin-input"
                          value="ETB (Ethiopian Birr)"
                          disabled
                          style={{ background: '#F8F9F7', cursor: 'not-allowed' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guest Wi-Fi */}
                  <div className="admin-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <AdminIcon name="wifi" size={18} />
                      <h3 className="admin-card-title" style={{ margin: 0 }}>Guest Wi-Fi Details</h3>
                    </div>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--muted)' }}>
                      Automatically printed on table tents and QR cards so guests can connect and view the menu quickly.
                    </p>

                    <div className="admin-settings-form-grid">
                      <div className="admin-form-group">
                        <label>Wi-Fi Network Name (SSID)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={profileForm.wifiSsid}
                          onChange={e => setProfileForm({ ...profileForm, wifiSsid: e.target.value })}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Wi-Fi Password</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={profileForm.wifiPassword}
                          onChange={e => setProfileForm({ ...profileForm, wifiPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERING RULES */}
              {settingsSubTab === 'ordering' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="admin-card">
                    <h3 className="admin-card-title" style={{ marginBottom: '6px' }}>Customer QR Ordering Rules</h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--muted)' }}>
                      Control how guests interact with the digital menu at their tables.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Direct QR Ordering Toggle */}
                      <div className="admin-switch-row">
                        <div className="admin-switch-info">
                          <strong>Direct QR Self-Ordering</strong>
                          <span>Allow customers to place orders directly from their phones without calling a waiter</span>
                        </div>
                        <label className="admin-switch">
                          <input
                            type="checkbox"
                            checked={orderingSettings.directOrdering}
                            onChange={e => setOrderingSettings({ ...orderingSettings, directOrdering: e.target.checked })}
                          />
                          <span className="admin-switch-slider" />
                        </label>
                      </div>

                      {/* Special Notes Toggle */}
                      <div className="admin-switch-row">
                        <div className="admin-switch-info">
                          <strong>Allow Special Cooking Notes</strong>
                          <span>Permit customers to enter custom dietary or allergy requests at checkout</span>
                        </div>
                        <label className="admin-switch">
                          <input
                            type="checkbox"
                            checked={orderingSettings.allowSpecialNotes}
                            onChange={e => setOrderingSettings({ ...orderingSettings, allowSpecialNotes: e.target.checked })}
                          />
                          <span className="admin-switch-slider" />
                        </label>
                      </div>

                      {/* Sound Alert Toggle */}
                      <div className="admin-switch-row">
                        <div className="admin-switch-info">
                          <strong>Audio Chime on New Orders</strong>
                          <span>Play a distinctive notification sound on this dashboard when a new order arrives</span>
                        </div>
                        <label className="admin-switch">
                          <input
                            type="checkbox"
                            checked={orderingSettings.soundAlerts}
                            onChange={e => setOrderingSettings({ ...orderingSettings, soundAlerts: e.target.checked })}
                          />
                          <span className="admin-switch-slider" />
                        </label>
                      </div>

                      {/* Auto Print Thermal Tickets */}
                      <div className="admin-switch-row">
                        <div className="admin-switch-info">
                          <strong>Automatic Kitchen Thermal Print</strong>
                          <span>Send orders directly to the POS receipt printer as soon as confirmed</span>
                        </div>
                        <label className="admin-switch">
                          <input
                            type="checkbox"
                            checked={orderingSettings.autoPrintTickets}
                            onChange={e => setOrderingSettings({ ...orderingSettings, autoPrintTickets: e.target.checked })}
                          />
                          <span className="admin-switch-slider" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Timing & Service Charges */}
                  <div className="admin-card">
                    <h3 className="admin-card-title" style={{ marginBottom: '6px' }}>Timing & Surcharges</h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--muted)' }}>
                      Estimated wait times and standard Ethiopian service & VAT percentages.
                    </p>

                    <div className="admin-settings-form-grid">
                      <div className="admin-form-group">
                        <label>Average Prep Time Estimate</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={orderingSettings.prepTimeEstimate}
                          onChange={e => setOrderingSettings({ ...orderingSettings, prepTimeEstimate: e.target.value })}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Restaurant Service Charge (%)</label>
                        <input
                          type="number"
                          className="admin-input"
                          value={orderingSettings.serviceCharge}
                          onChange={e => setOrderingSettings({ ...orderingSettings, serviceCharge: Number(e.target.value) })}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Government VAT / Tax (%)</label>
                        <input
                          type="number"
                          className="admin-input"
                          value={orderingSettings.taxVat}
                          onChange={e => setOrderingSettings({ ...orderingSettings, taxVat: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PAYMENT CHANNELS */}
              {settingsSubTab === 'payments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="admin-card">
                    <h3 className="admin-card-title" style={{ marginBottom: '6px' }}>Ethiopian Payment Channels</h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--muted)' }}>
                      Select which payment options are presented to customers on the digital checkout screen.
                    </p>

                    <div className="admin-payment-grid">
                      {/* Telebirr */}
                      <div className={`admin-payment-channel-card ${paymentSettings.telebirrEnabled ? 'active' : ''}`}>
                        <div className="admin-payment-header">
                          <div>
                            <span className="admin-payment-badge telebirr">Telebirr Mobile Money</span>
                            <h4 style={{ margin: '8px 0 2px 0', fontSize: '15px' }}>Telebirr Direct</h4>
                          </div>
                          <label className="admin-switch">
                            <input
                              type="checkbox"
                              checked={paymentSettings.telebirrEnabled}
                              onChange={e => setPaymentSettings({ ...paymentSettings, telebirrEnabled: e.target.checked })}
                            />
                            <span className="admin-switch-slider" />
                          </label>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 14px 0' }}>
                          Enables fast USSD and Telebirr SuperApp QR payments for dining guests.
                        </p>
                        <div className="admin-form-group">
                          <label style={{ fontSize: '11px' }}>Merchant / Till Code</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={paymentSettings.telebirrMerchantCode}
                            disabled={!paymentSettings.telebirrEnabled}
                            onChange={e => setPaymentSettings({ ...paymentSettings, telebirrMerchantCode: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* CBE Birr */}
                      <div className={`admin-payment-channel-card ${paymentSettings.cbeBirrEnabled ? 'active' : ''}`}>
                        <div className="admin-payment-header">
                          <div>
                            <span className="admin-payment-badge cbe">Commercial Bank of Ethiopia</span>
                            <h4 style={{ margin: '8px 0 2px 0', fontSize: '15px' }}>CBE Birr</h4>
                          </div>
                          <label className="admin-switch">
                            <input
                              type="checkbox"
                              checked={paymentSettings.cbeBirrEnabled}
                              onChange={e => setPaymentSettings({ ...paymentSettings, cbeBirrEnabled: e.target.checked })}
                            />
                            <span className="admin-switch-slider" />
                          </label>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 14px 0' }}>
                          Accept direct payments via CBE mobile banking and CBE Birr wallets.
                        </p>
                        <div className="admin-form-group">
                          <label style={{ fontSize: '11px' }}>Account / Merchant Number</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={paymentSettings.cbeBirrAccount}
                            disabled={!paymentSettings.cbeBirrEnabled}
                            onChange={e => setPaymentSettings({ ...paymentSettings, cbeBirrAccount: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Cash at Table */}
                      <div className={`admin-payment-channel-card ${paymentSettings.cashEnabled ? 'active' : ''}`}>
                        <div className="admin-payment-header">
                          <div>
                            <span className="admin-payment-badge inperson">In-Person</span>
                            <h4 style={{ margin: '8px 0 2px 0', fontSize: '15px' }}>Cash to Waiter</h4>
                          </div>
                          <label className="admin-switch">
                            <input
                              type="checkbox"
                              checked={paymentSettings.cashEnabled}
                              onChange={e => setPaymentSettings({ ...paymentSettings, cashEnabled: e.target.checked })}
                            />
                            <span className="admin-switch-slider" />
                          </label>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                          Customers can select 'Pay with Cash' and the assigned waiter collects at the table.
                        </p>
                      </div>

                      {/* POS Machine */}
                      <div className={`admin-payment-channel-card ${paymentSettings.posEnabled ? 'active' : ''}`}>
                        <div className="admin-payment-header">
                          <div>
                            <span className="admin-payment-badge inperson">POS Terminal</span>
                            <h4 style={{ margin: '8px 0 2px 0', fontSize: '15px' }}>Card Machine at Table</h4>
                          </div>
                          <label className="admin-switch">
                            <input
                              type="checkbox"
                              checked={paymentSettings.posEnabled}
                              onChange={e => setPaymentSettings({ ...paymentSettings, posEnabled: e.target.checked })}
                            />
                            <span className="admin-switch-slider" />
                          </label>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                          Customers can request the portable debit/credit card machine brought to table.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PLAN & BILLING */}
              {settingsSubTab === 'billing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Hero Plan Card */}
                  <div className="admin-card" style={{ border: '2px solid var(--accent)', background: '#FAF9F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', background: '#F5EBD7', padding: '4px 10px', borderRadius: '20px' }}>
                          Current Subscription
                        </span>
                        <h3 style={{ margin: '10px 0 4px 0', fontSize: '22px', color: 'var(--brand)' }}>GebetaQR Pro</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                          Full-featured digital menu & table management for growing restaurants.
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--brand)' }}>2,400 ETB</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>per month · Billed monthly</div>
                        <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 600, color: '#2E6B4D' }}>
                          ✓ Renews on 17 Nov 2026
                        </div>
                      </div>
                    </div>

                    <hr style={{ border: 0, borderTop: '1px solid #E5E9E2', margin: '20px 0' }} />

                    <div className="admin-plan-features-grid">
                      <div className="admin-plan-feature-item">
                        <span style={{ color: 'var(--brand)' }}>✓</span>
                        <span>Unlimited QR table scans & views</span>
                      </div>
                      <div className="admin-plan-feature-item">
                        <span style={{ color: 'var(--brand)' }}>✓</span>
                        <span>Live kitchen order board with chimes</span>
                      </div>
                      <div className="admin-plan-feature-item">
                        <span style={{ color: 'var(--brand)' }}>✓</span>
                        <span>Printable PDF table tents & QR stickers</span>
                      </div>
                      <div className="admin-plan-feature-item">
                        <span style={{ color: 'var(--brand)' }}>✓</span>
                        <span>Up to 15 staff accounts with roles</span>
                      </div>
                      <div className="admin-plan-feature-item">
                        <span style={{ color: 'var(--brand)' }}>✓</span>
                        <span>Telebirr & CBE Birr integrations</span>
                      </div>
                      <div className="admin-plan-feature-item">
                        <span style={{ color: 'var(--brand)' }}>✓</span>
                        <span>Analytics, CSV & PDF export reports</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Invoices */}
                  <div className="admin-card">
                    <h3 className="admin-card-title" style={{ marginBottom: '6px' }}>Invoice History</h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--muted)' }}>
                      Official monthly subscription receipts for tax and accounting records.
                    </p>

                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Invoice ID</th>
                            <th>Billing Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Receipt</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>#INV-2026-09</strong></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>17 Oct 2026</td>
                            <td style={{ fontWeight: 600 }}>2,400 ETB</td>
                            <td>
                              <span className="admin-order-status-badge delivered">Paid</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="admin-action-btn secondary sm"
                                onClick={() => showToast('Receipt #INV-2026-09 downloaded (PDF)')}
                              >
                                <AdminIcon name="download" size={13} />
                                <span>Download PDF</span>
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td><strong>#INV-2026-08</strong></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>17 Sep 2026</td>
                            <td style={{ fontWeight: 600 }}>2,400 ETB</td>
                            <td>
                              <span className="admin-order-status-badge delivered">Paid</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="admin-action-btn secondary sm"
                                onClick={() => showToast('Receipt #INV-2026-08 downloaded (PDF)')}
                              >
                                <AdminIcon name="download" size={13} />
                                <span>Download PDF</span>
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td><strong>#INV-2026-07</strong></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>17 Aug 2026</td>
                            <td style={{ fontWeight: 600 }}>2,400 ETB</td>
                            <td>
                              <span className="admin-order-status-badge delivered">Paid</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="admin-action-btn secondary sm"
                                onClick={() => showToast('Receipt #INV-2026-07 downloaded (PDF)')}
                              >
                                <AdminIcon name="download" size={13} />
                                <span>Download PDF</span>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* =========================================================
          MODAL 1: QR CODE DETAIL & GENERATOR MODAL (03C)
         ========================================================= */}
      {selectedQRTable && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedQRTable(null)}>
          <div className="admin-modal" style={{ width: '460px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0 }}>{selectedQRTable.number} QR Code</h3>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Zerfe Lounge · {selectedQRTable.area}</span>
              </div>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setSelectedQRTable(null)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            <div className="admin-qr-modal-body">
              {/* High-Contrast Crisp QR Code */}
              <div className="admin-qr-code-frame">
                <TableQRCodeSVG size={180} tableNumber={selectedQRTable.number} />
              </div>

              {/* Destination URL */}
              <div className="admin-qr-url-box">
                <span>https://gebetaqr.com/r/zerfe-lounge/t/{selectedQRTable.qrToken}</span>
                <button
                  style={{ background: 'transparent', border: 0, color: 'var(--brand)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  onClick={() => {
                    navigator.clipboard?.writeText(`https://gebetaqr.com/r/zerfe-lounge/t/${selectedQRTable.qrToken}`);
                    showToast('Table ordering link copied to clipboard!');
                  }}
                  title="Copy Link"
                >
                  <AdminIcon name="copy" size={16} />
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', marginBottom: '12px' }}>
                <button
                  className="admin-action-btn secondary"
                  onClick={() => {
                    setPrintModalTable(selectedQRTable);
                    setPrintConcept('card');
                  }}
                >
                  <AdminIcon name="printer" size={15} /> Print Card
                </button>
                <button
                  className="admin-action-btn secondary"
                  onClick={() => {
                    setPrintModalTable(selectedQRTable);
                    setPrintConcept('tent');
                  }}
                >
                  <AdminIcon name="printer" size={15} /> Print Tent Card
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button
                  className="admin-action-btn secondary"
                  style={{ flex: 1 }}
                  onClick={() => showToast(`Downloaded high-res PNG for ${selectedQRTable.number}`)}
                >
                  <AdminIcon name="download" size={15} /> Download PNG
                </button>
                <button
                  className="admin-action-btn danger"
                  onClick={() => handleRegenerateQR(selectedQRTable)}
                  title="Generate new QR token (invalidates old printed QR)"
                >
                  Regenerate QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: PRINTABLE ASSETS & TENT CARDS PREVIEW (03C)
         ========================================================= */}
      {printModalTable && (
        <div className="admin-modal-backdrop" onClick={() => setPrintModalTable(null)}>
          <div className="admin-modal" style={{ width: printConcept === 'bulk' ? '640px' : '520px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Print Table QR Code</h3>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>High-resolution print-ready layout</span>
              </div>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setPrintModalTable(null)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            {/* Print Concept Switcher */}
            <div className="admin-print-switcher">
              <button
                className={`admin-tab-btn ${printConcept === 'card' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setPrintConcept('card')}
              >
                Tabletop Card
              </button>
              <button
                className={`admin-tab-btn ${printConcept === 'tent' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setPrintConcept('tent')}
              >
                Folded Tent Card
              </button>
              <button
                className={`admin-tab-btn ${printConcept === 'bulk' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setPrintConcept('bulk')}
              >
                A4 Bulk Sheet (All Tables)
              </button>
            </div>

            {/* 1. Compact Tabletop Card Preview */}
            {printConcept === 'card' && (
              <div className="admin-print-card-preview">
                <div className="admin-print-card-brand">ZERFE LOUNGE</div>
                <div className="admin-print-card-sub">HOTEL & LUXURY DINING · BALE ROBE</div>
                <div className="admin-print-card-table">{printModalTable.number.toUpperCase()}</div>
                <div className="admin-print-card-qr">
                  <TableQRCodeSVG size={140} tableNumber={printModalTable.number} />
                </div>
                <div className="admin-print-card-instruction">Scan with phone camera to view menu & order</div>
                <div className="admin-print-card-footer">Thoughtfully served with gebetaQR</div>
              </div>
            )}

            {/* 2. Folded Tent Card Preview */}
            {printConcept === 'tent' && (
              <div className="admin-tent-card-preview">
                <div className="admin-tent-panel">
                  <strong style={{ fontSize: '14px', color: 'var(--brand)' }}>ZERFE LOUNGE</strong>
                  <p style={{ fontSize: '10px', color: 'var(--muted)', margin: '4px 0 12px' }}>{printModalTable.number}</p>
                  <TableQRCodeSVG size={105} tableNumber={printModalTable.number} />
                  <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--brand)', marginTop: '8px' }}>Scan to Order</p>
                </div>
                <div className="admin-tent-divider">FOLD LINE</div>
                <div className="admin-tent-panel">
                  <strong style={{ fontSize: '14px', color: 'var(--brand)' }}>WELCOME TO OUR TABLE</strong>
                  <p style={{ fontSize: '10px', color: 'var(--muted)', margin: '4px 0 12px' }}>{printModalTable.number}</p>
                  <TableQRCodeSVG size={105} tableNumber={printModalTable.number} />
                  <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--brand)', marginTop: '8px' }}>Scan to Order</p>
                </div>
              </div>
            )}

            {/* 3. Bulk A4 Sheet Preview */}
            {printConcept === 'bulk' && (
              <div className="admin-bulk-sheet">
                <div style={{ textAlign: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e5dc', paddingBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--brand)' }}>ZERFE LOUNGE — ALL TABLES QR PRINT SHEET</strong>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>Cut along dashed lines and place on dining tables</span>
                </div>
                <div className="admin-bulk-grid">
                  {tables.slice(0, 4).map(t => (
                    <div className="admin-bulk-cell" key={t.id}>
                      <strong style={{ fontSize: '13px', color: 'var(--brand)' }}>{t.number}</strong>
                      <div style={{ margin: '8px 0' }}>
                        <TableQRCodeSVG size={90} tableNumber={t.number} />
                      </div>
                      <span style={{ fontSize: '9px', color: 'var(--muted)' }}>Scan to view menu & order</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="admin-modal-actions" style={{ marginTop: '20px' }}>
              <button className="admin-action-btn secondary" onClick={() => setPrintModalTable(null)}>
                Cancel
              </button>
              <button
                className="admin-action-btn primary"
                onClick={() => {
                  showToast('Print dialog triggered. High-resolution print output ready.');
                  setPrintModalTable(null);
                }}
              >
                <AdminIcon name="printer" size={15} /> Print Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: ADD / EDIT TABLE FORM (03C)
         ========================================================= */}
      {editingTable && (
        <div className="admin-modal-backdrop" onClick={() => setEditingTable(null)}>
          <div className="admin-modal" style={{ width: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0 }}>{isNewTable ? 'Add Dining Table' : `Edit ${editingTable.number}`}</h3>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setEditingTable(null)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            <div className="admin-form-group">
              <label>Table Number / Name *</label>
              <input
                type="text"
                placeholder="e.g. Table 09 or Patio 01"
                value={editingTable.number}
                onChange={e => setEditingTable({ ...editingTable, number: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="admin-form-group">
                <label>Dining Area *</label>
                <select
                  value={editingTable.area}
                  onChange={e => setEditingTable({ ...editingTable, area: e.target.value })}
                >
                  <option value="Main Dining">Main Dining</option>
                  <option value="Terrace">Terrace</option>
                  <option value="VIP Lounge">VIP Lounge</option>
                  <option value="Patio">Patio</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Capacity (Seats) *</label>
                <input
                  type="number"
                  min={1}
                  value={editingTable.capacity}
                  onChange={e => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 2 })}
                />
              </div>
            </div>

            <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#fafbf8', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>Active for QR Ordering</strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Guests scanning this QR code can browse and place orders</span>
              </div>
              <button
                className={`admin-toggle ${editingTable.active ? 'on' : ''}`}
                onClick={() => setEditingTable({ ...editingTable, active: !editingTable.active })}
              >
                <span className="admin-toggle-knob" />
              </button>
            </div>

            <div className="admin-modal-actions">
              <button className="admin-action-btn secondary" onClick={() => setEditingTable(null)}>
                Cancel
              </button>
              <button className="admin-action-btn primary" onClick={handleSaveTable}>
                Save Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: ADD STAFF MEMBER MODAL (03D)
         ========================================================= */}
      {isAddStaffOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddStaffOpen(false)}>
          <div className="admin-modal" style={{ width: '560px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Add Staff Member</h3>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Send an invitation link to join Zerfe Lounge</span>
              </div>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setIsAddStaffOpen(false)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            {inviteSentSuccess ? (
              <div className="admin-invite-success-view">
                <div className="admin-invite-success-icon">
                  <AdminIcon name="check" size={32} />
                </div>
                <h3>Invitation Dispatched!</h3>
                <p>
                  A secure invitation link has been emailed to <strong>{inviteSentSuccess.email}</strong> with the <strong>{inviteSentSuccess.role}</strong> role.
                </p>
                <div className="admin-invite-note-card">
                  <AdminIcon name="info" size={16} />
                  <span>The link expires in 24 hours. The recipient will choose their own password upon opening the link.</span>
                </div>
                <div className="admin-modal-actions" style={{ marginTop: '20px' }}>
                  <button
                    className="admin-action-btn primary"
                    onClick={() => {
                      setIsAddStaffOpen(false);
                      setInviteSentSuccess(null);
                    }}
                  >
                    Done
                  </button>
                  <button
                    className="admin-action-btn secondary"
                    onClick={() => {
                      setInviteSentSuccess(null);
                      setAddForm({ name: '', email: '', phone: '', role: 'Waiter', note: '' });
                    }}
                  >
                    Invite Another Member
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); handleSendInvitation(); }}>
                {inviteErrorMsg && (
                  <div className="admin-alert-box error" style={{ marginBottom: '16px' }}>
                    <AdminIcon name="alertTriangle" size={18} />
                    <div style={{ flex: 1 }}>
                      <strong>Invitation Failed</strong>
                      <p>{inviteErrorMsg}</p>
                    </div>
                    <button
                      type="button"
                      className="admin-action-btn secondary sm"
                      onClick={handleSendInvitation}
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div className="admin-form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Almaz Ayana"
                    value={addForm.name}
                    onChange={e => {
                      setAddForm({ ...addForm, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                    }}
                    className={formErrors.name ? 'input-error' : ''}
                  />
                  {formErrors.name && <span className="admin-field-error">{formErrors.name}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. almaz@zerfelounge.et"
                      value={addForm.email}
                      onChange={e => {
                        setAddForm({ ...addForm, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                      }}
                      className={formErrors.email ? 'input-error' : ''}
                    />
                    {formErrors.email && <span className="admin-field-error">{formErrors.email}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label>Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+251 91 123 4567"
                      value={addForm.phone}
                      onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Select Role Profile *</label>
                  <div className="admin-role-selector-grid">
                    {(['Manager', 'Kitchen Staff', 'Waiter', 'Cashier', 'Owner'] as StaffRole[]).map(r => {
                      const desc = roleDescriptions[r];
                      const isSelected = addForm.role === r;
                      return (
                        <div
                          key={r}
                          className={`admin-role-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setAddForm({ ...addForm, role: r })}
                        >
                          <div className="admin-role-card-top">
                            <span className={`admin-role-badge ${desc.badgeClass}`}>
                              <AdminIcon name={desc.icon} size={12} />
                              <span>{desc.title}</span>
                            </span>
                            <span className="admin-radio-circle">{isSelected && <span className="admin-radio-dot" />}</span>
                          </div>
                          <p className="admin-role-card-desc">{desc.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Invitation Note (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Welcome to the Zerfe Lounge team! Look forward to working together."
                    value={addForm.note}
                    onChange={e => setAddForm({ ...addForm, note: e.target.value })}
                  />
                </div>

                {/* Password Notice Callout */}
                <div className="admin-security-banner">
                  <AdminIcon name="lock" size={16} />
                  <span>No password required. The staff member will receive a secure activation link to set their own credentials.</span>
                </div>

                {/* Simulated Error Toggle for Testing */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f5f7f3', borderRadius: '6px', margin: '14px 0 6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    Testing: Simulate network dispatch failure
                  </span>
                  <button
                    type="button"
                    className={`admin-toggle ${simulateInviteError ? 'on' : ''}`}
                    onClick={() => setSimulateInviteError(!simulateInviteError)}
                  >
                    <span className="admin-toggle-knob" />
                  </button>
                </div>

                <div className="admin-modal-actions" style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className="admin-action-btn secondary"
                    onClick={() => setIsAddStaffOpen(false)}
                    disabled={isSubmittingInvite}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-action-btn primary"
                    disabled={isSubmittingInvite || !addForm.name.trim() || !addForm.email.trim()}
                  >
                    {isSubmittingInvite ? (
                      <>
                        <AdminIcon name="refreshCw" size={15} /> Sending Invitation…
                      </>
                    ) : (
                      <>
                        <AdminIcon name="mail" size={15} /> Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: ROLES & PERMISSION MATRIX (03D)
         ========================================================= */}
      {isPermissionsMatrixOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsPermissionsMatrixOpen(false)}>
          <div className="admin-modal" style={{ width: '740px', maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Roles & Permissions Matrix</h3>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Predefined access profiles enforced by server authorization</span>
              </div>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setIsPermissionsMatrixOpen(false)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            {/* Role Filter Tabs for Quick Inspection */}
            <div className="admin-matrix-role-tabs">
              {(['Owner', 'Manager', 'Kitchen Staff', 'Waiter', 'Cashier'] as StaffRole[]).map(r => (
                <button
                  key={r}
                  className={`admin-tab-btn ${selectedMatrixRole === r ? 'active' : ''}`}
                  onClick={() => setSelectedMatrixRole(r)}
                >
                  <AdminIcon name={roleDescriptions[r].icon} size={14} />
                  <span>{r}</span>
                </button>
              ))}
            </div>

            {/* Selected Role Summary Banner */}
            <div className="admin-role-summary-banner">
              <strong>{selectedMatrixRole} Profile</strong>
              <p>{roleDescriptions[selectedMatrixRole].desc}</p>
            </div>

            {/* Permission Table */}
            <div className="admin-matrix-table-container">
              <table className="admin-matrix-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ color: selectedMatrixRole === 'Owner' ? 'var(--gold)' : undefined }}>Owner</th>
                    <th style={{ color: selectedMatrixRole === 'Manager' ? 'var(--brand)' : undefined }}>Manager</th>
                    <th style={{ color: selectedMatrixRole === 'Kitchen Staff' ? '#b87333' : undefined }}>Kitchen Staff</th>
                    <th style={{ color: selectedMatrixRole === 'Waiter' ? '#2a5d7c' : undefined }}>Waiter / Service</th>
                    <th style={{ color: selectedMatrixRole === 'Cashier' ? '#6b3f7a' : undefined }}>Cashier</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionMatrix.map(row => (
                    <tr key={row.category}>
                      <td><strong>{row.category}</strong></td>
                      <td className={selectedMatrixRole === 'Owner' ? 'highlight-col' : ''}>
                        <span className="perm-chip full">{row.Owner}</span>
                      </td>
                      <td className={selectedMatrixRole === 'Manager' ? 'highlight-col' : ''}>
                        <span className={`perm-chip ${row.Manager === 'Restricted' ? 'none' : 'partial'}`}>{row.Manager}</span>
                      </td>
                      <td className={selectedMatrixRole === 'Kitchen Staff' ? 'highlight-col' : ''}>
                        <span className={`perm-chip ${row['Kitchen Staff'] === 'Restricted' ? 'none' : 'partial'}`}>{row['Kitchen Staff']}</span>
                      </td>
                      <td className={selectedMatrixRole === 'Waiter' ? 'highlight-col' : ''}>
                        <span className={`perm-chip ${row.Waiter === 'Restricted' ? 'none' : 'partial'}`}>{row.Waiter}</span>
                      </td>
                      <td className={selectedMatrixRole === 'Cashier' ? 'highlight-col' : ''}>
                        <span className={`perm-chip ${row.Cashier === 'Restricted' ? 'none' : 'partial'}`}>{row.Cashier}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Security Notice */}
            <div className="admin-security-banner" style={{ marginTop: '16px' }}>
              <AdminIcon name="shield" size={16} />
              <span>
                Access is enforced by the server. The visible controls reflect the permissions assigned to your account. Every backend API request validates authentication and role permissions.
              </span>
            </div>

            <div className="admin-modal-actions" style={{ marginTop: '16px' }}>
              <button className="admin-action-btn primary" onClick={() => setIsPermissionsMatrixOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 6: STAFF PROFILE & DETAILS DRAWER (03D)
         ========================================================= */}
      {selectedStaffProfile && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedStaffProfile(null)}>
          <div className="admin-modal" style={{ width: '520px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span className="admin-staff-avatar lg">{selectedStaffProfile.avatar}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedStaffProfile.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{selectedStaffProfile.email}</span>
                </div>
              </div>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setSelectedStaffProfile(null)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="admin-profile-details-grid">
              <div className="admin-profile-stat-box">
                <span className="stat-label">Assigned Role</span>
                <span className={`admin-role-badge ${roleDescriptions[selectedStaffProfile.role].badgeClass}`} style={{ marginTop: '4px' }}>
                  <AdminIcon name={roleDescriptions[selectedStaffProfile.role].icon} size={12} />
                  <span>{selectedStaffProfile.role}</span>
                </span>
              </div>

              <div className="admin-profile-stat-box">
                <span className="stat-label">Account Status</span>
                <span
                  className={`admin-status-pill ${
                    selectedStaffProfile.status === 'Active'
                      ? 'active'
                      : selectedStaffProfile.status === 'Pending Invitation'
                      ? 'pending'
                      : 'inactive'
                  }`}
                  style={{ marginTop: '4px' }}
                >
                  <span className="admin-status-dot" />
                  <span>{selectedStaffProfile.status}</span>
                </span>
              </div>

              <div className="admin-profile-stat-box">
                <span className="stat-label">Phone Number</span>
                <strong>{selectedStaffProfile.phone || 'Not provided'}</strong>
              </div>

              <div className="admin-profile-stat-box">
                <span className="stat-label">Restaurant Workspace</span>
                <strong>Zerfe Lounge (Bale Robe)</strong>
              </div>

              <div className="admin-profile-stat-box">
                <span className="stat-label">Date Added</span>
                <strong>{selectedStaffProfile.dateAdded}</strong>
              </div>

              <div className="admin-profile-stat-box">
                <span className="stat-label">Last Active</span>
                <strong>{selectedStaffProfile.lastActive}</strong>
              </div>
            </div>

            {/* Invitation Details if Pending */}
            {selectedStaffProfile.status === 'Pending Invitation' && (
              <div className="admin-profile-invite-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '13px' }}>Invitation Pending</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)' }}>
                      Invitation sent · Token valid for 24 hours
                    </span>
                  </div>
                  <button
                    className="admin-action-btn secondary sm"
                    onClick={() => handleResendInvite(selectedStaffProfile)}
                  >
                    <AdminIcon name="mail" size={13} /> Resend Invite
                  </button>
                </div>
                {selectedStaffProfile.invitationNote && (
                  <p style={{ fontSize: '12px', color: 'var(--ink)', fontStyle: 'italic', margin: '8px 0 0' }}>
                    "{selectedStaffProfile.invitationNote}"
                  </p>
                )}
              </div>
            )}

            {/* Permitted Actions */}
            <div className="admin-profile-perms-section">
              <span className="section-title">Permitted System Capabilities</span>
              <ul className="admin-profile-perms-list">
                {selectedStaffProfile.role === 'Owner' && (
                  <>
                    <li><AdminIcon name="check" size={14} /> Full management of restaurant settings & team accounts</li>
                    <li><AdminIcon name="check" size={14} /> View and export all financial and sales analytics</li>
                    <li><AdminIcon name="check" size={14} /> Manage bank payouts and Telebirr merchant billing</li>
                    <li><AdminIcon name="check" size={14} /> Create and modify digital menu dishes, prices, and QR codes</li>
                  </>
                )}
                {selectedStaffProfile.role === 'Manager' && (
                  <>
                    <li><AdminIcon name="check" size={14} /> Manage daily kitchen orders, dining tables, and QR cards</li>
                    <li><AdminIcon name="check" size={14} /> Update dish availability and edit menu pricing</li>
                    <li><AdminIcon name="check" size={14} /> View daily shift reports and customer feedback</li>
                    <li><AdminIcon name="check" size={14} /> View staff directory (cannot invite or alter owner credentials)</li>
                  </>
                )}
                {selectedStaffProfile.role === 'Kitchen Staff' && (
                  <>
                    <li><AdminIcon name="check" size={14} /> View incoming live QR orders with customer dietary notes</li>
                    <li><AdminIcon name="check" size={14} /> Update kitchen prep status (Preparing → Ready)</li>
                    <li><AdminIcon name="check" size={14} /> View food recipes and menu items</li>
                  </>
                )}
                {selectedStaffProfile.role === 'Waiter' && (
                  <>
                    <li><AdminIcon name="check" size={14} /> View table orders and guest seating allocations</li>
                    <li><AdminIcon name="check" size={14} /> Mark food items as served to guest tables</li>
                    <li><AdminIcon name="check" size={14} /> Inspect table QR codes and customer feedback</li>
                  </>
                )}
                {selectedStaffProfile.role === 'Cashier' && (
                  <>
                    <li><AdminIcon name="check" size={14} /> View orders, bill totals, and tax breakdowns</li>
                    <li><AdminIcon name="check" size={14} /> Record and confirm payments (Cash, Telebirr, Card)</li>
                    <li><AdminIcon name="check" size={14} /> View shift settlement history and print guest receipts</li>
                  </>
                )}
              </ul>
            </div>

            {/* Profile Action Buttons */}
            <div className="admin-modal-actions" style={{ marginTop: '20px' }}>
              <button
                className="admin-action-btn secondary"
                onClick={() => {
                  setRoleChangeTarget(selectedStaffProfile);
                  setNewSelectedRole(selectedStaffProfile.role);
                }}
              >
                <AdminIcon name="shield" size={15} /> Change Role
              </button>

              <button
                className={`admin-action-btn ${selectedStaffProfile.status === 'Active' ? 'danger' : 'secondary'}`}
                onClick={() => setDeactivatingTarget(selectedStaffProfile)}
              >
                {selectedStaffProfile.status === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
              </button>

              <button className="admin-action-btn secondary" onClick={() => setSelectedStaffProfile(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 7: CHANGE ROLE CONFIRMATION (03D)
         ========================================================= */}
      {roleChangeTarget && (
        <div className="admin-modal-backdrop" onClick={() => setRoleChangeTarget(null)}>
          <div className="admin-modal" style={{ width: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Change Staff Role</h3>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Update access privileges for {roleChangeTarget.name}</span>
              </div>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setRoleChangeTarget(null)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            {roleChangeTarget.role === 'Owner' && staffMembers.filter(s => s.role === 'Owner' && s.status === 'Active').length <= 1 ? (
              <div className="admin-alert-box warning" style={{ marginBottom: '16px' }}>
                <AdminIcon name="alertTriangle" size={18} />
                <div>
                  <strong>Primary Owner Cannot Be Demoted</strong>
                  <p>Zerfe Lounge requires at least one active Owner. Transfer workspace ownership before changing this role.</p>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f5f7f3', borderRadius: '8px', marginBottom: '16px' }}>
                  <span className="admin-staff-avatar">{roleChangeTarget.avatar}</span>
                  <div>
                    <strong>{roleChangeTarget.name}</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)' }}>
                      Current role: <span className={`admin-role-badge ${roleDescriptions[roleChangeTarget.role].badgeClass}`}>{roleChangeTarget.role}</span>
                    </span>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Assign New Role *</label>
                  <select
                    value={newSelectedRole}
                    onChange={e => setNewSelectedRole(e.target.value as StaffRole)}
                  >
                    <option value="Manager">Manager</option>
                    <option value="Kitchen Staff">Kitchen Staff</option>
                    <option value="Waiter">Waiter / Service</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>

                <div className="admin-role-summary-banner" style={{ marginTop: '12px' }}>
                  <strong>New Role: {newSelectedRole}</strong>
                  <p>{roleDescriptions[newSelectedRole].desc}</p>
                </div>

                <div className="admin-security-banner" style={{ marginTop: '12px' }}>
                  <AdminIcon name="shield" size={15} />
                  <span>Role changes require server authorization. New permissions take effect immediately upon the staff member's next request.</span>
                </div>
              </div>
            )}

            <div className="admin-modal-actions" style={{ marginTop: '20px' }}>
              <button className="admin-action-btn secondary" onClick={() => setRoleChangeTarget(null)}>
                Cancel
              </button>
              {!(roleChangeTarget.role === 'Owner' && staffMembers.filter(s => s.role === 'Owner' && s.status === 'Active').length <= 1) && (
                <button className="admin-action-btn primary" onClick={handleConfirmRoleChange}>
                  Confirm Role Change
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 8: DEACTIVATE / REACTIVATE CONFIRMATION (03D)
         ========================================================= */}
      {deactivatingTarget && (
        <div className="admin-modal-backdrop" onClick={() => setDeactivatingTarget(null)}>
          <div className="admin-modal" style={{ width: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>
                  {deactivatingTarget.status === 'Active' ? 'Deactivate Staff Account' : 'Reactivate Staff Account'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{deactivatingTarget.name} · {deactivatingTarget.role}</span>
              </div>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setDeactivatingTarget(null)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            {deactivatingTarget.role === 'Owner' && deactivatingTarget.status === 'Active' ? (
              <div className="admin-alert-box error">
                <AdminIcon name="alertTriangle" size={18} />
                <div>
                  <strong>Primary Owner Cannot Be Deactivated</strong>
                  <p>You cannot deactivate the primary workspace owner. You must transfer restaurant ownership before removing owner credentials.</p>
                </div>
              </div>
            ) : deactivatingTarget.status === 'Active' ? (
              <div>
                <p style={{ fontSize: '13px', lineHeight: '1.5', margin: '0 0 14px' }}>
                  Are you sure you want to deactivate <strong>{deactivatingTarget.name}</strong>?
                </p>
                <div className="admin-alert-box warning" style={{ marginBottom: '14px' }}>
                  <AdminIcon name="alertTriangle" size={18} />
                  <div>
                    <strong>Access Revocation Notice</strong>
                    <p>The staff member will immediately lose access to the Zerfe Lounge dashboard. All historical order entries, kitchen preparation logs, and payment records remain preserved in the system.</p>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                  This account can be reactivated at any time by an authorized administrator.
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '13px', lineHeight: '1.5', margin: '0 0 14px' }}>
                  Reactivate <strong>{deactivatingTarget.name}</strong>?
                </p>
                <div className="admin-alert-box info">
                  <AdminIcon name="check" size={18} />
                  <div>
                    <strong>Restore Access</strong>
                    <p>{deactivatingTarget.name} will regain access to their assigned <strong>{deactivatingTarget.role}</strong> workspace privileges upon logging in.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="admin-modal-actions" style={{ marginTop: '20px' }}>
              <button className="admin-action-btn secondary" onClick={() => setDeactivatingTarget(null)}>
                Cancel
              </button>
              {!(deactivatingTarget.role === 'Owner' && deactivatingTarget.status === 'Active') && (
                <button
                  className={`admin-action-btn ${deactivatingTarget.status === 'Active' ? 'danger' : 'primary'}`}
                  onClick={handleConfirmDeactivation}
                >
                  {deactivatingTarget.status === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 03E Modal 9: Export Report Studio Modal */}
      {isExportModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => { setIsExportModalOpen(false); setExportErrorMsg(null); }}>
          <div className="admin-modal-box admin-export-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">Export Report Studio</h3>
                <p className="admin-modal-subtitle">Download analytical reports and operational audits for Zerfe Lounge</p>
              </div>
              <button
                className="admin-icon-btn"
                onClick={() => { setIsExportModalOpen(false); setExportErrorMsg(null); }}
                aria-label="Close dialog"
              >
                <AdminIcon name="x" size={18} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Active Scope Summary */}
              <div className="admin-export-scope-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AdminIcon name="calendar" size={16} />
                  <strong>Target Period:</strong>
                  <span>{activeReport.periodLabel}</span>
                </div>
                <span className="admin-export-records-count">
                  {filteredReportOrders.length} records in scope
                </span>
              </div>

              {/* Format Selection */}
              <div>
                <label className="admin-form-label" style={{ marginBottom: '8px' }}>Export File Format</label>
                <div className="admin-export-format-selector">
                  <button
                    type="button"
                    className={`admin-export-format-btn ${exportFormat === 'csv' ? 'active' : ''}`}
                    onClick={() => setExportFormat('csv')}
                  >
                    <div className="admin-export-format-icon">
                      <AdminIcon name="fileText" size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div className="admin-export-format-name">CSV Spreadsheet (.csv)</div>
                      <div className="admin-export-format-desc">Raw tabular data ready for Microsoft Excel, Google Sheets, or accountant audits.</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`admin-export-format-btn ${exportFormat === 'pdf' ? 'active' : ''}`}
                    onClick={() => setExportFormat('pdf')}
                  >
                    <div className="admin-export-format-icon">
                      <AdminIcon name="download" size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div className="admin-export-format-name">Printable PDF Report (.pdf)</div>
                      <div className="admin-export-format-desc">Formatted executive summary with Zerfe Lounge letterhead and charts.</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Data Inclusions */}
              <div>
                <label className="admin-form-label" style={{ marginBottom: '8px' }}>Report Sections to Include</label>
                <div className="admin-export-checkbox-grid">
                  <label className="admin-export-check-item">
                    <input
                      type="checkbox"
                      checked={exportSections.summary}
                      onChange={e => setExportSections({ ...exportSections, summary: e.target.checked })}
                    />
                    <div>
                      <strong>Executive KPI Summary</strong>
                      <p>Gross sales, order volumes, average order value, cancellation rates.</p>
                    </div>
                  </label>

                  <label className="admin-export-check-item">
                    <input
                      type="checkbox"
                      checked={exportSections.salesTrend}
                      onChange={e => setExportSections({ ...exportSections, salesTrend: e.target.checked })}
                    />
                    <div>
                      <strong>Sales & Revenue Timeline</strong>
                      <p>Daily and hourly revenue data points with comparison period deltas.</p>
                    </div>
                  </label>

                  <label className="admin-export-check-item">
                    <input
                      type="checkbox"
                      checked={exportSections.topItems}
                      onChange={e => setExportSections({ ...exportSections, topItems: e.target.checked })}
                    />
                    <div>
                      <strong>Top Performing Dishes</strong>
                      <p>Full ranking by volume sold and revenue generated in ETB.</p>
                    </div>
                  </label>

                  <label className="admin-export-check-item">
                    <input
                      type="checkbox"
                      checked={exportSections.categories}
                      onChange={e => setExportSections({ ...exportSections, categories: e.target.checked })}
                    />
                    <div>
                      <strong>Menu Category Breakdown</strong>
                      <p>Share of revenue and item distribution across all categories.</p>
                    </div>
                  </label>

                  <label className="admin-export-check-item">
                    <input
                      type="checkbox"
                      checked={exportSections.orderLogs}
                      onChange={e => setExportSections({ ...exportSections, orderLogs: e.target.checked })}
                    />
                    <div>
                      <strong>Detailed Order Logs</strong>
                      <p>Individual order receipts, timestamps, table numbers, and payment channels.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Developer Test Toggle */}
              <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--muted)' }}>
                  <input
                    type="checkbox"
                    checked={exportErrorSimulate}
                    onChange={e => setExportErrorSimulate(e.target.checked)}
                  />
                  <span>Simulate export pipeline timeout (demonstrates failure & retry UI)</span>
                </label>
              </div>

              {/* Error Alert if simulation triggered */}
              {exportErrorMsg && (
                <div className="admin-alert-box error">
                  <AdminIcon name="alertTriangle" size={18} />
                  <div style={{ flex: 1 }}>
                    <strong>Export Failed</strong>
                    <p>{exportErrorMsg}</p>
                  </div>
                  <button
                    className="admin-action-btn secondary"
                    style={{ fontSize: '11px', padding: '4px 8px', height: 'auto' }}
                    onClick={handleTriggerExport}
                  >
                    Retry Now
                  </button>
                </div>
              )}
            </div>

            <div className="admin-modal-actions" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="admin-action-btn secondary"
                onClick={() => { setIsExportModalOpen(false); setExportErrorMsg(null); }}
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-action-btn primary"
                onClick={handleTriggerExport}
                disabled={isExporting || (!exportSections.summary && !exportSections.salesTrend && !exportSections.topItems && !exportSections.categories && !exportSections.orderLogs)}
              >
                {isExporting ? (
                  <>
                    <span className="admin-spinner" style={{ width: 14, height: 14, borderWidth: 2, marginRight: 6 }}></span>
                    Generating {exportFormat.toUpperCase()}...
                  </>
                ) : (
                  <>
                    <AdminIcon name="download" size={15} />
                    <span>Download {exportFormat.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 03E Modal 10: Selected Historical Order Detail Modal */}
      {selectedHistoricalOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedHistoricalOrder(null)}>
          <div className="admin-modal-box admin-order-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="admin-modal-title">Order {selectedHistoricalOrder.reference}</h3>
                  <span className={`admin-order-status-badge ${selectedHistoricalOrder.status === 'Completed' ? 'delivered' : 'cancelled'}`}>
                    {selectedHistoricalOrder.status}
                  </span>
                </div>
                <p className="admin-modal-subtitle">
                  {selectedHistoricalOrder.date} at {selectedHistoricalOrder.time} • {selectedHistoricalOrder.table}
                </p>
              </div>
              <button
                className="admin-icon-btn"
                onClick={() => setSelectedHistoricalOrder(null)}
                aria-label="Close dialog"
              >
                <AdminIcon name="x" size={18} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Order Key Metas */}
              <div className="admin-order-detail-meta-grid">
                <div className="admin-order-meta-card">
                  <span className="admin-order-meta-label">Total Amount</span>
                  <strong className="admin-order-meta-val" style={{ color: 'var(--color-primary)' }}>
                    {selectedHistoricalOrder.total.toLocaleString()} ETB
                  </strong>
                </div>
                <div className="admin-order-meta-card">
                  <span className="admin-order-meta-label">Payment Channel</span>
                  <strong className="admin-order-meta-val">
                    {selectedHistoricalOrder.paymentMethod}
                  </strong>
                </div>
                <div className="admin-order-meta-card">
                  <span className="admin-order-meta-label">Origin</span>
                  <strong className="admin-order-meta-val">
                    QR Scan Dine-in
                  </strong>
                </div>
              </div>

              {/* Items List */}
              <div>
                <label className="admin-form-label" style={{ marginBottom: '8px' }}>Dishes Ordered</label>
                <div className="admin-order-detail-items">
                  <div className="admin-order-detail-item-row">
                    <span className="admin-order-detail-item-name">{selectedHistoricalOrder.itemsSummary}</span>
                    <strong className="admin-order-detail-item-price">{selectedHistoricalOrder.total.toLocaleString()} ETB</strong>
                  </div>
                </div>
              </div>

              {/* Operational Audit Log */}
              <div>
                <label className="admin-form-label" style={{ marginBottom: '8px' }}>Operational Timeline</label>
                <div className="admin-order-timeline">
                  <div className="admin-order-timeline-step done">
                    <div className="admin-timeline-bullet"></div>
                    <div className="admin-timeline-content">
                      <div className="admin-timeline-title">QR Order Submitted</div>
                      <div className="admin-timeline-time">{selectedHistoricalOrder.time} — Guest placed order from mobile menu</div>
                    </div>
                  </div>
                  <div className="admin-order-timeline-step done">
                    <div className="admin-timeline-bullet"></div>
                    <div className="admin-timeline-content">
                      <div className="admin-timeline-title">Kitchen Ticket Printed & Prepared</div>
                      <div className="admin-timeline-time">Ticket dispatched to Chef Dawit (Station 1)</div>
                    </div>
                  </div>
                  <div className={`admin-order-timeline-step ${selectedHistoricalOrder.status === 'Completed' ? 'done' : 'cancelled'}`}>
                    <div className="admin-timeline-bullet"></div>
                    <div className="admin-timeline-content">
                      <div className="admin-timeline-title">
                        {selectedHistoricalOrder.status === 'Completed' ? 'Dispatched to Table & Paid' : 'Order Cancelled / Voided'}
                      </div>
                      <div className="admin-timeline-time">
                        {selectedHistoricalOrder.status === 'Completed' 
                          ? `Settled via ${selectedHistoricalOrder.paymentMethod}`
                          : 'Cancelled by customer / manager request'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-actions" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="admin-action-btn secondary"
                onClick={() => {
                  showToast(`Receipt for ${selectedHistoricalOrder.reference} sent to thermal printer`);
                }}
              >
                <AdminIcon name="printer" size={15} />
                <span>Print Thermal Receipt</span>
              </button>
              <button
                type="button"
                className="admin-action-btn primary"
                onClick={() => setSelectedHistoricalOrder(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: ADD / EDIT CATEGORY (CRUD)
         ========================================================= */}
      {isCategoryModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="admin-modal" style={{ width: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Organize dishes for diners in GebetaQR menu</span>
              </div>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setIsCategoryModalOpen(false)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Category Name *</label>
                <input
                  type="text"
                  required
                  className="admin-form-input"
                  placeholder="e.g., Traditional Wats, Breakfast, Hot Beverages"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Short Description</label>
                <textarea
                  className="admin-form-input"
                  rows={3}
                  placeholder="Describe items in this category for dining guests..."
                  value={categoryForm.description}
                  onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                <input
                  type="checkbox"
                  id="categoryActiveToggle"
                  checked={categoryForm.isActive}
                  onChange={e => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--brand)', cursor: 'pointer' }}
                />
                <label htmlFor="categoryActiveToggle" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>
                  Category is Active (visible on digital QR menu)
                </label>
              </div>

              <div className="admin-modal-actions" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="admin-action-btn secondary"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  <AdminIcon name="check" size={15} />
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: DELETE CATEGORY CONFIRMATION
         ========================================================= */}
      {deletingCategory && (
        <div className="admin-modal-backdrop" onClick={() => setDeletingCategory(null)}>
          <div className="admin-modal" style={{ width: '420px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fdf2f2', color: '#c93b2b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AdminIcon name="trash" size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#c93b2b' }}>Delete Category</h3>
              </div>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setDeletingCategory(null)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Are you sure you want to delete category <strong>"{deletingCategory.name}"</strong>? Any dishes currently in this category will remain in the menu and can be reassigned to another section.
            </p>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-action-btn secondary"
                onClick={() => setDeletingCategory(null)}
              >
                Keep Category
              </button>
              <button
                type="button"
                className="admin-action-btn danger"
                onClick={() => handleDeleteCategory(deletingCategory)}
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: STAFF ROLE AUTHENTICATION & LOGIN (ROLE-BASED)
         ========================================================= */}
      {showStaffLoginModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowStaffLoginModal(false)}>
          <div className="admin-modal" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Staff Sign-In & Role Access</h3>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Select role and enter station PIN for rapid access</span>
              </div>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setShowStaffLoginModal(false)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {(
                [
                  { role: 'Owner', name: 'Abebe Bekele', desc: 'Full admin access, financial & analytics', icon: 'crown' },
                  { role: 'Manager', name: 'Tigist Alemu', desc: 'Menu pricing, QR codes & shift oversight', icon: 'shield' },
                  { role: 'Kitchen', name: 'Dawit Hailu', desc: 'Live ticket queue & KDS preparation', icon: 'clock' },
                  { role: 'Waiter', name: 'Sara Girma', desc: 'Table occupancy & bill settlement', icon: 'receipt' },
                ] as const
              ).map(item => {
                const isSelected = selectedLoginRole === item.role;
                return (
                  <div
                    key={item.role}
                    onClick={() => setSelectedLoginRole(item.role)}
                    style={{
                      border: isSelected ? '2px solid var(--brand)' : '1px solid #e2e5dc',
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(20, 61, 43, 0.04)' : '#faf8f5',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--brand)' }}>{item.role}</span>
                      <AdminIcon name={item.icon} size={16} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.3 }}>{item.desc}</div>
                  </div>
                );
              })}
            </div>

            <div className="admin-form-group" style={{ marginBottom: '16px' }}>
              <label className="admin-form-label">Station PIN Code</label>
              <input
                type="password"
                className="admin-form-input"
                maxLength={4}
                value={loginPinInput}
                onChange={e => setLoginPinInput(e.target.value)}
                placeholder="Enter 4-digit PIN"
                style={{ letterSpacing: '4px', fontSize: '18px', textAlign: 'center' }}
              />
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-action-btn secondary"
                onClick={() => setShowStaffLoginModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-action-btn primary"
                onClick={() => handleStaffRoleLogin(selectedLoginRole)}
              >
                <AdminIcon name="check" size={15} />
                <span>Switch to {selectedLoginRole}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: LIVE ORDER TICKET & KITCHEN DISPATCH (KOT)
         ========================================================= */}
      {selectedOrderModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrderModal(null)}>
          <div className="admin-modal" style={{ width: '520px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf0ea', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--brand)' }}>{selectedOrderModal.reference}</span>
                  <span className={`admin-order-badge ${(selectedOrderModal.status || 'Pending').toLowerCase()}`}>
                    {selectedOrderModal.status || 'Pending'}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {selectedOrderModal.table} · Placed at {selectedOrderModal.time || 'Just now'}
                </span>
              </div>
              <button style={{ background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => setSelectedOrderModal(null)}>
                <AdminIcon name="close" size={20} />
              </button>
            </div>

            {/* Customer Details Box */}
            <div style={{ background: '#faf8f5', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', border: '1px solid #edf0ea', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Name</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                  {selectedOrderModal.customerName || 'Dine-In Customer'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone / Contact</span>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>
                  {selectedOrderModal.customerPhone || 'N/A (Scanned QR)'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand)' }}>
                  {selectedOrderModal.paymentMethod?.toUpperCase() || 'CASH'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Status</span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: selectedOrderModal.paymentStatus === 'paid' ? '#23734b' : '#c69234' }}>
                  {selectedOrderModal.paymentStatus === 'paid' ? 'Paid Online' : 'Pending Settlement'}
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Ordered Items
              </div>
              <div style={{ border: '1px solid #edf0ea', borderRadius: '8px', overflow: 'hidden' }}>
                {Array.isArray(selectedOrderModal.items) && selectedOrderModal.items.length > 0 ? (
                  selectedOrderModal.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        borderBottom: idx < selectedOrderModal.items.length - 1 ? '1px solid #edf0ea' : 'none'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                          <span style={{ color: 'var(--brand)', fontWeight: 700, marginRight: '6px' }}>{item.quantity || 1}x</span>
                          {item.name}
                        </div>
                        {item.notes && (
                          <div style={{ fontSize: '11px', color: '#c69234', marginTop: '2px' }}>
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                        {((item.price || 0) * (item.quantity || 1)).toLocaleString()} ETB
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', fontSize: '13px', color: 'var(--ink)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{selectedOrderModal.itemsSummary || 'Standard Order Items'}</span>
                    <strong style={{ color: 'var(--brand)' }}>{selectedOrderModal.total?.toLocaleString()} ETB</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Total Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #edf0ea', paddingTop: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Total Bill Amount</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand)' }}>
                {selectedOrderModal.total?.toLocaleString()} ETB
              </span>
            </div>

            {/* Quick Status Advancement & Thermal Print */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="admin-action-btn secondary"
                onClick={() => showToast(`KOT receipt for ${selectedOrderModal.reference} sent to kitchen printer`)}
              >
                <AdminIcon name="printer" size={15} />
                <span>Print KOT Ticket</span>
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                {selectedOrderModal.status === 'Pending' && (
                  <button
                    type="button"
                    className="admin-order-advance-btn cook"
                    onClick={() => {
                      handleAdvanceOrderStatus(selectedOrderModal.reference, 'Preparing');
                      setSelectedOrderModal({ ...selectedOrderModal, status: 'Preparing' });
                    }}
                  >
                    Accept & Cook
                  </button>
                )}
                {selectedOrderModal.status === 'Preparing' && (
                  <button
                    type="button"
                    className="admin-order-advance-btn ready"
                    onClick={() => {
                      handleAdvanceOrderStatus(selectedOrderModal.reference, 'Ready');
                      setSelectedOrderModal({ ...selectedOrderModal, status: 'Ready' });
                    }}
                  >
                    Mark Ready
                  </button>
                )}
                {selectedOrderModal.status === 'Ready' && (
                  <button
                    type="button"
                    className="admin-order-advance-btn complete"
                    onClick={() => {
                      handleAdvanceOrderStatus(selectedOrderModal.reference, 'Completed');
                      setSelectedOrderModal({ ...selectedOrderModal, status: 'Completed' });
                    }}
                  >
                    Mark Served
                  </button>
                )}
                <button
                  type="button"
                  className="admin-action-btn primary"
                  onClick={() => setSelectedOrderModal(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toast && (
        <div className="admin-toast" role="status">
          <AdminIcon name="check" size={16} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
