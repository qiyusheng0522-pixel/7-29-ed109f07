import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useParentExam } from "@/hooks/use-parent-exam";

export function ParentExamState({ state }: { state: ReturnType<typeof useParentExam> }) {
  if (state.loading) return <p className="py-10 text-center text-sm text-muted-foreground" role="status">正在读取孩子的体检记录…</p>;
  if (state.isError) return <div className="py-10 text-center"><p className="mb-3 text-sm text-danger">体检记录读取失败，请重试</p><Button variant="outline" onClick={() => state.refetch()}>重新加载</Button></div>;
  return <div className="py-10 text-center"><p className="mb-4 text-sm text-muted-foreground">{state.uid ? "未找到绑定的学生，请重新核对绑定信息" : "请先绑定孩子，再查看体检记录"}</p><Button asChild><Link to="/parent/bind">绑定孩子</Link></Button></div>;
}