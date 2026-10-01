import { useState, useEffect } from 'react';
import { BuyerOrder } from '../types/calendar';
import { fetchBuyerOrders } from '../services/buyerOrders';
import { useUserWalletAddress } from '@/shared/stores';
import { useBuyerOrderStore } from '@/shared/stores/buyerOrderStore';

export function useBuyerOrders() {
  const walletAddress = useUserWalletAddress();
  const getOrdersForWallet = useBuyerOrderStore((state) => state.getOrdersForWallet);
  const setOrdersForWallet = useBuyerOrderStore((state) => state.setOrdersForWallet);

  // Initialize with the current wallet's cached orders (or empty if none/disconnected)
  const [orders, setOrders] = useState<BuyerOrder[]>(() =>
    walletAddress ? getOrdersForWallet(walletAddress) : []
  );
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(walletAddress));

  useEffect(() => {
    let isMounted = true;

    // If wallet is not connected, clear displayed orders immediately
    if (!walletAddress) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    // When wallet changes, update immediate state to this wallet's cache while fetching
    setOrders(getOrdersForWallet(walletAddress));
    setIsLoading(true);

    fetchBuyerOrders(walletAddress).then((data) => {
      if (isMounted) {
        setOrders(data);
        // Persist successful response (even if empty) to overwrite stale cache
        setOrdersForWallet(walletAddress, data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [walletAddress, getOrdersForWallet, setOrdersForWallet]);

  return { orders, isLoading };
}
