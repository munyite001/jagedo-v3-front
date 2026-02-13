import { BuilderType, BUILDER_TYPE_LABELS } from "@/types/builder";
import { cn } from "@/lib/utils";

const typeStyles: Record<BuilderType, string> = {
  FUNDI:
    "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",

  PROFESSIONAL:
    "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",

  CONTRACTOR:
    "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",

  HARDWARE:
    "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30",
};

export function BuilderTypeBadge({ type }: { type: BuilderType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        typeStyles[type]
      )}
    >
      {BUILDER_TYPE_LABELS[type]}
    </span>
  );
}
