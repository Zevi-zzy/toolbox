"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Key, Plus, Trash2, Copy, Check, Loader2, Code, Box, Terminal, Lock, Zap } from "lucide-react";
import Link from "next/link";

export function DeveloperContent({ isHome = false }: { isHome?: boolean }) {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchKeys();
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchKeys = async () => {
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
    <div className={`${isHome ? 'max-w-7xl' : 'max-w-5xl'} mx-auto px-4 py-12`}>
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Terminal className="w-8 h-8 text-blue-600" />
          开发者中心
        </h1>
        <p className="text-gray-500 text-lg">将 Toolbox 的 AI 能力集成到您的 AI Agent、GPTs 或自有应用中。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* API Keys Section */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                API 密钥管理
              </h2>
              {user && (
                <button 
                  onClick={createKey}
                  disabled={creating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  创建新密钥
                </button>
              )}
            </div>
            
            <div className="divide-y divide-gray-50">
              {!user ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-6">登录后即可创建并管理您的 API 密钥</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                  >
                    返回首页登录
                  </button>
                </div>
              ) : loading ? (
                <div className="p-16 text-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  加载中...
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="p-16 text-center text-gray-400">暂无 API 密钥</div>
              ) : (
                apiKeys.map((key) => (
                  <div key={key.id} className="p-8 flex items-center justify-between group hover:bg-gray-50/50 transition-colors">
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-900">{key.name}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-gray-600 font-mono shadow-sm">
                          {key.key_value.substring(0, 8)}****************{key.key_value.slice(-4)}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(key.key_value)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {copiedKey === key.key_value ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">创建于 {new Date(key.created_at).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => deleteKey(key.id)}
                      className="p-3 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* API Documentation */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Code className="w-7 h-7 text-blue-600" />
              API 调用文档
            </h2>
            
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    通用请求头 (Headers)
                  </h3>
                  <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Key</p>
                        <code className="text-sm text-blue-200">x-api-key</code>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Value</p>
                        <code className="text-sm text-blue-200">YOUR_API_KEY</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    调用示例 (以 Excel 助手为例)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">POST</span>
                      <span className="text-slate-400">/api/v1/tools/excel-helper</span>
                    </div>
                    <pre className="bg-black/40 p-6 rounded-2xl text-sm font-mono text-blue-100 overflow-x-auto border border-white/5 leading-relaxed">
{`curl -X POST https://toolbox.apexcosmos.com/api/v1/tools/excel-helper \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{ "prompt": "计算 A1 到 A10 的平均值" }'`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    可用工具 ID (toolId)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['excel-helper', 'optimize-prompt', 'generate-mindmap', 'generate-resume', 'article-summary', 'meeting-minutes', 'report-gen'].map(id => (
                      <span key={id} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-mono text-slate-300 border border-white/5 transition-colors">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20">
            <Box className="w-10 h-10 mb-6 opacity-80" />
            <h3 className="text-xl font-bold mb-4">Skills 集成说明</h3>
            <p className="text-sm text-blue-50 leading-relaxed mb-6">
              每个工具都提供了标准的 OpenAPI Manifest 地址，您可以直接导入 GPTs 的 Actions 或 Claude 的集成中。
            </p>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Manifest URL 格式</p>
                <code className="text-[10px] break-all text-blue-50">/api/v1/tools/[toolId]/manifest</code>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <Zap className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Pro 专属权益</h3>
            <ul className="text-sm text-gray-500 space-y-3">
              <li className="flex items-start gap-2">• API & Skills 调用权限</li>
              <li className="flex items-start gap-2">• 1000 次/月 高额度保障</li>
              <li className="flex items-start gap-2">• 极速响应优先级</li>
              <li className="flex items-start gap-2">• 批量处理能力</li>
            </ul>
            <Link 
              href="/pricing" 
              className="mt-8 block w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 text-center rounded-xl text-sm font-bold transition-all"
            >
              了解更多 Pro 权益
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
