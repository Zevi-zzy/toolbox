"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import AuthModal from "@/components/auth/AuthModal";
import { LogOut, ChevronDown, Zap } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [usage, setUsage] = useState<{ count: number; allowed: boolean } | null>(null);
  const supabase = createClient();

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/user/usage');
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (err) {
      console.error('Failed to fetch usage');
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchUsage();
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAuthModalOpen(false);
        fetchUsage();
      } else {
        setUsage(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold text-blue-600">Toolbox</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-blue-600">首页</Link>
            <a href="mailto:zevizhang@gmail.com" className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 transition-all">
              商务合作：zevizhang@gmail.com
            </a>
          </nav>
          <div className="relative">
            {user ? (
              <div className="flex items-center gap-4">
                {/* 简易用量显示 */}
                {usage && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      可用额度: {10 - usage.count} / 10
                    </span>
                  </div>
                )}

                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-100 rounded-full transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-[60]">
                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">个人账户</p>
                      <p className="text-xs text-gray-600 truncate font-medium">{user.email}</p>
                    </div>
                    
                    {usage && (
                      <div className="px-4 py-3 border-b border-gray-50 mb-2">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">免费额度使用情况</p>
                          <span className="text-[10px] font-bold text-blue-600">{usage.count}/10</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${usage.count >= 10 ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min((usage.count / 10) * 100, 100)}%` }}
                          ></div>
                        </div>
                        {usage.count >= 10 && (
                          <p className="text-[10px] text-red-500 mt-2 font-medium">额度已用完，请联系合作</p>
                        )}
                      </div>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
