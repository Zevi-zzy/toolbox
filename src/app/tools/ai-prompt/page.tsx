import AIPromptOptimizer from "@/components/tools/AIPromptOptimizer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 提示词优化器 | Toolbox",
  description: "使用 MiniMax M2.5 模型，将简单想法转为高质量 Prompt。",
};

export default function AIPromptPage() {
  return <AIPromptOptimizer />;
}
