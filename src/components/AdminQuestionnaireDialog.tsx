import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaperQuestionnaireRecords } from "@/components/PaperQuestionnaireRecords";
import type { DbStudent } from "@/lib/students-db";

export function AdminQuestionnaireDialog({ student, refresh, onClose }: {
  student: DbStudent | null;
  refresh: number;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!student} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[85vh] max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-12">
          <DialogTitle>问卷填写结果</DialogTitle>
          <DialogDescription>
            {student ? `${student.name} · ${student.school} · ${student.grade}${student.cls} · 学号 ${student.sno}` : "学生问卷档案"}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-5">
          {student && <PaperQuestionnaireRecords uid={student.uid} refresh={refresh} answersOnly />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
