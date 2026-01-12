import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function RoleCard({
  title,
  description,
  icon: Icon,
  selected = false,
  onClick,
  disabled = false,
}: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative w-full p-6 rounded-lg border-2 text-left transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5",
        selected
          ? "border-accent bg-accent/5 shadow-md"
          : "border-border bg-card hover:border-accent/50",
        disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-lg transition-colors",
            selected ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground group-hover:bg-accent/20 group-hover:text-accent"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      {selected && (
        <div className="absolute top-3 right-3 w-3 h-3 bg-accent rounded-full" />
      )}
    </button>
  );
}
