import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBoundUid, getStudent, listResults } from "@/lib/students-db";
import { buildParentExam } from "@/lib/parent-exam";

export function useParentExam() {
  const [uid, setUid] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const sync = () => { setUid(getBoundUid()); setHydrated(true); };
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("parent-binding-updated", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("parent-binding-updated", sync);
    };
  }, []);
  const query = useQuery({
    queryKey: ["parent-exam", uid], enabled: hydrated && Boolean(uid), staleTime: 0,
    queryFn: async () => {
      if (!uid) return null;
      const student = await getStudent(uid);
      if (!student) return null;
      const results = await listResults(uid);
      return { student, exam: buildParentExam(results, uid) };
    },
  });
  return { ...query, uid, loading: !hydrated || (Boolean(uid) && query.isPending) };
}