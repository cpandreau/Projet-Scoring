import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-3",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-muted-foreground/30 border-t-muted-foreground",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Chargement"
    >
      <span className="sr-only">Chargement...</span>
    </div>
  );
}

interface LoadingSpinnerWithTextProps extends LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinnerWithText({
  size = "md",
  text = "Chargement...",
  className,
}: LoadingSpinnerWithTextProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LoadingSpinner size={size} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

interface LoadingOverlayProps {
  text?: string;
}

export function LoadingOverlay({ text = "Chargement..." }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
      <LoadingSpinnerWithText size="lg" text={text} />
    </div>
  );
}

interface LoadingCenteredProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingCentered({ text, size = "lg" }: LoadingCenteredProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <LoadingSpinner size={size} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
