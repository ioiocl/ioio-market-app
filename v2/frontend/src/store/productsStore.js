import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useProductsStore = create((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_URL}/products`);
      set({ products: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const response = await axios.post(`${API_URL}/products`, product);
      set((state) => ({ products: [...state.products, response.data] }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  updateProduct: async (id, product) => {
    try {
      const response = await axios.put(`${API_URL}/products/${id}`, product);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? response.data : p))
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  deleteProduct: async (id) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
    }
  }
}));
