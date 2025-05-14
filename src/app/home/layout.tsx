'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </ThemeProvider>
  );
} 