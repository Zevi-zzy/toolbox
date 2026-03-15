import AIReportGenerator from "@/components/tools/AIReportGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 汇报/周报生成器 | Toolbox",
  description: "输入工作内容碎弹，AI 帮你快速生成逻辑严密、专业的正式汇报。",
};

export default function AIReportPage() {
  return <AIReportGenerator />;
}
