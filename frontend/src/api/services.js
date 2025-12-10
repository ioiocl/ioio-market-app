import apiClient from './client';

// Auth Services
export const authService = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
};

// Product Services
export const productService = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (productData) => apiClient.post('/products', productData),
  update: (id, productData) => apiClient.put(`/products/${id}`, productData),
  delete: (id) => apiClient.delete(`/products/${id}`),
};

// Category Services
export const categoryService = {
  getAll: () => apiClient.get('/categories'),
  getById: (id) => apiClient.get(`/categories/${id}`),
  create: (categoryData) => apiClient.post('/categories', categoryData),
  update: (id, categoryData) => apiClient.put(`/categories/${id}`, categoryData),
  delete: (id) => apiClient.delete(`/categories/${id}`),
};

// Cart Services
export const cartService = {
  get: () => apiClient.get('/cart'),
  addItem: (productId, quantity) => apiClient.post('/cart/items', { productId, quantity }),
  updateQuantity: (id, quantity) => apiClient.put(`/cart/items/${id}`, { quantity }),
  removeItem: (id) => apiClient.delete(`/cart/items/${id}`),
  clear: () => apiClient.delete('/cart'),
};

// Order Services
export const orderService = {
  create: (orderData) => apiClient.post('/orders', orderData),
  getMyOrders: () => apiClient.get('/orders/my'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  getAll: (params) => apiClient.get('/orders', { params }),
  updateStatus: (id, status) => apiClient.patch(`/orders/${id}/status`, { status }),
};

// Banner Services
export const bannerService = {
  getAll: (params) => apiClient.get('/banners', { params }),
  create: (bannerData) => apiClient.post('/banners', bannerData),
  update: (id, bannerData) => apiClient.put(`/banners/${id}`, bannerData),
  delete: (id) => apiClient.delete(`/banners/${id}`),
};

// Event Services
export const eventService = {
  getAll: (params) => apiClient.get('/events', { params }),
  getById: (id) => apiClient.get(`/events/${id}`),
  create: (eventData) => apiClient.post('/events', eventData),
  update: (id, eventData) => apiClient.put(`/events/${id}`, eventData),
  delete: (id) => apiClient.delete(`/events/${id}`),
};

// Experiment Services
export const experimentService = {
  getAll: (params) => apiClient.get('/experiments', { params }),
  getById: (id) => apiClient.get(`/experiments/${id}`),
  create: (experimentData) => apiClient.post('/experiments', experimentData),
  update: (id, experimentData) => apiClient.put(`/experiments/${id}`, experimentData),
  delete: (id) => apiClient.delete(`/experiments/${id}`),
};

// Company Info Services
export const companyInfoService = {
  get: () => apiClient.get('/company-info'),
  update: (companyData) => apiClient.put('/company-info', companyData),
};

// Upload Services
export const uploadService = {
  uploadImage: (file, folder = 'products') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMultiple: (files, folder = 'products') => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('folder', folder);
    return apiClient.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
