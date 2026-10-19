import { create } from 'zustand';

export const useAuthStore = create((set, get) => {
  // Load initial from localStorage
  const savedUser = localStorage.getItem('sami_cafe_user');
  const savedToken = localStorage.getItem('sami_cafe_token');

  let initialUser = null;
  if (savedUser) {
    try {
      initialUser = JSON.parse(savedUser);
      const isAdminOwner = initialUser && (initialUser.email === 'admin@samicafe.com' || (initialUser.role === 'admin' && initialUser.fullName?.includes('Simachew')));
      if (isAdminOwner) {
        initialUser.fullName = 'Simachew Alene (Owner)';
        initialUser.avatarUrl = '/images/simachew-profile.png';
        localStorage.setItem('sami_cafe_user', JSON.stringify(initialUser));
      } else if (initialUser) {
        // Ensure non-admin roles (manager, cashier, waiter, customer) do not carry admin photo
        if (initialUser.avatarUrl === '/images/simachew-profile.png') {
          initialUser.avatarUrl = null;
          localStorage.setItem('sami_cafe_user', JSON.stringify(initialUser));
        }
      }
    } catch {
      initialUser = null;
    }
  }

  return {
    user: initialUser,
    token: savedToken || null,
    isAuthenticated: !!savedToken,

    setAuth: (user, token) => {
      localStorage.setItem('sami_cafe_user', JSON.stringify(user));
      localStorage.setItem('sami_cafe_token', token);
      set({ user, token, isAuthenticated: true });
    },

    updateUser: (updatedFields) => {
      const current = get().user;
      if (!current) return;
      const newUser = { ...current, ...updatedFields };
      localStorage.setItem('sami_cafe_user', JSON.stringify(newUser));
      set({ user: newUser });
    },

    logout: () => {
      localStorage.removeItem('sami_cafe_user');
      localStorage.removeItem('sami_cafe_token');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
