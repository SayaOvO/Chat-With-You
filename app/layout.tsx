import type { Metadata } from "next";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Provider } from "react-redux";
import { store } from "@/store";
import { StoreProvider } from "@/providers/store-provider";
import { ModalProvider } from "@/providers/modal-provider";

// uploadthing
import "@uploadthing/react/styles.css";
import { SocketProvider } from "@/providers/socket-provider";
import { QueryProvider } from "@/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Let's Chat Together",
  description: "Chat app built by Saya",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <StoreProvider>
            <QueryProvider>
              <SocketProvider>
                {children}
                <ModalProvider />
              </SocketProvider>
            </QueryProvider>
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
