import type { InputHTMLAttributes } from "react";
import { outlinedControlClass, OutlinedField } from "./OutlinedField";

type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "className"
> & {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function SearchField({
  label = "Search",
  value,
  onChange,
  className = "",
  type = "text",
  ...props
}: SearchFieldProps) {
  return (
    <OutlinedField label={label} className={`search-field ${className}`.trim()}>
      <input
        {...props}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={outlinedControlClass}
      />
    </OutlinedField>
  );
}
