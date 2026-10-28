import { supabase } from "@/integrations/supabase/client";
import type { ExamValue } from "@/lib/exam-record";

export type DbStudent = {
  uid: string; school: string; sno: string; name: string; gender: string; grade: string; cls: string;
};
export type DbResult = {
  student_uid: string; station_id: string; doctor: string | null;
  item_values: Record<string, ExamValue>; crit_count: number; created_at: string;
};

export async function listStudents(): Promise<DbStudent[]> {
  const { data, error } = await supabase.from("students").select("uid,school,sno,name,gender,grade,cls").order("school").order("sno");
  if (error) throw error;
  return data ?? [];
}

export async function getStudent(uid: string): Promise<DbStudent | null> {
  const { data, error } = await supabase.from("students").select("uid,school,sno,name,gender,grade,cls").eq("uid", uid).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function findStudentBySnoName(sno: string, name: string): Promise<DbStudent | null> {
  const { data } = await supabase.from("students").select("uid,school,sno,name,gender,grade,cls").eq("sno", sno.trim()).eq("name", name.trim()).maybeSingle();
  return data ?? null;
}

export async function upsertStudents(list: DbStudent[]) {
  if (!list.length) return;
  const { error } = await supabase.from("students").upsert(list.map((s) => ({ ...s, updated_at: new Date().toISOString() })), { onConflict: "uid" });
  if (error) throw error;
}

export async function deleteStudent(uid: string) {
  const { error } = await supabase.from("students").delete().eq("uid", uid);
  if (error) throw error;
}

export async function listResults(uid?: string): Promise<DbResult[]> {
  let q = supabase.from("exam_results").select("student_uid,station_id,doctor,item_values,crit_count,created_at");
  if (uid) q = q.eq("student_uid", uid);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as DbResult[];
}

export async function saveResult(r: Omit<DbResult, "created_at">) {
  const { error } = await supabase.from("exam_results").upsert({ ...r, item_values: r.item_values as never, created_at: new Date().toISOString() }, { onConflict: "student_uid,station_id" });
  if (error) throw error;
}

/** 合并某学生所有工位的录入值 */
export function mergeValues(results: DbResult[], uid: string): Record<string, ExamValue> {
  return results.filter((r) => r.student_uid === uid).reduce((acc, r) => ({ ...acc, ...r.item_values }), {} as Record<string, ExamValue>);
}

// 家长端绑定的孩子（原型无登录，绑定关系保存在本机）
const BIND_KEY = "parent_bound_uid_v1";
export const getBoundUid = () => (typeof window === "undefined" ? null : localStorage.getItem(BIND_KEY));
export const setBoundUid = (uid: string | null) => {
  if (uid) localStorage.setItem(BIND_KEY, uid);
  else localStorage.removeItem(BIND_KEY);
  window.dispatchEvent(new Event("parent-binding-updated"));
};
