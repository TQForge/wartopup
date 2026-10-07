import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import InstallBanner from './InstallBanner';

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F3F7FF] flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {children || <Outlet />}
      </main>
      <Footer />
      <BottomNav />
      <InstallBanner />
    </div>
  );
}
