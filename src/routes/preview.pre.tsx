import { createFileRoute } from "@tanstack/react-router";
import { ExamStagePreview } from "@/components/ExamStagePreview";

export const Route = createFileRoute("/preview/pre")({
  head: () => ({ meta: [
    { title: "初中检前预览 · 阳光校园健康" },
    { name: "description", content: "初中学生检前授权、原样问卷与家校医准备流程演示。" },
    { property: "og:title", content: "初中检前预览 · 阳光校园健康" },
    { property: "og:description", content: "独立检前演示入口，授权及问卷进度持续保存。" },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: PrePreview,
});
function PrePreview() { return <ExamStagePreview stage="pre" />; }