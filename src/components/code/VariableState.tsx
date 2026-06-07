import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VariableStateProps {
  variables: Record<string, unknown>;
}

export function VariableState({ variables }: VariableStateProps) {
  const entries = Object.entries(variables);

  return (
    <Card className="shrink-0 border-zinc-700 bg-zinc-900/80">
      <CardHeader className="pb-2">
        <CardTitle>Variables</CardTitle>
      </CardHeader>
      <CardContent className="max-h-48 space-y-2 overflow-auto text-sm">
        {!entries.length && (
          <p className="text-xs text-zinc-400">No tracked variables for this step.</p>
        )}
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-start justify-between gap-3 rounded-md bg-zinc-800 px-2 py-1"
          >
            <span className="font-mono text-xs text-zinc-300">{key}</span>
            <span className="max-w-[70%] break-all text-right font-mono text-xs text-zinc-100">
              {typeof value === "string" ? value : JSON.stringify(value)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
