const API_URL = '/api';

const getToken = () => localStorage.getItem('admin_token');

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

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

// Auth
export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

// Products
export const getProducts = () => request('/products');
export const createProduct = (data) =>
  request('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateProduct = (id, data) =>
  request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
export const deleteProduct = (id) =>
  request(`/products/${id}`, {
    method: 'DELETE',
  });

// Reviews
export const getReviewQueue = () => request('/review/queue');
export const getAllReviews = () => request('/review/all');
export const approveReview = (id, pointsValue, adminNotes) =>
  request(`/review/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ pointsValue, adminNotes }),
  });
export const rejectReview = (id, adminNotes) =>
  request(`/review/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ adminNotes }),
  });

// Stores
export const getStores = () => request('/stores');
export const createStore = (data) =>
  request('/stores', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Analytics
export const getDashboardStats = () => request('/admin/stats');
export const getStoreStats = () => request('/admin/stats/stores');
export const getProductStats = () => request('/admin/stats/products');
export const getUserStats = () => request('/admin/stats/users');
export const getUnknownProductStats = () => request('/admin/stats/unknown-products');

// Points
export const addPoints = (userId, points) =>
  request('/points/add', {
    method: 'POST',
    body: JSON.stringify({ userId, points }),
  });
export const usePoints = (userId, points) =>
  request('/points/use', {
    method: 'POST',
    body: JSON.stringify({ userId, points }),
  });
