export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-8">隐私政策</h1>
      <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
        <p>我们非常重视您的隐私。本政策说明了 Toolbox 平台如何收集、使用和保护您的个人信息。</p>
        <h2 className="text-xl font-bold text-gray-900">1. 信息收集</h2>
        <p>我们仅收集提供服务所必需的信息，包括您的邮箱地址（用于登录和账户识别）以及工具使用统计数据。</p>
        <h2 className="text-xl font-bold text-gray-900">2. 信息使用</h2>
        <p>您的信息将仅用于账户管理、额度统计以及为您提供更优质的 AI 办公体验。</p>
        <h2 className="text-xl font-bold text-gray-900">3. 数据安全</h2>
        <p>我们采用 Supabase 提供的加密存储和安全认证机制，确保您的数据安全。</p>
      </div>
    </div>
  );
}
