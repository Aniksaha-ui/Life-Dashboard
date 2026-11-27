import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useState } from "react";
import { ClassicEditor, Essentials, Paragraph, Bold, Italic, Heading, List, Link, Image, ImageInsert, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageTextAlternative, LinkImage, Table, TableToolbar, BlockQuote, Font, Alignment, Indent, IndentBlock, HorizontalLine, RemoveFormat, Strikethrough, Underline, Code, CodeBlock, SpecialCharacters, SpecialCharactersEssentials } from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import DOMPurify from "dompurify";

const isHtml = (value: string) => /<\/?(?:p|h[1-6]|ul|ol|li|strong|em|blockquote|br|s|code|pre|a|img|figure|table|hr)\b/i.test(value);

export function descriptionText(value: string) {
  if (!isHtml(value)) return value;
  const doc = new DOMParser().parseFromString(DOMPurify.sanitize(value), "text/html");
  return doc.body.textContent || "";
}

export function DescriptionView({ value }: { value: string }) {
  if (!isHtml(value)) return <div className="whitespace-pre-line">{value}</div>;
  return <div className="project-rich-text ck-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }} />;
}

export function ProjectDescriptionEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [initialData] = useState(() => isHtml(value)
    ? DOMPurify.sanitize(value)
    : value.split("\n").map((line) => `<p>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") || "<br>"}</p>`).join(""));
  return <CKEditor
    editor={ClassicEditor}
    data={initialData}
    config={{
      licenseKey: import.meta.env.VITE_CKEDITOR_LICENSE_KEY || "GPL",
      plugins: [Essentials, Paragraph, Bold, Italic, Heading, List, Link, Image, ImageInsert, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageTextAlternative, LinkImage, Table, TableToolbar, BlockQuote, Font, Alignment, Indent, IndentBlock, HorizontalLine, RemoveFormat, Strikethrough, Underline, Code, CodeBlock, SpecialCharacters, SpecialCharactersEssentials],
      toolbar: { items: ["undo", "redo", "|", "heading", "|", "fontFamily", "fontSize", "fontColor", "fontBackgroundColor", "|", "bold", "italic", "underline", "strikethrough", "code", "removeFormat", "|", "link", "insertImage", "insertTable", "blockQuote", "codeBlock", "horizontalLine", "specialCharacters", "|", "alignment", "bulletedList", "numberedList", "outdent", "indent"], shouldNotGroupWhenFull: false },
      image: { insert: { integrations: ["url"] }, toolbar: ["toggleImageCaption", "imageTextAlternative", "|", "imageStyle:inline", "imageStyle:block", "imageStyle:side", "|", "resizeImage", "linkImage"] },
      table: { contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"] },
    }}
    onChange={(_, editor) => onChange(editor.getData())}
  />;
}
