import { Button } from "@/components/ui/button";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-accent"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );
}
