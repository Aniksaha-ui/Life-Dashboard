import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { clsx } from "clsx";
import { Tooltip } from "./Tooltip";

interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip content={copied ? "Copied!" : "Copy"}>
      <button
        onClick={handleCopy}
        className={clsx(
          "p-1 rounded hover:bg-slate-100 transition-colors inline-flex items-center justify-center",
          copied ? "text-emerald-600" : "text-slate-400 hover:text-slate-600",
          className,
        )}
      >
        {copied ? (
          <Check className="w-3 h-3 animate-in zoom-in duration-200" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </Tooltip>
  );
}
