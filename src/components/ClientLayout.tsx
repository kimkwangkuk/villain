'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const authRoutes = ['/login', '/register', '/signup', '/forgot-password'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  return (
    <>
      {!isAuthRoute && <Navbar />}
      <div className={!isAuthRoute ? "pt-16" : ""}>
        {children}
      </div>
    </>
  );
} 