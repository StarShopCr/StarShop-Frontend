import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BuyerOrder } from '@/features/buyer/calendar/types/calendar';

interface BuyerOrderState {
  ordersByWallet: Record<string, BuyerOrder[]>;
  getOrdersForWallet: (wallet?: string | null) => BuyerOrder[];
  setOrdersForWallet: (wallet: string, orders: BuyerOrder[]) => void;
  clearOrdersForWallet: (wallet: string) => void;
  clearAllOrders: () => void;
}

export const useBuyerOrderStore = create<BuyerOrderState>()(
  persist(
    (set, get) => ({
      ordersByWallet: {},
      getOrdersForWallet: (wallet) => {
        if (!wallet) return [];
        return get().ordersByWallet[wallet] || [];
      },
      setOrdersForWallet: (wallet, orders) => {
        if (!wallet) return;
        set((state) => ({
          ordersByWallet: {
            ...state.ordersByWallet,
            [wallet]: orders,
          },
        }));
      },
      clearOrdersForWallet: (wallet) => {
        if (!wallet) return;
        set((state) => {
          const updated = { ...state.ordersByWallet };
          delete updated[wallet];
          return { ordersByWallet: updated };
        });
      },
      clearAllOrders: () => set({ ordersByWallet: {} }),
    }),
    {
      name: 'buyer-orders-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
