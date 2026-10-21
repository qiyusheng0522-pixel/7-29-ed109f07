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
