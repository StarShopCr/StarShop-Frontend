"use client";
import { useWalletUtils } from "@/hooks/useWalletUtils";
import { useWalletStore } from "@/store/walletStore";

export const ConnectWalletButton = () => {
  const { handleConnect, handleDisconnect } = useWalletUtils();
  const { address } = useWalletStore();

  return (
    <div>
      {address ? (
        <>
          <div className="flex gap-5 ml-auto">
            <button
              type="button"
              onClick={handleDisconnect}
              className="mt-[30px] md:mt-[50px] font-bold inline-block bg-white dark:bg-white text-primary-purple px-[10px] md:px-[40px] py-[15px] rounded-[25px] dark:hover:bg-purple-100 leading-[22.72px] text-left cursor-pointer hover:bg-purple-100 hover:text-primary-purple"
            >
              Disconnect Wallet
            </button>
          </div>
        </>
      ) : (
        <div className="flex gap-5 ml-auto">
          <button
            type="button"
            onClick={handleConnect}
            className="mt-[30px] md:mt-[50px] font-bold inline-block bg-black dark:bg-white text-white dark:text-primary-purple px-[10px] md:px-[40px] py-[15px] rounded-[25px] dark:hover:bg-purple-100 leading-[22.72px] text-left cursor-pointer hover:bg-purple-100 hover:text-primary-purple"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};
