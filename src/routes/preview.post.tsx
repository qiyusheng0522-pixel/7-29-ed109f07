import { createFileRoute } from "@tanstack/react-router";
import { ExamStagePreview } from "@/components/ExamStagePreview";

export const Route = createFileRoute("/preview/post")({
  head: () => ({ meta: [
    { title: "初中检后预览 · 阳光校园健康" },
    { name: "description", content: "以初中体检结果展示风险分层、医生方案、家校协同及社区转诊随访。" },
    { property: "og:title", content: "初中检后预览 · 阳光校园健康" },
    { property: "og:description", content: "初中检后业务闭环独立演示，报告与各角色状态一致。" },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: PostPreview,
});
function PostPreview() { return <ExamStagePreview stage="post" />; }