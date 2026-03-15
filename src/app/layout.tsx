import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Logo from "@/components/layout/Logo";
import Link from "next/link";

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
          <footer className="border-t bg-gray-50/50 py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-4">
                  <Logo />
                  <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                    极简 AI 办公工具箱，专为办公小白设计的效率神器。助您摆脱繁琐工作，拥抱效率飞跃。
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-sm">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900">产品</h4>
                    <ul className="space-y-2 text-gray-500">
                      <li><Link href="/" className="hover:text-blue-600 transition-colors">所有工具</Link></li>
                      <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">价格方案</Link></li>
                      <li><Link href="/help" className="hover:text-blue-600 transition-colors">帮助中心</Link></li>
                      <li><Link href="/changelog" className="hover:text-blue-600 transition-colors">更新日志</Link></li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900">支持</h4>
                    <ul className="space-y-2 text-gray-500">
                      <li><a href="mailto:zevizhang@gmail.com" className="hover:text-blue-600 transition-colors">联系我们</a></li>
                      <li><Link href="/terms" className="hover:text-blue-600 transition-colors">服务协议</Link></li>
                      <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">隐私政策</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <p>© 2026 Toolbox - toolbox.apexcosmos.com. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <span>Power by ApexCosmos AI</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
