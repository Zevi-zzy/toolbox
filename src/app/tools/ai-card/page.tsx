import AIKnowledgeCard from "@/components/tools/AIKnowledgeCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 知识卡片 | Toolbox",
  description: "将长文章或心得一键转化为精美的、可分享的知识卡片。",
};

export default function AIKnowledgePage() {
  return <AIKnowledgeCard />;
}
