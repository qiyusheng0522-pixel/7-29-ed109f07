import { useRef, useState } from "react";
import { toast } from "sonner";
import { EIcon } from "@/components/EIcon";

function useSpeech(onText: (t: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const start = () => {
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("当前浏览器不支持语音识别", { description: "请手动输入或使用 Chrome" });
      return;
    }
    const rec = new SR();
    rec.lang = "zh-CN";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      onText(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };
  const stop = () => {
    recRef.current?.stop?.();
    setListening(false);
  };
  return { listening, start, stop };
}

export function VoiceTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const { listening, start, stop } = useSpeech((t) =>
    onChange((value ? value + " " : "") + t),
  );
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl bg-surface-2 p-3 pr-12 text-[13px] leading-relaxed outline-none ring-1 ring-transparent focus:ring-deep"
      />
      <button
        type="button"
        onClick={listening ? stop : start}
        className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-[13px] transition ${
          listening ? "bg-danger text-white animate-pulse" : "bg-deep/10 text-deep"
        }`}
        title={listening ? "停止录音" : "语音输入"}
      >
        <EIcon e="🎤" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />
      </button>
      {listening && (
        <span className="absolute bottom-2 right-3 text-[10px] text-danger">正在听…请口述修改内容</span>
      )}
    </div>
  );
}
