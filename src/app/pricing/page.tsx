"use client";

import { useState } from "react";
import { Check, Loader2, Zap, Shield, Rocket, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handleUpgrade = async (variantId: string) => {
    setLoading(variantId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("请先登录");
        return;
      }

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "无法创建支付链接");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "免费版",
      price: "0",
      description: "体验 Toolbox 的基础能力",
      features: ["10 次免费额度", "7 大基础 AI 工具", "社区支持", "极简网页体验"],
      buttonText: "当前计划",
      disabled: true,
      variantId: null,
    },
    {
      name: "专业版 Pro",
      price: "19.9",
      period: "/月",
      description: "解锁无限生产力",
      features: ["无限次使用", "高级工具优先体验", "API 调用支持", "Skills 插件集成", "1对1 技术支持"],
      buttonText: "立即升级",
      popular: true,
      variantId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID || "your-variant-id",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">简单透明的定价</h1>
        <p className="text-gray-500 text-lg">选择适合您的计划，让 AI 助你效率飞跃</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative p-8 rounded-[2.5rem] border ${plan.popular ? 'border-blue-600 shadow-xl shadow-blue-500/10' : 'border-gray-100'} bg-white flex flex-col`}
          >
            {plan.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-black rounded-full uppercase tracking-widest">最受欢迎</span>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black text-gray-900">￥{plan.price}</span>
              {plan.period && <span className="text-gray-400 font-medium">{plan.period}</span>}
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className={`mt-1 p-0.5 rounded-full ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => plan.variantId && handleUpgrade(plan.variantId)}
              disabled={plan.disabled || loading === plan.variantId}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                plan.popular 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20' 
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading === plan.variantId ? <Loader2 className="w-5 h-5 animate-spin" /> : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Contact Support Section */}
      <div className="mt-24 max-w-2xl mx-auto bg-white border border-blue-100 rounded-[3rem] p-10 text-center shadow-xl shadow-blue-500/5">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">定制化/大客户需求？</h3>
        <p className="text-gray-500 mb-8 text-sm">
          如果您需要更高级别的 API 调用额度、私有化部署或有任何使用疑问，欢迎添加客服微信咨询。
        </p>
        <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-gray-50 rounded-[2rem] border border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">客服微信</p>
          <p className="text-2xl font-black text-blue-600 font-mono">zzy714537955</p>
          <button 
            onClick={() => {
              navigator.clipboard.writeText("zzy714537955");
              alert("微信号已复制");
            }}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            点击复制微信号
          </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-3xl">
          <Shield className="w-8 h-8 text-blue-600 mb-4" />
          <h4 className="font-bold text-gray-900 mb-2">安全支付</h4>
          <p className="text-xs text-gray-500">通过 Lemon Squeezy 全球安全交易加密</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-3xl">
          <Rocket className="w-8 h-8 text-blue-600 mb-4" />
          <h4 className="font-bold text-gray-900 mb-2">即时生效</h4>
          <p className="text-xs text-gray-500">付款成功后系统自动实时解锁额度</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-3xl">
          <Zap className="w-8 h-8 text-blue-600 mb-4" />
          <h4 className="font-bold text-gray-900 mb-2">弹性扩容</h4>
          <p className="text-xs text-gray-500">未来将支持更多高级生产力工具</p>
        </div>
      </div>
    </div>
  );
}
