import { Card, CardContent } from "@/components/ui/card";

interface ComplexityBadgeProps {
  timeComplexity: string;
  spaceComplexity: string;
}

export function ComplexityBadge({
  timeComplexity,
  spaceComplexity,
}: ComplexityBadgeProps) {
  return (
    <Card className="border-zinc-700 bg-zinc-900/70">
      <CardContent className="flex items-center gap-4 p-3 text-xs text-zinc-300">
        <span>
          Time: <strong className="text-zinc-100">{timeComplexity}</strong>
        </span>
        <span>
          Space: <strong className="text-zinc-100">{spaceComplexity}</strong>
        </span>
      </CardContent>
    </Card>
  );
}
