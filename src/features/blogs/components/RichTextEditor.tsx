import { useEffect, useRef } from "react";

const commands = [
  ["bold", "B", "Bold"],
  ["italic", "I", "Italic"],
  ["underline", "U", "Underline"],
  ["insertUnorderedList", "• List", "Bulleted list"],
  ["insertOrderedList", "1. List", "Numbered list"],
] as const;

export function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value;
  }, [value]);

  const run = (command: string) => {
    editor.current?.focus();
    document.execCommand(command);
    onChange(editor.current?.innerHTML || "");
  };

  const addLink = () => {
    const url = window.prompt("Link URL");
    if (!url) return;
    editor.current?.focus();
    document.execCommand("createLink", false, url);
    onChange(editor.current?.innerHTML || "");
  };

  return <div className="mt-1 overflow-hidden rounded-lg border border-slate-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
    <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
      {commands.map(([command, label, title]) => <button key={command} type="button" title={title} onMouseDown={(event) => { event.preventDefault(); run(command); }} className="rounded px-2 py-1 text-xs font-bold text-slate-700 hover:bg-white hover:text-primary-700">{label}</button>)}
      <button type="button" title="Add link" onMouseDown={(event) => { event.preventDefault(); addLink(); }} className="rounded px-2 py-1 text-xs font-bold text-slate-700 hover:bg-white hover:text-primary-700">Link</button>
    </div>
    <div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" onInput={(event) => onChange(event.currentTarget.innerHTML)} data-placeholder="Write paragraph content..." className="min-h-32 px-3 py-2 text-sm leading-6 text-slate-800 outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]" />
  </div>;
}
