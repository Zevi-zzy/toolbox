import AIExcelHelper from "@/components/tools/AIExcelHelper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Excel 助手 | Toolbox",
  description: "描述你的需求，AI 帮你快速生成准确的 Excel 公式。",
};

export default function AIExcelPage() {
  return <AIExcelHelper />;
}
