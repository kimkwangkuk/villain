'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  // /add-post 경로에서는 pt-16 클래스를 적용하지 않음
  const isAddPostPage = pathname === '/add-post';
  
  return (
    <div className={isAddPostPage ? '' : 'pt-16'}>
      {children}
    </div>
  );
}

export default Layout; 