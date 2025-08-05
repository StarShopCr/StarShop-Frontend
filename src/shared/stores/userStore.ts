import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserStore } from '../types/user';

const initialState: User = {
  walletAddress: '',
  role: 'buyer',
  name: '',
  email: '',
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      ...initialState,

      // Acciones
      setUser: user => set(user),

      updateUser: updates => set(state => ({ ...state, ...updates })),

      clearUser: () => set(initialState),

      setWalletAddress: walletAddress => set({ walletAddress }),

      setRole: role => set({ role }),

      setName: name => set({ name }),

      setEmail: email => set({ email }),

      isAuthenticated: () => {
        const state = get();
        return Boolean(state.walletAddress && state.name && state.email);
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        walletAddress: state.walletAddress,
        role: state.role,
        name: state.name,
        email: state.email,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          console.log('User store rehydrated:', state);
        }
      },
    }
  )
);

// Selectores para optimizar re-renders
export const useUserWalletAddress = () =>
  useUserStore(state => state.walletAddress);
export const useUserRole = () => useUserStore(state => state.role);
export const useUserName = () => useUserStore(state => state.name);
export const useUserEmail = () => useUserStore(state => state.email);
export const useIsAuthenticated = () =>
  useUserStore(state => state.isAuthenticated());

// Hook personalizado para obtener datos completos del usuario
export const useUser = () =>
  useUserStore(state => ({
    walletAddress: state.walletAddress,
    role: state.role,
    name: state.name,
    email: state.email,
    isAuthenticated: state.isAuthenticated(),
  }));

// Hook para acciones del usuario
export const useUserActions = () =>
  useUserStore(state => ({
    setUser: state.setUser,
    updateUser: state.updateUser,
    clearUser: state.clearUser,
    setWalletAddress: state.setWalletAddress,
    setRole: state.setRole,
    setName: state.setName,
    setEmail: state.setEmail,
  }));
