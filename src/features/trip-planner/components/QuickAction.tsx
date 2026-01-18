import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface QuickActionProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function QuickAction({ icon, label, onClick, disabled }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 rounded-full border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-accent"
      aria-label={label}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );
}
