import AIMindmapGenerator from "@/components/tools/AIMindmapGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 思维导图 | Toolbox",
  description: "将长文章或心得一键转化为层级分明的、可下载的思维导图（脑图）。",
};

export default function AIMindmapPage() {
  return <AIMindmapGenerator />;
}
