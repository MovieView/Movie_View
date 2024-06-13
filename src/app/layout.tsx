"use client";

import { Inter } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import React from "react";
import NavBar from "@/components/NavBar/NavBar";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import SessionWrapper from "@/components/login/SessionWrapper";

const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 현재 URL 경로를 가져옴
  const currentLocation = usePathname();
  // 네비게이션 바의 사용으로 인한 길이 조정
  const navBarStyle = clsx(
    inter.className,
    "",
    currentLocation === "/" ? "flex flex-col min-h-screen" : "block"
  );

  return (
    // social login session provider
    <SessionWrapper>
      <QueryClientProvider client={queryClient}>
        <html lang="en">
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
