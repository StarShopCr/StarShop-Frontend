import { BaseApi } from '@/shared/api/baseApi';
import { BuyerOrder } from '../types/calendar';
import { useBuyerOrderStore } from '@/shared/stores/buyerOrderStore';

/**
 * Service to fetch buyer orders from API or persisted buyer order store.
 * Strictly isolates cached orders by wallet address and persists empty states.
 */
class BuyerOrderApiService extends BaseApi {
  public constructor() {
    super();
  }

  async getOrders(walletAddress?: string): Promise<BuyerOrder[]> {
    if (!walletAddress) {
      return [];
    }

    try {
      const url = `/api/buyer/orders?wallet=${encodeURIComponent(walletAddress)}`;
      const response = await this.get<BuyerOrder[]>(url);
      if (response.data && Array.isArray(response.data)) {
        // Persist response (including empty lists) scoped to this wallet
        useBuyerOrderStore.getState().setOrdersForWallet(walletAddress, response.data);
        return response.data;
      }
    } catch {
      // In development or when API is offline, fall back to wallet-scoped cached store
    }

    // Return orders exclusively for this specific wallet
    return useBuyerOrderStore.getState().getOrdersForWallet(walletAddress);
  }
}

export const buyerOrderApiService = new BuyerOrderApiService();

export async function fetchBuyerOrders(walletAddress?: string): Promise<BuyerOrder[]> {
  return buyerOrderApiService.getOrders(walletAddress);
}
