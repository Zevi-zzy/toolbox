import AIResumeGenerator from "@/components/tools/AIResumeGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 极速简历 | Toolbox",
  description: "只需输入零散的个人信息，AI 帮你自动排版并优化出一份精美简历图。",
};

export default function AIResumePage() {
  return <AIResumeGenerator />;
}
