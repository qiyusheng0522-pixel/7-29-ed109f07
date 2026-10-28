import { useEffect, useRef, useState } from "react";

/** Real handwritten signature: draws with finger/mouse, returns PNG data URL (null when cleared). */
export function SignaturePad({ onChange, height = 120 }: { onChange: (dataUrl: string | null) => void; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio; c.height = height * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio); ctx.lineWidth = 2.6; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = getComputedStyle(c).color || "#111";
  }, [height]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = e.currentTarget.getContext("2d")!; const p = pos(e);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 0.1, p.y + 0.1); ctx.stroke();
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d")!; const p = pos(e);
    ctx.lineTo(p.x, p.y); ctx.stroke();
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false; setEmpty(false);
    onChange(ref.current!.toDataURL("image/png"));
  };
  const clear = () => {
    const c = ref.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setEmpty(true); onChange(null);
  };

  return (
    <div>
      <div className="relative rounded-xl border-2 border-dashed border-border bg-background">
        <canvas
          ref={ref}
          style={{ height, touchAction: "none" }}
          className="block w-full cursor-crosshair text-foreground"
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
        />
        {empty && <p className="pointer-events-none absolute inset-0 grid place-items-center text-xs text-muted-foreground">请在此处用手指或鼠标手写签名</p>}
      </div>
      {!empty && <button type="button" onClick={clear} className="mt-1 text-[11px] text-muted-foreground underline">清除重签</button>}
    </div>
  );
}
