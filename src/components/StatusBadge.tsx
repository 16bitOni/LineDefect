import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "OPEN" | "CLOSED";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

export function StatusBadge({ status, size = "md", pulse = false }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono font-semibold rounded-sm uppercase tracking-wider",
        sizeClasses[size],
        status === "OPEN" 
          ? "bg-status-open text-accent-foreground" 
          : "bg-success text-success-foreground"
      )}
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          status === "OPEN" ? "bg-accent-foreground" : "bg-success-foreground",
          pulse && status === "OPEN" && "animate-pulse-ring"
        )}
      />
      {status}
    </span>
  );
}
