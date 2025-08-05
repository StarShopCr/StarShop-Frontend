export interface User {
  walletAddress: string;
  role: 'buyer' | 'seller';
  name: string;
  email: string;
}

export interface UserStore extends User {
  setUser: (user: Partial<User>) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  setWalletAddress: (address: string) => void;
  setRole: (role: 'buyer' | 'seller') => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  isAuthenticated: () => boolean;
}
