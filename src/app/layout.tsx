import { Metadata } from "next";
import ReactQueryProvider from "@/providers/query-client-provider";
import "./globals.css";
import ClientSidebar from "@/components/ui/client-sidebar";
import { AuthProvider } from "@/context/AuthProvider";

export const metadata: Metadata = {
  title: "StarShop",
  description:
    "Empowering users to buy and sell unique digital assets on a blockchain-based marketplace, fostering transparency and trust through NFTs.",
  keywords: "NFT, Blockchain, Digital Assets, Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-starshopBackground overflow-x-hidden">
        <AuthProvider>
          <div className="flex flex-col lg:flex-row min-h-screen w-full">
            <ClientSidebar />
            <main className="flex-1 overflow-y-auto">
              <ReactQueryProvider>{children}</ReactQueryProvider>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
