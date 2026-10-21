// 体检单右上角学生标签：条码/二维码 + 姓名 + 学号（仅浏览器端调用）
export type CodeKind = "barcode" | "qr";

export async function renderLabel(uid: string, name: string, sno: string, kind: CodeKind): Promise<string> {
  const W = 480, H = kind === "qr" ? 420 : 260;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
  const code = document.createElement("canvas");
  if (kind === "barcode") {
    const JsBarcode = (await import("jsbarcode")).default;
    JsBarcode(code, uid, { format: "CODE128", width: 2, height: 110, displayValue: true, fontSize: 18, margin: 8 });
  } else {
    const QR = await import("qrcode");
    await QR.toCanvas(code, uid, { width: 300, margin: 1 });
  }
  const scale = Math.min(1, (W - 20) / code.width);
  const cw = code.width * scale, ch = code.height * scale;
  ctx.drawImage(code, (W - cw) / 2, 10, cw, ch);
  ctx.fillStyle = "#111"; ctx.textAlign = "center";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(name, W / 2, ch + 48);
  ctx.font = "20px sans-serif";
  ctx.fillText(`学号：${sno}${kind === "qr" ? `   ${uid}` : ""}`, W / 2, ch + 80);
  return c.toDataURL("image/png");
}

export function downloadUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
}

/** 按顺序为每位学生套打体检档案模板：第 1 页右上角印条码/二维码 + 姓名 + 学号，合并为一个 PDF */
export async function buildExamSheets(
  templateUrl: string,
  list: { uid: string; name: string; sno: string }[],
  kind: CodeKind,
): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const tplBytes = await (await fetch(templateUrl)).arrayBuffer();
  const tpl = await PDFDocument.load(tplBytes);
  const out = await PDFDocument.create();
  for (const s of list) {
    const pages = await out.copyPages(tpl, tpl.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    const first = pages[0];
    const { width, height } = first.getSize();
    const png = await out.embedPng(await renderLabel(s.uid, s.name, s.sno, kind));
    const w = kind === "qr" ? 80 : 95;
    const h = (png.height / png.width) * w;
    first.drawImage(png, { x: width - w - 8, y: height - h - 4, width: w, height: h });
  }
  return new Blob([await out.save()], { type: "application/pdf" });
}
