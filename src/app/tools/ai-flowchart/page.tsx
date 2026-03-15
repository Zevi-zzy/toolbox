import AIFlowchartGenerator from "@/components/tools/AIFlowchartGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 流程图 | Toolbox",
  description: "输入逻辑描述或业务步骤，AI 将自动为你绘制精美的流程图。",
};

export default function AIFlowchartPage() {
  return <AIFlowchartGenerator />;
}
