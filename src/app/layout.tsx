import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Toolbox | toolbox.apexcosmos.com",
  description: "一站式实用工具平台，助力效率飞跃",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="border-t bg-gray-50">
            <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-500">
              <p>© 2026 Toolbox - toolbox.apexcosmos.com. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
