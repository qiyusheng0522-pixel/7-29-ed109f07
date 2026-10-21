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

/** 体检单专用标签：条码铺满宽度，下方一行「姓名  学号：xxx」 */
async function renderSheetLabel(uid: string, name: string, sno: string, kind: CodeKind): Promise<string> {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const code = document.createElement("canvas");
  if (kind === "barcode") {
    const JsBarcode = (await import("jsbarcode")).default;
    JsBarcode(code, uid, { format: "CODE128", width: 4, height: 150, displayValue: false, margin: 0 });
    c.width = code.width + 40; c.height = 150 + 110;
  } else {
    const QR = await import("qrcode");
    await QR.toCanvas(code, uid, { width: 360, margin: 0 });
    c.width = 560; c.height = 360 + 110;
  }
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(code, (c.width - code.width) / 2, 10);
  ctx.fillStyle = "#000"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const text = `${name}  学号：${sno}`;
  let size = 72;
  do { ctx.font = `bold ${size}px sans-serif`; size -= 2; } while (ctx.measureText(text).width > c.width - 30 && size > 20);
  ctx.fillText(text, c.width / 2, code.height + 10 + 50);
  return c.toDataURL("image/png");
}

/** 按顺序为每位学生套打体检档案模板：模板整体缩放下移留出顶部空白，第 1 页右上角印条码 + 姓名 + 学号，合并为一个 PDF */
export async function buildExamSheets(
  templateUrl: string,
  list: { uid: string; name: string; sno: string }[],
  kind: CodeKind,
): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const tplBytes = await (await fetch(templateUrl)).arrayBuffer();
  const out = await PDFDocument.create();
  const tpl = await PDFDocument.load(tplBytes);
  const tplPages = await out.embedPdf(tpl, tpl.getPageIndices());
  const SCALE = 0.95;
  for (const s of list) {
    tplPages.forEach((tp) => {
      const { width, height } = tp;
      const page = out.addPage([width, height]);
      const w = width * SCALE, h = height * SCALE;
      page.drawPage(tp, { x: (width - w) / 2, y: 6, width: w, height: h });
    });
    const first = out.getPage(out.getPageCount() - tplPages.length);
    const { width, height } = first.getSize();
    const png = await out.embedPng(await renderSheetLabel(s.uid, s.name, s.sno, kind));
    const topSpace = height * (1 - SCALE) + 30;
    const lh = topSpace - 6;
    const lw = Math.min((png.width / png.height) * lh, 200);
    const fh = (png.height / png.width) * lw;
    first.drawImage(png, { x: width - lw - 18, y: height - fh - 6, width: lw, height: fh });
  }
  return new Blob([(await out.save()) as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
}
