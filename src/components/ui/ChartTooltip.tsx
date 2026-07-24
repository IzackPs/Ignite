import React from "react";


interface ChartTooltipProps {
  readonly active?: boolean;
  readonly payload?: any[];
  readonly titleKey?: string;
  readonly children: (data: any) => React.ReactNode;
}

export function ChartTooltip({
  active,
  payload,
  titleKey = "mesAno",
  children,
}: ChartTooltipProps) {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950 border border-border-subtle p-3 rounded-lg shadow-xl text-xs space-y-1">
        {titleKey && <div className="font-bold text-white">{data[titleKey]}</div>}
        {children(data)}
      </div>
    );
  }
  return null;
}
