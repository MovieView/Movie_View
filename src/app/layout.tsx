'use client';

import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './globals.css';
import React from 'react';
import NavBar from '@/components/common/NavBar';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import SessionWrapper from '@/components/login/SessionWrapper';

const inter = Inter({ subsets: ['latin'] });
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentLocation = usePathname();
  const navBarStyle = clsx(
    inter.className,
    '',
    currentLocation === '/' ? 'flex flex-col min-h-screen' : 'block'
  );

  return (
    <SessionWrapper>
      <QueryClientProvider client={queryClient}>
        <html lang='en'>
          <body className={navBarStyle}>
            <NavBar isFixed={true} />
            <NavBar isFixed={false} />
            {children}
          </body>
        </html>
      </QueryClientProvider>
    </SessionWrapper>
  );
}
