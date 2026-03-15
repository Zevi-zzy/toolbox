import AIMeetingMinutes from "@/components/tools/AIMeetingMinutes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 会议纪要 | Toolbox",
  description: "将零碎的会议笔记整理成专业的商务会议纪要和待办事项。",
};

export default function AIMeetingPage() {
  return <AIMeetingMinutes />;
}
