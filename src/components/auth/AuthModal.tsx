"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase';
import { X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const supabase = createClient();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">欢迎加入 Toolbox</h2>
          <p className="text-gray-500 text-sm mt-2">登录后即可享受更多高级功能与记录保存</p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                },
                radii: {
                  borderRadiusButton: '12px',
                  buttonBorderRadius: '12px',
                  inputBorderRadius: '12px',
                }
              }
            }
          }}
          providers={['github']}
          localization={{
            variables: {
              sign_in: {
                email_label: '邮箱地址',
                password_label: '密码',
                button_label: '登录',
                social_provider_text: '使用 {{provider}} 登录',
                link_text: '已有账号？登录',
              },
              sign_up: {
                email_label: '邮箱地址',
                password_label: '设置密码',
                button_label: '注册',
                social_provider_text: '使用 {{provider}} 注册',
                link_text: '没有账号？注册一个',
              },
            }
          }}
        />
      </div>
    </div>
  );
}
