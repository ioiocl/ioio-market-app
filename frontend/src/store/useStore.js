import { create } from 'zustand';

const useStore = create((set) => ({
  // User state
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  
  setUser: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  // Cart state
  cart: { items: [], total: 0 },
  
  setCart: (cart) => set({ cart }),
  
  addToCart: (item) => set((state) => ({
    cart: {
      items: [...state.cart.items, item],
      total: state.cart.total + item.price * item.quantity
    }
  })),
  
  removeFromCart: (itemId) => set((state) => {
    const item = state.cart.items.find(i => i.id === itemId);
    return {
      cart: {
        items: state.cart.items.filter(i => i.id !== itemId),
        total: state.cart.total - (item ? item.price * item.quantity : 0)
      }
    };
  }),
  
  clearCart: () => set({ cart: { items: [], total: 0 } }),

  // Language state
  language: localStorage.getItem('language') || 'en',
  
  setLanguage: (language) => {
    localStorage.setItem('language', language);
    set({ language });
  },
}));

export default useStore;
