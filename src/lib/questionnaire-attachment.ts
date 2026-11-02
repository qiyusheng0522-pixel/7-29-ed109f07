import type { PreExamQuestionnaireId } from "./pre-exam-questionnaires";

export function needsBloodReport(id: PreExamQuestionnaireId, answers: Record<number, string>) {
  return id === "allergy" && Object.values(answers).includes("是");
}

export function bloodReportError(file: Pick<File, "size" | "type">): string | undefined {
  if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) return "请选择 JPG、PNG 图片或 PDF 化验单。";
  if (file.size > 10 * 1024 * 1024) return "文件超过 10MB，请选择较小的文件。";
  if (file.size === 0) return "文件为空，请重新选择。";
}

// Files remain in the browser, separate from answer JSON and preview/live namespaces.
async function attachmentStore<T>(operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const opening = indexedDB.open("questionnaire-attachments", 1);
    opening.onupgradeneeded = () => opening.result.createObjectStore("files");
    opening.onerror = () => reject(opening.error);
    opening.onsuccess = () => {
      const db = opening.result;
      const tx = db.transaction("files", "readwrite");
      const request = operation(tx.objectStore("files"));
      tx.oncomplete = () => { resolve(request.result); db.close(); };
      tx.onerror = () => { reject(tx.error); db.close(); };
      tx.onabort = () => { reject(tx.error); db.close(); };
    };
  });
}

export const readBloodReport = (key: string): Promise<File | undefined> => attachmentStore(store => store.get(key));
export const saveBloodReport = (key: string, file: File) => attachmentStore(store => store.put(file, key));
export const removeBloodReport = (key: string) => attachmentStore(store => store.delete(key));