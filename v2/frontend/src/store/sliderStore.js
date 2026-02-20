import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useSliderStore = create((set) => ({
  slides: [],
  loading: false,
  error: null,

  fetchSlides: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_URL}/slider`);
      set({ slides: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addSlide: async (slide) => {
    try {
      const response = await axios.post(`${API_URL}/slider`, slide);
      set((state) => ({ slides: [...state.slides, response.data] }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  updateSlide: async (id, slide) => {
    try {
      const response = await axios.put(`${API_URL}/slider/${id}`, slide);
      set((state) => ({
        slides: state.slides.map((s) => (s.id === id ? response.data : s))
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  deleteSlide: async (id) => {
    try {
      await axios.delete(`${API_URL}/slider/${id}`);
      set((state) => ({
        slides: state.slides.filter((s) => s.id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
    }
  }
}));
