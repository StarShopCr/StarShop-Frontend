"use client";
import React from "react";
import { SorobanReactProvider } from "@soroban-react/core";
import { freighter } from "@soroban-react/freighter";
import { futurenet, sandbox, standalone, testnet } from "@soroban-react/chains";
import { ChainMetadata, Connector } from "@soroban-react/types";

const chains: ChainMetadata[] = [sandbox, standalone, futurenet, testnet];
const activeChain = futurenet;
const connectors: Connector[] = [freighter()];

console.log(chains);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SorobanReactProvider
      appName={"StarShop"}
      chains={chains}
      activeChain={activeChain}
      connectors={connectors}
      autoconnect={true}
    >
      {children}
    </SorobanReactProvider>
  );
};
