// GebetaQR Unified API Client
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export interface ApiCategory {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  dishCount?: number;
}

export interface ApiMenuItem {
  _id?: string;
  id?: number | string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tag?: string;
  isCustomizable?: boolean;
  isAvailable?: boolean;
  prepTime?: string;
  displayOrder?: number;
}

export interface ApiTable {
  _id?: string;
  number: string;
  area: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
  isActive: boolean;
  activeOrderRef?: string | null;
}

export interface ApiOrderLine {
  key?: string;
  dishId?: string;
  name: string;
  portion?: string;
  extras?: string[];
  instructions?: string;
  unitPrice: number;
  quantity: number;
  dish?: any;
}

export interface ApiOrder {
  _id?: string;
  reference: string;
  customerName: string;
  customerPhone?: string;
  table: string;
  lines: ApiOrderLine[];
  orderNotes?: string;
  subtotal: number;
  total: number;
  status: 'New' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  paymentMethod: 'Telebirr' | 'CBE Birr' | 'Chapa' | 'Cash' | 'Card';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  chapaTxRef?: string;
  placedAt: string;
}

export interface ApiStaff {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Owner' | 'Manager' | 'Kitchen' | 'Waiter';
  status: 'Active' | 'Inactive' | 'Invited';
  lastLogin?: string;
}

export const api = {
  // Categories CRUD
  async getCategories(): Promise<ApiCategory[]> {
    const res = await fetch(`${API_BASE}/categories`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async createCategory(cat: Partial<ApiCategory>): Promise<ApiCategory> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create category');
    return json.data;
  },

  async updateCategory(id: string, cat: Partial<ApiCategory>): Promise<ApiCategory> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update category');
    return json.data;
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete category');
  },

  // Menu Items
  async getMenuItems(category?: string): Promise<ApiMenuItem[]> {
    const url = category && category !== 'All Items'
      ? `${API_BASE}/menu?category=${encodeURIComponent(category)}`
      : `${API_BASE}/menu`;
    const res = await fetch(url);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async toggleItemAvailability(id: string): Promise<ApiMenuItem> {
    const res = await fetch(`${API_BASE}/menu/${id}/toggle`, { method: 'PATCH' });
    const json = await res.json();
    return json.data;
  },

  // Tables
  async getTables(): Promise<ApiTable[]> {
    const res = await fetch(`${API_BASE}/tables`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async updateTableStatus(id: string, status: string): Promise<ApiTable> {
    const res = await fetch(`${API_BASE}/tables/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    return json.data;
  },

  // Orders
  async getOrders(status?: string): Promise<ApiOrder[]> {
    const url = status && status !== 'all' ? `${API_BASE}/orders?status=${status}` : `${API_BASE}/orders`;
    const res = await fetch(url);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getOrderByRef(ref: string): Promise<ApiOrder | null> {
    const res = await fetch(`${API_BASE}/orders/${ref}`);
    const json = await res.json();
    return json.success ? json.data : null;
  },

  async checkoutOrder(orderData: {
    customerName: string;
    customerPhone?: string;
    table?: string;
    lines: any[];
    orderNotes?: string;
    paymentMethod: string;
    chapaTxRef?: string;
  }): Promise<ApiOrder> {
    const res = await fetch(`${API_BASE}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to place order');
    return json.data;
  },

  async updateOrderStatus(id: string, status: string): Promise<ApiOrder> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update order status');
    return json.data;
  },

  // Staff & Auth
  async loginStaff(credentials: { email?: string; username?: string; role?: string; pin: string } | string, pin?: string): Promise<ApiStaff> {
    const body = typeof credentials === 'string'
      ? { role: credentials, pin }
      : credentials;
    const res = await fetch(`${API_BASE}/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Staff authentication failed');
    return json.data;
  },

  async getStaff(): Promise<ApiStaff[]> {
    const res = await fetch(`${API_BASE}/staff`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  // Settings
  async getSettings(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`);
    const json = await res.json();
    return json.success ? json.data : {};
  },

  async updateSettings(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  },

  // Chapa Payments
  async initializeChapaPayment(params: {
    amount: number;
    customerName: string;
    customerPhone?: string;
    email?: string;
    txRef?: string;
    orderReference: string;
    returnUrl?: string;
  }): Promise<{ checkout_url: string; tx_ref: string; amount: number }> {
    const res = await fetch(`${API_BASE}/payments/chapa/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const json = await res.json();
    if (!json.success || !json.data?.checkout_url) {
      throw new Error(json.error || 'Failed to initialize Chapa payment');
    }
    return json.data;
  },

  async verifyChapaPayment(txRef: string): Promise<any> {
    const res = await fetch(`${API_BASE}/payments/chapa/verify/${txRef}`);
    const json = await res.json();
    return json;
  }
};

