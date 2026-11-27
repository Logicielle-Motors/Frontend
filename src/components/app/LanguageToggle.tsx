import type { Settings } from "@/lib/store";
import { cn } from "@/lib/utils";

type LanguageToggleProps = {
  language: Settings["language"];
  onChange: (language: Settings["language"]) => void;
  label: string;
};

function Flag({ language }: { language: Settings["language"] }) {
  if (language === "fr") {
    return (
      <svg viewBox="0 0 24 16" aria-hidden="true" className="h-3.5 w-5 overflow-hidden rounded-[2px] border border-black/10">
        <rect width="8" height="16" fill="#002395" />
        <rect x="8" width="8" height="16" fill="#fff" />
        <rect x="16" width="8" height="16" fill="#ed2939" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" className="h-3.5 w-5 overflow-hidden rounded-[2px] border border-black/10">
      <rect width="8" height="16" fill="#fff" />
      <rect x="8" width="16" height="8" fill="#fc3d32" />
      <rect x="8" y="8" width="16" height="8" fill="#007e3a" />
    </svg>
  );
}

export function LanguageToggle({ language, onChange, label }: LanguageToggleProps) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center gap-1">
      {(["fr", "mg"] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-label={value === "fr" ? "Français" : "Malagasy"}
          title={value === "fr" ? "Français" : "Malagasy"}
          aria-pressed={language === value}
          onClick={() => onChange(value)}
          className={cn(
            "grid size-8 place-items-center rounded-md border transition hover:bg-muted",
            language === value ? "border-primary bg-primary/10" : "border-transparent",
          )}
        >
          <Flag language={value} />
        </button>
      ))}
    </div>
  );
}
