import { Metadata } from "next";
import ReactQueryProvider from "@/providers/query-client-provider";
import "./globals.css";
import ClientSidebar from "@/components/ui/client-sidebar";
import { AuthProvider } from "@/context/AuthProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import NavigationGuard from "@/components/auth/NavigationGuard";
import { Header } from "@/components/ui/header";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('starshop-theme') || 'dark';
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var actualTheme = theme === 'system' ? systemTheme : theme;
                  document.documentElement.className = actualTheme;
                } catch (e) {
                  // Keep the default 'dark' class if there's an error
                }
              })();
            `,
          }}
        />
      </head>
      <body className="overflow-x-hidden bg-background text-foreground dark:bg-starshopBackground">
        <ThemeProvider defaultTheme="dark" storageKey="starshop-theme">
          <AuthProvider>
            <div className="flex flex-col lg:flex-row min-h-screen w-full">
              <ClientSidebar />
              <main className="flex-1 overflow-y-auto">
                <Header />
                <NavigationGuard>
                  <ReactQueryProvider>{children}</ReactQueryProvider>
                </NavigationGuard>
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
