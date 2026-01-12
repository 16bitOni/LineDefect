import { cn } from "@/lib/utils";

type ZoneType = "L1" | "L2" | "L3" | "L4" | "R0" | "R1" | "R2" | "R3" | "R4";

interface ZoneBadgeProps {
  zone: ZoneType;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

export function ZoneBadge({ zone, selected = false, onClick, size = "md" }: ZoneBadgeProps) {
  const isLeft = zone.startsWith("L");
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "font-mono font-semibold rounded-sm border-2 transition-all",
        sizeClasses[size],
        isLeft ? "border-zone-left" : "border-zone-right",
        selected && isLeft && "bg-zone-left text-primary-foreground",
        selected && !isLeft && "bg-zone-right text-primary-foreground",
        !selected && "bg-transparent",
        !selected && isLeft && "text-zone-left",
        !selected && !isLeft && "text-zone-right",
        onClick && "cursor-pointer hover:opacity-80",
        !onClick && "cursor-default"
      )}
    >
      {zone}
    </button>
  );
}

export function ZoneSelector({
  selected,
  onChange,
}: {
  selected: ZoneType[];
  onChange: (zones: ZoneType[]) => void;
}) {
  const leftZones: ZoneType[] = ["L1", "L2", "L3", "L4"];
  const rightZones: ZoneType[] = ["R0", "R1", "R2", "R3", "R4"];

  const toggleZone = (zone: ZoneType) => {
    if (selected.includes(zone)) {
      onChange(selected.filter((z) => z !== zone));
    } else {
      onChange([...selected, zone]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground w-12">Left:</span>
        <div className="flex gap-2 flex-wrap">
          {leftZones.map((zone) => (
            <ZoneBadge
              key={zone}
              zone={zone}
              selected={selected.includes(zone)}
              onClick={() => toggleZone(zone)}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground w-12">Right:</span>
        <div className="flex gap-2 flex-wrap">
          {rightZones.map((zone) => (
            <ZoneBadge
              key={zone}
              zone={zone}
              selected={selected.includes(zone)}
              onClick={() => toggleZone(zone)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
