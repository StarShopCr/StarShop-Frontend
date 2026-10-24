export interface User {
  walletAddress: string;
  role: 'buyer' | 'seller';
  name: string;
  email: string;
  avatar?: string;
  isVerified?: boolean;
  joinedDate?: string;
  isLoading?: boolean;
}

export interface UserStore extends User {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setUser: (user: Partial<User>) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  setWalletAddress: (address: string) => void;
  setRole: (role: 'buyer' | 'seller') => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setAvatar: (avatar: string) => void;
  setIsVerified: (isVerified: boolean) => void;
  setJoinedDate: (date: string) => void;
  isAuthenticated: () => boolean;
}
