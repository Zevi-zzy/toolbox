export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-8">服务条款</h1>
      <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
        <p>欢迎使用 Toolbox。通过访问本平台，即表示您同意遵守以下条款。</p>
        <h2 className="text-xl font-bold text-gray-900">1. 服务说明</h2>
        <p>Toolbox 提供一系列 AI 驱动的办公工具。免费用户拥有基础使用额度，Pro 用户可享受更高的额度与高级功能。</p>
        <h2 className="text-xl font-bold text-gray-900">2. 用户责任</h2>
        <p>用户应合法使用本平台提供的工具，不得利用 AI 生成违法或侵权内容。用户应对其账户下的一切行为负责。</p>
        <h2 className="text-xl font-bold text-gray-900">3. 支付与订阅</h2>
        <p>Pro 会员订阅通过 Lemon Squeezy 进行处理。订阅一经生效，将根据所选计划自动续费，除非您提前取消。</p>
      </div>
    </div>
  );
}
