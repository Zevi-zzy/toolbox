"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Key, Plus, Trash2, Copy, Check, Loader2, Code, Box, Terminal } from "lucide-react";
import Link from "next/link";

export default function DeveloperPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });
    
    setApiKeys(data || []);
    setLoading(false);
  };

  const createKey = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/user/keys', { method: 'POST' });
      if (res.ok) {
        await fetchKeys();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (id: string) => {
    const { error } = await supabase.from('api_keys').delete().eq('id', id);
    if (!error) {
      setApiKeys(apiKeys.filter(k => k.id !== id));
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Terminal className="w-8 h-8 text-blue-600" />
          开发者中心
        </h1>
        <p className="text-gray-500">管理您的 API 密钥，并将 Toolbox 工具集成到您的 AI Agent 或应用中。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* API Keys Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                API 密钥
              </h2>
              <button 
                onClick={createKey}
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                创建新密钥
              </button>
            </div>
            
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="p-12 text-center text-gray-400">加载中...</div>
              ) : apiKeys.length === 0 ? (
                <div className="p-12 text-center text-gray-400">暂无 API 密钥</div>
              ) : (
                apiKeys.map((key) => (
                  <div key={key.id} className="p-6 flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900">{key.name}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-500 font-mono">
                          {key.key_value.substring(0, 8)}****************{key.key_value.slice(-4)}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(key.key_value)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {copiedKey === key.key_value ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400">创建于 {new Date(key.created_at).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => deleteKey(key.id)}
                      className="p-2 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Start Section */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              快速调用示例
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">使用 cURL 调用 AI Excel 助手：</p>
              <pre className="bg-black/50 p-4 rounded-2xl text-xs font-mono text-blue-300 overflow-x-auto">
{`curl -X POST https://toolbox.apexcosmos.com/api/v1/tools/excel-helper \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{ "prompt": "计算A1和B1的和" }'`}
              </pre>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Box className="w-4 h-4" />
              什么是 Skills?
            </h3>
            <p className="text-sm text-blue-700 leading-relaxed mb-4">
              Skills 是专门为 OpenAI GPTs、Claude Projects 等 AI 平台设计的插件接口。
            </p>
            <ul className="text-xs text-blue-600 space-y-2">
              <li className="flex items-start gap-2">• 支持一键导入 OpenAPI Manifest</li>
              <li className="flex items-start gap-2">• 让您的 AI Agent 具备 Toolbox 的专业能力</li>
              <li className="flex items-start gap-2">• 统一的鉴权与额度管理</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
            <h3 className="font-bold text-amber-900 mb-2">商业化建议</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              API 调用将消耗您的 Pro 额度。开发者模式支持更高的并发与批量处理能力。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
