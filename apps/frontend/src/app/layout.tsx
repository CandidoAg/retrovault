'use client'

import { useEffect } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { useAuthStore } from "@/store/use-auth";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  useEffect(() => {
    const syncAuth = () => {
      const state = useAuthStore.getState();
      
      useAuthStore.persist.rehydrate();
      
      state.checkTokenExpiration();
    };

    window.addEventListener('storage', (event) => {
      if (event.key === 'auth-storage') syncAuth();
    });

    const interval = setInterval(syncAuth, 3000); 

    return () => {
      window.removeEventListener('storage', syncAuth);
      clearInterval(interval);
    };
  }, []);

  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${geistSans.variable} antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="grow"> 
            {children} 
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}