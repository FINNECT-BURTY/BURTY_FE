"use client";

type FilterTab<T extends string> = Readonly<{
  label: string;
  value: T;
}>;

type FilterTabsProps<T extends string> = Readonly<{
  tabs: readonly FilterTab<T>[];
  value: T;
  onChange: (value: T) => void;
}>;

export function FilterTabs<T extends string>({
  tabs,
  value,
  onChange,
}: FilterTabsProps<T>) {
  return (
    <div className="flex gap-2" role="tablist">
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            aria-selected={selected}
            className={`text-body-md flex h-9 items-center justify-center rounded-full border px-4 ${
              selected
                ? "border-grayscale-1000 bg-grayscale-1000 text-background"
                : "border-grayscale-200 bg-background text-grayscale-800"
            }`}
            key={tab.value}
            onClick={() => onChange(tab.value)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
