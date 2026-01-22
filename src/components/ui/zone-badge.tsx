import { type Zone, getZoneBgClasses, getZoneTextClasses, ZONE_LABELS } from "@/config/colors.config";
import { cn } from "@/lib/utils";

interface ZoneBadgeProps {
  zone: Zone;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function ZoneBadge({ zone, label, className, size = "md" }: ZoneBadgeProps) {
  const displayLabel = label ?? ZONE_LABELS[zone];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        getZoneBgClasses(zone),
        getZoneTextClasses(zone),
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      {displayLabel}
    </span>
  );
}
