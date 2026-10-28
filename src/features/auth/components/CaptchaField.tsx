import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const DIGIT_COLORS = [
  "#e07a5f",
  "#3d5a80",
  "#588157",
  "#9c6644",
  "#5c4d7d",
  "#2a9d8f",
];
const LINE_COLORS = [
  "#7b2cbf",
  "#2a9d8f",
  "#1d3557",
  "#e9c46a",
  "#588157",
  "#e76f51",
];

function generateCaptchaCode(length = 4): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

function drawCaptcha(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const charWidth = width / (code.length + 1);

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const x = charWidth * (i + 0.75);
    const y = height / 2 + (Math.random() * 8 - 4);
    const angle = (Math.random() * 24 - 12) * (Math.PI / 180);
    const fontSize = 20 + Math.floor(Math.random() * 4);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `bold ${fontSize}px Georgia, serif`;
    ctx.fillStyle = DIGIT_COLORS[i % DIGIT_COLORS.length];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }

  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.strokeStyle = LINE_COLORS[i % LINE_COLORS.length];
    ctx.lineWidth = 1 + Math.random();
    ctx.stroke();
  }

  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(100, 116, 139, ${Math.random() * 0.15})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
  }
}

interface CaptchaFieldProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange: (isValid: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export function CaptchaField({
  value,
  onChange,
  onValidChange,
  disabled,
  error,
}: CaptchaFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptchaCode());

  const refreshCaptcha = useCallback(() => {
    const nextCode = generateCaptchaCode();
    setCaptchaCode(nextCode);
    onChange("");
    onValidChange(false);
  }, [onChange, onValidChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCaptcha(canvas, captchaCode);
  }, [captchaCode]);

  useEffect(() => {
    const isValid = value.trim() === captchaCode;
    onValidChange(isValid);
  }, [value, captchaCode, onValidChange]);

  return (
    <div className="space-y-2">
      <label
        htmlFor="captcha-input"
        className="block text-sm font-medium text-slate-700"
      >
        Security Code
      </label>
      <div className="flex items-stretch gap-2">
        <div className="shrink-0 w-[120px] border border-slate-300 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={120}
            height={42}
            className="w-full h-[42px] block"
            aria-hidden
          />
        </div>
        <button
          type="button"
          onClick={refreshCaptcha}
          disabled={disabled}
          className="shrink-0 w-10 flex items-center justify-center border border-slate-300 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          title="Refresh captcha"
          aria-label="Refresh captcha"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <input
          id="captcha-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          placeholder="Enter code"
          disabled={disabled}
          className="flex-1 min-w-0 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
