import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useEventsStore = create((set) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_URL}/events`);
      set({ events: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addEvent: async (event) => {
    try {
      const response = await axios.post(`${API_URL}/events`, event);
      set((state) => ({ events: [...state.events, response.data] }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  updateEvent: async (id, event) => {
    try {
      const response = await axios.put(`${API_URL}/events/${id}`, event);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? response.data : e))
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  deleteEvent: async (id) => {
    try {
      await axios.delete(`${API_URL}/events/${id}`);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
    }
  }
}));
