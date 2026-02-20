import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useActivitiesStore = create((set) => ({
  activities: [],
  loading: false,
  error: null,

  fetchActivities: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_URL}/activities`);
      set({ activities: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addActivity: async (activity) => {
    try {
      const response = await axios.post(`${API_URL}/activities`, activity);
      set((state) => ({ activities: [...state.activities, response.data] }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  updateActivity: async (id, activity) => {
    try {
      const response = await axios.put(`${API_URL}/activities/${id}`, activity);
      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? response.data : a))
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  deleteActivity: async (id) => {
    try {
      await axios.delete(`${API_URL}/activities/${id}`);
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
    }
  }
}));
