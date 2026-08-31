import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type BirthDateSelectProps = Readonly<{
  ariaLabel: string;
  children: ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}>;

const selectClassName =
  "text-body-md h-13 w-full appearance-none rounded-2xl border border-grayscale-200 bg-background px-3 pr-8 text-grayscale-1000";

export function BirthDateSelect({
  ariaLabel,
  children,
  placeholder,
  value,
  onChange,
}: BirthDateSelectProps) {
  return (
    <span className="relative block">
      <select
        aria-label={ariaLabel}
        className={`${selectClassName} ${value ? "" : "text-grayscale-500"}`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option disabled hidden value="">
          {placeholder}
        </option>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-grayscale-400"
        strokeWidth={1.6}
      />
    </span>
  );
}
