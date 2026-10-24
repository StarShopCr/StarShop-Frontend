import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { User, UserStore } from '@/shared/types/user';

const initialState: User = {
  walletAddress: '',
  role: 'buyer',
  name: '',
  email: '',
  avatar: '',
  isVerified: false,
  joinedDate: '',
  isLoading: false,
};

const memoryStorage = new Map<string, string>();
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStorage.get(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      memoryStorage.set(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    } else {
      memoryStorage.delete(key);
    }
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      isLoading: false,

      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setUser: user => set(state => ({ ...state, ...user })),
      updateUser: updates => set(state => ({ ...state, ...updates })),
      clearUser: () => set({ ...initialState, isLoading: false }),
      setWalletAddress: walletAddress => set({ walletAddress }),
      setRole: role => set({ role }),
      setName: name => set({ name }),
      setEmail: email => set({ email }),
      setAvatar: avatar => set({ avatar }),
      setIsVerified: isVerified => set({ isVerified }),
      setJoinedDate: joinedDate => set({ joinedDate }),
      isAuthenticated: () => {
        const state = get();
        return Boolean(state.walletAddress && state.name && state.email);
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: state => ({
        walletAddress: state.walletAddress,
        role: state.role,
        name: state.name,
        email: state.email,
        avatar: state.avatar,
        isVerified: state.isVerified,
        joinedDate: state.joinedDate,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          console.log('User store rehydrated:', state);
        }
      },
    }
  )
);

export const useUserWalletAddress = () =>
  useUserStore(state => state.walletAddress);
export const useUserRole = () => useUserStore(state => state.role);
export const useUserName = () => useUserStore(state => state.name);
export const useUserEmail = () => useUserStore(state => state.email);
export const useUserAvatar = () => useUserStore(state => state.avatar);
export const useUserIsVerified = () => useUserStore(state => state.isVerified);
export const useUserJoinedDate = () => useUserStore(state => state.joinedDate);
export const useUserIsLoading = () => useUserStore(state => state.isLoading);
export const useIsAuthenticated = () =>
  useUserStore(state => state.isAuthenticated());

export const useUser = () =>
  useUserStore(
    useShallow(state => ({
      walletAddress: state.walletAddress,
      role: state.role,
      name: state.name,
      email: state.email,
      avatar: state.avatar,
      isVerified: state.isVerified,
      joinedDate: state.joinedDate,
      isLoading: state.isLoading,
      isAuthenticated: state.isAuthenticated(),
    }))
  );

export const useSetUser = () => useUserStore(state => state.setUser);
export const useUpdateUser = () => useUserStore(state => state.updateUser);
export const useClearUser = () => useUserStore(state => state.clearUser);
export const useSetWalletAddress = () =>
  useUserStore(state => state.setWalletAddress);
export const useSetRole = () => useUserStore(state => state.setRole);
export const useSetName = () => useUserStore(state => state.setName);
export const useSetEmail = () => useUserStore(state => state.setEmail);
export const useSetAvatar = () => useUserStore(state => state.setAvatar);
export const useSetIsVerified = () =>
  useUserStore(state => state.setIsVerified);
export const useSetJoinedDate = () =>
  useUserStore(state => state.setJoinedDate);
export const useSetIsLoading = () => useUserStore(state => state.setIsLoading);

export const useUserActions = () => ({
  setUser: useUserStore.getState().setUser,
  updateUser: useUserStore.getState().updateUser,
  clearUser: useUserStore.getState().clearUser,
  setWalletAddress: useUserStore.getState().setWalletAddress,
  setRole: useUserStore.getState().setRole,
  setName: useUserStore.getState().setName,
  setEmail: useUserStore.getState().setEmail,
  setAvatar: useUserStore.getState().setAvatar,
  setIsVerified: useUserStore.getState().setIsVerified,
  setJoinedDate: useUserStore.getState().setJoinedDate,
  setIsLoading: useUserStore.getState().setIsLoading,
});

export const getSavedUser = () => {
  const state = useUserStore.getState();
  return {
    walletAddress: state.walletAddress,
    role: state.role,
    name: state.name,
    email: state.email,
    avatar: state.avatar,
    isVerified: state.isVerified,
    joinedDate: state.joinedDate,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated(),
  };
};
