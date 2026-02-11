const API_URL = '/api';

const getToken = () => localStorage.getItem('token');

class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, config);
  } catch (err) {
    throw new ApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Invalid response from server', response.status, 'PARSE_ERROR');
  }

  if (!response.ok) {
    // Auto-logout on 401
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new ApiError('Session expired. Please log in again.', 401, 'AUTH_EXPIRED');
    }

    const message = data.error || 'Request failed';
    throw new ApiError(message, response.status, data.code, data.details);
  }

  return data;
};

// Auth
export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (email, name, password) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  });

// User
export const getProfile = () => request('/user/profile');
export const updateProfile = (name) =>
  request('/user/profile', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });

// Points
export const getBalance = () => request('/points/get');
export const getHistory = () => request('/points/history');

// Receipt
export const scanReceipt = (qrData) =>
  request('/receipt/scan', {
    method: 'POST',
    body: JSON.stringify({ qrData }),
  });

// Products
export const getProducts = () => request('/products');

// Stores
export const getStores = () => request('/stores');
export const getFavorites = () => request('/stores/favorites');
export const addFavorite = (storeId) =>
  request('/stores/favorites', {
    method: 'POST',
    body: JSON.stringify({ storeId }),
  });
export const removeFavorite = (storeId) =>
  request(`/stores/favorites/${storeId}`, {
    method: 'DELETE',
  });

// Reviews
export const submitReview = (productName, productIdentifier) =>
  request('/review/request', {
    method: 'POST',
    body: JSON.stringify({ productName, productIdentifier }),
  });

// Notifications
export const getNotifications = (page = 1) => request(`/notifications?page=${page}`);
export const getUnreadCount = () => request('/notifications/unread-count');
export const markNotificationRead = (id) =>
  request(`/notifications/${id}/read`, { method: 'PUT' });
export const markAllNotificationsRead = () =>
  request('/notifications/read-all', { method: 'PUT' });

// Push
export const getVapidKey = () => request('/push/vapid-key');
export const subscribePush = (subscription) =>
  request('/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
  });
export const unsubscribePush = (endpoint) =>
  request('/push/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ endpoint }),
  });
