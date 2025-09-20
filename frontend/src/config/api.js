// API configuration constants
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_TOKEN: '/auth/verify',
    PROFILE: '/auth/profile',
  },
  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
  // Products
  PRODUCTS: {
    BASE: '/products',
    SEARCH: '/products/search',
  },
  // Manufacturing Orders
  MANUFACTURING_ORDERS: {
    BASE: '/manufacturing-orders',
    BY_ID: (id) => `/manufacturing-orders/${id}`,
    UPDATE_STATUS: (id) => `/manufacturing-orders/${id}/status`,
    ASSIGN: (id) => `/manufacturing-orders/${id}/assign`,
  },
  // Work Centers
  WORK_CENTERS: {
    BASE: '/work-centers',
    BY_ID: (id) => `/work-centers/${id}`,
    AVAILABILITY: (id) => `/work-centers/${id}/availability`,
  },
  // Work Orders
  WORK_ORDERS: {
    BASE: '/work-orders',
    BY_ID: (id) => `/work-orders/${id}`,
    UPDATE_STATUS: (id) => `/work-orders/${id}/status`,
  },
  // BOM
  BOM: {
    BASE: '/bom',
    BY_ID: (id) => `/bom/${id}`,
    BY_PRODUCT: (productId) => `/bom/product/${productId}`,
  },
  // Stock
  STOCK: {
    BASE: '/stock',
    MOVEMENTS: '/stock/movements',
    INVENTORY: '/stock/inventory',
    BY_PRODUCT: (productId) => `/stock/product/${productId}`,
  },
};

export default API_CONFIG;